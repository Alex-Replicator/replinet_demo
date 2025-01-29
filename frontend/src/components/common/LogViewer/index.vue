<template>
  <div 
    class="log-viewer"
    :class="{ 'log-viewer--dark': dark }"
  >
    <!-- Панель инструментов -->
    <div
      v-if="showToolbar"
      class="log-viewer__toolbar"
    >
      <!-- Фильтры -->
      <v-text-field
        v-model="searchQuery"
        density="compact"
        hide-details
        placeholder="Поиск в логах..."
        prepend-inner-icon="mdi-magnify"
        clearable
        class="log-viewer__search"
      />

      <v-select
        v-model="selectedLevel"
        :items="logLevels"
        label="Уровень"
        density="compact"
        hide-details
        class="log-viewer__level-select"
      />

      <v-spacer />

      <!-- Действия -->
      <v-btn-group>
        <v-btn
          :icon="autoScroll ? 'mdi-arrow-down-bold-box' : 'mdi-arrow-down-bold-box-outline'"
          size="small"
          :color="autoScroll ? 'primary' : undefined"
          @click="toggleAutoScroll"
        >
          <v-tooltip activator="parent">
            Автопрокрутка
          </v-tooltip>
        </v-btn>

        <v-btn
          icon="mdi-refresh"
          size="small"
          :loading="loading"
          @click="refresh"
        >
          <v-tooltip activator="parent">
            Обновить
          </v-tooltip>
        </v-btn>

        <v-btn
          icon="mdi-content-copy"
          size="small"
          @click="copyLogs"
        >
          <v-tooltip activator="parent">
            Копировать все
          </v-tooltip>
        </v-btn>

        <v-btn
          icon="mdi-download"
          size="small"
          @click="downloadLogs"
        >
          <v-tooltip activator="parent">
            Скачать
          </v-tooltip>
        </v-btn>

        <v-btn
          v-if="showClear"
          icon="mdi-trash-can"
          size="small"
          color="error"
          @click="confirmClear"
        >
          <v-tooltip activator="parent">
            Очистить
          </v-tooltip>
        </v-btn>
      </v-btn-group>
    </div>

    <!-- Контейнер логов -->
    <div
      ref="logContainer"
      class="log-viewer__content"
      :style="{ height }"
      @scroll="onScroll"
    >
      <virtual-list
        class="log-viewer__list"
        :data-key="'id'"
        :data-sources="filteredLogs"
        :data-component="LogEntry"
        :estimate-size="36"
        :keeps="50"
      >
        <template #header v-if="loading">
          <div class="log-viewer__loading">
            <v-progress-circular
              indeterminate
              size="20"
              width="2"
            />
            <span class="ml-2">Загрузка логов...</span>
          </div>
        </template>

        <template #footer v-if="filteredLogs.length === 0">
          <div class="log-viewer__empty">
            <empty-state
              title="Нет логов"
              description="Логи пока отсутствуют или не соответствуют заданным фильтрам"
              icon="mdi-text-box-remove"
              size="small"
            />
          </div>
        </template>
      </virtual-list>
    </div>

    <!-- Диалог подтверждения очистки -->
    <confirm-dialog
      v-if="showClearDialog"
      title="Очистить логи"
      message="Вы уверены, что хотите очистить все логи? Это действие нельзя отменить."
      type="error"
      :loading="clearing"
      @confirm="clearLogs"
      @cancel="showClearDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import VirtualList from 'vue-virtual-scroll-list'
import { saveAs } from 'file-saver'
import LogEntry from './LogEntry.vue'
import EmptyState from '../EmptyState.vue'
import ConfirmDialog from '../ConfirmDialog.vue'
import { useAppStore } from '@/stores/app'

interface LogItem {
  id: string | number
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  details?: Record<string, any>
}

interface Props {
  /**
   * Массив логов
   */
  logs: LogItem[]

  /**
   * Загрузка данных
   */
  loading?: boolean

  /**
   * Высота компонента
   */
  height?: string

  /**
   * Темная тема
   */
  dark?: boolean

