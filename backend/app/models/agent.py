from sqlalchemy import Column, String, JSON, ForeignKey, Boolean, Integer
from sqlalchemy.orm import relationship
from app.models.base import Base, PrimaryKeyMixin, TimestampMixin

class Agent(Base, PrimaryKeyMixin, TimestampMixin):
    """Модель ИИ-агента"""
    __tablename__ = "agents"

    name = Column(String, nullable=False)
    description = Column(String)
    
    # Состояние агента
    is_active = Column(Boolean, default=True)
    status = Column(String, default="idle")  # idle, running, error
    
    # Персональные настройки и данные
    personal_instructions = Column(String)
    credentials = Column(JSON, default={})  # Зашифрованные учетные данные
    browser_config = Column(JSON, default={})  # Настройки браузера
    
    # Статистика
    total_runs = Column(Integer, default=0)
    successful_runs = Column(Integer, default=0)
    error_runs = Column(Integer, default=0)
    total_runtime = Column(Integer, default=0)  # в секундах
    
    # Внешние ключи
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    preset_id = Column(Integer, ForeignKey("presets.id", ondelete="CASCADE"), nullable=False)
    
    # Отношения
    user = relationship("User", back_populates="agents")
    preset = relationship("Preset", back_populates="agents")
    threads = relationship("Thread", back_populates="agent", cascade="all, delete")

    def to_dict(self):
        """Преобразование в словарь для API"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "is_active": self.is_active,
            "status": self.status,
            "personal_instructions": self.personal_instructions,
            "browser_config": self.browser_config,
            "total_runs": self.total_runs,
            "successful_runs": self.successful_runs,
            "error_runs": self.error_runs,
            "total_runtime": self.total_runtime,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "user_id": self.user_id,
            "preset_id": self.preset_id
        }

class Thread(Base, PrimaryKeyMixin, TimestampMixin):
    """Модель потока выполнения агента"""
    __tablename__ = "threads"

    # Состояние потока
    status = Column(String, nullable=False, default="created")  # created, running, completed, error
    error_message = Column(String)
    
    # Данные выполнения
    browser_id = Column(String, unique=True)  # ID контейнера browser-use
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    execution_time = Column(Integer)  # в секундах
    
    # Логи и результаты
    logs = Column(JSON, default=[])
    results = Column(JSON, default={})
    
    # Внешние ключи
    agent_id = Column(Integer, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    
    # Отношения
    agent = relationship("Agent", back_populates="threads")

    def to_dict(self):
        """Преобразование в словарь для API"""
        return {
            "id": self.id,
            "status": self.status,
            "error_message": self.error_message,
            "browser_id": self.browser_id,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "execution_time": self.execution_time,
            "logs": self.logs,
            "results": self.results,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "agent_id": self.agent_id
        }