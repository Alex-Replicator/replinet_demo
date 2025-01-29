import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import Components from 'unplugin-vue-components/vite'
import { VuetifyResolver } from 'unplugin-vue-components/resolvers'
import Fonts from 'unplugin-fonts/vite'
import { resolve, dirname } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }),
    // Vuetify loader
    vuetify({
      autoImport: true,
      styles: { configFile: 'src/styles/variables.scss' }
    }),
    // i18n plugin
    VueI18nPlugin({
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**'),
      runtimeOnly: false
    }),
    // Auto-import components
    Components({
      resolvers: [VuetifyResolver()],
      dts: true,
      types: [{
        from: 'vue-router',
        names: ['RouterLink', 'RouterView']
      }]
    }),
    // Fonts loader
    Fonts({
      google: {
        families: ['Roboto:100,300,400,500,700,900&display=swap']
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    host: true,
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/ws': {
        target: process.env.VITE_WS_URL || 'ws://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia', 'vue-i18n'],
          'vuetify': ['vuetify'],
          'monaco-editor': ['monaco-editor'],
          'utils': [
            '@/utils/api',
            '@/utils/formatters',
            '@/utils/storage',
            '@/utils/validation',
            '@/utils/permissions',
            '@/utils/logger',
            '@/utils/websocket'
          ]
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/variables.scss";'
      }
    }
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'vue-i18n',
      '@mdi/font',
      'axios',
      'date-fns',
      'webfontloader',
      'monaco-editor',
      'file-saver',
      'vue-virtual-scroll-list'
    ],
    exclude: []
  }
})