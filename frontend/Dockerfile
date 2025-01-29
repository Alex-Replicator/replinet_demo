# Этап сборки
FROM node:18-alpine AS build

WORKDIR /app

# Установка зависимостей
COPY package*.json ./
RUN npm ci

# Копирование исходного кода
COPY . .

# Сборка для продакшена
RUN npm run build

# Этап разработки
FROM node:18-alpine AS dev

WORKDIR /app

# Установка зависимостей для разработки
COPY package*.json ./
RUN npm install

# Копирование исходного кода
COPY . .

# Запуск dev сервера
CMD ["npm", "run", "dev"]

# Этап продакшена
FROM nginx:alpine AS prod

# Копирование собранных файлов
COPY --from=build /app/dist /usr/share/nginx/html

# Настройка NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Скрипт для подстановки переменных окружения
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]