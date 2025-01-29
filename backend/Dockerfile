# Базовый образ с Python
FROM docker.io/library/python:3.10.12-slim-bullseye as python-base

# Python переменные окружения
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100 \
    POETRY_VERSION=1.7.1 \
    POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1 \
    PYSETUP_PATH="/opt/pysetup" \
    VENV_PATH="/opt/pysetup/.venv"

# Добавляем poetry в PATH
ENV PATH="$POETRY_HOME/bin:$VENV_PATH/bin:$PATH"

# Этап установки зависимостей
FROM python-base as builder-base
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    python3-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Установка poetry через pip
RUN pip install --no-cache-dir "poetry==$POETRY_VERSION"

# Копируем файлы зависимостей
WORKDIR $PYSETUP_PATH
COPY pyproject.toml ./

# Проверка наличия файлов и установка зависимостей проекта
RUN ls -la && \
    poetry config virtualenvs.create false && \
    poetry install --only main -vvv

# Этап разработки
FROM python-base as development

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    git \
    python3-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Установка poetry через pip
RUN pip install --no-cache-dir "poetry==$POETRY_VERSION"

# Копируем зависимости из builder-base
COPY --from=builder-base $POETRY_HOME $POETRY_HOME
COPY --from=builder-base $PYSETUP_PATH $PYSETUP_PATH

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем исходный код
COPY . .

# Устанавливаем зависимости для разработки
RUN poetry install

# Установка Playwright browsers
RUN poetry run playwright install --with-deps chromium

# Запуск development сервера
CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Этап продакшена
FROM python-base as production

# Копируем только необходимые файлы из builder-base
COPY --from=builder-base $PYSETUP_PATH $PYSETUP_PATH
COPY --from=builder-base $POETRY_HOME $POETRY_HOME

# Установка системных зависимостей для Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем исходный код
COPY . .

# Установка Playwright browsers
RUN poetry run playwright install --with-deps chromium

# Запуск production сервера через gunicorn
CMD ["poetry", "run", "gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]

# Здоровье контейнера
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1