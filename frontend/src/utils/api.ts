import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import type { ApiError } from '@/types/models'

// Создаем инстанс axios с базовой конфигурацией
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 секунд
})

// Интерцептор для добавления токена авторизации
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Интерцептор для обработки ответов и ошибок
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const authStore = useAuthStore()
    const appStore = useAppStore()

    // Если токен истек, разлогиниваем пользователя
    if (error.response?.status === 401) {
      await authStore.logout()
      return Promise.reject(error)
    }

    // Формируем понятное сообщение об ошибке
    const apiError = parseError(error)
    appStore.showError(apiError)

    return Promise.reject(apiError)
  }
)

// Функция для парсинга ошибок
function parseError(error: AxiosError): ApiError {
  if (error.response) {
    // Ошибка от сервера
    const data = error.response.data as Record<string, any>
    return {
      status: error.response.status,
      message: data.detail || data.message || 'Произошла ошибка при запросе к серверу',
      details: data.errors
    }
  } else if (error.request) {
    // Ошибка сети
    return {
      status: 0,
      message: 'Не удалось подключиться к серверу. Проверьте соединение с интернетом.'
    }
  } else {
    // Системная ошибка
    return {
      status: 500,
      message: error.message || 'Произошла неизвестная ошибка'
    }
  }
}

interface RequestConfig extends Omit<InternalAxiosRequestConfig, 'url' | 'method' | 'data'> {}

// Типизированные методы для работы с API
export async function apiGet<T>(url: string, config?: RequestConfig): Promise<T> {
  const response = await api.get<T>(url, config)
  return response.data
}

export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: RequestConfig
): Promise<T> {
  const response = await api.post<T>(url, data, config)
  return response.data
}

export async function apiPut<T>(
  url: string,
  data?: unknown,
  config?: RequestConfig
): Promise<T> {
  const response = await api.put<T>(url, data, config)
  return response.data
}

export async function apiDelete<T>(url: string, config?: RequestConfig): Promise<T> {
  const response = await api.delete<T>(url, config)
  return response.data
}

// Вспомогательные функции
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

// API endpoints
export const endpoints = {
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    google: '/api/v1/auth/google',
    changePassword: '/api/v1/auth/change-password'
  },
  users: {
    me: '/api/v1/users/me',
    settings: '/api/v1/users/me/settings',
    stats: '/api/v1/users/me/stats'
  },
  presets: {
    list: '/api/v1/presets',
    detail: (id: number) => `/api/v1/presets/${id}`,
    create: '/api/v1/presets',
    update: (id: number) => `/api/v1/presets/${id}`,
    delete: (id: number) => `/api/v1/presets/${id}`,
    test: (id: number) => `/api/v1/presets/${id}/test`
  },
  agents: {
    list: '/api/v1/agents',
    detail: (id: number) => `/api/v1/agents/${id}`,
    create: '/api/v1/agents',
    update: (id: number) => `/api/v1/agents/${id}`,
    delete: (id: number) => `/api/v1/agents/${id}`,
    threads: {
      list: (agentId: number) => `/api/v1/agents/${agentId}/threads`,
      create: (agentId: number) => `/api/v1/agents/${agentId}/threads`,
      stop: (agentId: number, threadId: number) => 
        `/api/v1/agents/${agentId}/threads/${threadId}/stop`
    }
  }
}

export default api