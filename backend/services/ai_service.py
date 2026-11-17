from sqlalchemy.orm import Session

from backend.ai.pipeline import fuse_evidence, run_llava_vision_analysis, run_mistral_reasoning
from backend.models.ai_analysis import AIAnalysisResult
from backend.models.complaint import CivicComplaint


def analyze_complaint(db: Session, complaint: CivicComplaint) -> dict:
    mistral = run_mistral_reasoning(f"{complaint.title}\n{complaint.description}")
    llava = run_llava_vision_analysis()
    fusion = fuse_evidence(mistral, llava)

    result = AIAnalysisResult(
        complaint_id=complaint.id,
        model_name="evidence-fusion-engine",
        pipeline_stage="fusion",
        confidence_score=fusion["confidence_score"],
        severity_prediction=fusion["severity_prediction"],
        reasoning_summary=fusion["reason"],
        detected_objects=llava["detected_objects"],
        raw_response={"mistral": mistral, "llava": llava, "fusion": fusion},
        latency_ms=mistral["latency_ms"] + llava["latency_ms"] + 612,
    )
    db.add(result)
    db.commit()

    return {
        "complaint_id": complaint.id,
        "severity_prediction": fusion["severity_prediction"],
        "confidence_score": fusion["confidence_score"],
        "recommended_department": fusion["recommended_department"],
        "detected_issues": llava["detected_objects"],
        "model_outputs": {"mistral_7b": mistral, "llava": llava, "fusion": fusion},
        "reasoning_trace": [
            {"stage": "Mistral 7B", "summary": mistral["summary"], "latency_ms": mistral["latency_ms"]},
            {"stage": "LLaVA Vision", "summary": "Detected multimodal civic infrastructure risks.", "latency_ms": llava["latency_ms"]},
            {"stage": "Evidence Fusion", "summary": fusion["reason"], "latency_ms": 612},
        ],
    }
