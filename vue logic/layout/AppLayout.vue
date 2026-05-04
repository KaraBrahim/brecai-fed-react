<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="bg-gray-100 text-gray-900 min-h-screen h-full font-sans">

    <header class="sticky top-0 inset-x-0 flex flex-wrap sm:justify-start sm:flex-nowrap z-[48] w-full bg-white border-b border-gray-200 text-sm py-2.5 sm:py-4 lg:ps-64 shadow-sm">
      <nav class="flex basis-full items-center w-full mx-auto px-4 sm:px-6 md:px-8" aria-label="Global">
        <div class="me-5 lg:me-0 lg:hidden flex items-center gap-2">
          <i class="pi pi-shield text-blue-700 text-xl"></i>
          <a class="flex-none text-2xl font-extrabold text-blue-700 border-none" href="#" aria-label="Brand">MedAdmin</a>
        </div>

        <div class="w-full flex items-center justify-end ms-auto sm:justify-between sm:gap-x-3 sm:order-3 gap-3">
          <div class="hidden sm:block">
            <span class="text-base font-semibold text-gray-800">
              {{ authStore.user?.organization?.name || 'Dashboard Overview' }}
            </span>
          </div>

          <div class="hs-dropdown relative inline-flex" data-hs-dropdown-placement="bottom-right">
            <button id="hs-dropdown-with-header" type="button" class="w-10 h-10 inline-flex justify-center items-center gap-x-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-700 focus:ring-2 focus:ring-blue-700 transition">
              <i class="pi pi-user text-lg"></i>
            </button>

            <div class="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-[16rem] bg-white shadow-xl rounded-xl p-3 border border-gray-200" aria-labelledby="hs-dropdown-with-header">
              <div class="py-3 px-5 -m-2 bg-gray-50 rounded-t-xl">
                <p class="text-sm font-medium text-gray-800">{{ authStore.user?.email || 'admin@medadmin.com' }}</p>
                <p class="text-xs text-gray-500 mt-1">Signed in as</p>
              </div>
              <div class="mt-3 py-2 space-y-1">
                <button @click="handleLogout" class="flex w-full items-center gap-x-3.5 py-2.5 px-3 rounded-lg text-sm text-red-600 font-medium hover:bg-red-50 focus:ring-2 focus:ring-blue-500 transition-colors">
                  <i class="pi pi-sign-out"></i> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
    <div class="sticky top-0 inset-x-0 z-20 bg-white border-y border-gray-200 px-4 sm:px-6 md:px-8 lg:hidden">
      <div class="flex items-center py-4">
        <button type="button" class="text-gray-500 hover:text-gray-700" data-hs-overlay="#application-sidebar" aria-controls="application-sidebar" aria-label="Toggle navigation">
          <span class="sr-only">Toggle Navigation</span>
          <i class="pi pi-bars text-xl"></i>
        </button>
        <ol class="ms-3 flex items-center whitespace-nowrap" aria-label="Breadcrumb">
          <li class="flex items-center text-sm font-medium text-gray-900">
            MedAdmin Dashboard
          </li>
        </ol>
      </div>
    </div>
    <div id="application-sidebar" class="hs-overlay hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform hidden fixed top-0 start-0 bottom-0 z-[60] w-64 bg-white border-e border-gray-200 pt-7 pb-10 overflow-y-auto lg:block lg:translate-x-0 lg:end-auto lg:bottom-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 h-screen flex flex-col shadow-xl lg:shadow-none">
      <div class="px-6 border-b border-gray-200 pb-4 flex items-center gap-2">
        <i class="pi pi-shield text-blue-700 text-2xl"></i>
        <a class="flex-none text-2xl font-extrabold text-blue-700 border-none" href="#" aria-label="Brand">
          MedAdmin
        </a>
      </div>

      <nav class="hs-accordion-group p-4 w-full flex flex-col flex-wrap space-y-2 mt-4 flex-1">
        <ul class="space-y-1.5">
          <li>
            <router-link to="/admin" class="flex items-center gap-x-3.5 py-3 px-3.5 text-blue-700 font-semibold text-base rounded-lg border-l-4 border-blue-700 bg-blue-100 transition shadow-inner">
              <i class="pi pi-home text-lg"></i> Dashboard
            </router-link>
          </li>

          <li>
            <a class="flex items-center gap-x-3.5 py-3 px-3.5 text-gray-700 font-medium text-base rounded-lg border-l-4 border-transparent hover:border-gray-300 hover:bg-gray-100 transition" href="#">
              <i class="pi pi-chart-bar text-lg"></i> Reports
            </a>
          </li>

          <li>
            <a class="flex items-center gap-x-3.5 py-3 px-3.5 text-gray-700 font-medium text-base rounded-lg border-l-4 border-transparent hover:border-gray-300 hover:bg-gray-100 transition" href="#">
              <i class="pi pi-cog text-lg"></i> Settings
            </a>
          </li>
        </ul>
      </nav>

      <div class="p-5 border-t border-gray-200 bg-gray-50 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 border border-blue-200 shadow-inner">
          <i class="pi pi-id-card text-xl"></i>
        </div>
        <div>
          <div class="font-bold text-gray-900 truncate">{{ authStore.user?.name || 'Administrator' }}</div>
          <div class="text-xs text-blue-800 uppercase font-extrabold">{{ authStore.userRole || 'Admin' }}</div>
        </div>
      </div>
    </div>
    <div class="w-full pt-10 px-4 sm:px-6 md:px-8 lg:ps-72 bg-gray-100">
      <div class="bg-white p-6 sm:p-8 space-y-6 sm:space-y-8 rounded-3xl shadow-lg border border-gray-200 min-h-[calc(100vh-10rem)]">

        <h1 class="text-3xl font-extrabold text-gray-950 tracking-tight">Admin Dashboard</h1>

        <div class="w-full">
          <slot></slot>
        </div>

      </div>
    </div>
  </div>
</template>