from typing import AsyncGenerator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.security import verify_token
from app.db.session import async_session
from app.models.user import User
from app.crud.user import user_crud

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Зависимость для получения сессии базы данных
    """
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    Зависимость для получения текущего пользователя
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось проверить учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Проверяем JWT токен
        user_id = verify_token(token)
        if not user_id:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    # Получаем пользователя из базы
    user = await user_crud.get(db, id=int(user_id))
    if not user:
        raise credentials_exception
        
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Зависимость для получения активного пользователя
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неактивный пользователь"
        )
    return current_user

async def get_current_admin_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Зависимость для получения пользователя с правами администратора
    """
    if not current_user.role in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав"
        )
    return current_user

async def get_current_team_manager(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Зависимость для получения пользователя с правами управления командой
    """
    if not current_user.role in ["team_organizer", "admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав"
        )
    return current_user

def check_user_permissions(required_role: str) -> User:
    """
    Фабрика зависимостей для проверки прав пользователя
    """
    async def _check_permissions(
        current_user: User = Depends(get_current_active_user)
    ) -> User:
        role_levels = {
            "guest": 0,
            "free_user": 1,
            "pro_user": 2,
            "team_member": 3,
            "team_organizer": 4,
            "admin": 5,
            "super_admin": 6
        }
        
        if role_levels.get(current_user.role, 0) < role_levels.get(required_role, 0):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав"
            )
        return current_user
        
    return _check_permissions