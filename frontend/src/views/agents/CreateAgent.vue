<template>
  <div class="create-agent">
    <v-container>
      <v-row>
        <v-col>
          <div class="d-flex align-center mb-4">
            <v-btn
              icon
              variant="text"
              :to="fromPreset ? `/presets/${presetId}` : '/agents'"
              class="mr-4"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <h2>Создание нового агента</h2>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" lg="8">
          <v-card>
            <v-form ref="form" @submit.prevent="createAgent">
              <v-card-text>
                <!-- Основные настройки -->
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="agentForm.name"
                      label="Название агента"
                      :rules="[v => !!v || 'Обязательное поле']"
                      required
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      v-if="!fromPreset"
                      v-model="agentForm.preset_id"
                      :items="presets"
                      item-title="name"
                      item-value="id"
                      label="Выберите пресет"
                      :rules="[v => !!v || 'Обязательное поле']"
                      required
                    />
                    <v-text-field
                      v-else
                      :model-value="selectedPreset?.name"
                      label="Пресет"
                      readonly
                      disabled
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="agentForm.description"
                      label="Описание"
                      rows="3"
                    />
                  </v-col>
                </v-row>

                <v-divider class="my-4" />

                <!-- Персональные инструкции -->
                <h3 class="text-h6 mb-4">Персональные инструкции</h3>
                <v-textarea
                  v-model="agentForm.personal_instructions"
                  label="Дополнительные инструкции для агента"
                  hint="Эти инструкции будут добавлены к системному промпту пресета"
                  persistent-hint
                  rows="5"
                />

                <v-divider class="my-4" />

                <!-- Учетные данные -->
                <h3 class="text-h6 mb-4">Учетные данные</h3>
                <v-alert
                  type="info"
                  text="Учетные данные будут зашифрованы и использованы агентом для доступа к необходимым сервисам"
                  class="mb-4"
                />

                <div
                  v-for="(value, key) in agentForm.credentials"
                  :key="key"
                  class="mb-4"
                >
                  <div class="d-flex align-center">
                    <v-text-field
                      v-model="credentialKeys[key]"
                      label="Название"
                      class="mr-2"
                      @update:model-value="updateCredentialKey(key, $event)"
                    />
                    <v-text-field
                      v-model="agentForm.credentials[key]"
                      label="Значение"
                      :type="showCredential[key] ? 'text' : 'password'"
                      class="mr-2"
                    />
                    <v-btn
                      icon
                      variant="text"
                      @click="showCredential[key] = !showCredential[key]"
                    >
                      <v-icon>
                        {{ showCredential[key] ? 'mdi-eye-off' : 'mdi-eye' }}
                      </v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      color="error"
                      variant="text"
                      @click="removeCredential(key)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </div>

                <v-btn
                  prepend-icon="mdi-plus"
                  variant="text"
                  @click="addCredential"
                >
                  Добавить учетные данные
                </v-btn>

                <v-divider class="my-4" />

                <!-- Настройки браузера -->
                <h3 class="text-h6 mb-4">Настройки браузера</h3>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-switch
                      v-model="agentForm.browser_config.headless"
                      label="Headless режим"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="agentForm.browser_config.proxy_location"
                      :items="proxyLocations"
                      label="Локация прокси"
                    />
                  </v-col>
                </v-row>
              </v-card-text>

              <v-divider />

              <v-card-actions>
                <v-spacer />
                <v-btn
                  variant="text"
                  :to="fromPreset ? `/presets/${presetId}` : '/agents'"
                >
                  Отмена
                </v-btn>
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="creating"
                >
                  Создать агента
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card>
        </v-col>

        <!-- Предпросмотр пресета -->
        <v-col cols="12" lg="4">
          <v-card>
            <v-card-title>Информация о пресете</v-card-title>
            <v-card-text v-if="selectedPreset">
              <v-list density="compact">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-brain</v-icon>
                  </template>
                  <v-list-item-title>Модель ИИ</v-list-item-title>
                  <template v-slot:append>
                    {{ selectedPreset.ai_model }}
                  </template>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-thermometer</v-icon>
                  </template>
                  <v-list-item-title>Температура</v-list-item-title>
                  <template v-slot:append>
                    {{ selectedPreset.temperature }}
                  </template>
                </v-list-item>
              </v-list>

              <v-divider class="my-4" />

              <h4 class="text-subtitle-1 mb-2">Системный промпт:</h4>
              <v-card
                color="surface-variant"
                class="pa-4"
              >
                <pre>{{ selectedPreset.system_prompt }}</pre>
              </v-card>
            </v-card-text>
            <v-card-text v-else>
              <v-alert
                type="info"
                text="Выберите пресет для просмотра информации"
              />
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
const form = ref()
const creating = ref(false)
const presets = ref([])
const credentialKeys = ref({})
const showCredential = ref({})

// Получаем ID пресета из роута, если он есть
const presetId = computed(() => route.params.presetId)
const fromPreset = computed(() => !!presetId.value)

// Форма агента
const agentForm = ref({
  name: '',
  description: '',
  preset_id: null,
  personal_instructions: '',
  credentials: {},
  browser_config: {
    headless: true,
    proxy_location: 'auto'
  }
})

// Локации прокси
const proxyLocations = [
  { title: 'Автоматически', value: 'auto' },
  { title: 'Европа', value: 'europe' },
  { title: 'США', value: 'usa' },
  { title: 'Азия', value: 'asia' }
]

// Выбранный пресет
const selectedPreset = computed(() => {
  const id = fromPreset.value ? presetId.value : agentForm.value.preset_id
  return presets.value.find(p => p.id === Number(id))
})

// Методы
async function fetchPresets() {
  try {
    appStore.startLoading()
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/presets`)
    presets.value = response.data
    
    if (fromPreset.value) {
      agentForm.value.preset_id = Number(presetId.value)
    }
  } catch (error) {
    appStore.showError(error)
  } finally {
    appStore.stopLoading()
  }
}

function addCredential() {
  const newKey = `credential_${Object.keys(agentForm.value.credentials).length + 1}`
  agentForm.value.credentials[newKey] = ''
  credentialKeys.value[newKey] = ''
  showCredential.value[newKey] = false
}

function removeCredential(key: string) {
  delete agentForm.value.credentials[key]
  delete credentialKeys.value[key]
  delete showCredential.value[key]
}

function updateCredentialKey(oldKey: string, newKey: string) {
  if (newKey && newKey !== oldKey) {
    const value = agentForm.value.credentials[oldKey]
    delete agentForm.value.credentials[oldKey]
    agentForm.value.credentials[newKey] = value
  }
}

async function createAgent() {
  if (!form.value?.validate()) return

  try {
    creating.value = true
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/agents`,
      agentForm.value
    )
    
    appStore.showMessage({
      text: 'Агент успешно создан',
      color: 'success'
    })
    
    router.push(`/agents/${response.data.id}`)
  } catch (error) {
    appStore.showError(error)
  } finally {
    creating.value = false
  }
}

// Загрузка данных при монтировании
onMounted(fetchPresets)
</script>

<style scoped>
.create-agent {
  padding: 16px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>