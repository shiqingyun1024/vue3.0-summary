import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

let app = createApp(App);
app.config.errorHandler = (err,vm,info) =>{
    console.log('123456')
    console.log(err);
    console.log(vm);
    console.log(info);
 }

app.use(store).use(router).mount('#app')
