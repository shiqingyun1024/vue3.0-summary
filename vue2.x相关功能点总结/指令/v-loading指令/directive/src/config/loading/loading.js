import loadingDom from './loading.vue'
import Vue from 'vue'
let loading = {
  inserted: (el, binding)=> {
    let dom = Vue.extend(loadingDom)
    let domel = new dom().$mount()
    el.instance = domel
    if (!binding.value) {
      appendChild(el)
    }
  },
  update:(el,binding)=>{
     if(binding.value !== binding.oldValue){
      binding.value?removeChild(el):appendChild(el)
     }
  }
}
function appendChild(el){
  el.appendChild(el.instance.$el)
}
function removeChild(el){
  el.removeChild(el.instance.$el)
}
export default loading
