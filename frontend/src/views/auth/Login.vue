<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Вход в систему</v-toolbar-title>
          </v-toolbar>
          
          <v-card-text>
            <v-form @submit.prevent="handleSubmit" ref="form">
              <v-text-field
                v-model="email"
                :rules="[rules.required, rules.email]"
                label="Email"
                name="email"
                prepend-inner-icon="mdi-email"
                type="email"
                required
              />

              <v-text-field
                v-model="password"
                :rules="[rules.required]"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                label="Пароль"
                name="password"
                prepend-inner-icon="mdi-lock"
                @click:append-inner="showPassword = !showPassword"
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
              Войти
            </v-btn>
          </v-card-actions>

          <v-divider />

          <v-card-text class="text-center">
            <v-btn
              color="primary"
              variant="text"
              @click="handleGoogleLogin"
              :loading="googleLoading"
            >
              <v-icon left>mdi-google</v-icon>
              Войти через Google
            </v-btn>
          </v-card-text>

          <v-card-text class="text-center">
            <router-link 
              class="text-decoration-none"
              to="/register"
            >
              Нет аккаунта? Зарегистрироваться
            </router-link>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()

const form = ref<any>(null)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const googleLoading = ref(false)

const rules = {
  required: (v: any) => !!v || 'Обязательное поле',
  email: (v: any) => /.+@.+\..+/.test(v) || 'Некорректный email'
}

async function handleSubmit() {
  if (!form.value?.validate()) return

  try {
    loading.value = true
    await authStore.login({
      email: email.value,
      password: password.value
    })
    
    const redirectPath = route.query.redirect as string || '/'
    router.push(redirectPath)
    
    appStore.showMessage({
      text: 'Успешная авторизация',
      color: 'success'
    })
  } catch (error) {
    appStore.showError(error)
  } finally {
    loading.value = false
  }
}

async function handleGoogleLogin() {
  try {
    googleLoading.value = true
    // TODO: Реализовать Google OAuth
    console.log('Google login not implemented yet')
  } catch (error) {
    appStore.showError(error)
  } finally {
    googleLoading.value = false
  }
}
</script>