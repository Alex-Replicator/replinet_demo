from sqlalchemy import Column, String, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base, PrimaryKeyMixin, TimestampMixin

class Preset(Base, PrimaryKeyMixin, TimestampMixin):
    """Модель пресета для ИИ-агента"""
    __tablename__ = "presets"

    name = Column(String, nullable=False)
    description = Column(String)
    
    # Настройки ИИ
    ai_model = Column(String, nullable=False)
    temperature = Column(Float, nullable=False, default=0.7)
    max_tokens = Column(Integer, nullable=False, default=2000)
    system_prompt = Column(String, nullable=False)
    
    # Дополнительные настройки
    additional_config = Column(JSON, default={})
    
    # Внешние ключи
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Отношения
    user = relationship("User", back_populates="presets")
    agents = relationship("Agent", back_populates="preset", cascade="all, delete")

    def to_dict(self):
        """Преобразование в словарь для API"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "ai_model": self.ai_model,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "system_prompt": self.system_prompt,
            "additional_config": self.additional_config,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "user_id": self.user_id
        }