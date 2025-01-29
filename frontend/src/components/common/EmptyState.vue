<template>
  <div 
    class="empty-state"
    :class="[
      `empty-state--${size}`,
      center && 'empty-state--center'
    ]"
  >
    <div class="empty-state__icon">
      <v-icon
        :size="iconSizes[size]"
        :color="color"
      >
        {{ icon }}
      </v-icon>
    </div>

    <div class="empty-state__content">
      <h3 class="empty-state__title text-h6">
        {{ title }}
      </h3>

      <p 
        v-if="description"
        class="empty-state__description text-body-1 text-medium-emphasis"
      >
        {{ description }}
      </p>

      <slot name="description" />

      <div 
        v-if="$slots.actions || primaryAction || secondaryAction"
        class="empty-state__actions mt-4"
      >
        <slot name="actions">
          <template v-if="primaryAction">
            <v-btn
              :color="color"
              :to="primaryAction.to"
              :href="primaryAction.href"
              :loading="primaryAction.loading"
              @click="primaryAction.onClick"
            >
              <v-icon
                v-if="primaryAction.icon"
                start
              >
                {{ primaryAction.icon }}
              </v-icon>
              {{ primaryAction.text }}
            </v-btn>
          </template>

          <template v-if="secondaryAction">
            <v-btn
              variant="text"
              class="ml-2"
              :to="secondaryAction.to"
              :href="secondaryAction.href"
              :loading="secondaryAction.loading"
              @click="secondaryAction.onClick"
            >
              <v-icon
                v-if="secondaryAction.icon"
                start
              >
                {{ secondaryAction.icon }}
              </v-icon>
              {{ secondaryAction.text }}
            </v-btn>
          </template>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Action {
  text: string
  icon?: string
  to?: string | Record<string, any>
  href?: string
  loading?: boolean
  onClick?: () => void
}

interface Props {
  /**
   * Заголовок
   */
  title: string

  /**
   * Описание
   */
  description?: string

  /**
   * Иконка
   */
  icon?: string

  /**
   * Цвет иконки и кнопок
   */
  color?: string

  /**
   * Размер компонента
   */
  size?: 'small' | 'medium' | 'large'

  /**
   * Центрировать контент
   */
  center?: boolean

  /**
   * Основное действие
   */
  primaryAction?: Action

  /**
   * Дополнительное действие
   */
  secondaryAction?: Action
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'mdi-information',
  color: 'primary',
  size: 'medium',
  center: true
})

// Размеры иконок для разных размеров компонента
const iconSizes = {
  small: 40,
  medium: 64,
  large: 96
}
</script>

<style lang="scss" scoped>
.empty-state {
  padding: var(--spacing-lg);

  &--center {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  &--small {
    max-width: 400px;

    .empty-state__description {
      font-size: 0.875rem;
    }
  }

  &--medium {
    max-width: 600px;
  }

  &--large {
    max-width: 800px;

    .empty-state__title {
      font-size: 1.5rem;
    }
  }

  &__icon {
    margin-bottom: var(--spacing-md);
    opacity: 0.8;
  }

  &__title {
    margin-bottom: var(--spacing-sm);
    font-weight: 500;
  }

  &__description {
    margin-bottom: 0;
    line-height: 1.5;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
  }
}

// Анимация появления
.empty-state {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Адаптивность
@media (max-width: 600px) {
  .empty-state {
    padding: var(--spacing-md);

    &__actions {
      flex-direction: column;
      width: 100%;

      .v-btn {
        width: 100%;
        margin-left: 0 !important;
        margin-top: var(--spacing-sm);

        &:first-child {
          margin-top: 0;
        }
      }
    }
  }
}
</style>