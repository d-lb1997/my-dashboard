import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify()

createApp(App).use(router).use(vuetify).mount('#app')
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
