from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "CivicAI Dispute Resolution Engine"
    environment: str = Field(default="development", alias="ENVIRONMENT")
    api_prefix: str = "/api/v1"
    database_url: str = Field(
        default="postgresql+psycopg2://civic:civic@localhost:5432/civic_ai",
        alias="DATABASE_URL",
    )
    jwt_secret_key: str = Field(
        default="change-this-secret-in-production",
        alias="JWT_SECRET_KEY",
    )
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    max_upload_mb: int = 25
    upload_dir: str = "backend/uploads"
    ollama_base_url: str = Field(default="http://127.0.0.1:11434", alias="OLLAMA_BASE_URL")
    ollama_mistral_model: str = Field(default="mistral", alias="OLLAMA_MISTRAL_MODEL")
    ollama_llava_model: str = Field(default="llava", alias="OLLAMA_LLAVA_MODEL")
    ollama_timeout_seconds: float = Field(default=90.0, alias="OLLAMA_TIMEOUT_SECONDS")

    model_config = SettingsConfigDict(env_file=".env", populate_by_name=True)


@lru_cache
def get_settings() -> Settings:
    return Settings()
