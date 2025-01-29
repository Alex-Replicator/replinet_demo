<template>
  <div class="preset-detail">
    <v-container>
      <!-- Заголовок -->
      <v-row>
        <v-col>
          <div class="d-flex align-center mb-4">
            <v-btn
              icon
              variant="text"
              to="/presets"
              class="mr-4"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <h2>{{ preset?.name || 'Загрузка...' }}</h2>
            <v-spacer />
            <v-btn
              color="primary"
              prepend-icon="mdi-robot"
              @click="createAgent"
              :disabled="!preset"
            >
              Создать агента
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-row v-if="preset">
        <!-- Основная информация и настройки -->
        <v-col cols="12" md="8">
          <v-card>
            <v-tabs v-model="activeTab">
              <v-tab value="settings">
                <v-icon start>mdi-cog</v-icon>
                Настройки
              </v-tab>
              <v-tab value="test">
                <v-icon start>mdi-test-tube</v-icon>
                Тестирование
              </v-tab>
              <v-tab value="agents">
                <v-icon start>mdi-robot</v-icon>
                Агенты ({{ preset.agents?.length || 0 }})
              </v-tab>
            </v-tabs>

            <v-card-text>
              <!-- Настройки -->
              <v-window v-model="activeTab">
                <v-window-item value="settings">
                  <v-form ref="form" @submit.prevent="savePreset">
                    <v-text-field
                      v-model="editedPreset.name"
                      label="Название"
                      :rules="[v => !!v || 'Обязательное поле']"
                      required
                    />

                    <v-textarea
                      v-model="editedPreset.description"
                      label="Описание"
                      rows="3"
                    />

                    <v-select
                      v-model="editedPreset.ai_model"
                      :items="aiModels"
                      label="Модель ИИ"
                      :rules="[v => !!v || 'Обязательное поле']"
                      required
                    />

                    <v-slider
                      v-model="editedPreset.temperature"
                      label="Температура"
                      min="0"
                      max="1"
                      step="0.1"
                      thumb-label
                    />

                    <v-slider
                      v-model="editedPreset.max_tokens"
                      label="Максимум токенов"
                      min="100"
                      max="4000"
                      step="100"
                      thumb-label
                    />

                    <v-textarea
                      v-model="editedPreset.system_prompt"
                      label="Системный промпт"
                      :rules="[v => !!v || 'Обязательное поле']"
                      rows="10"
                      required
                    />

                    <v-card-actions>
                      <v-spacer />
                      <v-btn
                        color="primary"
                        type="submit"
                        :loading="saving"
                      >
                        Сохранить изменения
                      </v-btn>
                    </v-card-actions>
                  </v-form>
                </v-window-item>

                <!-- Тестирование -->
                <v-window-item value="test">
                  <v-textarea
                    v-model="testInput"
                    label="Тестовое сообщение"
                    rows="5"
                    :disabled="testing"
                  />

                  <v-card-actions>
                    <v-spacer />
                    <v-btn
                      color="primary"
                      @click="testPreset"
                      :loading="testing"
                    >
                      Протестировать
                    </v-btn>
                  </v-card-actions>

                  <v-expand-transition>
                    <div v-if="testResult">
                      <v-divider class="my-4" />
                      <h3 class="text-h6 mb-2">Результат:</h3>
                      <v-card
                        color="surface-variant"
                        class="pa-4"
                      >
                        <pre>{{ testResult }}</pre>
                      </v-card>
                    </div>
                  </v-expand-transition>
                </v-window-item>

                <!-- Связанные агенты -->
                <v-window-item value="agents">
                  <v-list v-if="preset.agents?.length">
                    <v-list-item
                      v-for="agent in preset.agents"
                      :key="agent.id"
                      :to="`/agents/${agent.id}`"
                    >
                      <template v-slot:prepend>
                        <v-icon
                          :color="agent.is_active ? 'success' : 'error'"
                        >
                          {{ agent.is_active ? 'mdi-robot' : 'mdi-robot-off' }}
                        </v-icon>
                      </template>

                      <v-list-item-title>{{ agent.name }}</v-list-item-title>
                      <v-list-item-subtitle>
                        Статус: {{ agent.status }}
                      </v-list-item-subtitle>

                      <template v-slot:append>
                        <v-chip
                          size="small"
                          :color="agent.status === 'running' ? 'success' : 'default'"
                        >
                          {{ agent.total_runs }} запусков
                        </v-chip>
                      </template>
                    </v-list-item>
                  </v-list>
                  <v-alert
                    v-else
                    type="info"
                    text="Нет связанных агентов"
                  />
                </v-window-item>
              </v-window>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Статистика и информация -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>Статистика</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-robot</v-icon>
                  </template>
                  <v-list-item-title>Агентов создано</v-list-item-title>
                  <template v-slot:append>
                    <span class="text-primary">
                      {{ preset.agents?.length || 0 }}
                    </span>
                  </template>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>Успешных запусков</v-list-item-title>
                  <template v-slot:append>
                    <span class="text-success">
                      {{ totalSuccessfulRuns }}
                    </span>
                  </template>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="error">mdi-alert-circle</v-icon>
                  </template>
                  <v-list-item-title>Ошибок</v-list-item-title>
                  <template v-slot:append>
                    <span class="text-error">
                      {{ totalErrorRuns }}
                    </span>
                  </template>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="info">mdi-clock</v-icon>
                  </template>
                  <v-list-item-title>Общее время работы</v-list-item-title>
                  <template v-slot:append>
                    {{ formatDuration(totalRuntime) }}
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// Состояние
const preset = ref(null)
const editedPreset = ref({})
const activeTab = ref('settings')
const testInput = ref('')
const testResult = ref('')
const saving = ref(false)
const testing = ref(false)
const form = ref()

