import { defineStore } from 'pinia'
import { ref } from 'vue'

interface SnackbarOptions {
  text: string
  color?: string
  timeout?: number
}

export const useAppStore = defineStore('app', () => {
  const snackbar = ref({
    show: false,
    text: '',
    color: 'success',
    timeout: 3000
  })

  const loading = ref(false)

  function showMessage({ text, color = 'success', timeout = 3000 }: SnackbarOptions) {
    snackbar.value = {
      show: true,
      text,
      color,
      timeout
    }
  }

  function showError(error: any) {
    const message = error.response?.data?.message || error.message || 'An error occurred'
    showMessage({
      text: message,
      color: 'error'
    })
  }

  function startLoading() {
    loading.value = true
  }

  function stopLoading() {
    loading.value = false
  }

  return {
    snackbar,
    loading,
    showMessage,
    showError,
    startLoading,
    stopLoading
  }
})