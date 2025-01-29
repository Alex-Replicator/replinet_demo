<template>
  <div class="profile">
    <v-container>
      <v-row>
        <v-col cols="12" md="8">
          <v-card>
            <v-tabs v-model="activeTab">
              <v-tab value="profile">
                <v-icon start>mdi-account</v-icon>
                Профиль
              </v-tab>
              <v-tab value="security">
                <v-icon start>mdi-lock</v-icon>
                Безопасность
              </v-tab>
              <v-tab value="settings">
                <v-icon start>mdi-cog</v-icon>
                Настройки
              </v-tab>
            </v-tabs>

            <v-card-text>
              <v-window v-model="activeTab">
                <!-- Профиль -->
                <v-window-item value="profile">
                  <v-form ref="profileForm" @submit.prevent="saveProfile">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="profile.full_name"
                          label="Полное имя"
                          :rules="[v => !!v || 'Обязательное поле']"
                          required
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="profile.email"
                          label="Email"
                          type="email"
                          :rules="[
                            v => !!v || 'Обязательное поле',
                            v => /.+@.+\..+/.test(v) || 'Некорректный email'
                          ]"
                          required
                          disabled
                        />
                      </v-col>

                      <v-col cols="12">
                        <v-file-input
                          v-model="avatarFile"
                          label="Аватар"
                          accept="image/*"
                          prepend-icon="mdi-camera"
                          :show-size="true"
                        />
                      </v-col>
                    </v-row>

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

                <!-- Безопасность -->
                <v-window-item value="security">
                  <v-form ref="passwordForm" @submit.prevent="changePassword">
                    <v-text-field
                      v-model="passwordData.old_password"
                      label="Текущий пароль"
                      type="password"
                      :rules="[v => !!v || 'Обязательное поле']"
                      required
                    />

                    <v-text-field
                      v-model="passwordData.new_password"
                      label="Новый пароль"
                      type="password"
                      :rules="[
                        v => !!v || 'Обязательное поле',
                        v => v.length >= 8 || 'Минимум 8 символов'
                      ]"
                      required
                    />

                    <v-text-field
                      v-model="passwordData.confirm_password"
                      label="Подтвердите пароль"
                      type="password"
                      :rules="[
                        v => !!v || 'Обязательное поле',
                        v => v === passwordData.new_password || 'Пароли не совпадают'
                      ]"
                      required
                    />

                    <v-card-actions>
                      <v-spacer />
                      <v-btn
                        color="primary"
                        type="submit"
                        :loading="changingPassword"
                      >
                        Изменить пароль
                      </v-btn>
                    </v-card-actions>
                  </v-form>
                </v-window-item>

                <!-- Настройки -->
                <v-window-item value="settings">
                  <v-form ref="settingsForm" @submit.prevent="saveSettings">
                    <v-select
                      v-model="settings.language"
                      :items="languages"
                      label="Язык интерфейса"
                    />

                    <v-switch
                      v-model="settings.theme"
                      label="Тёмная тема"
                      true-value="dark"
                      false-value="light"
                    />

                    <v-switch
                      v-model="settings.email_notifications"
                      label="Email уведомления"
                    />

                    <v-card-actions>
                      <v-spacer />
                      <v-btn
                        color="primary"
                        type="submit"
                        :loading="savingSettings"
                      >
                        Сохранить настройки
                      </v-btn>
                    </v-card-actions>
                  </v-form>
                </v-window-item>
              </v-window>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <!-- Карточка с информацией -->
          <v-card class="mb-4">
            <v-card-text class="text-center">
              <v-avatar
                size="120"
                class="mb-4"
              >
                <v-img
                  :src="profile.avatar || '/default-avatar.png'"
                  alt="Avatar"
                />
              </v-avatar>

              <h3 class="text-h6 mb-2">
                {{ profile.full_name }}
              </h3>

              <v-chip
                :color="getRoleColor(profile.role)"
                class="mb-4"
              >
                {{ getRoleName(profile.role) }}
              </v-chip>
            </v-card-text>
          </v-card>

          <!-- Статистика -->
          <v-card>
            <v-card-title>Статистика</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-robot</v-icon>
                  </template>
                  <v-list-item-title>Агентов</v-list-item-title>
                  <template v-slot:append>
                    {{ stats.total_agents }}
                  </template>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-tune</v-icon>
                  </template>
                  <v-list-item-title>Пресетов</v-list-item-title>
                  <template v-slot:append>
                    {{ stats.total_presets }}
                  </template>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>Успешных запусков</v-list-item-title>
                  <template v-slot:append>
                    {{ stats.successful_runs }}
                  </template>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="error">mdi-alert-circle</v-icon>
                  </template>
                  <v-list-item-title>Ошибок</v-list-item-title>
                  <template v-slot:append>
                    {{ stats.error_runs }}
                  </template>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="info">mdi-clock</v-icon>
                  </template>
                  <v-list-item-title>Общее время работы</v-list-item-title>
                  <template v-slot:append>
                    {{ formatDuration(stats.total_runtime) }}
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
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const appStore = useAppStore()
const authStore = useAuthStore()

