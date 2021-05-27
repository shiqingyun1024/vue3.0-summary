<template>
  <h1>{{ msg }}</h1>

  <p>
    <a href="https://vitejs.dev/guide/features.html" target="_blank">
      Vite Documentation
    </a>
    |
    <a href="https://v3.vuejs.org/" target="_blank">Vue 3 Documentation</a>
  </p>

  <button @click="state.count++">count is: {{ state.count }}</button>
  <button>count is: {{ num }}</button>
  <p>
    Edit
    <code class="text">components/HelloWorld.vue</code> to test hot module replacement.
  </p>
</template>

<script setup>
import { defineProps, reactive, onMounted } from 'vue'
const color = "red";
const font = {
  size:'3em'
}
defineProps({
  msg: String
})

const state = reactive({ count: 0 })
ref:num=100;
onMounted:{
  num = 200;
  console.log('挂载',num);
}
</script>

<style>
:root{
  --varColor: yellowgreen;
}
a {
  color: var(--varColor);
}
.text{
  color: v-bind(color);
  font-size: v-bind("font.size")
}
</style>
