from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/")
def root() -> dict:
    return {"message": "CivicAI backend running", "docs": "/docs", "health": "/health"}


@router.get("/health")
def health() -> dict:
    return {"status": "healthy", "service": "civic-ai-platform-api"}
