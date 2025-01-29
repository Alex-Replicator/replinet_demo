<template>
  <div class="user-avatar">
    <!-- Аватар -->
    <v-avatar
      :size="size"
      :color="!imageUrl ? 'primary' : undefined"
      class="user-avatar__image"
      @click="editable ? openFileDialog() : null"
      :class="{ 'user-avatar__image--editable': editable }"
    >
      <template v-if="imageUrl">
        <v-img
          :src="imageUrl"
          :alt="alt"
          cover
        />
      </template>
      <template v-else>
        <span v-if="initials" class="text-h6">{{ initials }}</span>
        <v-icon v-else size="24">mdi-account</v-icon>
      </template>

      <!-- Оверлей для редактирования -->
      <div
        v-if="editable"
        class="user-avatar__overlay"
      >
        <v-icon size="20">mdi-camera</v-icon>
      </div>
    </v-avatar>

    <!-- Скрытый input для файла -->
    <input
      v-if="editable"
      ref="fileInput"
      type="file"
      accept="image/*"
      class="d-none"
      @change="handleFileChange"
    >

    <!-- Диалог обрезки изображения -->
    <v-dialog
      v-model="showCropDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title>
          Обрезка изображения
        </v-card-title>

        <v-card-text>
          <div class="crop-container">
            <vue-cropper
              v-if="cropImage"
              ref="cropper"
              :src="cropImage"
              :aspect-ratio="1"
              :view-mode="1"
              :background="false"
              :auto-crop-area="1"
              :movable="true"
              :rotatable="true"
              :scalable="true"
              :zoomable="true"
              :guides="true"
              :center="true"
              :highlight="true"
              :crop-box-movable="true"
              :crop-box-resizable="true"
              :minCropBoxWidth="100"
              :minCropBoxHeight="100"
            />
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showCropDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            :loading="uploading"
            @click="cropAndUpload"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import VueCropper from 'vue-cropperjs'
import 'cropperjs/dist/cropper.css'
import { useAppStore } from '@/stores/app'

interface Props {
  /**
   * URL изображения аватара
   */
  modelValue?: string

  /**
   * Размер аватара
   */
  size?: number

  /**
   * Альтернативный текст
   */
  alt?: string

  /**
   * Инициалы для отображения если нет изображения
   */
  initials?: string

  /**
   * Можно ли редактировать
   */
  editable?: boolean

  /**
   * Максимальный размер файла в байтах
   */
  maxSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  size: 40,
  alt: 'User avatar',
  initials: '',
  editable: false,
  maxSize: 5 * 1024 * 1024 // 5MB
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'error', error: Error): void
  (e: 'upload-start'): void
  (e: 'upload-end'): void
}>()

// Состояние
const fileInput = ref<HTMLInputElement>()
const cropper = ref()
const showCropDialog = ref(false)
const cropImage = ref('')
const uploading = ref(false)
const appStore = useAppStore()

// Вычисляемые свойства
const imageUrl = computed(() => props.modelValue)

// Методы
function openFileDialog() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  // Проверка размера файла
  if (file.size > props.maxSize) {
    appStore.showError(`Файл слишком большой. Максимальный размер: ${props.maxSize / 1024 / 1024}MB`)
    return
  }

  // Проверка типа файла
  if (!file.type.startsWith('image/')) {
    appStore.showError('Можно загружать только изображения')
    return
  }

  // Чтение файла
  const reader = new FileReader()
  reader.onload = (e) => {
    cropImage.value = e.target?.result as string
    showCropDialog.value = true
  }
  reader.readAsDataURL(file)

  // Очистка input для возможности повторной загрузки того же файла
  input.value = ''
}

async function cropAndUpload() {
  if (!cropper.value) return

  try {
    uploading.value = true
    emit('upload-start')

    // Получаем обрезанное изображение как Blob
    const canvas = cropper.value.getCroppedCanvas({
      width: 300,
      height: 300,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    })

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9)
    })

    // Создаем FormData
    const formData = new FormData()
    formData.append('avatar', blob, 'avatar.jpg')

    // Отправляем на сервер
    const response = await fetch('/api/v1/users/me/avatar', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Ошибка загрузки')
    }

    const data = await response.json()
    emit('update:modelValue', data.url)
    showCropDialog.value = false
    appStore.showMessage({
      text: 'Аватар успешно обновлен',
      color: 'success'
    })
  } catch (error) {
    appStore.showError(error)
    emit('error', error)
  } finally {
    uploading.value = false
    emit('upload-end')
  }
}
</script>

<style lang="scss" scoped>
.user-avatar {
  display: inline-block;
  position: relative;

  &__image {
    transition: transform var(--transition-duration) var(--transition-timing);

    &--editable {
      cursor: pointer;

      &:hover {
        transform: scale(1.05);

        .user-avatar__overlay {
          opacity: 1;
        }
      }
    }
  }

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity var(--transition-duration) var(--transition-timing);
    color: white;
  }
}

.crop-container {
  width: 100%;
  height: 400px;
  background: #f5f5f5;
  overflow: hidden;
}

:deep(.cropper-view-box) {
  border-radius: 50%;
  outline: none;
  box-shadow: 0 0 0 1px #39f;
}

:deep(.cropper-face) {
  background-color: inherit !important;
}

:deep(.cropper-view-box) {
  outline: inherit !important;
}
</style>