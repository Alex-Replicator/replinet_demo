from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.models.agent import Agent, Thread
from app.schemas.agent import (
    AgentCreate,
    AgentUpdate,
    AgentResponse,
    ThreadCreate,
    ThreadResponse,
    AgentWithThreads
)
from app.services.browser_manager import BrowserManager
from app.crud.agent import agent_crud
from app.crud.thread import thread_crud

router = APIRouter()
browser_manager = BrowserManager()

@router.post("/agents", response_model=AgentResponse)
async def create_agent(
    agent_in: AgentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создание нового агента"""
    if not current_user.can_create_agent():
        raise HTTPException(
            status_code=403,
            detail="Достигнут лимит агентов для вашего тарифа"
        )
    
    agent = await agent_crud.create(db, obj_in=agent_in, user_id=current_user.id)
    return agent

@router.get("/agents", response_model=List[AgentResponse])
async def get_agents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
):
    """Получение списка агентов"""
    filters = {"user_id": current_user.id}
    if status:
        filters["status"] = status
    
    agents = await agent_crud.get_multi(
        db, skip=skip, limit=limit, filters=filters
    )
    return agents

@router.get("/agents/{agent_id}", response_model=AgentWithThreads)
async def get_agent(
    agent_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получение информации об агенте"""
    agent = await agent_crud.get(db, id=agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Агент не найден")
    if agent.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа к этому агенту")
    return agent

@router.put("/agents/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: int,
    agent_in: AgentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Обновление агента"""
    agent = await agent_crud.get(db, id=agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Агент не найден")
    if agent.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа к этому агенту")
    
    agent = await agent_crud.update(db, db_obj=agent, obj_in=agent_in)
    return agent

@router.delete("/agents/{agent_id}")
async def delete_agent(
    agent_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Удаление агента"""
    agent = await agent_crud.get(db, id=agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Агент не найден")
    if agent.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа к этому агенту")
    
    # Остановка всех активных потоков
    for thread in agent.threads:
        if thread.browser_id:
            background_tasks.add_task(
                browser_manager.stop_browser,
                thread.browser_id
            )
    
    await agent_crud.remove(db, id=agent_id)
    return {"message": "Агент успешно удален"}

@router.post("/agents/{agent_id}/threads", response_model=ThreadResponse)
async def create_thread(
    agent_id: int,
    thread_in: ThreadCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создание нового потока для агента"""
    agent = await agent_crud.get(db, id=agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Агент не найден")
    if agent.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа к этому агенту")
    
    # Проверка количества активных потоков
    active_threads = len([t for t in agent.threads if t.status == "running"])
    if active_threads >= agent.preset.max_threads:
        raise HTTPException(
            status_code=400,
            detail=f"Достигнут лимит активных потоков ({agent.preset.max_threads})"
        )
    
    # Создание потока
    thread = await thread_crud.create(db, obj_in=thread_in, agent_id=agent_id)
    
    # Запуск browser-use в фоне
    browser_id = await browser_manager.create_browser(agent_id, thread.id)
    if browser_id:
        thread = await thread_crud.update(
            db,
            db_obj=thread,
            obj_in={"browser_id": browser_id, "status": "running"}
        )
    else:
        raise HTTPException(
            status_code=500,
            detail="Не удалось запустить браузер"
        )
    
    return thread

@router.get("/agents/{agent_id}/threads", response_model=List[ThreadResponse])
async def get_threads(
    agent_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
):
    """Получение списка потоков агента"""
    agent = await agent_crud.get(db, id=agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Агент не найден")
    if agent.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа к этому агенту")
    
    filters = {"agent_id": agent_id}
    if status:
        filters["status"] = status
    
    threads = await thread_crud.get_multi(
        db, skip=skip, limit=limit, filters=filters
    )
    return threads

@router.post("/agents/{agent_id}/threads/{thread_id}/stop")
async def stop_thread(
    agent_id: int,
    thread_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Остановка потока"""
    thread = await thread_crud.get(db, id=thread_id)
    if not thread or thread.agent_id != agent_id:
        raise HTTPException(status_code=404, detail="Поток не найден")
    if thread.agent.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа к этому потоку")
    
    if thread.browser_id:
        success = await browser_manager.stop_browser(thread.browser_id)
        if success:
            thread = await thread_crud.update(
                db,
                db_obj=thread,
                obj_in={"status": "stopped", "browser_id": None}
            )
            return {"message": "Поток успешно остановлен"}
    
    raise HTTPException(
        status_code=500,
        detail="Не удалось остановить поток"
    )