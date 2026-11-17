from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from backend.ai.jobs import job_store
from backend.auth.dependencies import require_roles
from backend.database.session import get_db
from backend.models.user import Role
from backend.schemas.ai import AIAnalysisRequest, AIAnalysisResponse
from backend.schemas.multimodal import AIJobStartResponse, AIJobStatusResponse
from backend.services.ai_service import analyze_complaint
from backend.services.complaint_service import get_complaint
from backend.services.multimodal_service import process_multimodal_upload, save_upload

router = APIRouter(prefix="/ai", tags=["AI Analysis"])


@router.post("/analyze", response_model=AIAnalysisResponse)
def analyze(
    payload: AIAnalysisRequest,
    db: Session = Depends(get_db),
    _=Depends(require_roles(Role.operator, Role.analyst)),
) -> AIAnalysisResponse:
    complaint = get_complaint(db, payload.complaint_id)
    if complaint is None:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return analyze_complaint(db, complaint)


@router.post(
    "/multimodal/upload",
    response_model=AIJobStartResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def start_multimodal_analysis(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    complaint_context: str = Form(default=""),
    _=Depends(require_roles(Role.operator, Role.analyst)),
) -> AIJobStartResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="Only image uploads are supported")
    job = job_store.create()
    file_path, _ = await save_upload(file)
    background_tasks.add_task(process_multimodal_upload, job.id, str(file_path), complaint_context)
    return AIJobStartResponse(
        job_id=job.id,
        state=job.state.value,
        status_url=f"/api/v1/ai/jobs/{job.id}",
    )


@router.get("/jobs/{job_id}", response_model=AIJobStatusResponse)
def get_ai_job(
    job_id: str,
    _=Depends(require_roles(Role.operator, Role.analyst)),
) -> AIJobStatusResponse:
    job = job_store.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="AI job not found")
    return AIJobStatusResponse(
        job_id=job.id,
        state=job.state.value,
        progress=job.progress,
        stage=job.stage,
        created_at=job.created_at,
        updated_at=job.updated_at,
        result=job.result,
        error=job.error,
    )
