/// <reference types="vite/client" />
/// <reference types="vue/ref-macros" />

// Декларация модулей Vue
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Декларации для Vue Router
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresGuest?: boolean
    requiresAdmin?: boolean
    title?: string
  }
}

// Декларации для изображений и ресурсов
declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

// Декларации для стилей
declare module '*.css' {
  const content: any
  export default content
}

declare module '*.scss' {
  const content: any
  export default content
}

declare module '*.sass' {
  const content: any
  export default content
}

// Декларации для веб-воркеров
declare module '*?worker' {
  const workerConstructor: {
    new (): Worker
  }
  export default workerConstructor
}

declare module '*?worker&inline' {
  const workerConstructor: {
    new (): Worker
  }
  export default workerConstructor
}

// Декларации для Vite
declare module 'virtual:*' {
  const result: any
  export default result
}

declare module '~/*' {
  const result: any
  export default result
}

declare module '@/*' {
  const result: any
  export default result
}

// Декларации для модулей без типов
declare module 'webfontloader' {
  interface WebFontConfig {
    google?: {
      families: string[]
    }
    custom?: {
      families: string[]
      urls: string[]
    }
    timeout?: number
    events?: boolean
    loading?(): void
    active?(): void
    inactive?(): void
    fontloading?(familyName: string, fvd: string): void
    fontactive?(familyName: string, fvd: string): void
    fontinactive?(familyName: string, fvd: string): void
  }

  export function load(config: WebFontConfig): void
}

// Глобальные переменные окружения
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_APP_VERSION: string
  readonly VITE_SENTRY_DSN?: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly glob: <T = any>(
    pattern: string,
    options?: {
      as?: string
      eager?: boolean
    }
  ) => T
}