<template>
  <div>{{num}}</div>
</template>

<script setup lang="ts">
// 生命周期
// 开发Hooks
/**  2.x与3.x对比
 *   beforeCreate -> use setup()
 *   created -> use setup()
 *   beforeMount -> onBeforeMount
 *   mounted -> onMounted
 *   beforeUpdate -> onBeforeUpdate
 *   updated -> onUpdated
 *   beforeDestory -> onBeforeUnmount
 *   destroyed -> onUnmounted
 *   errorCaptured -> onErrorCaptured
 * */ 
import {ref,onBeforeMount,onMounted,onBeforeUpdate,onUpdated,onBeforeUnmount,onUnmounted,onErrorCaptured} from "vue";
const num = ref(0);
onBeforeMount(()=>{
  console.log("onBeforeMount");
})
onMounted(()=>{
  console.log("onMounted");
})
onBeforeUpdate(()=>{
  console.log("onBeforeUpdate");
})
onUpdated(()=>{
  console.log("onUpdated");
})
onBeforeUnmount(()=>{
  console.log("onBeforeUnmount");
})
onUnmounted(()=>{
  console.log("onUnmounted");
})
onErrorCaptured(()=>{
  console.log("onErrorCaptured");
})
</script>

<style>

</style>
