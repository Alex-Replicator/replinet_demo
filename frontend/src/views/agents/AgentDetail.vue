<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAppStore } from '@/stores/app'
<template>
  <div class="agent-detail">
    <v-container>
      <!-- Заголовок -->
      <v-row>
        <v-col>
          <div class="d-flex align-center mb-4">
            <v-btn
              icon
              variant="text"
              to="/agents"
              class="mr-4"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <h2>{{ agent?.name || 'Загрузка...' }}</h2>
            <v-chip
              :color="statusColor"
              class="ml-4"
            >
              {{ agent?.status || 'unknown' }}
            </v-chip>
            <v-spacer />
            <v-btn
              color="primary"
              prepend-icon="mdi-play"
              @click="createThread"
              :disabled="!canCreateThread"
              :loading="creating"
            >
              Запустить поток
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-row v-if="agent">
        <!-- Основная информация и управление -->
        <v-col cols="12" md="8">
          <v-card>
            <v-tabs v-model="activeTab">
              <v-tab value="threads">
                <v-icon start>mdi-source-branch</v-icon>
                Потоки ({{ agent.threads?.length || 0 }})
              </v-tab>
              <v-tab value="logs">
                <v-icon start>mdi-text-box-multiple</v-icon>
                Логи
              </v-tab>
              <v-tab value="settings">
                <v-icon start>mdi-cog</v-icon>
                Настройки
              </v-tab>
            </v-tabs>

            <v-card-text>
              <v-window v-model="activeTab">
                <!-- Потоки -->
                <v-window-item value="threads">
                  <v-list>
                    <v-list-item
                      v-for="thread in sortedThreads"
                      :key="thread.id"
                      :subtitle="formatDate(thread.created_at)"
                    >
                      <template v-slot:prepend>
                        <v-icon :color="getThreadStatusColor(thread.status)">
                          {{ getThreadStatusIcon(thread.status) }}
                        </v-icon>
                      </template>

                      <v-list-item-title>
                        Поток #{{ thread.id }}
                      </v-list-item-title>

                      <template v-slot:append>
                        <v-btn
                          v-if="thread.status === 'running'"
                          color="error"
                          variant="text"
                          @click="stopThread(thread.id)"
                          :loading="stoppingThread === thread.id"
                        >
                          Остановить
                        </v-btn>
                        <v-btn
                          icon
                          variant="text"
                          @click="showThreadDetails(thread)"
                        >
                          <v-icon>mdi-information</v-icon>
                        </v-btn>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-window-item>

                <!-- Логи -->
                <v-window-item value="logs">
                  <v-card
                    variant="outlined"
                    class="logs-container"
                  >
                    <pre v-if="combinedLogs.length">{{ combinedLogs.join('\n') }}</pre>
                    <v-alert
                      v-else
                      type="info"
                      text="Нет доступных логов"
                    />
                  </v-card>
                </v-window-item>

                <!-- Настройки -->
                <v-window-item value="settings">
                  <v-form ref="form" @submit.prevent="saveSettings">
                    <v-text-field
                      v-model="editedAgent.name"
                      label="Название"
                      :rules="[v => !!v || 'Обязательное поле']"
                      required
                    />

                    <v-textarea
                      v-model="editedAgent.description"
                      label="Описание"
                      rows="3"
                    />

                    <v-textarea
                      v-model="editedAgent.personal_instructions"
                      label="Персональные инструкции"
                      rows="5"
                    />

                    <v-switch
                      v-model="editedAgent.is_active"
                      label="Активен"
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
              </v-window>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Статистика и информация -->
        <v-col cols="12" md="4">
          <v-card class="mb-4">
            <v-card-title>Статистика</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-play-circle</v-icon>
                  </template>
                  <v-list-item-title>Всего запусков</v-list-item-title>
                  <template v-slot:append>
                    {{ agent.total_runs }}
                  </template>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>Успешных</v-list-item-title>
                  <template v-slot:append>
                    {{ agent.successful_runs }}
                  </template>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="error">mdi-alert-circle</v-icon>
                  </template>
                  <v-list-item-title>Ошибок</v-list-item-title>
                  <template v-slot:append>
                    {{ agent.error_runs }}
                  </template>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="info">mdi-clock</v-icon>
                  </template>
                  <v-list-item-title>Общее время</v-list-item-title>
                  <template v-slot:append>
                    {{ formatDuration(agent.total_runtime) }}
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Диалог с деталями потока -->
      <v-dialog
        v-model="showThreadDialog"
        max-width="800"
      >
        <v-card v-if="selectedThread">
          <v-card-title>
            Детали потока #{{ selectedThread.id }}
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <strong>Статус:</strong>
                <v-chip
                  :color="getThreadStatusColor(selectedThread.status)"
                  class="ml-2"
                >
                  {{ selectedThread.status }}
                </v-chip>
              </v-col>
              <v-col cols="12" md="6">
                <strong>Время создания:</strong>
                {{ formatDate(selectedThread.created_at) }}
              </v-col>
              <v-col cols="12" md="6">
                <strong>Время запуска:</strong>
                {{ formatDate(selectedThread.start_time) }}
              </v-col>
              <v-col cols="12" md="6">
                <strong>Время завершения:</strong>
                {{ formatDate(selectedThread.end_time) }}
              </v-col>
              <v-col cols="12" v-if="selectedThread.error_message">
                <v-alert
                  type="error"
                  :text="selectedThread.error_message"
                />
              </v-col>
              <v-col cols="12">
                <v-expansion-panels>
                  <v-expansion-panel>
                    <v-expansion-panel-title>
                      Логи
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <pre>{{ selectedThread.logs.join('\n') }}</pre>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-title>
                      Результаты
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <pre>{{ JSON.stringify(selectedThread.results, null, 2) }}</pre>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              variant="text"
              @click="showThreadDialog = false"
            >
              Закрыть
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// Состояние
const agent = ref(null)
const editedAgent = ref({})
const activeTab = ref('threads')
const selectedThread = ref(null)
const showThreadDialog = ref(false)
const form = ref(null)
const creating = ref(false)
const saving = ref(false)
const stoppingThread = ref(null)
const pollingInterval = ref(null)

