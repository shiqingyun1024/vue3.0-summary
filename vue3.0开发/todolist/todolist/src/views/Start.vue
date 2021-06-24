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
      let start = ()=>{
        //   router.push('/Home')
          router.push({
              path:'/Home'
          })
      }
      return{
         start
      }
      
  }
});
</script>
