<script setup>
import { onMounted, computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AppLayout from '@/layout/AppLayout.vue';

// 🚀 Initialize Preline Core JS
// import 'preline/preline';

const authStore = useAuthStore();
const route = useRoute();

onMounted(async () => {
  // This is the most important call. It sets isInitialized to true.
  await authStore.fetchUser();
});

/**
 * We only show the Preline Layout if:
 * 1. The route explicitly says it needs auth.
 * 2. The user is actually authenticated.
 */
const showLayout = computed(() => {
  return route.meta?.requiresAuth && authStore.isAuthenticated;
});
</script>

<template>
  <div v-if="!authStore.isInitialized" class="flex items-center justify-center min-h-screen bg-slate-50">
    <i class="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
  </div>

  <template v-else>
    <AppLayout v-if="showLayout">
      <RouterView />
    </AppLayout>

    <RouterView v-else />
  </template>
</template>

<style>
/* Reset basics */
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
</style>