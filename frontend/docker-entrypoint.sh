#!/bin/sh

# Замена переменных окружения в конфигурации nginx
envsubst '${API_URL} ${WS_URL}' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp
mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf

# Замена переменных окружения в index.html
INDEX_FILE="/usr/share/nginx/html/index.html"
if [ -f "$INDEX_FILE" ]; then
    envsubst '${VITE_API_URL} ${VITE_WS_URL}' < "$INDEX_FILE" > "$INDEX_FILE.tmp"
    mv "$INDEX_FILE.tmp" "$INDEX_FILE"
fi

# Запуск nginx
exec "$@"