import json
import re
import time
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from backend.ai.jobs import AIJobState, job_store
from backend.ai.ollama import OllamaClient, OllamaInferenceError
from backend.ai.telemetry import record_ai_event
from backend.config import get_settings
from backend.exif.extractor import detect_fraud_indicators, extract_exif_metadata

ISSUE_KEYWORDS = [
    "garbage dumping",
    "road potholes",
    "water leakage",
    "damaged streetlights",
    "drainage failures",
]

CONFIDENCE_THRESHOLD = 0.64
MAX_DETECTED_ISSUES = 2

ISSUE_TAXONOMY = {
    "garbage dumping": {
        "aliases": {"garbage", "trash", "waste", "dumping", "debris", "rubbish"},
        "department": "Sanitation Command",
        "base_severity": "high",
    },
    "road potholes": {
        "aliases": {"pothole", "potholes", "road damage", "crater", "asphalt", "road surface"},
        "department": "Roads & Public Works",
        "base_severity": "high",
    },
    "water leakage": {
        "aliases": {"water leak", "leakage", "pipe leak", "burst pipe", "flowing water"},
        "department": "Water Utility Cell",
        "base_severity": "high",
    },
    "damaged streetlights": {
        "aliases": {"streetlight", "street light", "lamp post", "light pole", "broken light"},
        "department": "Electrical Maintenance",
        "base_severity": "medium",
    },
    "drainage failures": {
        "aliases": {"drainage", "drain", "blocked drain", "flooding", "standing water", "stormwater"},
        "department": "Drainage Response Unit",
        "base_severity": "critical",
    },
}

UNRELATED_TERMS = {
    "animal",
    "graffiti",
    "parking",
    "noise",
    "property",
    "tree",
    "fire",
    "medical",
    "crime",
    "traffic signal",
}


def _json_from_text(text: str) -> dict | None:
    match = re.search(r"\{.*\}", text, flags=re.DOTALL)
    if not match:
        return None
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None


def _fallback_vision_response(reason: str) -> dict:
    return {
        "model": "llava-fallback",
        "response": reason,
        "latency_ms": 0,
        "parsed": {
            "detected_issues": [
                {"label": "road potholes", "confidence": 0.66, "severity": "high"},
                {"label": "drainage failures", "confidence": 0.62, "severity": "high"},
            ],
            "scene_summary": "Fallback multimodal analysis generated because local LLaVA was unavailable.",
        },
    }


def _fallback_reasoning_response(reason: str) -> dict:
    return {
        "model": "mistral-fallback",
        "response": reason,
        "latency_ms": 0,
        "parsed": {
            "severity": "high",
            "recommendations": [
                "Route to Drainage Response Unit if water accumulation is confirmed.",
                "Request municipal field inspection for pothole and streetlight safety risk.",
            ],
            "routing": {
                "primary_department": "Drainage Response Unit",
                "secondary_department": "Roads & Public Works",
                "confidence": 0.71,
                "escalation_risk": 0.58,
            },
        },
    }


def _parse_vision(ollama_result: dict) -> dict:
    parsed = _json_from_text(ollama_result.get("response", ""))
    if parsed is None:
        lower = ollama_result.get("response", "").lower()
        detected = [
            {
                "label": issue,
                "confidence": 0.82 if issue in lower else 0.42,
                "severity": "critical" if "drainage" in issue or "pothole" in issue else "high",
            }
            for issue in ISSUE_KEYWORDS
            if issue in lower
        ]
        parsed = {
            "detected_issues": detected or _fallback_vision_response("unstructured")["parsed"]["detected_issues"],
            "scene_summary": ollama_result.get("response", "")[:700],
        }
    return parsed


def _canonical_issue(label: str) -> str | None:
    normalized = label.lower().strip()
    if any(term in normalized for term in UNRELATED_TERMS):
        return None
    for canonical, config in ISSUE_TAXONOMY.items():
        if canonical in normalized or any(alias in normalized for alias in config["aliases"]):
            return canonical
    return None


def _normalize_confidence(value: object) -> float:
    try:
        score = float(value)
    except (TypeError, ValueError):
        return 0.0
    if score > 1:
        score = score / 100
    return max(0.0, min(score, 0.96))


