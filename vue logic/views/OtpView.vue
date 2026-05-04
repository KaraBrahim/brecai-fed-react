<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import InputOtp from 'primevue/inputotp';
import Button from 'primevue/button';

const authStore = useAuthStore();
const otp = ref('');
const loading = ref(false);
const error = ref('');

const handleVerify = async () => {
  if (otp.value.length < 6) return;
  loading.value = true;
  error.value = '';

  try {
    await authStore.verifyOtp(otp.value);
  } catch (e) {
    error.value = 'Invalid code.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">

    <div class="absolute w-[500px] h-[500px] bg-medical-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

    <div class="bg-white p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-md relative z-10 flex flex-col gap-6 border border-slate-100">

      <div class="text-center">
        <div class="w-16 h-16 bg-medical-50 text-medical-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="pi pi-shield text-3xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-slate-800">Verify Identity</h2>
        <p class="text-slate-500 text-sm mt-2">
          Enter the code sent to <br>
          <span class="font-semibold text-slate-800">{{ authStore.tempEmail || 'your email' }}</span>
        </p>
      </div>

      <div class="flex justify-center">
        <InputOtp v-model="otp" :length="6" integerOnly class="custom-otp" />
      </div>

      <div v-if="error" class="bg-rose-50 text-rose-600 text-sm p-3 rounded-lg text-center flex items-center justify-center gap-2">
        <i class="pi pi-info-circle"></i> {{ error }}
      </div>

      <Button label="Verify & Login" @click="handleVerify" :loading="loading"
              class="w-full !bg-slate-900 hover:!bg-slate-800 !border-none !text-white py-4 font-bold rounded-xl shadow-lg shadow-slate-200" />

      <div class="flex items-center justify-center gap-4 text-sm mt-2">
        <button class="text-slate-400 hover:text-medical-600 font-medium transition-colors">Resend Code</button>
        <div class="w-px h-4 bg-slate-300"></div> <button @click="authStore.logout" class="text-slate-400 hover:text-rose-500 font-medium transition-colors">Back to Login</button>
      </div>

    </div>
  </div>
</template>

<style>
/* WE ARE FORCING THE STYLE HERE
   PrimeVue's InputOtp renders nested inputs. We target them directly.
*/

.custom-otp {
  gap: 0.5rem; /* Gap between boxes */
}

.custom-otp .p-inputotp-input {
  width: 3rem !important;  /* Force Width */
  height: 3.5rem !important; /* Force Height */
  font-size: 1.5rem !important;
  text-align: center;
  border: 2px solid #e2e8f0 !important; /* Visible Slate-200 border */
  border-radius: 0.5rem !important;
  background-color: #f8fafc !important; /* Slight gray background so it's not invisible */
  color: #1e293b !important;
  transition: all 0.2s;
}

.custom-otp .p-inputotp-input:focus {
  border-color: #0ea5e9 !important; /* Medical Blue on focus */
  background-color: #ffffff !important;
  outline: none !important;
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1) !important; /* Glow effect */
}
</style>