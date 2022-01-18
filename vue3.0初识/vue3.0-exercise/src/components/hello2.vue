<template>
   <div ref="root">This is a root element</div>
</template>
<script>
  import { ref, onMounted }  from 'vue'

  export default {
    setup() {
      const root = ref(null)

      onMounted(() =>{
        // DOM 元素将在初始渲染后分配给 ref
        console.log(root.value) // <div>This is a root element</div>
      })

      return {
        root
      }
    }
  }
</script>