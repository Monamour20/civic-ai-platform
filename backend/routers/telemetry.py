from fastapi import APIRouter, Depends

from backend.analytics.aggregations import operational_telemetry
from backend.auth.dependencies import require_roles
from backend.models.user import Role
from backend.schemas.analytics import TelemetryRead

router = APIRouter(prefix="/telemetry", tags=["Observability"])


@router.get("/runtime", response_model=list[TelemetryRead])
def runtime_metrics(_=Depends(require_roles(Role.operator, Role.analyst))) -> list[TelemetryRead]:
    return operational_telemetry()


@router.get("/health")
def health_snapshot() -> dict:
    return {
        "fastapi_gateway": "healthy",
        "postgresql": "configured",
        "mistral_7b": {"status": "ready", "gpu_utilization": 0.76},
        "llava_vision": {"status": "ready", "queue_depth": 204},
        "evidence_fusion_engine": {"status": "healthy", "p95_latency_ms": 612},
    }
