<template>
  <div class="preset-list">
    <v-container>
      <!-- Заголовок и кнопка создания -->
      <v-row>
        <v-col>
          <div class="d-flex justify-space-between align-center">
            <h2>Пресеты ИИ-агентов</h2>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="showCreateDialog = true"
            >
              Создать пресет
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Фильтры -->
      <v-row>
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="search"
            label="Поиск"
            prepend-inner-icon="mdi-magnify"
            clearable
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-select
            v-model="selectedModel"
            :items="aiModels"
            label="Модель ИИ"
            clearable
            density="comfortable"
          />
        </v-col>
      </v-row>

      <!-- Список пресетов -->
      <v-row>
        <v-col 
          v-for="preset in filteredPresets"
          :key="preset.id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
              {{ preset.name }}
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon
                    v-bind="props"
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item
                    prepend-icon="mdi-pencil"
                    @click="editPreset(preset)"
                  >
                    Редактировать
                  </v-list-item>
                  <v-list-item
                    prepend-icon="mdi-content-copy"
                    @click="clonePreset(preset)"
                  >
                    Клонировать
                  </v-list-item>
                  <v-list-item
                    prepend-icon="mdi-delete"
                    @click="deletePreset(preset)"
                    color="error"
                  >
                    Удалить
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-card-title>

            <v-card-text>
              <p class="text-body-2 mb-2">{{ preset.description || 'Нет описания' }}</p>
              <v-chip size="small" color="primary" class="mr-2">
                {{ preset.ai_model }}
              </v-chip>
              <v-chip size="small">
                temp: {{ preset.temperature }}
              </v-chip>
            </v-card-text>

            <v-divider />

            <v-card-actions>
              <v-btn
                variant="text"
                :to="`/presets/${preset.id}`"
              >
                Подробнее
              </v-btn>
              <v-spacer />
              <v-btn
                color="primary"
                @click="createAgent(preset)"
              >
                Создать агента
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Диалог создания/редактирования -->
      <v-dialog
        v-model="showCreateDialog"
        max-width="600"
      >
        <v-card>
          <v-card-title>
            {{ editingPreset ? 'Редактирование пресета' : 'Создание пресета' }}
          </v-card-title>

          <v-card-text>
            <v-form ref="form" @submit.prevent="savePreset">
              <v-text-field
                v-model="presetForm.name"
                label="Название"
                :rules="[v => !!v || 'Обязательное поле']"
                required
              />

              <v-textarea
                v-model="presetForm.description"
                label="Описание"
                rows="3"
              />

              <v-select
                v-model="presetForm.ai_model"
                :items="aiModels"
                label="Модель ИИ"
                :rules="[v => !!v || 'Обязательное поле']"
                required
              />

              <v-slider
                v-model="presetForm.temperature"
                label="Температура"
                min="0"
                max="1"
                step="0.1"
                thumb-label
              />

              <v-textarea
                v-model="presetForm.system_prompt"
                label="Системный промпт"
                :rules="[v => !!v || 'Обязательное поле']"
                rows="5"
                required
              />
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              variant="text"
              @click="showCreateDialog = false"
            >
              Отмена
            </v-btn>
            <v-btn
              color="primary"
              @click="savePreset"
              :loading="saving"
            >
              {{ editingPreset ? 'Сохранить' : 'Создать' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Подтверждение удаления -->
      <v-dialog
        v-model="showDeleteDialog"
        max-width="400"
      >
        <v-card>
          <v-card-title>Удаление пресета</v-card-title>
          <v-card-text>
            Вы действительно хотите удалить пресет "{{ presetToDelete?.name }}"?
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              variant="text"
              @click="showDeleteDialog = false"
            >
              Отмена
            </v-btn>
            <v-btn
              color="error"
              @click="confirmDelete"
              :loading="deleting"
            >
              Удалить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const appStore = useAppStore()

// Состояние
const presets = ref([])
const search = ref('')
const selectedModel = ref(null)
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const form = ref()
const editingPreset = ref(null)
const presetToDelete = ref(null)

// Доступные модели ИИ
const aiModels = [
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4-turbo'
]

// Форма пресета
const presetForm = ref({
  name: '',
  description: '',
  ai_model: 'gpt-3.5-turbo',
  temperature: 0.7,
  system_prompt: ''
})

// Фильтрация пресетов
const filteredPresets = computed(() => {
  let result = [...presets.value]
  
  if (search.value) {
    const searchLower = search.value.toLowerCase()
    result = result.filter(preset =>
      preset.name.toLowerCase().includes(searchLower) ||
      preset.description?.toLowerCase().includes(searchLower)
    )
  }
  
  if (selectedModel.value) {
    result = result.filter(preset => 
      preset.ai_model === selectedModel.value
    )
  }
  
  return result
})

// Методы
async function fetchPresets() {
  try {
    appStore.startLoading()
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/presets`)
    presets.value = response.data
  } catch (error) {
    appStore.showError(error)
  } finally {
    appStore.stopLoading()
  }
}

function resetForm() {
  presetForm.value = {
    name: '',
    description: '',
    ai_model: 'gpt-3.5-turbo',
    temperature: 0.7,
    system_prompt: ''
  }
  editingPreset.value = null
  if (form.value) {
    form.value.resetValidation()
  }
}

async function savePreset() {
  if (!form.value?.validate()) return

  try {
    saving.value = true
    if (editingPreset.value) {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/v1/presets/${editingPreset.value.id}`,
        presetForm.value
      )
      appStore.showMessage({
        text: 'Пресет успешно обновлен',
        color: 'success'
      })
    } else {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/presets`,
        presetForm.value
      )
      appStore.showMessage({
        text: 'Пресет успешно создан',
        color: 'success'
      })
    }
    await fetchPresets()
    showCreateDialog.value = false
    resetForm()
  } catch (error) {
    appStore.showError(error)
  } finally {
    saving.value = false
  }
}

function editPreset(preset) {
  editingPreset.value = preset
  presetForm.value = { ...preset }
  showCreateDialog.value = true
}

async function clonePreset(preset) {
  try {
    appStore.startLoading()
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/presets/${preset.id}/clone`
    )
    appStore.showMessage({
      text: 'Пресет успешно клонирован',
      color: 'success'
    })
    await fetchPresets()
  } catch (error) {
    appStore.showError(error)
  } finally {
    appStore.stopLoading()
  }
}

function deletePreset(preset) {
  presetToDelete.value = preset
  showDeleteDialog.value = true
}

async function confirmDelete() {
  if (!presetToDelete.value) return
  
  try {
    deleting.value = true
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/v1/presets/${presetToDelete.value.id}`
    )
    appStore.showMessage({
      text: 'Пресет успешно удален',
      color: 'success'
    })
    await fetchPresets()
    showDeleteDialog.value = false
    presetToDelete.value = null
  } catch (error) {
    appStore.showError(error)
  } finally {
    deleting.value = false
  }
}

function createAgent(preset) {
  router.push({
    name: 'create-agent',
    params: { presetId: preset.id }
  })
}

// Загрузка данных при монтировании
onMounted(fetchPresets)
</script>

<style scoped>
.preset-list {
  padding: 16px;
}
</style>