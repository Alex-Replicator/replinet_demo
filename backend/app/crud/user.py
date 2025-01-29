from typing import Optional, Dict, Any, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import get_password_hash, verify_password
from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[User]:
        """
        Получить пользователя по email
        """
        result = await db.execute(
            select(User).filter(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_by_google_id(self, db: AsyncSession, *, google_id: str) -> Optional[User]:
        """
        Получить пользователя по Google ID
        """
        result = await db.execute(
            select(User).filter(User.google_id == google_id)
        )
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, *, obj_in: UserCreate, **kwargs: Any) -> User:
        """
        Создать нового пользователя
        """
        db_obj = User(
            email=obj_in.email,
            hashed_password=get_password_hash(obj_in.password) if obj_in.password else None,
            full_name=obj_in.full_name,
            role=obj_in.role if obj_in.role else "free_user",
            google_id=obj_in.google_id,
            language=obj_in.language if obj_in.language else "en",
            theme=obj_in.theme if obj_in.theme else "light",
            **kwargs
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self,
        db: AsyncSession,
        *,
        db_obj: User,
        obj_in: UserUpdate | Dict[str, Any]
    ) -> User:
        """
        Обновить пользователя
        """
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
            
        if "password" in update_data:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
            
        return await super().update(db, db_obj=db_obj, obj_in=update_data)

    async def authenticate(
        self,
        db: AsyncSession,
        *,
        email: str,
        password: str
    ) -> Optional[User]:
        """
        Аутентифицировать пользователя
        """
        user = await self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    async def get_multi_by_role(
        self,
        db: AsyncSession,
        *,
        role: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[User]:
        """
        Получить список пользователей по роли
        """
        result = await db.execute(
            select(User)
            .filter(User.role == role)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def is_active(self, user: User) -> bool:
        """
        Проверить активен ли пользователь
        """
        return True  # В будущем можно добавить проверку статуса

    async def is_admin(self, user: User) -> bool:
        """
        Проверить является ли пользователь администратором
        """
        return user.role in ["admin", "super_admin"]

# Создаем глобальный экземпляр CRUD для пользователей
user_crud = CRUDUser(User)