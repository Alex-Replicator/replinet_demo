<template>
  <div class="data-table">
    <!-- Панель инструментов -->
    <div 
      v-if="$slots.toolbar || showSearch"
      class="data-table__toolbar"
    >
      <slot name="toolbar-prepend" />

      <v-text-field
        v-if="showSearch"
        v-model="searchQuery"
        density="compact"
        hide-details
        prepend-inner-icon="mdi-magnify"
        placeholder="Поиск..."
        class="data-table__search"
        :loading="loading"
        clearable
        @click:clear="onSearchClear"
      />

      <slot name="toolbar" />

      <slot name="toolbar-append" />
    </div>

    <!-- Таблица -->
    <v-table
      :loading="loading"
      :hover="hover"
      :fixed-header="fixedHeader"
      :height="height"
    >
      <!-- Заголовок таблицы -->
      <thead>
        <tr>
          <th
            v-for="header in headers"
            :key="header.key"
            :class="[
              header.class,
              header.sortable !== false ? 'sortable' : ''
            ]"
            :style="{ width: header.width }"
            @click="header.sortable !== false && sort(header.key)"
          >
            <div class="d-flex align-center">
              {{ header.title }}
              <v-icon
                v-if="header.sortable !== false"
                size="small"
                :color="sortBy === header.key ? 'primary' : 'grey'"
              >
                {{ getSortIcon(header.key) }}
              </v-icon>
            </div>
          </th>
          <th 
            v-if="$slots.actions"
            class="actions-header"
          >
            Действия
          </th>
        </tr>
      </thead>

      <!-- Тело таблицы -->
      <tbody>
        <template v-if="loading">
          <tr
            v-for="n in 3"
            :key="n"
          >
            <td
              v-for="header in headers"
              :key="header.key"
              class="pa-4"
            >
              <v-skeleton-loader type="text" />
            </td>
            <td v-if="$slots.actions">
              <v-skeleton-loader type="button" />
            </td>
          </tr>
        </template>

        <template v-else-if="items.length">
          <tr
            v-for="(item, index) in items"
            :key="getItemKey(item)"
            @click="$emit('row-click', item)"
          >
            <td
              v-for="header in headers"
              :key="header.key"
              :class="header.class"
            >
              <slot
                :name="header.key"
                :item="item"
                :value="getValue(item, header.key)"
                :index="index"
              >
                {{ getValue(item, header.key) }}
              </slot>
            </td>
            <td v-if="$slots.actions">
              <slot
                name="actions"
                :item="item"
                :index="index"
              />
            </td>
          </tr>
        </template>

        <template v-else>
          <tr>
            <td
              :colspan="headers.length + ($slots.actions ? 1 : 0)"
              class="text-center pa-4"
            >
              <empty-state
                v-bind="emptyState"
                size="small"
              >
                <template
                  v-for="(_, name) in $slots"
                  :key="name"
                  #[name]="slotData"
                >
                  <slot
                    :name="name"
                    v-bind="slotData"
                  />
                </template>
              </empty-state>
            </td>
          </tr>
        </template>
      </tbody>
    </v-table>

    <!-- Пагинация -->
    <div
      v-if="showPagination && totalItems > 0"
      class="data-table__pagination"
    >
      <div class="d-flex align-center">
        <span class="text-caption text-medium-emphasis mr-4">
          Строк на странице
        </span>
        <v-select
          v-model="itemsPerPage"
          :items="itemsPerPageOptions"
          density="compact"
          variant="outlined"
          hide-details
          class="items-per-page-select"
        />
      </div>

      <v-pagination
        v-model="page"
        :length="pageCount"
        :total-visible="5"
      />

      <div class="text-caption text-medium-emphasis">
        {{ paginationText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import EmptyState from './EmptyState.vue'
import type { Action } from '@/types/models'

interface Header {
  title: string
  key: string
  sortable?: boolean
  width?: string
  class?: string
}

interface Props {
  /**
   * Заголовки таблицы
   */
  headers: Header[]

  /**
   * Элементы для отображения
   */
  items: any[]

  /**
   * Общее количество элементов (для пагинации)
   */
  totalItems?: number

  /**
   * Загрузка данных
   */
  loading?: boolean

  /**
   * Подсветка при наведении
   */
  hover?: boolean

  /**
   * Фиксированный заголовок
   */
  fixedHeader?: boolean

  /**
   * Высота таблицы
   */
  height?: string | number

  /**
   * Показывать поиск
   */
  showSearch?: boolean

  /**
   * Показывать пагинацию
   */
  showPagination?: boolean

  /**
   * Опции количества элементов на странице
   */
  itemsPerPageOptions?: number[]

  /**
   * Настройки пустого состояния
   */
  emptyState?: {
    title: string
    description?: string
    icon?: string
    primaryAction?: Action
    secondaryAction?: Action
  }
}

const props = withDefaults(defineProps<Props>(), {
  totalItems: 0,
  loading: false,
  hover: true,
  fixedHeader: false,
  height: undefined,
  showSearch: true,
  showPagination: true,
  itemsPerPageOptions: () => [10, 25, 50, 100],
  emptyState: () => ({
    title: 'Нет данных',
    icon: 'mdi-database-off'
  })
})

const emit = defineEmits<{
  (e: 'update:options', value: any): void
  (e: 'row-click', item: any): void
}>()

// Состояние
const searchQuery = ref('')
const sortBy = ref('')
const sortDesc = ref(false)
const page = ref(1)
const itemsPerPage = ref(props.itemsPerPageOptions[0])

// Вычисляемые свойства
const pageCount = computed(() => {
  return Math.ceil(props.totalItems / itemsPerPage.value)
})

const paginationText = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value + 1
  const end = Math.min(start + itemsPerPage.value - 1, props.totalItems)
  return `${start}-${end} из ${props.totalItems}`
})

