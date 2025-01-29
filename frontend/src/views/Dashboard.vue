<template>
  <div class="dashboard">
    <v-row>
      <!-- Статистика -->
      <v-col cols="12" md="3">
        <v-card>
          <v-card-title class="text-h6">
            Всего агентов
          </v-card-title>
          <v-card-text class="text-h4">
            {{ stats.totalAgents }}
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-title class="text-h6">
            Активные потоки
          </v-card-title>
          <v-card-text class="text-h4">
            {{ stats.activeThreads }}
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-title class="text-h6">
            Пресеты
          </v-card-title>
          <v-card-text class="text-h4">
            {{ stats.totalPresets }}
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-title class="text-h6">
            Успешные запуски
          </v-card-title>
          <v-card-text class="text-h4">
            {{ stats.successfulRuns }}
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Последние агенты -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Последние агенты</span>
            <v-btn
              variant="text"
              color="primary"
              to="/agents"
            >
              Все агенты
            </v-btn>
          </v-card-title>
          
          <v-card-text>
            <v-list v-if="recentAgents.length">
              <v-list-item
                v-for="agent in recentAgents"
                :key="agent.id"
                :to="{ name: 'agent-detail', params: { id: agent.id }}"
              >
                <v-list-item-title>{{ agent.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  Статус: {{ agent.status }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <v-alert
              v-else
              type="info"
              text="Нет активных агентов"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Последние потоки -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Последние потоки</v-card-title>
          <v-card-text>
            <v-list v-if="recentThreads.length">
              <v-list-item
                v-for="thread in recentThreads"
                :key="thread.id"
              >
                <v-list-item-title>
                  {{ thread.agent.name }} - {{ thread.status }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(thread.created_at) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <v-alert
              v-else
              type="info"
              text="Нет активных потоков"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

interface Stats {
  totalAgents: number
  activeThreads: number
  totalPresets: number
  successfulRuns: number
}

interface Agent {
  id: number
  name: string
  status: string
}

interface Thread {
  id: number
  status: string
  created_at: string
  agent: Agent
}

const stats = ref<Stats>({
  totalAgents: 0,
  activeThreads: 0,
  totalPresets: 0,
  successfulRuns: 0
})

const recentAgents = ref<Agent[]>([])
const recentThreads = ref<Thread[]>([])

async function fetchDashboardData() {
  try {
    appStore.startLoading()
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/dashboard`)
    stats.value = response.data.stats
    recentAgents.value = response.data.recentAgents
    recentThreads.value = response.data.recentThreads
  } catch (error) {
    appStore.showError(error)
  } finally {
    appStore.stopLoading()
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.dashboard {
  padding: 16px;
}
</style>