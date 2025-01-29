<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Регистрация</v-toolbar-title>
          </v-toolbar>
          
          <v-card-text>
            <v-form @submit.prevent="handleSubmit" ref="form">
              <v-text-field
                v-model="fullName"
                :rules="[rules.required]"
                label="Полное имя"
                prepend-inner-icon="mdi-account"
                required
              />

              <v-text-field
                v-model="email"
                :rules="[rules.required, rules.email]"
                label="Email"
                prepend-inner-icon="mdi-email"
                type="email"
                required
              />

              <v-text-field
                v-model="password"
                :rules="[rules.required, rules.password]"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                label="Пароль"
                prepend-inner-icon="mdi-lock"
                @click:append-inner="showPassword = !showPassword"
                required
              />

              <v-text-field
                v-model="confirmPassword"
                :rules="[rules.required, rules.passwordMatch]"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showConfirmPassword ? 'text' : 'password'"
                label="Подтверждение пароля"
                prepend-inner-icon="mdi-lock-check"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
                required
              />
            </v-form>
          </v-card-text>

          <v-card-actions class="px-4 pb-4">
            <v-btn
              type="submit"
              color="primary"
              block
              :loading="loading"
              @click="handleSubmit"
            >
              Зарегистрироваться
            </v-btn>
          </v-card-actions>

          <v-divider />

          <v-card-text class="text-center">
            <v-btn
              color="primary"
              variant="text"
              @click="handleGoogleRegister"
              :loading="googleLoading"
            >
              <v-icon left>mdi-google</v-icon>
              Регистрация через Google
            </v-btn>
          </v-card-text>

          <v-card-text class="text-center">
            <router-link 
              class="text-decoration-none"
              to="/login"
            >
              Уже есть аккаунт? Войти
            </router-link>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const form = ref<any>(null)
const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const googleLoading = ref(false)

const rules = {
  required: (v: any) => !!v || 'Обязательное поле',
  email: (v: any) => /.+@.+\..+/.test(v) || 'Некорректный email',
  password: (v: any) => v.length >= 8 || 'Пароль должен содержать минимум 8 символов',
  passwordMatch: (v: any) => v === password.value || 'Пароли не совпадают'
}

async function handleSubmit() {
  if (!form.value?.validate()) return

  try {
    loading.value = true
    await authStore.register({
      full_name: fullName.value,
      email: email.value,
      password: password.value
    })
    
    appStore.showMessage({
      text: 'Регистрация успешна',
      color: 'success'
    })
    
    router.push('/')
  } catch (error) {
    appStore.showError(error)
  } finally {
    loading.value = false
  }
}

async function handleGoogleRegister() {
  try {
    googleLoading.value = true
    // TODO: Реализовать Google OAuth
    console.log('Google registration not implemented yet')
  } catch (error) {
    appStore.showError(error)
  } finally {
    googleLoading.value = false
  }
}
</script>