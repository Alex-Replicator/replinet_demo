from typing import List
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Replinet"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = "AI Agents Management System"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-here"  # в продакшене использовать переменную окружения
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # База данных
    DATABASE_URL: str
    
    # Redis
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    
    # CORS
    CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",  # frontend
        "http://localhost:8000",  # backend
    ]

    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: str | List[str]) -> List[AnyHttpUrl]:
        if isinstance(v, str):
            return [AnyHttpUrl(origin) for origin in v.split(",")]
        return v
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    
    # AI Settings
    DEFAULT_AI_MODEL: str = "gpt-3.5-turbo"
    DEFAULT_TEMPERATURE: float = 0.7
    
    # Browser Settings
    MAX_THREADS_PER_AGENT: int = 5
    BROWSER_TIMEOUT: int = 30
    
    # Roles and Permissions
    ROLES: List[str] = [
        "super_admin",
        "admin",
        "team_organizer",
        "team_member",
        "pro_user",
        "free_user",
        "guest"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

# Создаем глобальный экземпляр настроек
settings = Settings()