import type { BrowserConfig } from '@/types/models'

// Основные настройки приложения
export const APP_CONFIG = {
  name: 'Replinet',
  version: '0.1.0',
  description: 'AI Agents Management System',
  apiUrl: import.meta.env.VITE_API_URL,
  defaultLocale: 'ru',
  defaultTheme: 'light',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportEmail: 'support@replinet.com',
  sessionTimeout: 30 * 60 * 1000, // 30 минут
  pollingInterval: 5000, // 5 секунд
} as const

// Доступные модели ИИ
export const AI_MODELS = [
  {
    value: 'gpt-3.5-turbo',
    title: 'GPT-3.5 Turbo',
    description: 'Быстрая и эффективная модель для большинства задач',
    maxTokens: 4096,
    costPer1K: 0.002,
    available: true
  },
  {
    value: 'gpt-4',
    title: 'GPT-4',
    description: 'Продвинутая модель с улучшенным пониманием контекста',
    maxTokens: 8192,
    costPer1K: 0.03,
    available: true
  },
  {
    value: 'gpt-4-turbo',
    title: 'GPT-4 Turbo',
    description: 'Улучшенная версия GPT-4 с большим контекстным окном',
    maxTokens: 128000,
    costPer1K: 0.04,
    available: false
  }
] as const

// Настройки локализации
export const LOCALES = [
  {
    code: 'ru',
    name: 'Русский',
    flag: '🇷🇺'
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇬🇧'
  }
] as const

// Настройки браузера по умолчанию
export const DEFAULT_BROWSER_CONFIG: BrowserConfig = {
  headless: true,
  proxy_location: 'auto',
  viewport: {
    width: 1920,
    height: 1080
  }
}

// Статусы и их настройки
export const STATUS_CONFIG = {
  idle: {
    color: 'info',
    icon: 'mdi-timer-sand',
    text: 'В ожидании'
  },
  running: {
    color: 'success',
    icon: 'mdi-play-circle',
    text: 'Запущен'
  },
  completed: {
    color: 'primary',
    icon: 'mdi-check-circle',
    text: 'Завершен'
  },
  error: {
    color: 'error',
    icon: 'mdi-alert-circle',
    text: 'Ошибка'
  },
  stopped: {
    color: 'warning',
    icon: 'mdi-stop-circle',
    text: 'Остановлен'
  }
} as const

// Настройки уведомлений
export const NOTIFICATION_CONFIG = {
  position: 'bottom-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  showProgressBar: true,
  types: {
    success: {
      icon: 'mdi-check-circle',
      color: 'success'
    },
    error: {
      icon: 'mdi-alert-circle',
      color: 'error'
    },
    warning: {
      icon: 'mdi-alert',
      color: 'warning'
    },
    info: {
      icon: 'mdi-information',
      color: 'info'
    }
  }
} as const

// Валидация полей форм
export const VALIDATION_RULES = {
  required: (v: any) => !!v || 'Обязательное поле',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Некорректный email',
  password: (v: string) => v.length >= 8 || 'Минимум 8 символов',
  maxLength: (max: number) => (v: string) => 
    !v || v.length <= max || `Максимум ${max} символов`,
  minLength: (min: number) => (v: string) => 
    !v || v.length >= min || `Минимум ${min} символов`,
  numeric: (v: string) => !v || /^\d+$/.test(v) || 'Только цифры',
  url: (v: string) => !v || /^https?:\/\/.+\..+/.test(v) || 'Некорректный URL'
} as const

// Настройки пагинации
export const PAGINATION_CONFIG = {
  itemsPerPageOptions: [10, 25, 50, 100],
  defaultItemsPerPage: 25
} as const

// Настройки темы
export const THEME_CONFIG = {
  light: {
    dark: false,
    colors: {
      primary: '#1976D2',
      secondary: '#424242',
      accent: '#82B1FF',
      error: '#FF5252',
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FB8C00'
    }
  },
  dark: {
    dark: true,
    colors: {
      primary: '#2196F3',
      secondary: '#424242',
      accent: '#FF4081',
      error: '#FF5252',
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FB8C00'
    }
  }
} as const

export default {
  APP_CONFIG,
  AI_MODELS,
  LOCALES,
  DEFAULT_BROWSER_CONFIG,
  STATUS_CONFIG,
  NOTIFICATION_CONFIG,
  VALIDATION_RULES,
  PAGINATION_CONFIG,
  THEME_CONFIG
}