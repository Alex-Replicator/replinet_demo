from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.base import CRUDBase
from app.models.agent import Agent, Thread
from app.schemas.agent import AgentCreate, AgentUpdate, ThreadCreate, ThreadUpdate

class CRUDAgent(CRUDBase[Agent, AgentCreate, AgentUpdate]):
    async def get_by_user(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Agent]:
        """
        Получить список агентов пользователя
        """
        result = await db.execute(
            select(Agent)
            .filter(Agent.user_id == user_id)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_active_agents(
        self,
        db: AsyncSession,
        *,
        user_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Agent]:
        """
        Получить список активных агентов
        """
        query = select(Agent).filter(Agent.is_active == True)
        if user_id:
            query = query.filter(Agent.user_id == user_id)
        
        result = await db.execute(
            query.offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def update_stats(
        self,
        db: AsyncSession,
        *,
        agent_id: int,
        successful: bool,
        runtime: int
    ) -> Agent:
        """
        Обновить статистику агента
        """
        agent = await self.get(db, id=agent_id)
        if not agent:
            return None

        agent.total_runs += 1
        if successful:
            agent.successful_runs += 1
        else:
            agent.error_runs += 1
        agent.total_runtime += runtime

        db.add(agent)
        await db.commit()
        await db.refresh(agent)
        return agent

class CRUDThread(CRUDBase[Thread, ThreadCreate, ThreadUpdate]):
    async def get_by_agent(
        self,
        db: AsyncSession,
        *,
        agent_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Thread]:
        """
        Получить список потоков агента
        """
        result = await db.execute(
            select(Thread)
            .filter(Thread.agent_id == agent_id)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_active_threads(
        self,
        db: AsyncSession,
        *,
        agent_id: Optional[int] = None
    ) -> List[Thread]:
        """
        Получить список активных потоков
        """
        query = select(Thread).filter(Thread.status == "running")
        if agent_id:
            query = query.filter(Thread.agent_id == agent_id)
        
        result = await db.execute(query)
        return result.scalars().all()

    async def start_thread(
        self,
        db: AsyncSession,
        *,
        thread_id: int,
        browser_id: str
    ) -> Thread:
        """
        Запустить поток
        """
        thread = await self.get(db, id=thread_id)
        if not thread:
            return None

        thread.status = "running"
        thread.browser_id = browser_id
        thread.start_time = datetime.utcnow()

        db.add(thread)
        await db.commit()
        await db.refresh(thread)
        return thread

    async def complete_thread(
        self,
        db: AsyncSession,
        *,
        thread_id: int,
        success: bool,
        error_message: Optional[str] = None,
        results: Optional[Dict] = None
    ) -> Thread:
        """
        Завершить поток
        """
        thread = await self.get(db, id=thread_id)
        if not thread:
            return None

        thread.status = "completed" if success else "error"
        thread.error_message = error_message
        thread.results = results or {}
        thread.end_time = datetime.utcnow()
        
        if thread.start_time:
            thread.execution_time = int(
                (thread.end_time - thread.start_time).total_seconds()
            )

        db.add(thread)
        await db.commit()
        await db.refresh(thread)
        
        # Обновляем статистику агента
        await agent_crud.update_stats(
            db,
            agent_id=thread.agent_id,
            successful=success,
            runtime=thread.execution_time or 0
        )
        
        return thread

# Создаем глобальные экземпляры CRUD
agent_crud = CRUDAgent(Agent)
thread_crud = CRUDThread(Thread)