<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';

const authStore = useAuthStore();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    await authStore.login(email.value, password.value);
  } catch (e) {
    error.value = e.response?.data?.message || 'Invalid credentials.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">

    <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-medical-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
    <div class="absolute top-[-10%] right-[-10%] w-96 h-96 bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md relative z-10 border-t-4 border-rose-400">

      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 text-rose-500 mb-4">
          <i class="pi pi-heart text-xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-slate-800">Welcome Back</h2>
        <p class="text-slate-500 text-sm mt-1">Oncology Portal Login</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-slate-700">Email Address</label>
          <InputText v-model="email" type="email" placeholder="dr.house@clinic.com"
                     class="w-full border-slate-200 focus:border-rose-400 focus:ring-rose-400" required />
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <label class="text-sm font-semibold text-slate-700">Password</label>
            <a href="#" class="text-xs text-rose-500 hover:text-rose-600 font-medium">Forgot?</a>
          </div>
          <Password v-model="password" :feedback="false" toggleMask placeholder="••••••••"
                    inputClass="w-full border-slate-200 focus:border-rose-400 focus:ring-rose-400"
                    class="w-full" required />
        </div>

        <div v-if="error" class="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 p-3 rounded-lg border border-rose-100">
          <i class="pi pi-exclamation-circle"></i>
          <span>{{ error }}</span>
        </div>

        <Button type="submit" label="Sign In" :loading="loading"
                class="w-full bg-slate-900 hover:bg-slate-800 border-none py-3 font-semibold shadow-lg shadow-slate-200/50" />
      </form>

      <div class="mt-8 text-center border-t border-slate-100 pt-6">
        <p class="text-sm text-slate-500">
          New here?
          <router-link to="/register" class="text-rose-500 font-semibold hover:text-rose-600 transition-colors">Create Account</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
</style>