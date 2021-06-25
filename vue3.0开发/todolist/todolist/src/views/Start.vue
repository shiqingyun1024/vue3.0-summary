<template>
  <div class="start">
      <!-- 开始页-->
    <button @click="start">开始任务</button>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import { useRouter } from "vue-router" // 内置的hooks函数

export default defineComponent({
  name: "Start",
  
  setup() {
      let router = useRouter()
      let name = ref('jack')
      let num = ref(10)
      let obj = ref({
        msg:'start'
      })
      let start = ()=>{
        //   router.push('/Home')
        // push 如果是传的对象的形式 就可以传递参数
          router.push({
              path:'/Home',
              query:{
                name: name.value,
                num: num.value,
                obj: JSON.stringify(obj),
              }
          })
      }
      return{
         start
      }
      
  }
});
</script>