// Состояние
const activeTab = ref('profile')
const profileForm = ref(null)
const passwordForm = ref(null)
const settingsForm = ref(null)
const saving = ref(false)
const changingPassword = ref(false)
const savingSettings = ref(false)
const avatarFile = ref(null)

// Данные форм
const profile = ref({
  full_name: '',
  email: '',
  avatar: ''
})

const passwordData = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const settings = ref({
  language: 'ru',
  theme: 'light',
  email_notifications: true
})

const stats = ref({
  total_agents: 0,
  total_presets: 0,
  successful_runs: 0,
  error_runs: 0,
  total_runtime: 0
})

// Опции
const languages = [
  { title: 'Русский', value: 'ru' },
  { title: 'English', value: 'en' }
]

// Методы
async function fetchProfile() {
  try {
    appStore.startLoading()
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/v1/users/me`
    )
    profile.value = response.data
    settings.value = {
      language: response.data.language || 'ru',
      theme: response.data.theme || 'light',
      email_notifications: response.data.email_notifications || true
    }
  } catch (error) {
    appStore.showError(error)
  } finally {
    appStore.stopLoading()
  }
}

async function fetchStats() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/v1/users/me/stats`
    )
    stats.value = response.data
  } catch (error) {
    appStore.showError(error)
  }
}

async function saveProfile() {
  if (!profileForm.value?.validate()) return

  try {
    saving.value = true
    const formData = new FormData()
    formData.append('full_name', profile.value.full_name)
    if (avatarFile.value) {
      formData.append('avatar', avatarFile.value)
    }

    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/v1/users/me`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    appStore.showMessage({
      text: 'Профиль обновлен',
      color: 'success'
    })
    
    await fetchProfile()
  } catch (error) {
    appStore.showError(error)
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  if (!passwordForm.value?.validate()) return

  try {
    changingPassword.value = true
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/v1/auth/change-password`,
      {
        old_password: passwordData.value.old_password,
        new_password: passwordData.value.new_password
      }
    )

    appStore.showMessage({
      text: 'Пароль успешно изменен',
      color: 'success'
    })

    passwordData.value = {
      old_password: '',
      new_password: '',
      confirm_password: ''
    }
  } catch (error) {
    appStore.showError(error)
  } finally {
    changingPassword.value = false
  }
}

async function saveSettings() {
  if (!settingsForm.value?.validate()) return

  try {
    savingSettings.value = true
    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/v1/users/me/settings`,
      settings.value
    )

    appStore.showMessage({
      text: 'Настройки сохранены',
      color: 'success'
    })

    await fetchProfile()
  } catch (error) {
    appStore.showError(error)
  } finally {
    savingSettings.value = false
  }
}

function getRoleColor(role: string) {
  switch (role) {
    case 'super_admin': return 'red'
    case 'admin': return 'orange'
    case 'team_organizer': return 'blue'
    case 'team_member': return 'cyan'
    case 'pro_user': return 'purple'
    case 'free_user': return 'green'
    default: return 'grey'
  }
}

function getRoleName(role: string) {
  switch (role) {
    case 'super_admin': return 'Супер-админ'
    case 'admin': return 'Администратор'
    case 'team_organizer': return 'Организатор команды'
    case 'team_member': return 'Участник команды'
    case 'pro_user': return 'Pro пользователь'
    case 'free_user': return 'Базовый пользователь'
    default: return 'Гость'
  }
}

function formatDuration(seconds: number) {
  if (!seconds) return '0с'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}ч ${minutes}м`
}

// Загрузка данных при монтировании
onMounted(() => {
  fetchProfile()
  fetchStats()
})
</script>

<style scoped>
.profile {
  padding: 16px;
}
</style>