<template>
  <div>{{state.count}}</div>
</template>

<script setup lang="ts">
// watch
import {watch,reactive} from "vue"
const state = reactive({count:0})
watch(()=>state.count,(count,prevCount)=>{
   console.log("第一个监听的值",count,prevCount);
},{
  deep:true,
  immediate:true
})
setTimeout(()=>{
  state.count++
},1000)

</script>

<style>

</style>
