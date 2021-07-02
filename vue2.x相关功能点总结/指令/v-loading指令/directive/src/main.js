import Vue from 'vue'
import App from './App.vue'
import loading from './config/loading/loading'

Vue.config.productionTip = false
Vue.directive('loading',loading)

new Vue({
  render: h => h(App),
}).$mount('#app')