// Доступные модели ИИ
const aiModels = [
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4-turbo'
]

// Вычисляемые свойства для статистики
const totalSuccessfulRuns = computed(() => {
  return preset.value?.agents?.reduce(
    (total, agent) => total + (agent.successful_runs || 0),
    0
  ) || 0
})

const totalErrorRuns = computed(() => {
  return preset.value?.agents?.reduce(
    (total, agent) => total + (agent.error_runs || 0),
    0
  ) || 0
})

const totalRuntime = computed(() => {
  return preset.value?.agents?.reduce(
    (total, agent) => total + (agent.total_runtime || 0),
    0
  ) || 0
})

// Методы
async function fetchPreset() {
  try {
    appStore.startLoading()
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/v1/presets/${route.params.id}`
    )
    preset.value = response.data
    editedPreset.value = { ...response.data }
  } catch (error) {
    appStore.showError(error)
  } finally {
    appStore.stopLoading()
  }
}

async function savePreset() {
  if (!form.value?.validate()) return

  try {
    saving.value = true
    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/v1/presets/${preset.value.id}`,
      editedPreset.value
    )
    preset.value = { ...editedPreset.value }
    appStore.showMessage({
      text: 'Пресет успешно обновлен',
      color: 'success'
    })
  } catch (error) {
    appStore.showError(error)
  } finally {
    saving.value = false
  }
}

async function testPreset() {
  if (!testInput.value) return

  try {
    testing.value = true
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/presets/${preset.value.id}/test`,
      { input: testInput.value }
    )
    testResult.value = response.data.result
  } catch (error) {
    appStore.showError(error)
  } finally {
    testing.value = false
  }
}

function createAgent() {
  router.push({
    name: 'create-agent',
    params: { presetId: preset.value.id }
  })
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}ч ${minutes}м`
}

// Загрузка данных при монтировании
onMounted(fetchPreset)
</script>

<style scoped>
.preset-detail {
  padding: 16px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>