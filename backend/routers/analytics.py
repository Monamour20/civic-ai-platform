from fastapi import APIRouter, Depends

from backend.auth.dependencies import require_roles
from backend.models.user import Role
from backend.schemas.analytics import AnalyticsSummary
from backend.analytics.aggregations import executive_summary

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def summary(_=Depends(require_roles(Role.operator, Role.analyst, Role.department_user))) -> AnalyticsSummary:
    return executive_summary()
