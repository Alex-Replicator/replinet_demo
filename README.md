# Replinet

Система автоматизации для работы с веб-браузерами, построенная на основе современного стека технологий.

## Технологии

### Backend
- Python FastAPI
- PostgreSQL
- Redis
- Alembic для миграций
- Docker и Docker Compose

### Frontend
- Vue 3
- TypeScript
- Vite
- SCSS

## Установка и запуск

### Предварительные требования
- Docker
- Docker Compose

### Шаги по установке

1. Клонируйте репозиторий:
```bash
git clone https://github.com/username/replinet.git
cd replinet
```

2. Скопируйте файл с переменными окружения:
```bash
cp .env.example .env
```

3. Отредактируйте `.env` файл, установив необходимые значения:
- Измените `POSTGRES_PASSWORD`
- Установите безопасный `SECRET_KEY`
- Настройте остальные параметры при необходимости

4. Запустите проект через Docker Compose:
```bash
docker compose up -d
```

После запуска:
- Frontend будет доступен по адресу: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger документация API: http://localhost:8000/docs

## Разработка

### Структура проекта

```
.
├── backend/               # Python FastAPI backend
│   ├── app/              # Основной код приложения
│   ├── migrations/       # Миграции Alembic
│   └── tests/           # Тесты
├── frontend/             # Vue.js frontend
│   ├── src/             # Исходный код
│   └── public/          # Статические файлы
└── docker-compose.yml    # Docker Compose конфигурация
```

### Команды для разработки

```bash
# Запуск с отображением логов
docker compose up

# Пересборка контейнеров
docker compose build

# Остановка проекта
docker compose down

# Применение миграций
docker compose exec backend alembic upgrade head

# Создание новой миграции
docker compose exec backend alembic revision --autogenerate -m "description"
```

## Тестирование

```bash
# Запуск тестов бэкенда
docker compose exec backend pytest

# Запуск тестов фронтенда
docker compose exec frontend npm test
```

## Лицензия

MIT License. См. файл `LICENSE` для подробностей.