import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/global.css'
import layui from '@layui/layui-vue'
import '@layui/layui-vue/lib/index.css'
import '@layui/icons-vue/lib/index.css'
import './assets/styles/fontawesome.css'
import './utils/layui-init.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(layui)

app.mount('#app')

console.log('App mounted successfully')
