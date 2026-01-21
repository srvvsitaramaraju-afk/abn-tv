import { createApp } from 'vue'
import { createPinia } from 'pinia'

// styles
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/app.scss'

import App from '@/App.vue'
import {router} from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
