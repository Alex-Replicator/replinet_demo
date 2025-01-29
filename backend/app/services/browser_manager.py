import asyncio
import logging
from typing import Dict, Optional
import docker
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger(__name__)

class BrowserManager:
    def __init__(self):
        self.docker_client = docker.from_env()
        self.active_browsers: Dict[str, dict] = {}
        self.max_instances = int(settings.MAX_BROWSER_INSTANCES)
        self.browser_timeout = int(settings.BROWSER_TIMEOUT)

    async def create_browser(self, agent_id: int, thread_id: int) -> Optional[str]:
        """
        Создает новый изолированный браузер для агента
        """
        if len(self.active_browsers) >= self.max_instances:
            logger.error("Достигнут лимит браузеров")
            return None

        try:
            container = self.docker_client.containers.run(
                "browseruse/browser-use:latest",
                detach=True,
                remove=True,
                environment={
                    "AGENT_ID": str(agent_id),
                    "THREAD_ID": str(thread_id)
                },
                network="replinet_network",
                mem_limit="1g",
                cpu_quota=100000,  # 1 CPU
                name=f"browser_{agent_id}_{thread_id}_{datetime.now().timestamp()}"
            )

            browser_id = container.id
            self.active_browsers[browser_id] = {
                "container": container,
                "agent_id": agent_id,
                "thread_id": thread_id,
                "started_at": datetime.now()
            }

            logger.info(f"Создан браузер {browser_id} для агента {agent_id}")
            return browser_id

        except Exception as e:
            logger.error(f"Ошибка создания браузера: {e}")
            return None

    async def stop_browser(self, browser_id: str) -> bool:
        """
        Останавливает и удаляет browser-use контейнер
        """
        try:
            if browser_id in self.active_browsers:
                container = self.active_browsers[browser_id]["container"]
                container.stop()
                del self.active_browsers[browser_id]
                logger.info(f"Остановлен браузер {browser_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Ошибка остановки браузера {browser_id}: {e}")
            return False

    async def check_timeouts(self):
        """
        Проверяет и останавливает зависшие браузеры
        """
        while True:
            current_time = datetime.now()
            browsers_to_stop = []

            for browser_id, info in self.active_browsers.items():
                duration = (current_time - info["started_at"]).total_seconds()
                if duration > self.browser_timeout:
                    browsers_to_stop.append(browser_id)

            for browser_id in browsers_to_stop:
                logger.warning(f"Таймаут браузера {browser_id}")
                await self.stop_browser(browser_id)

            await asyncio.sleep(10)  # Проверка каждые 10 секунд

    def get_browser_status(self, browser_id: str) -> Optional[dict]:
        """
        Возвращает статус браузера
        """
        if browser_id in self.active_browsers:
            info = self.active_browsers[browser_id]
            container = info["container"]
            
            return {
                "status": container.status,
                "agent_id": info["agent_id"],
                "thread_id": info["thread_id"],
                "started_at": info["started_at"].isoformat(),
                "container_id": browser_id
            }
        return None

    async def cleanup(self):
        """
        Очистка всех браузеров при выключении
        """
        for browser_id in list(self.active_browsers.keys()):
            await self.stop_browser(browser_id)

async def main():
    """
    Основной цикл менеджера браузеров
    """
    logging.basicConfig(level=logging.INFO)
    manager = BrowserManager()
    
    try:
        # Запуск проверки таймаутов
        asyncio.create_task(manager.check_timeouts())
        
        # Держим сервис запущенным
        while True:
            await asyncio.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("Остановка менеджера браузеров")
        await manager.cleanup()

if __name__ == "__main__":
    asyncio.run(main())