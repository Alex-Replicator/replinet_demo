<template>
  <v-app>
    <!-- Навигационная панель -->
    <v-navigation-drawer
      v-model="drawer"
      app
      v-if="isAuthenticated"
    >
      <v-list>
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          to="/"
        />
        <v-list-item
          prepend-icon="mdi-tune"
          title="Presets"
          to="/presets"
        />
        <v-list-item
          prepend-icon="mdi-robot"
          title="Agents"
          to="/agents"
        />
        <v-divider />
        <v-list-item
          prepend-icon="mdi-account"
          title="Profile"
          to="/profile"
        />
        <v-list-item
          v-if="isAdmin"
          prepend-icon="mdi-cog"
          title="Admin Panel"
          to="/admin"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- Верхняя панель -->
    <v-app-bar app>
      <v-app-bar-nav-icon
        v-if="isAuthenticated"
        @click="drawer = !drawer"
      />
      
      <v-toolbar-title>Replinet</v-toolbar-title>
      
      <v-spacer />

      <!-- Кнопки для неавторизованных пользователей -->
      <template v-if="!isAuthenticated">
        <v-btn
          text
          to="/login"
        >
          Login
        </v-btn>
        <v-btn
          color="primary"
          to="/register"
        >
          Register
        </v-btn>
      </template>

      <!-- Меню для авторизованных пользователей -->
      <template v-else>
        <v-btn icon @click="toggleTheme">
          <v-icon>{{ isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}</v-icon>
        </v-btn>
        
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              icon
              v-bind="props"
            >
              <v-icon>mdi-earth</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="locale in availableLocales"
              :key="locale.code"
              @click="changeLocale(locale.code)"
            >
              {{ locale.name }}
            </v-list-item>
          </v-list>
        </v-menu>

        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              icon
              v-bind="props"
            >
              <v-avatar size="40">
                <v-img :src="userAvatar" />
              </v-avatar>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="logout">
              Logout
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <!-- Основной контент -->
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>

    <!-- Глобальный снекбар для уведомлений -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const theme = useTheme()
const { locale } = useI18n()
const authStore = useAuthStore()
const appStore = useAppStore()

// Состояние компонента
const drawer = ref(false)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000
})

// Вычисляемые свойства
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const isDark = computed(() => theme.global.current.value.dark)
const userAvatar = computed(() => authStore.user?.avatar || '/default-avatar.png')

// Доступные языки
const availableLocales = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' }
]

// Методы
const toggleTheme = () => {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}

const changeLocale = (newLocale: string) => {
  locale.value = newLocale
}

const logout = async () => {
  await authStore.logout()
  appStore.showMessage({
    text: 'Successfully logged out',
    color: 'success'
  })
}
</script>

<style scoped>
.v-application {
  font-family: 'Roboto', sans-serif;
}
</style>