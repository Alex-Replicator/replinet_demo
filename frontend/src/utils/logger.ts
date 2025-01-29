/**
 * Уровни логирования
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Интерфейс записи лога
 */
export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  stack?: string
}

/**
 * Конфигурация логгера
 */
interface LoggerConfig {
  minLevel: LogLevel
  maxEntries: number
  persistLogs: boolean
  reportErrors: boolean
  errorEndpoint?: string
}

/**
 * Настройки по умолчанию
 */
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: LogLevel.INFO,
  maxEntries: 1000,
  persistLogs: true,
  reportErrors: true,
  errorEndpoint: `${import.meta.env.VITE_API_URL}/api/v1/logs`
}

class Logger {
  private config: LoggerConfig
  private logs: LogEntry[] = []
  private readonly storageKey = 'app_logs'

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.loadLogs()
  }

  /**
   * Логирование с разными уровнями
   */
  debug(message: string, context?: Record<string, unknown>): LogEntry {
    return this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: Record<string, unknown>): LogEntry {
    return this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: Record<string, unknown>): LogEntry {
    return this.log(LogLevel.WARN, message, context)
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): LogEntry {
    const errorContext = error ? {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack
    } : undefined

    const entry = this.log(LogLevel.ERROR, message, {
      ...context,
      error: errorContext
    })

    if (this.config.reportErrors) {
      this.reportError(entry)
    }

    return entry
  }

  /**
   * Основной метод логирования
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      stack: this.getStackTrace()
    }

    if (this.shouldLog(level)) {
      this.addEntry(entry)
      this.printToConsole(entry)
    }

    return entry
  }

  /**
   * Получение стека вызовов
   */
  private getStackTrace(): string {
    const error = new Error()
    return error.stack?.split('\n')
      .slice(3) // Пропускаем первые 3 строки (Error, getStackTrace, log)
      .join('\n') || ''
  }

  /**
   * Проверка нужно ли логировать сообщение
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel)
    return levels.indexOf(level) >= levels.indexOf(this.config.minLevel)
  }

  /**
   * Добавление записи в лог
   */
  private addEntry(entry: LogEntry): void {
    this.logs.push(entry)

    // Ограничение количества записей
    if (this.logs.length > this.config.maxEntries) {
      this.logs = this.logs.slice(-this.config.maxEntries)
    }

    if (this.config.persistLogs) {
      this.saveLogs()
    }
  }

  /**
   * Сохранение логов в localStorage
   */
  private saveLogs(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs))
    } catch (error) {
      console.error('Failed to save logs:', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  /**
   * Загрузка логов из localStorage
   */
  private loadLogs(): void {
    if (this.config.persistLogs) {
      try {
        const saved = localStorage.getItem(this.storageKey)
        if (saved) {
          const parsed = JSON.parse(saved)
          this.logs = Array.isArray(parsed) ? parsed : []
        }
      } catch (error) {
        console.error('Failed to load logs:', error instanceof Error ? error.message : 'Unknown error')
        this.logs = []
      }
    }
  }

  /**
   * Вывод в консоль браузера
   */
  private printToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()
    const context = entry.context ? `\nContext: ${JSON.stringify(entry.context, null, 2)}` : ''
    const message = `[${timestamp}] ${entry.message}${context}`

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message)
        break
      case LogLevel.INFO:
        console.info(message)
        break
      case LogLevel.WARN:
        console.warn(message)
        break
      case LogLevel.ERROR:
        console.error(message)
        if (entry.stack) {
          console.error(entry.stack)
        }
        break
    }
  }

  /**
   * Отправка ошибки на сервер
   */
  private async reportError(entry: LogEntry): Promise<void> {
    if (!this.config.errorEndpoint) return

    try {
      const response = await fetch(this.config.errorEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to report error:', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  /**
   * Очистка логов
   */
  clear(): void {
    this.logs = []
    if (this.config.persistLogs) {
      localStorage.removeItem(this.storageKey)
    }
  }

  /**
   * Получение всех логов
   */
  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  /**
   * Получение логов по уровню
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(entry => entry.level === level)
  }

  /**
   * Получение последних N логов
   */
  getRecentLogs(count: number): LogEntry[] {
    return this.logs.slice(-count)
  }

  /**
   * Экспорт логов
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

// Создаем глобальный экземпляр логгера
export const logger = new Logger()

// Перехватываем глобальные ошибки
window.onerror = function(message: string | Event, source?: string, lineno?: number, colno?: number, error?: Error): void {
  logger.error('Global error', error, {
    message: String(message),
    source,
    lineno,
    colno
  })
}

// Перехватываем необработанные промисы
window.onunhandledrejection = function(event: PromiseRejectionEvent): void {
  const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
  logger.error('Unhandled promise rejection', error)
}

export default logger