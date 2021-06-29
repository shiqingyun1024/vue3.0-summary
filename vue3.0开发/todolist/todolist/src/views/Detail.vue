<template>
<div class="detail">
  <h3>这是detail组件</h3>
  <child :msg="msg"></child>
</div>
</template>
<script>
import {defineComponent,ref} from 'vue'
import child from '../components/child/child'
export default defineComponent({
    name:'Detail',
    components:{
       child
    },
    setup(){
        let msg = ref('这是父组件的数据')
        return{
            msg
        }

    }

})
</script>