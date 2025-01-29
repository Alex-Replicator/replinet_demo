<template>
  <v-chip
    :color="statusColor"
    :class="[
      'status-badge',
      size === 'small' ? 'status-badge--small' : '',
      bordered ? 'status-badge--bordered' : ''
    ]"
    :variant="variant"
  >
    <v-icon
      v-if="showIcon"
      :size="iconSize"
      :class="pulse ? 'status-badge__icon--pulse' : ''"
      class="status-badge__icon mr-1"
    >
      {{ statusIcon }}
    </v-icon>
    <span>{{ statusText }}</span>
  </v-chip>
</template>

<script setup lang="ts">
interface Props {
  /**
   * Статус для отображения
   */
  status: string

  /**
   * Размер бейджа
   */
  size?: 'small' | 'medium'

  /**
   * Показывать ли иконку
   */
  showIcon?: boolean

  /**
   * Должна ли иконка пульсировать
   */
  pulse?: boolean

  /**
   * Вариант отображения
   */
  variant?: 'text' | 'outlined' | 'flat' | 'elevated'

  /**
   * Показывать ли рамку
   */
  bordered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  showIcon: true,
  pulse: false,
  variant: 'flat',
  bordered: false
})

// Статусы и их настройки
const statusConfig = {
  running: {
    color: 'success',
    icon: 'mdi-play-circle',
    text: 'Запущен'
  },
  completed: {
    color: 'primary',
    icon: 'mdi-check-circle',
    text: 'Завершен'
  },
  error: {
    color: 'error',
    icon: 'mdi-alert-circle',
    text: 'Ошибка'
  },
  idle: {
    color: 'info',
    icon: 'mdi-timer-sand',
    text: 'В ожидании'
  },
  stopped: {
    color: 'warning',
    icon: 'mdi-stop-circle',
    text: 'Остановлен'
  },
  paused: {
    color: 'warning',
    icon: 'mdi-pause-circle',
    text: 'Приостановлен'
  },
  pending: {
    color: 'grey',
    icon: 'mdi-dots-horizontal-circle',
    text: 'В очереди'
  },
  unknown: {
    color: 'grey',
    icon: 'mdi-help-circle',
    text: 'Неизвестно'
  }
} as const

// Вычисляемые свойства
const statusColor = computed(() => {
  return statusConfig[props.status as keyof typeof statusConfig]?.color || 'grey'
})

const statusIcon = computed(() => {
  return statusConfig[props.status as keyof typeof statusConfig]?.icon || 'mdi-help-circle'
})

const statusText = computed(() => {
  return statusConfig[props.status as keyof typeof statusConfig]?.text || props.status
})

const iconSize = computed(() => {
  return props.size === 'small' ? 16 : 20
})
</script>

<style lang="scss" scoped>
.status-badge {
  font-weight: 500;
  letter-spacing: 0.0125em;

  &--small {
    height: 24px;
    padding: 0 8px;
    font-size: 12px;
  }

  &--bordered {
    border: 1px solid currentColor;
  }

  &__icon {
    margin-right: 4px;

    &--pulse {
      animation: pulse 2s infinite;
    }
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

// Цветовые темы для разных статусов
.v-theme--light {
  .status-badge {
    &.bg-success {
      background-color: rgba(var(--v-theme-success), 0.12) !important;
    }
    &.bg-error {
      background-color: rgba(var(--v-theme-error), 0.12) !important;
    }
    &.bg-warning {
      background-color: rgba(var(--v-theme-warning), 0.12) !important;
    }
    &.bg-info {
      background-color: rgba(var(--v-theme-info), 0.12) !important;
    }
    &.bg-grey {
      background-color: rgba(var(--v-theme-grey), 0.12) !important;
    }
  }
}

.v-theme--dark {
  .status-badge {
    &.bg-success {
      background-color: rgba(var(--v-theme-success), 0.24) !important;
    }
    &.bg-error {
      background-color: rgba(var(--v-theme-error), 0.24) !important;
    }
    &.bg-warning {
      background-color: rgba(var(--v-theme-warning), 0.24) !important;
    }
    &.bg-info {
      background-color: rgba(var(--v-theme-info), 0.24) !important;
    }
    &.bg-grey {
      background-color: rgba(var(--v-theme-grey), 0.24) !important;
    }
  }
}
</style>