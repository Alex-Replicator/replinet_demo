import type { UserRole } from '@/types/models'

// Уровни доступа для ролей
export const ROLE_LEVELS: Record<UserRole, number> = {
  'super_admin': 100,
  'admin': 90,
  'team_organizer': 70,
  'team_member': 60,
  'pro_user': 50,
  'free_user': 10,
  'guest': 0
}

// Ограничения для ролей
export const ROLE_LIMITS = {
  'super_admin': {
    maxAgents: -1, // без ограничений
    maxPresets: -1,
    maxThreads: -1,
    features: ['all']
  },
  'admin': {
    maxAgents: -1,
    maxPresets: -1,
    maxThreads: 20,
    features: ['all']
  },
  'team_organizer': {
    maxAgents: 20,
    maxPresets: 20,
    maxThreads: 10,
    features: ['team_management', 'agent_management', 'preset_management']
  },
  'team_member': {
    maxAgents: 5,
    maxPresets: 5,
    maxThreads: 5,
    features: ['agent_management', 'preset_management']
  },
  'pro_user': {
    maxAgents: 10,
    maxPresets: 10,
    maxThreads: 5,
    features: ['agent_management', 'preset_management']
  },
  'free_user': {
    maxAgents: 2,
    maxPresets: 2,
    maxThreads: 2,
    features: ['agent_management', 'preset_management']
  },
  'guest': {
    maxAgents: 0,
    maxPresets: 0,
    maxThreads: 0,
    features: ['view']
  }
}

// Проверка уровня доступа
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole]
}

// Проверка конкретных прав
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const limits = ROLE_LIMITS[userRole]
  return limits.features.includes('all') || limits.features.includes(permission)
}

// Проверка ограничений
export function checkLimit(
  userRole: UserRole,
  limitType: 'maxAgents' | 'maxPresets' | 'maxThreads',
  currentCount: number
): boolean {
  const limit = ROLE_LIMITS[userRole][limitType]
  return limit === -1 || currentCount < limit
}

// Получение максимального значения для ограничения
export function getLimit(
  userRole: UserRole,
  limitType: 'maxAgents' | 'maxPresets' | 'maxThreads'
): number {
  return ROLE_LIMITS[userRole][limitType]
}

// Специфичные проверки прав
export const permissions = {
  canManageUsers: (role: UserRole) => hasRole(role, 'admin'),
  
  canManageTeam: (role: UserRole) => hasRole(role, 'team_organizer'),
  
  canCreatePreset: (role: UserRole, currentCount: number) => 
    checkLimit(role, 'maxPresets', currentCount),
  
  canCreateAgent: (role: UserRole, currentCount: number) =>
    checkLimit(role, 'maxAgents', currentCount),
  
  canCreateThread: (role: UserRole, currentCount: number) =>
    checkLimit(role, 'maxThreads', currentCount),
  
  canAccessAdminPanel: (role: UserRole) => hasRole(role, 'admin'),
  
  canManageSystem: (role: UserRole) => hasRole(role, 'super_admin'),
  
  canEditPreset: (role: UserRole, isOwner: boolean) =>
    hasRole(role, 'admin') || isOwner,
  
  canDeletePreset: (role: UserRole, isOwner: boolean) =>
    hasRole(role, 'admin') || isOwner,
  
  canManageApiKeys: (role: UserRole) =>
    hasRole(role, 'pro_user') || hasRole(role, 'admin'),
  
  canAccessAnalytics: (role: UserRole) =>
    hasRole(role, 'team_organizer') || hasRole(role, 'admin'),
  
  canExportData: (role: UserRole) =>
    hasRole(role, 'pro_user') || hasRole(role, 'admin')
}

// Вспомогательные функции
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    'super_admin': 'Супер-администратор',
    'admin': 'Администратор',
    'team_organizer': 'Организатор команды',
    'team_member': 'Участник команды',
    'pro_user': 'Pro пользователь',
    'free_user': 'Базовый пользователь',
    'guest': 'Гость'
  }
  return displayNames[role]
}

export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    'super_admin': 'red',
    'admin': 'orange',
    'team_organizer': 'blue',
    'team_member': 'cyan',
    'pro_user': 'purple',
    'free_user': 'green',
    'guest': 'grey'
  }
  return colors[role]
}

export default permissions