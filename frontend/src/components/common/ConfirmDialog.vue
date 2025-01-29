<template>
  <v-dialog
    v-model="showDialog"
    :max-width="maxWidth"
    :persistent="persistent"
  >
    <v-card>
      <v-card-title :class="getTitleClass">
        <v-icon
          v-if="icon"
          :icon="icon"
          :color="type"
          class="mr-2"
          size="24"
        />
        {{ title }}
      </v-card-title>

      <v-card-text class="pt-4">
        <div v-if="$slots.default">
          <slot />
        </div>
        <div v-else class="text-body-1">
          {{ message }}
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        
        <v-btn
          v-if="showCancel"
          variant="text"
          :disabled="loading"
          @click="handleCancel"
        >
          {{ cancelText }}
        </v-btn>

        <v-btn
          :color="type"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  /**
   * Заголовок диалога
   */
  title: string

  /**
   * Сообщение диалога (если нет слота)
   */
  message?: string

  /**
   * Тип диалога (влияет на цвет)
   */
  type?: 'primary' | 'error' | 'warning' | 'info'

  /**
   * Иконка в заголовке
   */
  icon?: string

  /**
   * Максимальная ширина диалога
   */
  maxWidth?: number | string

  /**
   * Текст кнопки подтверждения
   */
  confirmText?: string

  /**
   * Текст кнопки отмены
   */
  cancelText?: string

  /**
   * Показывать ли кнопку отмены
   */
  showCancel?: boolean

  /**
   * Нельзя закрыть по клику вне
   */
  persistent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  type: 'primary',
  icon: undefined,
  maxWidth: 400,
  confirmText: 'Подтвердить',
  cancelText: 'Отмена',
  showCancel: true,
  persistent: false
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

// Состояние
const showDialog = ref(true)
const loading = ref(false)

// Вычисляемые свойства
const getTitleClass = computed(() => ({
  [`text-${props.type}`]: true,
  'pa-4': true,
  'd-flex': true,
  'align-center': true
}))

// Методы
async function handleConfirm() {
  loading.value = true
  try {
    emit('confirm')
  } finally {
    loading.value = false
    showDialog.value = false
  }
}

function handleCancel() {
  emit('cancel')
  showDialog.value = false
}

// Сопоставление типов с иконками по умолчанию
const defaultIcons = {
  primary: 'mdi-check-circle',
  error: 'mdi-alert-circle',
  warning: 'mdi-alert',
  info: 'mdi-information'
}

// Если иконка не указана, используем иконку по умолчанию для типа
if (!props.icon && props.type) {
  props.icon = defaultIcons[props.type]
}
</script>

<style lang="scss" scoped>
.v-card {
  &__title {
    border-bottom: thin solid var(--border-color);
  }
  
  &__text {
    white-space: pre-line;
  }
  
  &__actions {
    padding: var(--spacing-md) var(--spacing-lg);
  }
}

// Анимация появления
.v-dialog-transition-enter-active,
.v-dialog-transition-leave-active {
  transition: opacity var(--transition-duration) var(--transition-timing),
              transform var(--transition-duration) var(--transition-timing);
}

.v-dialog-transition-enter-from,
.v-dialog-transition-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>