from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, constr

class UserBase(BaseModel):
    """Базовая схема пользователя"""
    email: EmailStr
    full_name: Optional[str] = None
    language: str = "en"
    theme: str = "light"
    is_active: bool = True

class UserCreate(UserBase):
    """Схема для создания пользователя"""
    password: Optional[constr(min_length=8)] = None  # Optional для OAuth
    google_id: Optional[str] = None
    role: Optional[str] = "free_user"

class UserUpdate(UserBase):
    """Схема для обновления пользователя"""
    password: Optional[constr(min_length=8)] = None
    role: Optional[str] = None

class UserInDBBase(UserBase):
    """Базовая схема пользователя в БД"""
    id: int
    role: str
    google_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class User(UserInDBBase):
    """Схема пользователя для API ответов"""
    pass

class UserWithStats(User):
    """Схема пользователя с дополнительной статистикой"""
    total_agents: int = 0
    active_agents: int = 0
    total_presets: int = 0
    total_threads: int = 0
    successful_runs: int = 0
    error_runs: int = 0
    total_runtime: int = 0

# Схемы для токенов
class Token(BaseModel):
    """Схема токена доступа"""
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    """Схема данных токена"""
    sub: str
    exp: datetime

# Схемы для аутентификации
class Login(BaseModel):
    """Схема для входа"""
    email: EmailStr
    password: str

class GoogleAuth(BaseModel):
    """Схема для Google OAuth"""
    token: str

# Схемы для смены пароля
class PasswordReset(BaseModel):
    """Схема для сброса пароля"""
    email: EmailStr

class PasswordChange(BaseModel):
    """Схема для изменения пароля"""
    old_password: str
    new_password: constr(min_length=8)

# Схемы для обновления настроек
class UserSettings(BaseModel):
    """Схема для обновления настроек пользователя"""
    language: Optional[str] = None
    theme: Optional[str] = None
    email_notifications: Optional[bool] = None
    telegram_notifications: Optional[bool] = None

# Схемы для ответов API
class UserResponse(BaseModel):
    """Базовая схема ответа с пользователем"""
    user: User
    token: Optional[Token] = None

class UserListResponse(BaseModel):
    """Схема ответа со списком пользователей"""
    total: int
    items: list[User]