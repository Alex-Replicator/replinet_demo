import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import logger from './logger'

interface WebSocketMessage<T = unknown> extends Record<string, unknown> {
  type: string
  payload: T
}

interface WebSocketConfig {
  reconnectAttempts: number
  reconnectDelay: number
  pingInterval: number
  debug: boolean
}

const DEFAULT_CONFIG: WebSocketConfig = {
  reconnectAttempts: 5,
  reconnectDelay: 3000,  // 3 секунды
  pingInterval: 30000,   // 30 секунд
  debug: false
}

type MessageCallback<T = unknown> = (data: T) => void

class WebSocketService {
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private reconnectCount = 0
  private pingTimer: number | null = null
  private subscriptions: Map<string, Set<MessageCallback>> = new Map()
  private baseUrl: string
  
  // Состояние соединения
  public isConnected = ref(false)
  public isReconnecting = ref(false)

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.baseUrl = import.meta.env.VITE_WS_URL || 
      `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`
  }

  /**
   * Подключение к WebSocket серверу
   */
  connect(): void {
    const authStore = useAuthStore()
    const url = `${this.baseUrl}?token=${authStore.token}`

    this.ws = new WebSocket(url)
    this.setupEventHandlers()
  }

  /**
   * Установка обработчиков событий
   */
  private setupEventHandlers(): void {
    if (!this.ws) return

    this.ws.onopen = this.onConnect.bind(this)
    this.ws.onclose = this.onDisconnect.bind(this)
    this.ws.onerror = this.onError.bind(this)
    this.ws.onmessage = this.onMessage.bind(this)
  }

  /**
   * Обработка успешного подключения
   */
  private onConnect(): void {
    logger.info('WebSocket connected')
    this.isConnected.value = true
    this.isReconnecting.value = false
    this.reconnectCount = 0
    this.startPingInterval()
    
    // Уведомляем подписчиков о подключении
    this.notifySubscribers('connection', { status: 'connected' })
  }

  /**
   * Обработка отключения
   */
  private onDisconnect(event: CloseEvent): void {
    logger.warn('WebSocket disconnected', { code: event.code, reason: event.reason })
    this.isConnected.value = false
    this.stopPingInterval()

    // Пытаемся переподключиться
    if (this.reconnectCount < this.config.reconnectAttempts) {
      this.attemptReconnect()
    } else {
      this.handleReconnectFailure()
    }
  }

  /**
   * Обработка ошибок
   */
  private onError(event: Event): void {
    const error = new Error('WebSocket connection error')
    logger.error('WebSocket error', error)
    const appStore = useAppStore()
    appStore.showError('Ошибка WebSocket соединения')
  }

  /**
   * Обработка входящих сообщений
   */
  private onMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage
      
      if (this.config.debug) {
        logger.debug('WebSocket message received', message as Record<string, unknown>)
      }

      // Обработка пинга
      if (message.type === 'ping') {
        this.send({ type: 'pong', payload: null })
        return
      }

      // Уведомляем подписчиков
      this.notifySubscribers(message.type, message.payload)
    } catch (error) {
      const parseError = error instanceof Error ? error : new Error('Failed to parse message')
      logger.error('Failed to parse WebSocket message', parseError)
    }
  }

  /**
   * Попытка переподключения
   */
  private attemptReconnect(): void {
    this.isReconnecting.value = true
    this.reconnectCount++

    logger.info(`Attempting to reconnect (${this.reconnectCount}/${this.config.reconnectAttempts})`)

    setTimeout(() => {
      this.connect()
    }, this.config.reconnectDelay)
  }

  /**
   * Обработка неудачного переподключения
   */
  private handleReconnectFailure(): void {
    const error = new Error('Failed to reconnect to WebSocket')
    logger.error('Failed to reconnect', error)
    const appStore = useAppStore()
    appStore.showError('Не удалось восстановить соединение')
  }

  /**
   * Отправка сообщения
   */
  send<T>(message: WebSocketMessage<T>): void {
    if (!this.isConnected.value) {
      logger.warn('Attempted to send message while disconnected', message as Record<string, unknown>)
      return
    }

    try {
      this.ws?.send(JSON.stringify(message))
      
      if (this.config.debug) {
        logger.debug('WebSocket message sent', message as Record<string, unknown>)
      }
    } catch (error) {
      const sendError = error instanceof Error ? error : new Error('Failed to send message')
      logger.error('Failed to send WebSocket message', sendError)
    }
  }

  /**
   * Подписка на определенный тип сообщений
   */
  subscribe<T = unknown>(type: string, callback: MessageCallback<T>): () => void {
    if (!this.subscriptions.has(type)) {
      this.subscriptions.set(type, new Set())
    }
    this.subscriptions.get(type)?.add(callback as MessageCallback)

    // Возвращаем функцию отписки
    return () => {
      this.subscriptions.get(type)?.delete(callback as MessageCallback)
    }
  }

  /**
   * Уведомление подписчиков
   */
  private notifySubscribers<T = unknown>(type: string, data: T): void {
    const callbacks = this.subscriptions.get(type)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          const callbackError = error instanceof Error ? error : new Error('Callback execution failed')
          logger.error('Error in WebSocket subscriber callback', callbackError)
        }
      })
    }
  }

  /**
   * Запуск периодической отправки ping
   */
  private startPingInterval(): void {
    this.stopPingInterval()
    this.pingTimer = window.setInterval(() => {
      this.send({ type: 'ping', payload: null })
    }, this.config.pingInterval)
  }

  /**
   * Остановка периодической отправки ping
   */
  private stopPingInterval(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  /**
   * Закрытие соединения
   */
  disconnect(): void {
    this.stopPingInterval()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected.value = false
    this.subscriptions.clear()
  }
}

// Создаем глобальный экземпляр сервиса
export const wsService = new WebSocketService()

export default wsService