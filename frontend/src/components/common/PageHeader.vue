<template>
  <div class="page-header">
    <!-- Основная информация -->
    <div class="page-header__main">
      <!-- Кнопка назад -->
      <v-btn
        v-if="backTo"
        icon
        variant="text"
        size="small"
        :to="backTo"
        class="page-header__back"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>

      <!-- Заголовок и подзаголовок -->
      <div class="page-header__titles">
        <div class="d-flex align-center">
          <slot name="title-prepend" />
          
          <h1 class="text-h5 font-weight-medium mb-0">
            {{ title }}
          </h1>

          <slot name="title-append" />
        </div>

        <div 
          v-if="subtitle || $slots.subtitle"
          class="text-body-1 text-medium-emphasis mt-1"
        >
          <slot name="subtitle">
            {{ subtitle }}
          </slot>
        </div>
      </div>

      <v-spacer />

      <!-- Действия справа -->
      <div 
        v-if="$slots.actions"
        class="page-header__actions d-flex align-center"
      >
        <slot name="actions" />
      </div>
    </div>

    <!-- Дополнительный контент -->
    <div
      v-if="$slots['extra-content']"
      class="page-header__extra mt-4"
    >
      <slot name="extra-content" />
    </div>

    <!-- Хлебные крошки -->
    <div
      v-if="breadcrumbs?.length"
      class="page-header__breadcrumbs mt-2"
    >
      <v-breadcrumbs
        :items="breadcrumbs"
        density="compact"
      >
        <template #divider>
          <v-icon size="small">mdi-chevron-right</v-icon>
        </template>

        <template #title="{ item, index }">
          <div 
            class="text-body-2"
            :class="{
              'font-weight-medium': index === breadcrumbs.length - 1,
              'text-primary': item.to && index !== breadcrumbs.length - 1
            }"
          >
            {{ item.title }}
          </div>
        </template>
      </v-breadcrumbs>
    </div>

    <!-- Вкладки -->
    <div
      v-if="tabs?.length"
      class="page-header__tabs mt-4"
    >
      <v-tabs
        v-model="activeTab"
        density="comfortable"
        :color="tabsColor"
      >
        <v-tab
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
          :to="tab.to"
          :disabled="tab.disabled"
        >
          <v-icon
            v-if="tab.icon"
            :icon="tab.icon"
            start
          />
          {{ tab.title }}
        </v-tab>
      </v-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Tab {
  title: string
  value: string | number
  icon?: string
  to?: string | Record<string, any>
  disabled?: boolean
}

interface Breadcrumb {
  title: string
  to?: string | Record<string, any>
  disabled?: boolean
}

interface Props {
  /**
   * Заголовок страницы
   */
  title: string

  /**
   * Подзаголовок
   */
  subtitle?: string

  /**
   * Ссылка для кнопки "Назад"
   */
  backTo?: string | Record<string, any>

  /**
   * Хлебные крошки
   */
  breadcrumbs?: Breadcrumb[]

  /**
   * Вкладки
   */
  tabs?: Tab[]

  /**
   * Цвет вкладок
   */
  tabsColor?: string

  /**
   * Модель для вкладок
   */
  modelValue?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  backTo: undefined,
  breadcrumbs: () => [],
  tabs: () => [],
  tabsColor: 'primary',
  modelValue: undefined
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

// Активная вкладка
const activeTab = ref(props.modelValue)

// Отслеживаем изменение активной вкладки
watch(activeTab, (value) => {
  emit('update:modelValue', value)
})
</script>

<style lang="scss" scoped>
.page-header {
  padding: var(--spacing-lg) 0;

  &__main {
    display: flex;
    align-items: flex-start;
  }

  &__back {
    margin-right: var(--spacing-md);
    margin-top: 2px;
  }

  &__titles {
    flex: 1;
    min-width: 0;
  }

  &__actions {
    margin-left: var(--spacing-md);
    
    .v-btn + .v-btn {
      margin-left: var(--spacing-sm);
    }
  }
}

// Адаптивность
@media (max-width: 600px) {
  .page-header {
    padding: var(--spacing-md) 0;

    &__main {
      flex-direction: column;
      align-items: stretch;
    }

    &__actions {
      margin-left: 0;
      margin-top: var(--spacing-md);
      justify-content: flex-start;

      .v-btn {
        flex: 1;
      }
    }

    &__breadcrumbs {
      overflow-x: auto;
      white-space: nowrap;
      -webkit-overflow-scrolling: touch;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    &__tabs {
      margin-left: calc(var(--spacing-md) * -1);
      margin-right: calc(var(--spacing-md) * -1);
      
      .v-tabs {
        background-color: var(--v-theme-surface);
      }
    }
  }
}
</style>