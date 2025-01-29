# Руководство по разработке Replinet

## Требования

- Docker и Docker Compose
- Git
- VSCode (рекомендуется)
- Python 3.10+ (для локальной разработки)
- Node.js 18+ (для локальной разработки)

## Быстрый старт

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-org/replinet.git
cd replinet
```

2. Скопируйте файл с переменными окружения:
```bash
cp .env.example .env
```

3. Запустите сервисы через Docker Compose:
```bash
docker compose up -d
```

Сервисы будут доступны по следующим адресам:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Структура проекта

```
replinet/
├── backend/             # FastAPI backend
│   ├── app/
│   │   ├── api/        # API endpoints
│   │   ├── core/       # Конфигурация и утилиты
│   │   ├── crud/       # CRUD операции
│   │   ├── models/     # SQLAlchemy модели
│   │   └── services/   # Бизнес-логика
│   ├── migrations/     # Alembic миграции
│   └── tests/         # Тесты
└── frontend/           # Vue.js frontend
    ├── src/
    │   ├── components/ # Vue компоненты
    │   ├── views/      # Страницы
    │   ├── stores/     # Pinia сторы
    │   └── utils/      # Утилиты
    └── public/         # Статические файлы
```

## Разработка

### Backend

1. Установка зависимостей:
```bash
cd backend
poetry install
```

2. Применение миграций:
```bash
poetry run alembic upgrade head
```

3. Создание новой миграции:
```bash
poetry run alembic revision --autogenerate -m "description"
```

4. Запуск тестов:
```bash
poetry run pytest
```

### Frontend

1. Установка зависимостей:
```bash
cd frontend
npm install
```

2. Запуск dev сервера:
```bash
npm run dev
```

3. Сборка для продакшена:
```bash
npm run build
```

## Работа с Docker

### Пересборка отдельных сервисов:
```bash
docker compose build backend
docker compose build frontend
```

### Просмотр логов:
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

### Перезапуск сервисов:
```bash
docker compose restart backend
docker compose restart frontend
```

## База данных

### Подключение к PostgreSQL:
```bash
docker compose exec postgres psql -U postgres -d replinet
```

### Создание резервной копии:
```bash
docker compose exec postgres pg_dump -U postgres replinet > backup.sql
```

### Восстановление из резервной копии:
```bash
cat backup.sql | docker compose exec -T postgres psql -U postgres -d replinet
```

## Отладка

### Backend
- Используйте `breakpoint()` или `import pdb; pdb.set_trace()` для отладки Python кода
- Логи доступны через `docker compose logs -f backend`

### Frontend
- Vue DevTools для отладки компонентов и состояния
- Chrome DevTools для отладки JavaScript и сети

## Рекомендуемые расширения VSCode

- Python
- Pylance
- Vue Language Features
- TypeScript Vue Plugin
- ESLint
- Prettier
- Docker
- Remote - Containers

## Кодстайл

- Backend: Black + isort для форматирования Python кода
- Frontend: Prettier для форматирования JavaScript/Vue кода
- Используйте pre-commit хуки для автоматической проверки

## CI/CD

Проект использует GitHub Actions для:
- Проверки кодстайла
- Запуска тестов
- Сборки и публикации Docker образов
- Автоматического деплоя

## Мониторинг

- Логи сервисов в Docker
- API метрики через /metrics
- Встроенный мониторинг браузеров
- Websocket события в реальном времени

## Полезные команды

### Очистка Docker:
```bash
# Удаление неиспользуемых образов
docker image prune -a

# Удаление неиспользуемых томов
docker volume prune

# Полная очистка
docker system prune -a
```

### Обновление зависимостей:
```bash
# Backend
poetry update

# Frontend
npm update
```

### Создание нового компонента:
```bash
# Frontend
cd frontend
npm run new:component