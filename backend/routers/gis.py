from fastapi import APIRouter, Depends

from backend.auth.dependencies import require_roles
from backend.models.user import Role
from backend.schemas.gis import GISIssueRead
from backend.services.gis_service import live_gis_records

router = APIRouter(prefix="/gis", tags=["GIS"])


@router.get("/issues", response_model=list[GISIssueRead])
def gis_issues(_=Depends(require_roles(Role.operator, Role.analyst, Role.department_user))) -> list[GISIssueRead]:
    return live_gis_records()