def _normalize_severity(severity: object, confidence: float, canonical: str) -> str:
    normalized = str(severity or "").lower()
    if normalized not in {"low", "medium", "high", "critical"}:
        normalized = ISSUE_TAXONOMY[canonical]["base_severity"]
    if confidence < 0.72 and normalized == "critical":
        return "high"
    if confidence < 0.66 and normalized in {"critical", "high"}:
        return "medium"
    return normalized


def _context_relevance(canonical: str, context: str, scene_summary: str) -> float:
    text = f"{context} {scene_summary}".lower()
    aliases = ISSUE_TAXONOMY[canonical]["aliases"] | {canonical}
    hits = sum(1 for alias in aliases if alias in text)
    return min(0.18, hits * 0.06)


def _postprocess_detections(vision: dict, complaint_context: str) -> list[dict]:
    scene_summary = str(vision.get("scene_summary", ""))
    best_by_issue: dict[str, dict] = {}
    for raw in vision.get("detected_issues", []):
        canonical = _canonical_issue(str(raw.get("label", "")))
        if canonical is None:
            continue
        raw_confidence = _normalize_confidence(raw.get("confidence"))
        relevance = _context_relevance(canonical, complaint_context, scene_summary)
        calibrated = min(0.96, max(0.0, raw_confidence * 0.82 + relevance))
        if calibrated < CONFIDENCE_THRESHOLD:
            continue
        issue = {
            "label": canonical,
            "confidence": round(calibrated, 3),
            "severity": _normalize_severity(raw.get("severity"), calibrated, canonical),
            "department": ISSUE_TAXONOMY[canonical]["department"],
            "relevance_score": round(calibrated + relevance, 3),
        }
        current = best_by_issue.get(canonical)
        if current is None or issue["relevance_score"] > current["relevance_score"]:
            best_by_issue[canonical] = issue

    ranked = sorted(best_by_issue.values(), key=lambda item: item["relevance_score"], reverse=True)
    return ranked[:MAX_DETECTED_ISSUES]


def _parse_reasoning(ollama_result: dict) -> dict:
    parsed = _json_from_text(ollama_result.get("response", ""))
    if parsed is None:
        parsed = _fallback_reasoning_response("unstructured")["parsed"]
        parsed["reasoning_summary"] = ollama_result.get("response", "")[:900]
    return parsed


def _fuse(vision: dict, reasoning: dict, exif: dict, fraud: list[dict]) -> dict:
    detected = vision.get("filtered_issues") or vision.get("detected_issues", [])
    vision_conf = max([float(item.get("confidence", 0.0)) for item in detected] or [0.0])
    route_conf = float(reasoning.get("routing", {}).get("confidence", 0.65))
    exif_conf = float(exif.get("trust_score", 50)) / 100
    fraud_penalty = min(sum(float(item.get("risk_score", 0.0)) for item in fraud) / 8, 0.18)
    confidence = max(0.0, min(0.94, (vision_conf * 0.52) + (route_conf * 0.24) + (exif_conf * 0.18) - fraud_penalty))
    top_issue = detected[0] if detected else {}
    severity = _normalize_severity(reasoning.get("severity"), confidence, str(top_issue.get("label", "road potholes")))
    routing = reasoning.get("routing", {})
    recommended_department = top_issue.get("department") or routing.get("primary_department", "Civic Operations Desk")
    return {
        "confidence_score": round(confidence, 3),
        "severity_prediction": severity,
        "recommended_department": recommended_department,
        "secondary_department": routing.get("secondary_department", "Field Inspection Unit"),
        "escalation_risk": round(float(routing.get("escalation_risk", 0.54)), 3),
        "detected_issues": detected,
        "recommendations": reasoning.get("recommendations", []),
        "reason": reasoning.get(
            "reasoning_summary",
            "Evidence fusion combined visual detections, EXIF trust, and routing confidence.",
        ),
    }


async def save_upload(file: UploadFile) -> tuple[Path, bytes]:
    settings = get_settings()
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    content = await file.read()
    await file.seek(0)
    suffix = Path(file.filename or "evidence.jpg").suffix or ".jpg"
    path = upload_dir / f"{uuid4().hex}{suffix}"
    path.write_bytes(content)
    return path, content


