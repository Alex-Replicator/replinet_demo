import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

interface User {
  id: number
  email: string
  full_name: string
  role: string
  avatar?: string
  language: string
  theme: string
}

interface LoginData {
  email: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const initialized = ref(false)

  // Вычисляемые свойства
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => {
    const role = user.value?.role
    return role === 'admin' || role === 'super_admin'
  })

  // Действия
  async function login(data: LoginData): Promise<boolean> {
    try {
      const response = await axios.post<{ access_token: string }>(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/login`,
        data
      )
      const accessToken = response.data.access_token
      token.value = accessToken
      await fetchUser()
      
      // Сохраняем токен
      localStorage.setItem('token', accessToken)
      
      return true
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async function loginWithGoogle(googleToken: string): Promise<boolean> {
    try {
      const response = await axios.post<{ access_token: string }>(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/google`,
        { token: googleToken }
      )
      const accessToken = response.data.access_token
      token.value = accessToken
      await fetchUser()
      
      localStorage.setItem('token', accessToken)
      
      return true
    } catch (error) {
      console.error('Google login error:', error)
      throw error
    }
  }

  async function logout(): Promise<void> {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  async function fetchUser(): Promise<void> {
    try {
      if (!token.value) {
        throw new Error('No token available')
      }

      const response = await axios.get<User>(
        `${import.meta.env.VITE_API_URL}/api/v1/users/me`,
        {
          headers: { Authorization: `Bearer ${token.value}` }
        }
      )
      user.value = response.data
    } catch (error) {
      console.error('Fetch user error:', error)
      throw error
    }
  }

  // Инициализация
  async function init(): Promise<void> {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      try {
        await fetchUser()
      } catch (error) {
        // Если токен невалиден, очищаем хранилище
        await logout()
      }
    }
    initialized.value = true
  }

  return {
    user,
    token,
    initialized,
    isAuthenticated,
    isAdmin,
    login,
    loginWithGoogle,
    logout,
    fetchUser,
    init
  }
})