  /**
   * Показывать панель инструментов
   */
  showToolbar?: boolean

  /**
   * Показывать кнопку очистки
   */
  showClear?: boolean

  /**
   * Автоматическая прокрутка вниз
   */
  autoScrollEnabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  height: '400px',
  dark: false,
  showToolbar: true,
  showClear: true,
  autoScrollEnabled: true
})

const emit = defineEmits<{
  (e: 'clear'): void
  (e: 'refresh'): void
}>()

// Состояние
const logContainer = ref<HTMLElement>()
const searchQuery = ref('')
const selectedLevel = ref<string | null>(null)
const autoScroll = ref(props.autoScrollEnabled)
const showClearDialog = ref(false)
const clearing = ref(false)
const appStore = useAppStore()

// Уровни логов
const logLevels = [
  { title: 'Все', value: null },
  { title: 'Debug', value: 'debug' },
  { title: 'Info', value: 'info' },
  { title: 'Warning', value: 'warn' },
  { title: 'Error', value: 'error' }
]

// Фильтрация логов
const filteredLogs = computed(() => {
  let result = [...props.logs]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(log => 
      log.message.toLowerCase().includes(query) ||
      JSON.stringify(log.details).toLowerCase().includes(query)
    )
  }

  if (selectedLevel.value) {
    result = result.filter(log => log.level === selectedLevel.value)
  }

  return result
})

// Методы
function toggleAutoScroll() {
  autoScroll.value = !autoScroll.value
  if (autoScroll.value) {
    scrollToBottom()
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
}

function onScroll(e: Event) {
  const target = e.target as HTMLElement
  const { scrollTop, scrollHeight, clientHeight } = target
  
  // Отключаем автопрокрутку если пользователь прокрутил вверх
  if (autoScroll.value && scrollTop + clientHeight < scrollHeight - 50) {
    autoScroll.value = false
  }
}

function copyLogs() {
  const text = filteredLogs.value
    .map(log => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`)
    .join('\n')
  
  navigator.clipboard.writeText(text)
  appStore.showMessage({
    text: 'Логи скопированы в буфер обмена',
    color: 'success'
  })
}

function downloadLogs() {
  const text = filteredLogs.value
    .map(log => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`)
    .join('\n')
  
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, `logs_${new Date().toISOString()}.txt`)
}

function refresh() {
  emit('refresh')
}

function confirmClear() {
  showClearDialog.value = true
}

async function clearLogs() {
  try {
    clearing.value = true
    emit('clear')
    showClearDialog.value = false
    appStore.showMessage({
      text: 'Логи очищены',
      color: 'success'
    })
  } catch (error) {
    appStore.showError(error)
  } finally {
    clearing.value = false
  }
}

// Автопрокрутка при добавлении новых логов
watch(() => props.logs.length, () => {
  if (autoScroll.value) {
    scrollToBottom()
  }
})

// Жизненный цикл
onMounted(() => {
  if (autoScroll.value) {
    scrollToBottom()
  }
})
</script>

<style lang="scss" scoped>
.log-viewer {
  border: thin solid var(--border-color);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  background-color: var(--v-theme-surface);

  &--dark {
    background-color: #1E1E1E;

    :deep(.log-entry) {
      border-color: rgba(255, 255, 255, 0.1);
    }
  }

  &__toolbar {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-sm);
    background-color: rgba(var(--v-theme-surface-variant), 0.1);
    border-bottom: thin solid var(--border-color);
  }

  &__search {
    max-width: 300px;
  }

  &__level-select {
    width: 150px;
  }

  &__content {
    overflow-y: auto;
    overflow-x: hidden;
  }

  &__loading,
  &__empty {
    padding: var(--spacing-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(var(--v-theme-on-surface), 0.6);
  }

  &__list {
    height: 100%;
  }
}

// Адаптивность
@media (max-width: 600px) {
  .log-viewer {
    &__toolbar {
      flex-wrap: wrap;
    }

    &__search,
    &__level-select {
      width: 100%;
      max-width: none;
    }
  }
}
</style>