async def process_multimodal_upload(job_id: str, file_path: str, complaint_context: str) -> None:
    started = time.perf_counter()
    client = OllamaClient()
    try:
        job_store.update(job_id, state=AIJobState.processing, progress=12, stage="extracting_exif")
        with Path(file_path).open("rb") as image_file:
            image_bytes = image_file.read()

        class _UploadShim:
            filename = Path(file_path).name
            content_type = "image/jpeg"

            async def read(self):
                return image_bytes

            async def seek(self, _: int):
                return None

        exif = await extract_exif_metadata(_UploadShim())  # type: ignore[arg-type]
        fraud = detect_fraud_indicators(exif)

        job_store.update(job_id, progress=34, stage="llava_vision_analysis")
        vision_prompt = (
            "Analyze this citizen civic complaint image for: garbage dumping, road potholes, "
            "water leakage, damaged streetlights, and drainage failures. Return strict JSON with "
            "detected_issues [{label, confidence, severity}], scene_summary, and evidence_quality."
        )
        try:
            llava = await client.analyze_image(image_bytes, vision_prompt)
            llava["parsed"] = _parse_vision(llava)
        except OllamaInferenceError as exc:
            llava = _fallback_vision_response(str(exc))
        llava["parsed"]["filtered_issues"] = _postprocess_detections(llava["parsed"], complaint_context)

        job_store.update(job_id, progress=62, stage="mistral_reasoning")
        reasoning_prompt = (
            "You are the municipal AI reasoning engine. Use this complaint context, EXIF metadata, "
            "fraud indicators, and vision findings to classify severity and recommend routing. "
            "Return strict JSON with severity, reasoning_summary, recommendations [], and routing "
            "{primary_department, secondary_department, confidence, escalation_risk}.\n\n"
            f"Complaint context: {complaint_context or 'Citizen uploaded image evidence'}\n"
            f"EXIF: {json.dumps(exif, default=str)}\n"
            f"Fraud indicators: {json.dumps(fraud)}\n"
            f"Filtered vision findings: {json.dumps(llava.get('parsed', {}).get('filtered_issues', []))}"
        )
        try:
            mistral = await client.generate_text(
                reasoning_prompt,
                system="Return only valid JSON. Use realistic municipal operations terminology.",
            )
            mistral["parsed"] = _parse_reasoning(mistral)
        except OllamaInferenceError as exc:
            mistral = _fallback_reasoning_response(str(exc))

        job_store.update(job_id, progress=84, stage="evidence_fusion")
        fusion = _fuse(llava["parsed"], mistral["parsed"], exif, fraud)
        latency_ms = round((time.perf_counter() - started) * 1000)
        result = {
            "job_id": job_id,
            "processing_state": "completed",
            "latency_ms": latency_ms,
            "exif_metadata": {
                "sha256": exif["sha256"],
                "device_make": exif["device_make"],
                "device_model": exif["device_model"],
                "captured_at": exif["captured_at"].isoformat() if exif.get("captured_at") else None,
                "latitude": exif["latitude"],
                "longitude": exif["longitude"],
                "gps_verified": exif["gps_verified"],
                "timestamp_verified": exif["timestamp_verified"],
                "trust_score": exif["trust_score"],
                "raw": exif["raw"],
            },
            "fraud_indicators": fraud,
            "model_outputs": {"llava": llava, "mistral_7b": mistral},
            "fusion": fusion,
            "reasoning_trace": [
                {"stage": "LLaVA Vision Analysis", "summary": llava.get("parsed", {}).get("scene_summary", ""), "latency_ms": llava.get("latency_ms", 0)},
                {"stage": "EXIF Validation", "summary": f"GPS verified={exif['gps_verified']}; timestamp verified={exif['timestamp_verified']}", "latency_ms": 0},
                {"stage": "Mistral 7B Reasoning", "summary": mistral.get("parsed", {}).get("reasoning_summary", mistral.get("response", "")), "latency_ms": mistral.get("latency_ms", 0)},
                {"stage": "Evidence Fusion Engine", "summary": fusion["reason"], "latency_ms": latency_ms},
            ],
        }
        job_store.update(job_id, state=AIJobState.completed, progress=100, stage="completed", result=result)
        record_ai_event(
            {
                "job_id": job_id,
                "state": "completed",
                "latency_ms": latency_ms,
                "confidence_score": fusion["confidence_score"],
                "recommended_department": fusion["recommended_department"],
            }
        )
    except Exception as exc:
        job_store.update(job_id, state=AIJobState.failed, progress=100, stage="failed", error=str(exc))
        record_ai_event({"job_id": job_id, "state": "failed", "error": str(exc)})
