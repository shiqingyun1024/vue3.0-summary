<template>
  <img alt="Vue logo" src="./assets/vite.jpeg" />
  <!-- <HelloWorld2 msg="Hello Vue 3 + Vite" /> -->
  <!-- <HelloWorld3 /> -->
  <!-- <HelloWorld6 /> -->
  <HelloWorld7 />
</template>

<script setup lang="ts">
// import HelloWorld3 from './components/HelloWorld3.vue'
// import HelloWorld4 from './components/HelloWorld4.vue'
// import HelloWorld6 from './components/HelloWorld6.vue'
import HelloWorld7 from './components/HelloWorld7.vue'
// import axios from 'axios'
import { onMounted, getCurrentInstance } from 'vue'

// mock数据
onMounted(()=>{
  const {proxy} = getCurrentInstance(); // proxy相当于this
  const baseUrl = 'https://www.fastmock.site/mock/3108d616ba9a1a9019a6d5b7905a11ea/api'
  // proxy.$http.get(`${baseUrl}/test`).then(({data})=>{
  proxy.axios.get(`${baseUrl}/test`).then(({data})=>{
    console.log(data);
    console.log(typeof data.code);
    
     if(data.code === 0){
       console.log(data.data);
     }
  })
})

// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
