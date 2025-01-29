-- Создание расширения для UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Создание базового пользователя-администратора
INSERT INTO users (id, email, hashed_password, is_active, is_superuser, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'admin@replinet.local',
    -- Пароль: admin123 (захешированный)
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

-- Создание базовых пресетов
INSERT INTO presets (id, name, description, created_at, updated_at)
VALUES 
    (uuid_generate_v4(), 'Basic Search', 'Basic web search preset', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Data Collection', 'Data collection and analysis preset', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'Content Generation', 'Content generation and writing preset', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;