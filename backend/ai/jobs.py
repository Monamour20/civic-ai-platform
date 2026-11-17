from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from threading import Lock
from uuid import uuid4


class AIJobState(str, Enum):
    queued = "queued"
    processing = "processing"
    completed = "completed"
    failed = "failed"


@dataclass
class AIJob:
    id: str
    state: AIJobState = AIJobState.queued
    progress: int = 0
    stage: str = "queued"
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    result: dict | None = None
    error: str | None = None


class AIJobStore:
    def __init__(self) -> None:
        self._jobs: dict[str, AIJob] = {}
        self._lock = Lock()

    def create(self) -> AIJob:
        job = AIJob(id=f"ai_job_{uuid4().hex[:12]}")
        with self._lock:
            self._jobs[job.id] = job
        return job

    def update(self, job_id: str, **changes) -> AIJob | None:
        with self._lock:
            job = self._jobs.get(job_id)
            if job is None:
                return None
            for key, value in changes.items():
                setattr(job, key, value)
            job.updated_at = datetime.now(timezone.utc).isoformat()
            return job

    def get(self, job_id: str) -> AIJob | None:
        with self._lock:
            return self._jobs.get(job_id)


job_store = AIJobStore()
