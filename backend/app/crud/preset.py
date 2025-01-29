from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.base import CRUDBase
from app.models.preset import Preset
from app.schemas.agent import PresetCreate, PresetUpdate

class CRUDPreset(CRUDBase[Preset, PresetCreate, PresetUpdate]):
    async def get_by_user(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Preset]:
        """
        Получить список пресетов пользователя
        """
        result = await db.execute(
            select(Preset)
            .filter(Preset.user_id == user_id)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_public_presets(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100
    ) -> List[Preset]:
        """
        Получить список публичных пресетов
        """
        result = await db.execute(
            select(Preset)
            .filter(Preset.is_public == True)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def create_with_owner(
        self,
        db: AsyncSession,
        *,
        obj_in: PresetCreate,
        user_id: int
    ) -> Preset:
        """
        Создать пресет с владельцем
        """
        return await self.create(db, obj_in=obj_in, user_id=user_id)

    async def get_by_name_and_user(
        self,
        db: AsyncSession,
        *,
        name: str,
        user_id: int
    ) -> Optional[Preset]:
        """
        Получить пресет по имени и ID пользователя
        """
        result = await db.execute(
            select(Preset)
            .filter(
                Preset.name == name,
                Preset.user_id == user_id
            )
        )
        return result.scalar_one_or_none()

    async def get_user_preset_count(
        self,
        db: AsyncSession,
        *,
        user_id: int
    ) -> int:
        """
        Получить количество пресетов пользователя
        """
        return await self.count(db, filters={"user_id": user_id})

    async def clone_preset(
        self,
        db: AsyncSession,
        *,
        preset_id: int,
        user_id: int,
        new_name: str
    ) -> Optional[Preset]:
        """
        Клонировать существующий пресет
        """
        original = await self.get(db, id=preset_id)
        if not original:
            return None

        # Создаем новый пресет на основе существующего
        new_preset_data = PresetCreate(
            name=new_name,
            description=f"Клон пресета: {original.name}",
            ai_model=original.ai_model,
            temperature=original.temperature,
            max_tokens=original.max_tokens,
            system_prompt=original.system_prompt,
            additional_config=original.additional_config
        )

        return await self.create_with_owner(
            db,
            obj_in=new_preset_data,
            user_id=user_id
        )

    async def update_prompt(
        self,
        db: AsyncSession,
        *,
        preset_id: int,
        new_prompt: str
    ) -> Optional[Preset]:
        """
        Обновить системный промпт пресета
        """
        preset = await self.get(db, id=preset_id)
        if not preset:
            return None

        return await self.update(
            db,
            db_obj=preset,
            obj_in={"system_prompt": new_prompt}
        )

# Создаем глобальный экземпляр CRUD для пресетов
preset_crud = CRUDPreset(Preset)