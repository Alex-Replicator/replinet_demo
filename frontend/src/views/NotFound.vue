<template>
  <div class="not-found">
    <v-container class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="text-center pa-6">
            <v-card-text>
              <v-icon
                size="100"
                color="grey"
                class="mb-4"
              >
                mdi-robot-confused
              </v-icon>

              <h1 class="text-h4 mb-2">
                404
              </h1>

              <p class="text-h6 mb-6">
                Страница не найдена
              </p>

              <p class="text-body-1 mb-6 text-grey">
                Похоже, что запрашиваемая страница не существует или была перемещена.
                Возможно, вы перешли по устаревшей ссылке или ввели неверный адрес.
              </p>

              <v-btn
                color="primary"
                size="large"
                :to="{ name: 'dashboard' }"
              >
                Вернуться на главную
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
// Компонент не требует дополнительной логики
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  background-color: rgb(var(--v-theme-surface));
}

.v-card {
  border-radius: 16px;
}

.v-icon {
  opacity: 0.7;
}
</style>