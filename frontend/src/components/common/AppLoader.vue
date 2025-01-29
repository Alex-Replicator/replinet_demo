<template>
  <div 
    class="app-loader"
    :class="{ 
      'app-loader--overlay': overlay,
      'app-loader--inline': !overlay
    }"
  >
    <v-progress-circular
      :size="size"
      :width="width"
      :color="color"
      indeterminate
    />
    <div 
      v-if="text"
      class="app-loader__text"
      :class="{ 'mt-2': text }"
    >
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /**
   * Показывать как оверлей поверх контента
   */
  overlay?: boolean
  
  /**
   * Размер индикатора загрузки
   */
  size?: number
  
  /**
   * Толщина линии индикатора
   */
  width?: number
  
  /**
   * Цвет индикатора
   */
  color?: string
  
  /**
   * Текст под индикатором
   */
  text?: string
}

withDefaults(defineProps<Props>(), {
  overlay: false,
  size: 32,
  width: 3,
  color: 'primary',
  text: ''
})
</script>

<style lang="scss" scoped>
.app-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  &--overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(var(--v-theme-surface), 0.8);
    z-index: var(--z-index-modal);
  }
  
  &--inline {
    padding: var(--spacing-md);
  }
  
  &__text {
    color: rgba(var(--v-theme-on-surface), 0.6);
    font-size: 0.875rem;
    text-align: center;
  }
}

// Анимация появления
.app-loader--overlay {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>