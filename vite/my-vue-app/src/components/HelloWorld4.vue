<template>
  <input type="text" ref="root" value="ref使用例子">
  <input type="tel" ref="root2" value="手机号码">
</template>

<script setup lang="ts">
// templateRefs的使用
import { ref, onMounted } from "vue"

// 这样就可以拿到ref的值了
const root = ref(null) // 声明的这个值要和html中ref中的值保持一致
const root2 = ref(null)// 声明的这个值要和html中ref中的值保持一致
// DOM首次渲染完成之后 才能获取到真实的DOM
onMounted(()=>{
  console.log("ref",root.value); // ref <input type="text">
  console.log("ref2",root2.value);// ref2 <input type="tel">
  
})

</script>

<style>

</style>
