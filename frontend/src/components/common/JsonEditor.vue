<template>
  <div
    class="json-editor"
    :class="{ 
      'json-editor--readonly': readonly,
      'json-editor--error': hasError
    }"
  >
    <!-- Панель инструментов -->
    <div
      v-if="showToolbar"
      class="json-editor__toolbar"
    >
      <v-btn-group>
        <v-btn
          v-if="!readonly"
          icon="mdi-format-align-left"
          size="small"
          @click="formatJson"
          :disabled="hasError"
        >
          <v-tooltip activator="parent">
            Форматировать JSON
          </v-tooltip>
        </v-btn>

        <v-btn
          v-if="!readonly"
          icon="mdi-content-copy"
          size="small"
          @click="copyToClipboard"
        >
          <v-tooltip activator="parent">
            Копировать
          </v-tooltip>
        </v-btn>

        <v-btn
          v-if="showExpandCollapse"
          icon="mdi-unfold-more-horizontal"
          size="small"
          @click="expandAll"
        >
          <v-tooltip activator="parent">
            Развернуть все
          </v-tooltip>
        </v-btn>

        <v-btn
          v-if="showExpandCollapse"
          icon="mdi-unfold-less-horizontal"
          size="small"
          @click="collapseAll"
        >
          <v-tooltip activator="parent">
            Свернуть все
          </v-tooltip>
        </v-btn>
      </v-btn-group>

      <div 
        v-if="hasError"
        class="json-editor__error text-error text-caption"
      >
        {{ errorMessage }}
      </div>
    </div>

    <!-- Редактор -->
    <div
      ref="editorContainer"
      class="json-editor__content"
      :style="{ height }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor'
import { useAppStore } from '@/stores/app'

interface Props {
  /**
   * Значение редактора
   */
  modelValue: string | object

  /**
   * Только для чтения
   */
  readonly?: boolean

  /**
   * Высота редактора
   */
  height?: string

  /**
   * Показывать панель инструментов
   */
  showToolbar?: boolean

  /**
   * Показывать кнопки развернуть/свернуть
   */
  showExpandCollapse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  height: '300px',
  showToolbar: true,
  showExpandCollapse: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'error', error: Error | null): void
  (e: 'change', value: string): void
}>()

// Состояние
const editorContainer = ref<HTMLElement>()
const editor = ref<monaco.editor.IStandaloneCodeEditor>()
const hasError = ref(false)
const errorMessage = ref('')
const appStore = useAppStore()

// Инициализация редактора
onMounted(() => {
  if (!editorContainer.value) return

  // Конфигурация редактора
  const options: monaco.editor.IStandaloneEditorConstructionOptions = {
    value: formatValue(props.modelValue),
    language: 'json',
    theme: 'vs-dark',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    wrappingIndent: 'deepIndent',
    automaticLayout: true,
    readOnly: props.readonly,
    tabSize: 2,
    fontSize: 14,
    lineNumbers: 'on',
    renderLineHighlight: 'all',
    matchBrackets: 'always',
    autoClosingBrackets: 'always',
    formatOnPaste: true,
    formatOnType: true
  }

  // Создание редактора
  editor.value = monaco.editor.create(editorContainer.value, options)

  // Обработка изменений
  editor.value.onDidChangeModelContent(() => {
    const value = editor.value?.getValue() || ''
    validateJson(value)
    emit('change', value)
    if (!hasError.value) {
      emit('update:modelValue', value)
    }
  })
})

// Очистка
onBeforeUnmount(() => {
  editor.value?.dispose()
})

// Отслеживание изменений значения извне
watch(
  () => props.modelValue,
  (newValue) => {
    const formatted = formatValue(newValue)
    if (editor.value && formatted !== editor.value.getValue()) {
      editor.value.setValue(formatted)
    }
  }
)

// Методы
function formatValue(value: string | object): string {
  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2)
    } catch {
      return value
    }
  }
  return JSON.stringify(value, null, 2)
}

function validateJson(value: string) {
  try {
    JSON.parse(value)
    hasError.value = false
    errorMessage.value = ''
    emit('error', null)
  } catch (error) {
    hasError.value = true
    errorMessage.value = (error as Error).message
    emit('error', error as Error)
  }
}

function formatJson() {
  try {
    const value = editor.value?.getValue() || ''
    const formatted = JSON.stringify(JSON.parse(value), null, 2)
    editor.value?.setValue(formatted)
    validateJson(formatted)
  } catch (error) {
    appStore.showError('Невалидный JSON')
  }
}

function copyToClipboard() {
  const value = editor.value?.getValue()
  if (value) {
    navigator.clipboard.writeText(value)
    appStore.showMessage({
      text: 'JSON скопирован в буфер обмена',
      color: 'success'
    })
  }
}

function expandAll() {
  const ranges = editor.value?.getModel()?.getAllDecorations()
    .filter(d => d.options.isWholeLine)
    .map(d => d.range)
  
  if (ranges) {
    ranges.forEach(range => {
      editor.value?.setPosition({ lineNumber: range.startLineNumber, column: 1 })
      monaco.editor.executeEditorAction(editor.value as any, 'editor.unfold')
    })
  }
}

function collapseAll() {
  const ranges = editor.value?.getModel()?.getAllDecorations()
    .filter(d => d.options.isWholeLine)
    .map(d => d.range)
  
  if (ranges) {
    ranges.forEach(range => {
      editor.value?.setPosition({ lineNumber: range.startLineNumber, column: 1 })
      monaco.editor.executeEditorAction(editor.value as any, 'editor.fold')
    })
  }
}
</script>

<style lang="scss" scoped>
.json-editor {
  border: thin solid var(--border-color);
  border-radius: var(--border-radius-md);
  overflow: hidden;

  &--readonly {
    opacity: 0.8;
  }

  &--error {
    border-color: var(--error);
  }

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: rgba(var(--v-theme-surface-variant), 0.1);
    border-bottom: thin solid var(--border-color);
  }

  &__error {
    max-width: 400px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__content {
    width: 100%;
  }
}

// Тема для Monaco Editor
:deep(.monaco-editor) {
  .margin {
    background-color: rgba(var(--v-theme-surface-variant), 0.1);
  }
}
</style>