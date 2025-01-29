export interface User {
  id: number
  email: string
  full_name: string | null
  role: UserRole
  avatar?: string
  language: string
  theme: string
  email_notifications: boolean
  created_at: string
  updated_at: string
}

export type UserRole = 
  | 'super_admin'
  | 'admin'
  | 'team_organizer'
  | 'team_member'
  | 'pro_user'
  | 'free_user'
  | 'guest'

export interface Preset {
  id: number
  name: string
  description: string | null
  ai_model: string
  temperature: number
  max_tokens: number
  system_prompt: string
  additional_config: Record<string, any>
  user_id: number
  created_at: string
  updated_at: string
  agents?: Agent[]
}

export interface Agent {
  id: number
  name: string
  description: string | null
  is_active: boolean
  status: AgentStatus
  personal_instructions: string | null
  credentials: Record<string, string>
  browser_config: BrowserConfig
  total_runs: number
  successful_runs: number
  error_runs: number
  total_runtime: number
  user_id: number
  preset_id: number
  preset?: Preset
  threads?: Thread[]
  created_at: string
  updated_at: string
}

export type AgentStatus = 
  | 'idle'
  | 'running'
  | 'error'

export interface BrowserConfig {
  headless: boolean
  proxy_location?: string
  user_agent?: string
  viewport?: {
    width: number
    height: number
  }
  additional_args?: string[]
}

export interface Thread {
  id: number
  status: ThreadStatus
  error_message: string | null
  browser_id: string | null
  start_time: string | null
  end_time: string | null
  execution_time: number | null
  logs: string[]
  results: Record<string, any>
  agent_id: number
  created_at: string
  updated_at: string
}

export type ThreadStatus = 
  | 'created'
  | 'running'
  | 'completed'
  | 'error'

export interface UserStats {
  total_agents: number
  total_presets: number
  successful_runs: number
  error_runs: number
  total_runtime: number
}

// Интерфейсы для форм
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  full_name: string
}

export interface PresetForm {
  name: string
  description?: string
  ai_model: string
  temperature: number
  max_tokens: number
  system_prompt: string
  additional_config?: Record<string, any>
}

export interface AgentForm {
  name: string
  description?: string
  preset_id: number
  personal_instructions?: string
  credentials?: Record<string, string>
  browser_config?: Partial<BrowserConfig>
}

// Интерфейсы для ответов API
export interface AuthResponse {
  user: User
  token: {
    access_token: string
    token_type: string
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

// Вспомогательные типы
export type ApiError = {
  status: number
  message: string
  details?: Record<string, string[]>
}

export interface AppNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timeout?: number
}