import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { loadFonts } from './plugins/webfontloader'
import router from './router'
import App from './App.vue'

// Общие компоненты
import CommonComponents from './components/common'

// Стили
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import './styles/app.scss'

// Конфигурация Vuetify
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#2196F3',
          secondary: '#424242',
          accent: '#FF4081',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
      },
    },
  },
  defaults: {
    VCard: {
      elevation: 2,
    },
    VBtn: {
      variant: 'elevated',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
    },
  },
})

// Конфигурация i18n
const i18n = createI18n({
  legacy: false,
  locale: 'ru',
  fallbackLocale: 'en',
  messages: {
    ru: {}, // Будут загружены динамически
    en: {}, // Будут загружены динамически
  },
})

// Инициализация приложения
const app = createApp(App)

// Использование плагинов
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(i18n)
app.use(CommonComponents)

// Глобальные свойства
app.config.globalProperties.$formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

app.config.errorHandler = (err: unknown, instance, info) => {
  console.error('Global error:', err)
  console.error('Component:', instance)
  console.error('Info:', info)
}

// Загрузка шрифтов и запуск приложения
loadFonts().finally(() => {
  app.mount('#app')
})

// Экспорт для типизации
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $formatDate: (date: string | Date) => string
  }
}