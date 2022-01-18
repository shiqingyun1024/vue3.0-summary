<template>
<div>
  <div v-for="(item, i) in list" :key="i" :ref="el => { if (el) divs[i] = el }">
    {{ item }}
  </div>
</div>
</template>

<script>
  import { ref, reactive, onBeforeUpdate, onMounted } from 'vue'

  export default {
    setup() {
      const list = reactive([1, 2, 3])
      const divs = ref([])

      // 确保在每次更新之前重置ref
      onBeforeUpdate(() => {
        divs.value = []
      })

      onMounted(()=>{
        console.log(divs)
      })

      return {
        list,
        divs
      }
    }
  }
</script>