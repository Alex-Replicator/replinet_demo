from typing import Optional, List, Dict
from datetime import datetime
from pydantic import BaseModel

class ThreadBase(BaseModel):
    status: str = "created"
    error_message: Optional[str] = None

class ThreadCreate(ThreadBase):
    pass

class ThreadUpdate(ThreadBase):
    browser_id: Optional[str] = None
    execution_time: Optional[int] = None
    logs: Optional[List[str]] = None
    results: Optional[Dict] = None

class Thread(ThreadBase):
    id: int
    agent_id: int
    browser_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    execution_time: Optional[int] = None
    logs: List[str] = []
    results: Dict = {}
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ThreadResponse(Thread):
    pass

class AgentBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True
    personal_instructions: Optional[str] = None
    browser_config: Optional[Dict] = None

class AgentCreate(AgentBase):
    preset_id: int
    credentials: Optional[Dict] = None

class AgentUpdate(AgentBase):
    credentials: Optional[Dict] = None
    status: Optional[str] = None

class Agent(AgentBase):
    id: int
    user_id: int
    preset_id: int
    status: str = "idle"
    credentials: Dict = {}
    total_runs: int = 0
    successful_runs: int = 0
    error_runs: int = 0
    total_runtime: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AgentResponse(Agent):
    pass

class AgentWithThreads(Agent):
    threads: List[ThreadResponse] = []

# Схемы для пресетов (используются в агентах)
class PresetBase(BaseModel):
    name: str
    description: Optional[str] = None
    ai_model: str
    temperature: float = 0.7
    max_tokens: int = 2000
    system_prompt: str
    additional_config: Optional[Dict] = None

class PresetCreate(PresetBase):
    pass

class PresetUpdate(PresetBase):
    pass

class Preset(PresetBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PresetResponse(Preset):
    pass