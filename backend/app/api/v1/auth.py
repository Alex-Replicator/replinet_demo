from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from google.oauth2 import id_token
from google.auth.transport import requests

from app.core.security import create_access_token
from app.core.config import settings
from app.core.deps import get_db, get_current_user
from app.crud.user import user_crud
from app.schemas.user import (
    User,
    UserCreate,
    UserResponse,
    Token,
    Login,
    GoogleAuth,
    PasswordReset,
    PasswordChange
)
from app.models.user import User as UserModel

router = APIRouter()

@router.post("/auth/register", response_model=UserResponse)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Регистрация нового пользователя
    """
    # Проверяем, не существует ли уже пользователь с таким email
    user = await user_crud.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="Пользователь с таким email уже существует"
        )
    
    # Создаем пользователя
    user = await user_crud.create(db, obj_in=user_in)
    
    # Создаем токен доступа
    access_token = create_access_token(
        subject=str(user.id),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "user": user,
        "token": Token(access_token=access_token)
    }

@router.post("/auth/login", response_model=UserResponse)
async def login(
    login_data: Login,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    OAuth2 совместимый токен для логина с JWT
    """
    user = await user_crud.authenticate(
        db,
        email=login_data.email,
        password=login_data.password
    )
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Неверный email или пароль"
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=400,
            detail="Неактивный пользователь"
        )
    
    access_token = create_access_token(
        subject=str(user.id),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "user": user,
        "token": Token(access_token=access_token)
    }

@router.post("/auth/google", response_model=UserResponse)
async def google_auth(
    google_data: GoogleAuth,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Аутентификация через Google OAuth
    """
    try:
        # Проверяем токен Google
        idinfo = id_token.verify_oauth2_token(
            google_data.token,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
        
        # Проверяем, существует ли пользователь с таким google_id
        user = await user_crud.get_by_google_id(
            db,
            google_id=idinfo["sub"]
        )
        
        if not user:
            # Создаем нового пользователя
            user_in = UserCreate(
                email=idinfo["email"],
                full_name=idinfo.get("name"),
                google_id=idinfo["sub"],
                is_active=True
            )
            user = await user_crud.create(db, obj_in=user_in)
        
        access_token = create_access_token(
            subject=str(user.id),
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        return {
            "user": user,
            "token": Token(access_token=access_token)
        }
        
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Недействительный токен Google"
        )

@router.post("/auth/password-reset", response_model=dict)
async def reset_password(
    reset_data: PasswordReset,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Запрос на сброс пароля
    """
    user = await user_crud.get_by_email(db, email=reset_data.email)
    if user:
        # TODO: Отправка email со ссылкой для сброса пароля
        # background_tasks.add_task(send_reset_password_email, user.email)
        pass
    
    return {
        "message": "Если указанный email существует, вы получите инструкции по сбросу пароля"
    }

@router.post("/auth/change-password", response_model=dict)
async def change_password(
    password_data: PasswordChange,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    """
    Изменение пароля пользователя
    """
    # Проверяем старый пароль
    if not await user_crud.authenticate(
        db,
        email=current_user.email,
        password=password_data.old_password
    ):
        raise HTTPException(
            status_code=400,
            detail="Неверный текущий пароль"
        )
    
    # Обновляем пароль
    user_in = {"password": password_data.new_password}
    await user_crud.update(db, db_obj=current_user, obj_in=user_in)
    
    return {"message": "Пароль успешно изменен"}

@router.post("/auth/test-token", response_model=User)
async def test_token(current_user: UserModel = Depends(get_current_user)) -> Any:
    """
    Тест валидности токена
    """
    return current_user