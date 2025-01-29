import type { RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Загрузка компонентов
const Dashboard = () => import('@/views/Dashboard.vue')
const Login = () => import('@/views/auth/Login.vue')
const Register = () => import('@/views/auth/Register.vue')
const Profile = () => import('@/views/Profile.vue')
const NotFound = () => import('@/views/NotFound.vue')

// Агенты
const AgentList = () => import('@/views/agents/AgentList.vue')
const AgentDetail = () => import('@/views/agents/AgentDetail.vue')
const CreateAgent = () => import('@/views/agents/CreateAgent.vue')

// Пресеты
const PresetList = () => import('@/views/presets/PresetList.vue')
const PresetDetail = () => import('@/views/presets/PresetDetail.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { guest: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/agents',
    name: 'agents',
    component: AgentList,
    meta: { requiresAuth: true }
  },
  {
    path: '/agents/create',
    name: 'create-agent',
    component: CreateAgent,
    meta: { requiresAuth: true }
  },
  {
    path: '/agents/:id',
    name: 'agent-detail',
    component: AgentDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/presets',
    name: 'presets',
    component: PresetList,
    meta: { requiresAuth: true }
  },
  {
    path: '/presets/:id',
    name: 'preset-detail',
    component: PresetDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach(async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isGuestRoute = to.matched.some(record => record.meta.guest)

  // Проверяем статус инициализации
  if (!authStore.initialized) {
    await authStore.init()
  }

  // Проверяем аутентификацию
  const isAuthenticated = authStore.isAuthenticated

  if (requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (isGuestRoute && isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router