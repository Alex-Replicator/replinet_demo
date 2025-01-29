<template>
  <div 
    class="log-entry"
    :class="`log-entry--${source.level}`"
  >
    <!-- Временная метка -->
    <span class="log-entry__timestamp">
      {{ formatTimestamp(source.timestamp) }}
    </span>

    <!-- Уровень лога -->
    <span 
      class="log-entry__level"
      :class="`log-entry__level--${source.level}`"
    >
      {{ source.level.toUpperCase() }}
    </span>

    <!-- Сообщение -->
    <span 
      class="log-entry__message"
      :class="{ 'log-entry__message--error': source.level === 'error' }"
    >
      {{ source.message }}
    </span>

    <!-- Дополнительные данные -->
    <div 
      v-if="hasDetails"
      class="log-entry__details"
    >
      <v-btn
        density="compact"
        size="x-small"
        variant="text"
        @click="expanded = !expanded"
      >
        <v-icon
          size="small"
          :icon="expanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
        />
        Детали
      </v-btn>

      <div 
        v-if="expanded"
        class="log-entry__json mt-2"
      >
        <pre>{{ formatDetails(source.details) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatDate } from '@/utils/formatters'

interface LogSource {
  id: string | number
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  details?: Record<string, any>
}

interface Props {
  source: LogSource
  index: number
}

const props = defineProps<Props>()

// Состояние
const expanded = ref(false)

// Вычисляемые свойства
const hasDetails = computed(() => {
  return !!props.source.details && Object.keys(props.source.details).length > 0
})

// Методы
function formatTimestamp(timestamp: string): string {
  return formatDate(timestamp)
}

function formatDetails(details: Record<string, any>): string {
  return JSON.stringify(details, null, 2)
}
</script>

<style lang="scss" scoped>
.log-entry {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-family: monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.1);

  &:hover {
    background-color: rgba(var(--v-theme-on-surface), 0.04);
  }

  // Уровни логов
  &--debug {
    color: rgba(var(--v-theme-on-surface), 0.7);
  }

  &--info {
    color: var(--v-theme-on-surface);
  }

  &--warn {
    background-color: rgba(var(--v-theme-warning), 0.1);
  }

  &--error {
    background-color: rgba(var(--v-theme-error), 0.1);
  }

  &__timestamp {
    color: rgba(var(--v-theme-on-surface), 0.6);
    margin-right: var(--spacing-sm);
  }

  &__level {
    display: inline-block;
    min-width: 60px;
    padding: 0 var(--spacing-xs);
    border-radius: var(--border-radius-sm);
    font-size: 0.75rem;
    font-weight: 500;
    text-align: center;
    margin-right: var(--spacing-sm);

    &--debug {
      background-color: rgba(var(--v-theme-on-surface), 0.1);
    }

    &--info {
      background-color: rgba(var(--v-theme-info), 0.1);
      color: var(--info);
    }

    &--warn {
      background-color: rgba(var(--v-theme-warning), 0.1);
      color: var(--warning);
    }

    &--error {
      background-color: rgba(var(--v-theme-error), 0.1);
      color: var(--error);
    }
  }

  &__message {
    &--error {
      color: var(--error);
    }
  }

  &__details {
    margin-top: var(--spacing-xs);
    margin-left: calc(60px + var(--spacing-sm) * 2);
  }

  &__json {
    background-color: rgba(var(--v-theme-surface-variant), 0.1);
    padding: var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    font-size: 0.75rem;

    pre {
      margin: 0;
    }
  }
}
</style>