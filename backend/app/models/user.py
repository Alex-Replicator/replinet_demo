from sqlalchemy import Column, String, Enum
from sqlalchemy.orm import relationship
from app.models.base import Base, PrimaryKeyMixin, TimestampMixin
from app.core.config import settings

class User(Base, PrimaryKeyMixin, TimestampMixin):
    """Модель пользователя"""
    __tablename__ = "users"

    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Может быть NULL для OAuth
    full_name = Column(String)
    role = Column(
        Enum(*settings.ROLES, name="user_role"),
        nullable=False,
        default="free_user"
    )
    
    # OAuth данные
    google_id = Column(String, unique=True, index=True, nullable=True)
    
    # Настройки пользователя
    language = Column(String, default="en")
    theme = Column(String, default="light")
    
    # Отношения
    presets = relationship("Preset", back_populates="user", cascade="all, delete")
    agents = relationship("Agent", back_populates="user", cascade="all, delete")
    
    # Ограничения в зависимости от роли
    MAX_PRESETS = {
        "free_user": 2,
        "pro_user": 10,
        "team_member": 5,
        "team_organizer": 20,
        "admin": -1,  # без ограничений
        "super_admin": -1,
    }
    
    MAX_AGENTS = {
        "free_user": 1,
        "pro_user": 5,
        "team_member": 3,
        "team_organizer": 10,
        "admin": -1,
        "super_admin": -1,
    }
    
    def can_create_preset(self) -> bool:
        """Проверка возможности создания нового пресета"""
        if self.MAX_PRESETS.get(self.role, 0) == -1:
            return True
        return len(self.presets) < self.MAX_PRESETS.get(self.role, 0)
    
    def can_create_agent(self) -> bool:
        """Проверка возможности создания нового агента"""
        if self.MAX_AGENTS.get(self.role, 0) == -1:
            return True
        return len(self.agents) < self.MAX_AGENTS.get(self.role, 0)