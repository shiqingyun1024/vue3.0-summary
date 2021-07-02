import loadingDom from './loading.vue'
import Vue from 'vue'
let loading = {
    inserted: function (el,binding) {
      console.log(typeof el);
      console.log(el);
       let dom = Vue.extend(loadingDom)
       let domel = new dom().$mount().$el
       console.log(domel);

       console.log(dom);
       el.appendChild(domel)
       console.log(binding.value);
       
        // 聚焦元素
        console.log(el);
      }
}
export default loading
