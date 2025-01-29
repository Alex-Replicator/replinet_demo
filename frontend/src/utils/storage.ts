/**
 * Утилиты для работы с localStorage
 */

// Ключи для хранения данных
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_SETTINGS: 'user_settings',
  THEME: 'theme',
  LANGUAGE: 'language',
  LAST_ROUTE: 'last_route'
} as const

// Типы для значений
export type StorageKey = keyof typeof STORAGE_KEYS
export type ThemeType = 'light' | 'dark'
export type LanguageType = 'ru' | 'en'

export interface UserSettings {
  theme: ThemeType
  language: LanguageType
  email_notifications: boolean
  telegram_notifications: boolean
}

/**
 * Базовые операции с localStorage
 */
export const storage = {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error reading from localStorage [${key}]:`, error)
      return null
    }
  },

  set(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage [${key}]:`, error)
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage [${key}]:`, error)
    }
  },

  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }
}

/**
 * Специфичные операции с данными
 */
export const storageService = {
  // Аутентификация
  getAuthToken(): string | null {
    return storage.get(STORAGE_KEYS.AUTH_TOKEN)
  },

  setAuthToken(token: string): void {
    storage.set(STORAGE_KEYS.AUTH_TOKEN, token)
  },

  removeAuthToken(): void {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN)
  },

  // Настройки пользователя
  getUserSettings(): UserSettings {
    return storage.get(STORAGE_KEYS.USER_SETTINGS) || {
      theme: 'light' as ThemeType,
      language: 'ru' as LanguageType,
      email_notifications: true,
      telegram_notifications: false
    }
  },

  setUserSettings(settings: Partial<UserSettings>): void {
    const currentSettings = this.getUserSettings()
    storage.set(STORAGE_KEYS.USER_SETTINGS, {
      ...currentSettings,
      ...settings
    })
  },

  // Тема
  getTheme(): ThemeType {
    return storage.get(STORAGE_KEYS.THEME) || 'light'
  },

  setTheme(theme: ThemeType): void {
    storage.set(STORAGE_KEYS.THEME, theme)
  },

  // Язык
  getLanguage(): LanguageType {
    return storage.get(STORAGE_KEYS.LANGUAGE) || 'ru'
  },

  setLanguage(language: LanguageType): void {
    storage.set(STORAGE_KEYS.LANGUAGE, language)
  },

  // Последний маршрут
  getLastRoute(): string | null {
    return storage.get(STORAGE_KEYS.LAST_ROUTE)
  },

  setLastRoute(route: string): void {
    storage.set(STORAGE_KEYS.LAST_ROUTE, route)
  }
}

/**
 * Вспомогательные функции
 */
export function clearAuthData(): void {
  storage.remove(STORAGE_KEYS.AUTH_TOKEN)
  storage.remove(STORAGE_KEYS.LAST_ROUTE)
}

export function clearAllData(): void {
  const theme = storageService.getTheme()
  const language = storageService.getLanguage()
  
  storage.clear()
  
  // Сохраняем некоторые настройки
  storageService.setTheme(theme)
  storageService.setLanguage(language)
}

/**
 * Проверка доступности localStorage
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

export default storageService