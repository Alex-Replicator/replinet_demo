from typing import Any, Optional, Union
import json
import redis.asyncio as redis
from app.core.config import settings

# Создаем пул подключений к Redis
redis_pool = redis.ConnectionPool(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=0,
    decode_responses=True,
    max_connections=10
)

class RedisManager:
    def __init__(self):
        self.redis = redis.Redis(connection_pool=redis_pool)
        self.default_ttl = 3600  # 1 час

    async def get(self, key: str) -> Optional[Any]:
        """
        Получить значение из Redis
        """
        try:
            value = await self.redis.get(key)
            return json.loads(value) if value else None
        except (json.JSONDecodeError, TypeError):
            return None

    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None
    ) -> bool:
        """
        Установить значение в Redis
        """
        try:
            serialized = json.dumps(value)
            return await self.redis.set(
                key,
                serialized,
                ex=ttl or self.default_ttl
            )
        except (TypeError, json.JSONError):
            return False

    async def delete(self, key: str) -> bool:
        """
        Удалить значение из Redis
        """
        return await self.redis.delete(key) > 0

    async def exists(self, key: str) -> bool:
        """
        Проверить существование ключа
        """
        return await self.redis.exists(key) > 0

    async def increment(self, key: str) -> int:
        """
        Увеличить значение на 1
        """
        return await self.redis.incr(key)

    async def decrement(self, key: str) -> int:
        """
        Уменьшить значение на 1
        """
        return await self.redis.decr(key)

class BrowserStateManager(RedisManager):
    """Менеджер для хранения состояния браузеров"""
    
    async def set_browser_state(
        self,
        browser_id: str,
        state: dict,
        ttl: int = 3600
    ) -> bool:
        """
        Сохранить состояние браузера
        """
        key = f"browser:{browser_id}:state"
        return await self.set(key, state, ttl)

    async def get_browser_state(self, browser_id: str) -> Optional[dict]:
        """
        Получить состояние браузера
        """
        key = f"browser:{browser_id}:state"
        return await self.get(key)

    async def delete_browser_state(self, browser_id: str) -> bool:
        """
        Удалить состояние браузера
        """
        key = f"browser:{browser_id}:state"
        return await self.delete(key)

class TaskQueue(RedisManager):
    """Менеджер очереди задач"""
    
    async def enqueue(
        self,
        queue_name: str,
        task_data: dict,
        ttl: Optional[int] = None
    ) -> str:
        """
        Добавить задачу в очередь
        """
        task_id = f"task:{queue_name}:{await self.increment(f'{queue_name}:counter')}"
        await self.set(task_id, task_data, ttl)
        await self.redis.lpush(f"queue:{queue_name}", task_id)
        return task_id

    async def dequeue(self, queue_name: str) -> Optional[dict]:
        """
        Получить задачу из очереди
        """
        task_id = await self.redis.rpop(f"queue:{queue_name}")
        if not task_id:
            return None
            
        task_data = await self.get(task_id)
        await self.delete(task_id)
        return task_data

    async def get_queue_length(self, queue_name: str) -> int:
        """
        Получить длину очереди
        """
        return await self.redis.llen(f"queue:{queue_name}")

# Создаем глобальные экземпляры менеджеров
redis_manager = RedisManager()
browser_state = BrowserStateManager()
task_queue = TaskQueue()