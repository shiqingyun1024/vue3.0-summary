import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'

const app = createApp(App);
// 把axios挂载到全局上 --- 方法1
// app.config.globalProperties.$http = axios;

// 把axios挂载到全局上 --- 方法2
app.use(VueAxios, axios)

app.mount('#app')
