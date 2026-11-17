from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import get_settings
from backend.errors import register_exception_handlers
from backend.middleware.logging import RequestLoggingMiddleware, configure_logging
from backend.middleware.security import SecurityHeadersMiddleware
from backend.routers import ai, analytics, auth, complaints, evidence, gis, health, routing, telemetry


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging()

    app = FastAPI(
        title=settings.app_name,
        description=(
            "Production-grade API for civic issue reporting, multimodal evidence intelligence, "
            "AI analysis, municipal routing, GIS operations, and observability."
        ),
        version="1.0.0",
        contact={"name": "CivicAI Platform Operations"},
        openapi_tags=[
            {"name": "Authentication", "description": "JWT login and identity flows"},
            {"name": "Civic Complaints", "description": "Citizen complaint lifecycle APIs"},
            {"name": "Evidence", "description": "Evidence uploads, EXIF forensics, trust scoring"},
            {"name": "AI Analysis", "description": "Mistral, LLaVA, EXIF, and fusion pipeline APIs"},
            {"name": "Municipal Routing", "description": "Department assignment and SLA routing"},
            {"name": "GIS", "description": "Geographic civic issue records and map feeds"},
            {"name": "Analytics", "description": "Executive operational aggregations"},
            {"name": "Observability", "description": "Runtime telemetry and AI pipeline health"},
        ],
    )

    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)

    app.include_router(health.router)
    app.include_router(auth.router, prefix=settings.api_prefix)
    app.include_router(complaints.router, prefix=settings.api_prefix)
    app.include_router(evidence.router, prefix=settings.api_prefix)
    app.include_router(ai.router, prefix=settings.api_prefix)
    app.include_router(routing.router, prefix=settings.api_prefix)
    app.include_router(analytics.router, prefix=settings.api_prefix)
    app.include_router(telemetry.router, prefix=settings.api_prefix)
    app.include_router(gis.router, prefix=settings.api_prefix)
    return app


app = create_app()
