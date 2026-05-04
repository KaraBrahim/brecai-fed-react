<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { FilterMatchMode } from '@primevue/core/api';

// Components
import Menubar from 'primevue/menubar';
import Card from 'primevue/card';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

const router = useRouter();
const authStore = useAuthStore();

// 1. Navigation Items
const items = ref([
  { label: 'Dashboard', icon: 'pi pi-home' },
  { label: 'Patients', icon: 'pi pi-users' },
  { label: 'Appointments', icon: 'pi pi-calendar' },
  { label: 'Settings', icon: 'pi pi-cog' }
]);

// 2. Logout Function
const handleLogout = async () => {
  await authStore.logout();
  // Router redirect happens inside the store
};

// 3. Stats Data (Static for now)
const stats = ref([
  { title: 'Total Patients', value: '1,240', icon: 'pi pi-users', color: 'text-blue-500', bg: 'bg-blue-100' },
  { title: 'Appointments Today', value: '12', icon: 'pi pi-calendar-clock', color: 'text-orange-500', bg: 'bg-orange-100' },
  { title: 'Pending Approvals', value: '1', icon: 'pi pi-exclamation-circle', color: 'text-purple-500', bg: 'bg-purple-100' }
]);

// 4. Doctors Data (Static for now)
const doctors = ref([
  { id: 1, name: 'Dr. House', specialty: 'Diagnostician', status: 'Active', patients: 12 },
  { id: 2, name: 'Dr. Wilson', specialty: 'Oncology', status: 'Active', patients: 8 },
  { id: 3, name: 'Dr. Chase', specialty: 'Surgery', status: 'Pending', patients: 0 },
  { id: 4, name: 'Dr. Cameron', specialty: 'Immunology', status: 'Active', patients: 15 },
]);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const getSeverity = (status) => {
  return status === 'Active' ? 'success' : 'warn';
};
</script>

<template>
  <div class="min-h-screen bg-slate-50">

    <Menubar :model="items" class="border-none shadow-sm rounded-none sticky top-0 z-50">
      <template #start>
        <div class="flex items-center gap-2">
          <i class="pi pi-heart-fill text-red-500 text-2xl"></i>
          <span class="font-bold text-xl text-gray-800">MediCore</span>
        </div>
      </template>
      <template #end>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500 hidden sm:block">
            Dr. {{ authStore.user?.name || 'Loading...' }}
          </span>
          <Button icon="pi pi-power-off" severity="danger" text rounded aria-label="Logout" @click="handleLogout" />
        </div>
      </template>
    </Menubar>

    <div class="w-full px-6 py-6 space-y-6">

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="stat in stats" :key="stat.title" class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm font-medium">{{ stat.title }}</p>
            <h3 class="text-2xl font-bold text-gray-800 mt-1">{{ stat.value }}</h3>
          </div>
          <div :class="`p-3 rounded-full ${stat.bg} ${stat.color}`">
            <i :class="`${stat.icon} text-xl`"></i>
          </div>
        </div>
      </div>

      <Card class="shadow-sm border border-gray-100">
        <template #title>
          <div class="flex justify-between items-center">
            <span>Staff Overview</span>
            <Button label="Invite New Doctor" icon="pi pi-plus" size="small" />
          </div>
        </template>
        <template #content>
          <DataTable v-model:filters="filters" :value="doctors" paginator :rows="5" stripedRows tableStyle="min-width: 50rem" :globalFilterFields="['name', 'specialty']">
            <template #header>
              <div class="flex justify-end">
                <IconField iconPosition="left">
                  <InputIcon class="pi pi-search" />
                  <InputText v-model="filters['global'].value" placeholder="Search doctors..." />
                </IconField>
              </div>
            </template>
            <Column field="name" header="Name" sortable></Column>
            <Column field="specialty" header="Specialty" sortable></Column>
            <Column field="patients" header="Current Patients" sortable></Column>
            <Column header="Status">
              <template #body="slotProps">
                <Tag :value="slotProps.data.status" :severity="getSeverity(slotProps.data.status)" rounded />
              </template>
            </Column>
            <Column header="Actions">
              <template #body="slotProps">
                <div class="flex gap-2">
                  <Button icon="pi pi-pencil" text rounded severity="secondary" />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>
  </div>
</template>