<template>
  <div class="agent-list">
    <v-container>
      <!-- Заголовок -->
      <v-row>
        <v-col>
          <div class="d-flex justify-space-between align-center mb-4">
            <h2>ИИ-агенты</h2>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              :to="{ name: 'create-agent' }"
            >
              Создать агента
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Фильтры -->
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="search"
            label="Поиск"
            prepend-inner-icon="mdi-magnify"
            clearable
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            label="Статус"
            clearable
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="presetFilter"
            :items="presets"
            item-title="name"
            item-value="id"
            label="Пресет"
            clearable
            density="comfortable"
          />
        </v-col>
      </v-row>

      <!-- Список агентов -->
      <v-row>
        <v-col 
          v-for="agent in filteredAgents"
          :key="agent.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card :class="{ 'inactive': !agent.is_active }">
            <v-card-title class="d-flex justify-space-between align-center">
              <span>{{ agent.name }}</span>
              <v-chip
                :color="getStatusColor(agent.status)"
                size="small"
              >
                {{ agent.status }}
              </v-chip>
            </v-card-title>

            <v-card-text>
              <p class="text-body-2 mb-2">{{ agent.description || 'Нет описания' }}</p>
              
              <v-row class="mt-2">
                <v-col cols="6">
                  <div class="text-caption">Успешных запусков</div>
                  <div class="text-success">{{ agent.successful_runs }}</div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption">Ошибок</div>
                  <div class="text-error">{{ agent.error_runs }}</div>
                </v-col>
              </v-row>

              <v-divider class="my-2" />

              <div class="d-flex align-center">
                <v-icon
                  color="primary"
                  size="small"
                  class="mr-1"
                >
                  mdi-tune
                </v-icon>
                <span class="text-caption">
                  {{ agent.preset?.name || 'Нет пресета' }}
                </span>
              </div>
            </v-card-text>

            <v-divider />

            <v-card-actions>
              <v-btn
                variant="text"
                :to="{ name: 'agent-detail', params: { id: agent.id }}"
              >
                Подробнее
              </v-btn>
              <v-spacer />
              <v-btn
                icon
                :color="agent.is_active ? 'error' : 'success'"
                variant="text"
                @click="toggleAgent(agent)"
                :loading="toggling === agent.id"
              >
                <v-icon>
                  {{ agent.is_active ? 'mdi-pause' : 'mdi-play' }}
                </v-icon>
              </v-btn>
              <v-btn
                icon
                color="error"
                variant="text"
                @click="deleteAgent(agent)"
                :loading="deleting === agent.id"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Диалог подтверждения удаления -->
    <v-dialog
      v-model="showDeleteDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title>Удаление агента</v-card-title>
        <v-card-text>
          Вы действительно хотите удалить агента "{{ agentToDelete?.name }}"?
          Это действие необратимо.
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
            :loading="deleting === agentToDelete?.id"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

// Состояние
const agents = ref([])
const presets = ref([])
const search = ref('')
const statusFilter = ref(null)
const presetFilter = ref(null)
const showDeleteDialog = ref(false)
const agentToDelete = ref(null)
const deleting = ref(null)
const toggling = ref(null)

// Опции статусов
const statusOptions = [
  { title: 'Активные', value: 'running' },
  { title: 'В ожидании', value: 'idle' },
  { title: 'С ошибкой', value: 'error' }
]

// Фильтрация агентов
const filteredAgents = computed(() => {
  let result = [...agents.value]
  
  if (search.value) {
    const searchLower = search.value.toLowerCase()
    result = result.filter(agent =>
      agent.name.toLowerCase().includes(searchLower) ||
      agent.description?.toLowerCase().includes(searchLower)
    )
  }
  
  if (statusFilter.value) {
    result = result.filter(agent => agent.status === statusFilter.value)
  }
  
  if (presetFilter.value) {
    result = result.filter(agent => agent.preset_id === presetFilter.value)
  }
  
  return result
})

// Методы
async function fetchAgents() {
  try {
    appStore.startLoading()
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/v1/agents`
    )
    agents.value = response.data
  } catch (error) {
    appStore.showError(error)
  } finally {
    appStore.stopLoading()
  }
}

async function fetchPresets() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/v1/presets`
    )
    presets.value = response.data
  } catch (error) {
    appStore.showError(error)
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'running': return 'success'
    case 'error': return 'error'
    case 'idle': return 'info'
    default: return 'grey'
  }
}

async function toggleAgent(agent) {
  try {
    toggling.value = agent.id
    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/v1/agents/${agent.id}`,
      { is_active: !agent.is_active }
    )
    await fetchAgents()
    appStore.showMessage({
      text: `Агент ${agent.is_active ? 'остановлен' : 'активирован'}`,
      color: 'success'
    })
  } catch (error) {
    appStore.showError(error)
  } finally {
    toggling.value = null
  }
}

function deleteAgent(agent) {
  agentToDelete.value = agent
  showDeleteDialog.value = true
}

async function confirmDelete() {
  if (!agentToDelete.value) return

  try {
    deleting.value = agentToDelete.value.id
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/v1/agents/${agentToDelete.value.id}`
    )
    await fetchAgents()
    showDeleteDialog.value = false
    agentToDelete.value = null
    appStore.showMessage({
      text: 'Агент успешно удален',
      color: 'success'
    })
  } catch (error) {
    appStore.showError(error)
  } finally {
    deleting.value = null
  }
}

// Загрузка данных при монтировании
onMounted(() => {
  fetchAgents()
  fetchPresets()
})
</script>

<style scoped>
.agent-list {
  padding: 16px;
}

.inactive {
  opacity: 0.7;
}

.v-card {
  transition: opacity 0.3s ease;
}
</style>