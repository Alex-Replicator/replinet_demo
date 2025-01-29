/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'webfontloader'

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_APP_VERSION: string
  readonly VITE_SENTRY_DSN?: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Глобальные типы для WebSocket
interface WebSocketEventMap {
  close: CloseEvent
  error: Event
  message: MessageEvent
  open: Event
}

interface WebSocket {
  addEventListener<K extends keyof WebSocketEventMap>(
    type: K,
    listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void
}

// Расширение Window для обработки ошибок
interface Window {
  onerror: ((
    message: string | Event,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error
  ) => void) | null
  onunhandledrejection: ((event: PromiseRejectionEvent) => void) | null
}

// Типы для локального хранилища
interface Storage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  clear(): void
  key(index: number): string | null
  readonly length: number
}

// Глобальные утилиты
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P]
}

type Nullable<T> = T | null

type Optional<T> = T | undefined

type ValidateFunction = (value: any) => boolean | string

interface ValidationRule {
  validate: ValidateFunction
  message: string
}

// Типы для событий
interface CustomEvent<T = any> extends Event {
  readonly detail: T
}

interface CustomEventInit<T = any> extends EventInit {
  detail?: T
}

declare global {
  interface Window {
    __APP_VERSION__: string
    __INITIAL_STATE__: any
  }
}

export {}