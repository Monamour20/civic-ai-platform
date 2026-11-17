import base64
import time
from typing import Any

import httpx

from backend.config import get_settings


class OllamaInferenceError(RuntimeError):
    pass


class OllamaClient:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def generate_text(self, prompt: str, system: str | None = None) -> dict[str, Any]:
        return await self._generate(
            model=self.settings.ollama_mistral_model,
            prompt=prompt,
            system=system,
        )

    async def analyze_image(self, image_bytes: bytes, prompt: str) -> dict[str, Any]:
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        return await self._generate(
            model=self.settings.ollama_llava_model,
            prompt=prompt,
            images=[image_b64],
        )

    async def _generate(
        self,
        model: str,
        prompt: str,
        system: str | None = None,
        images: list[str] | None = None,
    ) -> dict[str, Any]:
        started = time.perf_counter()
        payload: dict[str, Any] = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.1, "num_ctx": 4096},
        }
        if system:
            payload["system"] = system
        if images:
            payload["images"] = images

        try:
            async with httpx.AsyncClient(timeout=self.settings.ollama_timeout_seconds) as client:
                response = await client.post(f"{self.settings.ollama_base_url}/api/generate", json=payload)
                response.raise_for_status()
        except (httpx.HTTPError, httpx.TimeoutException) as exc:
            raise OllamaInferenceError(f"Ollama inference failed for {model}: {exc}") from exc

        data = response.json()
        return {
            "model": model,
            "response": data.get("response", ""),
            "raw": data,
            "latency_ms": round((time.perf_counter() - started) * 1000),
        }