// Вычисляемые свойства
const statusColor = computed(() => {
  switch (agent.value?.status) {
    case 'running': return 'success'
    case 'error': return 'error'
    case 'idle': return 'info'
    default: return 'grey'
  }
})

const sortedThreads = computed(() => {
  if (!agent.value?.threads) return []
  return [...agent.value.threads].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
})

const combinedLogs = computed(() => {
  if (!agent.value?.threads) return []
  return agent.value.threads
    .flatMap(thread => thread.logs)
    .filter(log => log)
})

const canCreateThread = computed(() => {
  if (!agent.value) return false
  const runningThreads = agent.value.threads?.filter(t => t.status === 'running') || []
  return agent.value.is_active && runningThreads.length < 5
})

// Методы
async function fetchAgent() {
  try {
    appStore.startLoading()
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/v1/agents/${route.params.id}`
    )
    agent.value = response.data
    editedAgent.value = { ...response.data }
  } catch (error) {
    appStore.showError(error)
  } finally {
    appStore.stopLoading()
  }
}

async function createThread() {
  if (!canCreateThread.value) return

  try {
    creating.value = true
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/agents/${agent.value.id}/threads`
    )
    await fetchAgent()
    appStore.showMessage({
      text: 'Поток успешно запущен',
      color: 'success'
    })
  } catch (error) {
    appStore.showError(error)
  } finally {
    creating.value = false
  }
}

async function stopThread(threadId: number) {
  try {
    stoppingThread.value = threadId
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/agents/${agent.value.id}/threads/${threadId}/stop`
    )
    await fetchAgent()
    appStore.showMessage({
      text: 'Поток остановлен',
      color: 'success'
    })
  } catch (error) {
    appStore.showError(error)
  } finally {
    stoppingThread.value = null
  }
}

async function saveSettings() {
  if (!form.value?.validate()) return

  try {
    saving.value = true
    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/v1/agents/${agent.value.id}`,
      editedAgent.value
    )
    await fetchAgent()
    appStore.showMessage({
      text: 'Настройки сохранены',
      color: 'success'
    })
  } catch (error) {
    appStore.showError(error)
  } finally {
    saving.value = false
  }
}

function showThreadDetails(thread) {
  selectedThread.value = thread
  showThreadDialog.value = true
}

function getThreadStatusColor(status: string) {
  switch (status) {
    case 'running': return 'success'
    case 'completed': return 'primary'
    case 'error': return 'error'
    default: return 'grey'
  }
}

function getThreadStatusIcon(status: string) {
  switch (status) {
    case 'running': return 'mdi-play-circle'
    case 'completed': return 'mdi-check-circle'
    case 'error': return 'mdi-alert-circle'
    default: return 'mdi-help-circle'
  }
}

function formatDate(dateString: string) {
  if (!dateString) return 'Н/Д'
  return new Date(dateString).toLocaleString()
}

function formatDuration(seconds: number) {
  if (!seconds) return '0с'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}ч ${minutes}м`
}

// Автообновление данных
function startPolling() {
  pollingInterval.value = setInterval(fetchAgent, 5000)
}

function stopPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

// Жизненный цикл
onMounted(() => {
  fetchAgent()
  startPolling()
})

onBeforeUnmount(() => {
  stopPolling()
})
</script>

<style scoped>
.agent-detail {
  padding: 16px;
}

.logs-container {
  max-height: 400px;
  overflow-y: auto;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
}
</style>