// Методы
function sort(key: string) {
  if (sortBy.value === key) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = key
    sortDesc.value = false
  }
  updateOptions()
}

function getSortIcon(key: string) {
  if (sortBy.value !== key) return 'mdi-unfold-more-horizontal'
  return sortDesc.value ? 'mdi-arrow-down' : 'mdi-arrow-up'
}

function getValue(item: any, key: string) {
  return key.split('.').reduce((o, i) => o?.[i], item)
}

function getItemKey(item: any) {
  return item.id || JSON.stringify(item)
}

function onSearchClear() {
  searchQuery.value = ''
  updateOptions()
}

function updateOptions() {
  emit('update:options', {
    page: page.value,
    itemsPerPage: itemsPerPage.value,
    sortBy: sortBy.value,
    sortDesc: sortDesc.value,
    search: searchQuery.value
  })
}

// Отслеживание изменений
watch([page, itemsPerPage, searchQuery], updateOptions)
</script>

<style lang="scss" scoped>
.data-table {
  border: thin solid var(--border-color);
  border-radius: var(--border-radius-md);
  overflow: hidden;

  &__toolbar {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    border-bottom: thin solid var(--border-color);
  }

  &__search {
    max-width: 300px;
  }

  &__pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) var(--spacing-md);
    border-top: thin solid var(--border-color);
  }
}

.items-per-page-select {
  width: 80px;
}

// Стили для заголовков
th {
  white-space: nowrap;
  user-select: none;

  &.sortable {
    cursor: pointer;

    &:hover {
      background-color: rgba(var(--v-theme-on-surface), 0.04);
    }
  }

  &.actions-header {
    width: 1%;
    white-space: nowrap;
    text-align: right;
  }
}

// Стили для строк
tr {
  cursor: pointer;

  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.04);
  }
}

// Адаптивность
@media (max-width: 600px) {
  .data-table {
    &__toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    &__search {
      max-width: none;
    }

    &__pagination {
      flex-direction: column;
      gap: var(--spacing-md);
    }
  }
}
</style>