from pydantic import BaseModel


class AIJobStartResponse(BaseModel):
    job_id: str
    state: str
    status_url: str


class AIJobStatusResponse(BaseModel):
    job_id: str
    state: str
    progress: int
    stage: str
    created_at: str
    updated_at: str
    result: dict | None = None
    error: str | None = None
