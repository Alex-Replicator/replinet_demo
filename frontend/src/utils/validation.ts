import { VALIDATION_RULES } from './config'
import type { AgentForm, PresetForm } from '@/types/models'

/**
 * Базовые правила валидации
 */
export const rules = {
  ...VALIDATION_RULES,
  
  // Расширенные правила для конкретных случаев
  password: (v: string) => {
    if (!v) return 'Обязательное поле'
    if (v.length < 8) return 'Минимум 8 символов'
    if (!/[A-Z]/.test(v)) return 'Минимум 1 заглавная буква'
    if (!/[a-z]/.test(v)) return 'Минимум 1 строчная буква'
    if (!/[0-9]/.test(v)) return 'Минимум 1 цифра'
    return true
  },

  confirmPassword: (password: string) => (v: string) => 
    v === password || 'Пароли не совпадают',

  aiModel: (v: string) => {
    if (!v) return 'Обязательное поле'
    const validModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']
    return validModels.includes(v) || 'Некорректная модель'
  },

  temperature: (v: number) => {
    if (v === undefined || v === null) return 'Обязательное поле'
    if (v < 0 || v > 1) return 'Значение должно быть от 0 до 1'
    return true
  },

  maxTokens: (v: number) => {
    if (!v) return 'Обязательное поле'
    if (v < 100) return 'Минимум 100 токенов'
    if (v > 8000) return 'Максимум 8000 токенов'
    return true
  }
}

/**
 * Валидация форм
 */
export const validators = {
  // Валидация пресета
  validatePreset(preset: PresetForm): string[] {
    const errors: string[] = []

    if (!preset.name) {
      errors.push('Название обязательно')
    }

    if (!preset.ai_model) {
      errors.push('Выберите модель ИИ')
    }

    if (preset.temperature === undefined || preset.temperature === null) {
      errors.push('Укажите температуру')
    } else if (preset.temperature < 0 || preset.temperature > 1) {
      errors.push('Температура должна быть от 0 до 1')
    }

    if (!preset.system_prompt) {
      errors.push('Системный промпт обязателен')
    }

    return errors
  },

  // Валидация агента
  validateAgent(agent: AgentForm): string[] {
    const errors: string[] = []

    if (!agent.name) {
      errors.push('Название обязательно')
    }

    if (!agent.preset_id) {
      errors.push('Выберите пресет')
    }

    if (agent.browser_config) {
      if (agent.browser_config.viewport) {
        const { width, height } = agent.browser_config.viewport
        if (width < 800 || width > 1920) {
          errors.push('Ширина viewport должна быть от 800 до 1920')
        }
        if (height < 600 || height > 1080) {
          errors.push('Высота viewport должна быть от 600 до 1080')
        }
      }
    }

    return errors
  }
}

/**
 * Проверка корректности email
 */
export function isValidEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return re.test(email)
}

/**
 * Проверка надежности пароля
 */
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = []
  let score = 0

  // Длина
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (password.length < 8) feedback.push('Пароль слишком короткий')

  // Сложность
  if (/[A-Z]/.test(password)) score++
  else feedback.push('Добавьте заглавную букву')

  if (/[a-z]/.test(password)) score++
  else feedback.push('Добавьте строчную букву')

  if (/[0-9]/.test(password)) score++
  else feedback.push('Добавьте цифру')

  if (/[^A-Za-z0-9]/.test(password)) score++
  else feedback.push('Добавьте специальный символ')

  // Повторения
  if (/(.)\1{2,}/.test(password)) {
    score--
    feedback.push('Избегайте повторяющихся символов')
  }

  return { score, feedback }
}

/**
 * Проверка URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Проверка имени файла
 */
export function isValidFileName(fileName: string): boolean {
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/
  return !invalidChars.test(fileName)
}

/**
 * Проверка размера файла
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize
}

/**
 * Форматирование ошибок валидации
 */
export function formatValidationErrors(errors: string[]): string {
  return errors.join('\n')
}

export default {
  rules,
  validators,
  isValidEmail,
  checkPasswordStrength,
  isValidUrl,
  isValidFileName,
  isValidFileSize,
  formatValidationErrors
}