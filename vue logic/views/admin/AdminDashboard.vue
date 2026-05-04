<script setup>
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
</script>

<template>
  <div class="p-8">
    <h1 class="text-4xl font-bold text-slate-800">Admin Dashboard</h1>
    <p class="mt-4 text-emerald-600 font-medium">
      ✅ If you can see this, the redirect loop is dead and you are logged in!
    </p>
    <div class="mt-6 p-4 bg-slate-100 rounded-lg">
      <pre>{{ authStore.user }}</pre>
    </div>

    <button
        @click="authStore.logout"
        class="mt-6 px-4 py-2 bg-rose-500 text-white rounded-lg">
      Logout
    </button>
  </div>
</template>