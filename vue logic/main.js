import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import { createPinia } from 'pinia';

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';

import 'primeicons/primeicons.css';
import './assets/main.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue, {
    theme: { preset: Aura, options: { cssLayer: false } },
    ripple: true
});
app.use(ToastService);
app.component('Toast', Toast);

// Mount the app
app.mount('#app');

// 🚀 Preline UI Core (From the docs)
import("preline/dist/index.js");