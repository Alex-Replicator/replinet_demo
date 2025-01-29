<template>
  <div 
    class="form-field"
    :class="{ 'form-field--error': hasError }"
  >
    <!-- Основное поле ввода -->
    <v-text-field
      v-if="type === 'text' || type === 'email' || type === 'password' || type === 'number'"
      v-model="innerValue"
      :type="type"
      :label="label"
      :placeholder="placeholder"
      :hint="hint"
      :rules="validationRules"
      :error-messages="errorMessage"
      :loading="loading"
      :readonly="readonly"
      :disabled="disabled"
      :required="required"
      :clearable="clearable"
      :persistent-hint="persistentHint"
      :density="density"
      :variant="variant"
      :hide-details="hideDetails"
      @blur="onBlur"
      @focus="onFocus"
      @keyup.enter="$emit('enter')"
    >
      <template
        v-for="(_, slot) in $slots"
        :key="slot"
        #[slot]="scope"
      >
        <slot 
          :name="slot"
          v-bind="scope"
        />
      </template>
    </v-text-field>

    <!-- Текстовая область -->
    <v-textarea
      v-else-if="type === 'textarea'"
      v-model="innerValue"
      :label="label"
      :placeholder="placeholder"
      :hint="hint"
      :rules="validationRules"
      :error-messages="errorMessage"
      :loading="loading"
      :readonly="readonly"
      :disabled="disabled"
      :required="required"
      :clearable="clearable"
      :persistent-hint="persistentHint"
      :auto-grow="autoGrow"
      :rows="rows"
      :density="density"
      :variant="variant"
      :hide-details="hideDetails"
      @blur="onBlur"
      @focus="onFocus"
    >
      <template
        v-for="(_, slot) in $slots"
        :key="slot"
        #[slot]="scope"
      >
        <slot 
          :name="slot"
          v-bind="scope"
        />
      </template>
    </v-textarea>

    <!-- Селект -->
    <v-select
      v-else-if="type === 'select'"
      v-model="innerValue"
      :items="items"
      :label="label"
      :placeholder="placeholder"
      :hint="hint"
      :rules="validationRules"
      :error-messages="errorMessage"
      :loading="loading"
      :readonly="readonly"
      :disabled="disabled"
      :required="required"
      :clearable="clearable"
      :persistent-hint="persistentHint"
      :density="density"
      :variant="variant"
      :hide-details="hideDetails"
      :item-title="itemTitle"
      :item-value="itemValue"
      :multiple="multiple"
      :chips="chips"
      @blur="onBlur"
      @focus="onFocus"
      @update:model-value="$emit('change', $event)"
    >
      <template
        v-for="(_, slot) in $slots"
        :key="slot"
        #[slot]="scope"
      >
        <slot 
          :name="slot"
          v-bind="scope"
        />
      </template>
    </v-select>

    <!-- Чекбокс -->
    <v-checkbox
      v-else-if="type === 'checkbox'"
      v-model="innerValue"
      :label="label"
      :hint="hint"
      :error-messages="errorMessage"
      :loading="loading"
      :readonly="readonly"
      :disabled="disabled"
      :required="required"
      :persistent-hint="persistentHint"
      :density="density"
      :hide-details="hideDetails"
      @blur="onBlur"
      @focus="onFocus"
    />

    <!-- Переключатель -->
    <v-switch
      v-else-if="type === 'switch'"
      v-model="innerValue"
      :label="label"
      :hint="hint"
      :error-messages="errorMessage"
      :loading="loading"
      :readonly="readonly"
      :disabled="disabled"
      :required="required"
      :persistent-hint="persistentHint"
      :density="density"
      :hide-details="hideDetails"
      @blur="onBlur"
      @focus="onFocus"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { rules as validationRules } from '@/utils/validation'

interface Props {
  /**
   * Тип поля
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'switch'

  /**
   * Значение поля
   */
  modelValue: any

  /**
   * Метка поля
   */
  label?: string

  /**
   * Подсказка
   */
  placeholder?: string

  /**
   * Пояснительный текст
   */
  hint?: string

  /**
   * Правила валидации
   */
  rules?: Array<(v: any) => true | string>

  /**
   * Загрузка
   */
  loading?: boolean

  /**
   * Только для чтения
   */
  readonly?: boolean

  /**
   * Отключено
   */
  disabled?: boolean

  /**
   * Обязательное поле
   */
  required?: boolean

  /**
   * Можно очистить
   */
  clearable?: boolean

  /**
   * Постоянно показывать подсказку
   */
  persistentHint?: boolean

  /**
   * Плотность поля
   */
  density?: 'default' | 'comfortable' | 'compact'

  /**
   * Вариант оформления
   */
  variant?: 'outlined' | 'filled' | 'plain' | 'underlined'

  /**
   * Скрыть детали (ошибки, подсказки)
   */
  hideDetails?: boolean

  /**
   * Автоматический рост текстовой области
   */
  autoGrow?: boolean

  /**
   * Количество строк текстовой области
   */
  rows?: number

  /**
   * Элементы для селекта
   */
  items?: any[]

  /**
   * Поле для заголовка элемента
   */
  itemTitle?: string

  /**
   * Поле для значения элемента
   */
  itemValue?: string

  /**
   * Множественный выбор
   */
  multiple?: boolean

  /**
   * Показывать выбранные элементы как чипсы
   */
  chips?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  label: '',
  placeholder: '',
  hint: '',
  rules: () => [],
  loading: false,
  readonly: false,
  disabled: false,
  required: false,
  clearable: false,
  persistentHint: false,
  density: 'default',
  variant: 'outlined',
  hideDetails: false,
  autoGrow: false,
  rows: 3,
  items: () => [],
  itemTitle: 'title',
  itemValue: 'value',
  multiple: false,
  chips: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'blur'): void
  (e: 'focus'): void
  (e: 'enter'): void
  (e: 'change', value: any): void
}>()

// Состояние
const innerValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const hasError = ref(false)
const errorMessage = ref('')

// Правила валидации
const computedRules = computed(() => {
  const rules = [...props.rules]
  
  if (props.required) {
    rules.unshift(validationRules.required)
  }
  
  if (props.type === 'email') {
    rules.push(validationRules.email)
  }
  
  if (props.type === 'number') {
    rules.push(validationRules.numeric)
  }
  
  return rules
})

// Методы
function validate() {
  const value = innerValue.value
  
  for (const rule of computedRules.value) {
    const result = rule(value)
    if (result !== true) {
      hasError.value = true
      errorMessage.value = result
      return false
    }
  }
  
  hasError.value = false
  errorMessage.value = ''
  return true
}

function onBlur() {
  validate()
  emit('blur')
}

function onFocus() {
  emit('focus')
}

// Отслеживание изменений значения для валидации
watch(innerValue, () => {
  if (hasError.value) {
    validate()
  }
})
</script>

<style lang="scss" scoped>
.form-field {
  width: 100%;
  margin-bottom: var(--spacing-sm);

  &--error {
    animation: shake 0.6s;
  }
}

@keyframes shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}
</style>