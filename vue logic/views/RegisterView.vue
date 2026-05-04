<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';

const router = useRouter();
const loading = ref(false);
const error = ref('');
const selectedRole = ref('Doctor'); // 'Doctor' or 'Manager'

const form = ref({
  name: '',
  email: '',
  password: '',
  org_name: '',
  org_address: '',
  org_code: ''
});

// Dynamic Theme Colors based on Role
const themeColor = computed(() => selectedRole.value === 'Doctor' ? 'rose' : 'teal');
const themeBorder = computed(() => selectedRole.value === 'Doctor' ? 'border-rose-500' : 'border-teal-500');
const themeRing = computed(() => selectedRole.value === 'Doctor' ? 'focus:!ring-rose-200 focus:!border-rose-500' : 'focus:!ring-teal-200 focus:!border-teal-500');

const handleRegister = async () => {
  loading.value = true;
  // Simulate API delay to show off the loading state
  setTimeout(() => {
    loading.value = false;
    router.push('/login');
  }, 1500);
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 py-10 px-4 font-sans">

    <div class="absolute top-[-10%] right-[-5%] w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
    <div class="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-rose-100 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

    <div class="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-xl relative z-10 border border-slate-100">

      <div class="text-center mb-8">
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
        <p class="text-slate-500 mt-2">Choose your path to get started</p>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-8">

        <div @click="selectedRole = 'Doctor'"
             class="cursor-pointer relative p-4 rounded-2xl border-2 transition-all duration-300 ease-out transform hover:-translate-y-1"
             :class="selectedRole === 'Doctor' ? 'border-rose-500 bg-rose-50 shadow-lg shadow-rose-100' : 'border-slate-200 bg-white hover:border-rose-200'">
          <div class="flex flex-col items-center gap-2">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors"
                 :class="selectedRole === 'Doctor' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'">
              <i class="pi pi-heart"></i>
            </div>
            <div class="text-center">
              <span class="block font-bold text-sm" :class="selectedRole === 'Doctor' ? 'text-rose-700' : 'text-slate-600'">I am a Doctor</span>
              <span class="text-xs text-slate-400">Join a team</span>
            </div>
          </div>
          <div v-if="selectedRole === 'Doctor'" class="absolute top-2 right-2 text-rose-500">
            <i class="pi pi-check-circle"></i>
          </div>
        </div>

        <div @click="selectedRole = 'Manager'"
             class="cursor-pointer relative p-4 rounded-2xl border-2 transition-all duration-300 ease-out transform hover:-translate-y-1"
             :class="selectedRole === 'Manager' ? 'border-teal-500 bg-teal-50 shadow-lg shadow-teal-100' : 'border-slate-200 bg-white hover:border-teal-200'">
          <div class="flex flex-col items-center gap-2">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors"
                 :class="selectedRole === 'Manager' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400'">
              <i class="pi pi-briefcase"></i>
            </div>
            <div class="text-center">
              <span class="block font-bold text-sm" :class="selectedRole === 'Manager' ? 'text-teal-700' : 'text-slate-600'">Clinic Manager</span>
              <span class="text-xs text-slate-400">Create clinic</span>
            </div>
          </div>
          <div v-if="selectedRole === 'Manager'" class="absolute top-2 right-2 text-teal-500">
            <i class="pi pi-check-circle"></i>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleRegister" class="flex flex-col gap-5">

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">Full Name</label>
          <InputText v-model="form.name" placeholder="John Doe"
                     class="w-full !p-3 !rounded-xl !border-slate-200 !bg-slate-50 focus:!bg-white transition-all"
                     :class="themeRing" />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">Email Address</label>
          <InputText v-model="form.email" type="email" placeholder="name@example.com"
                     class="w-full !p-3 !rounded-xl !border-slate-200 !bg-slate-50 focus:!bg-white transition-all"
                     :class="themeRing" />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">Password</label>
          <Password v-model="form.password" :feedback="false" toggleMask placeholder="••••••••"
                    inputClass="w-full !p-3 !rounded-xl !border-slate-200 !bg-slate-50 focus:!bg-white transition-all"
                    :pt="{ input: { class: themeRing } }"
                    class="w-full" />
        </div>

        <transition name="slide-fade" mode="out-in">

          <div v-if="selectedRole === 'Manager'" class="bg-teal-50/50 p-5 rounded-2xl border border-teal-100 mt-2 flex flex-col gap-4">
            <div class="flex items-center gap-2 text-teal-700 mb-1">
              <i class="pi pi-building"></i>
              <span class="text-sm font-bold">New Organization Details</span>
            </div>

            <div>
              <label class="text-xs text-teal-600 font-bold ml-1">Clinic Name</label>
              <InputText v-model="form.org_name" class="w-full !p-3 !rounded-xl !border-teal-200 focus:!border-teal-500 focus:!ring-teal-200" />
            </div>
            <div>
              <label class="text-xs text-teal-600 font-bold ml-1">Address</label>
              <InputText v-model="form.org_address" class="w-full !p-3 !rounded-xl !border-teal-200 focus:!border-teal-500 focus:!ring-teal-200" />
            </div>
          </div>

          <div v-else class="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 mt-2 flex flex-col gap-4">
            <div class="flex items-center gap-2 text-rose-700 mb-1">
              <i class="pi pi-id-card"></i>
              <span class="text-sm font-bold">Verification</span>
            </div>

            <div>
              <label class="text-xs text-rose-600 font-bold ml-1">Organization Code</label>
              <InputText v-model="form.org_code" placeholder="e.g. X8A9B" class="w-full !p-3 !rounded-xl !border-rose-200 focus:!border-rose-500 focus:!ring-rose-200" />
              <p class="text-[10px] text-rose-400 mt-1 ml-1">* Ask your manager for this code</p>
            </div>
          </div>
        </transition>

        <Button type="submit" label="Create Account" :loading="loading"
                class="w-full !mt-2 !py-4 !rounded-xl !font-bold !border-none transition-all duration-300 shadow-lg hover:!scale-[1.02] active:!scale-[0.98]"
                :class="selectedRole === 'Doctor' ? '!bg-rose-600 hover:!bg-rose-700 shadow-rose-200' : '!bg-teal-600 hover:!bg-teal-700 shadow-teal-200'" />

      </form>

      <div class="mt-6 text-center">
        <router-link to="/login" class="text-sm text-slate-400 hover:text-slate-800 transition-colors font-medium">
          Already have an account? <span :class="selectedRole === 'Doctor' ? 'text-rose-600' : 'text-teal-600'">Log in</span>
        </router-link>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Smooth slide animation for the dynamic section */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>