/**
 * Форматирование даты и времени
 */
export function formatDate(date: string | Date | null): string {
  if (!date) return 'Н/Д'
  
  const d = new Date(date)
  return d.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatShortDate(date: string | Date | null): string {
  if (!date) return 'Н/Д'
  
  const d = new Date(date)
  return d.toLocaleString('ru-RU', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Форматирование продолжительности
 */
export function formatDuration(seconds: number | null): string {
  if (!seconds) return '0с'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}ч ${minutes}м`
  } else if (minutes > 0) {
    return `${minutes}м ${remainingSeconds}с`
  } else {
    return `${remainingSeconds}с`
  }
}

/**
 * Форматирование размера файла
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Б'

  const k = 1024
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Форматирование числа с разделителями
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ru-RU').format(num)
}

/**
 * Форматирование процентов
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Преобразование snake_case в camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
}

/**
 * Преобразование camelCase в snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * Форматирование роли пользователя
 */
export type UserRole = 'super_admin' | 'admin' | 'team_organizer' | 'team_member' | 'pro_user' | 'free_user' | 'guest'

export function formatRole(role: UserRole): string {
  const roles: Record<UserRole, string> = {
    super_admin: 'Супер-администратор',
    admin: 'Администратор',
    team_organizer: 'Организатор команды',
    team_member: 'Участник команды',
    pro_user: 'Pro пользователь',
    free_user: 'Базовый пользователь',
    guest: 'Гость'
  }
  return roles[role] || role
}

/**
 * Получение цвета для статуса
 */
export type Status = 'running' | 'completed' | 'error' | 'idle' | 'pending'

export function getStatusColor(status: Status): string {
  const colors: Record<Status, string> = {
    running: 'success',
    completed: 'primary',
    error: 'error',
    idle: 'info',
    pending: 'warning'
  }
  return colors[status] || 'grey'
}

/**
 * Форматирование массива в строку с разделителями
 */
export function formatArray(arr: unknown[], separator: string = ', '): string {
  return arr.filter(Boolean).map(String).join(separator)
}

/**
 * Форматирование имени файла
 */
export function formatFileName(fileName: string, maxLength: number = 20): string {
  if (fileName.length <= maxLength) return fileName
  
  const extension = fileName.split('.').pop() || ''
  const name = fileName.substring(0, fileName.lastIndexOf('.'))
  
  const truncatedName = name.substring(0, maxLength - 3) + '...'
  return extension ? `${truncatedName}.${extension}` : truncatedName
}

/**
 * Получение инициалов из полного имени
 */
export function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Структура API ошибки
 */
interface ApiErrorDetails {
  [key: string]: string[]
}

interface ApiErrorResponse {
  message?: string
  details?: ApiErrorDetails
}

/**
 * Форматирование ошибок API
 */
export function formatApiError(error: string | ApiErrorResponse): string {
  if (typeof error === 'string') return error
  
  if (error.details) {
    return Object.entries(error.details)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n')
  }
  
  return error.message || 'Произошла неизвестная ошибка'
}