import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createAuth0 } from '@auth0/auth0-vue';

import PrimeVue from 'primevue/config';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const app = createApp(App)

app.use(
  createAuth0({
    domain: "dev-k0sl1xaa1o87ofbn.us.auth0.com",
    clientId: "C1R6iRUm2WvmLn1hIu5PkVLASp1Mrg3m",
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: `https://${import.meta.env.VITE_AUTH0_DOMAIN}/api/v2/`
    }
  })
);

app.use(router)
app.use(PrimeVue);
app.component('DataTable', DataTable);
app.component('Column', Column);

app.mount('#app')
