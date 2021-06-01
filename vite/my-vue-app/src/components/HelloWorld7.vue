<template>
  <div>{{num}}</div>
</template>

<script setup lang="ts">
// watchEffect
// watchEffect和watch区别
/**
 * 1、不需要手动传入依赖
 * 2、不是lazy，初始化执行分析依赖
 * 3、无法获取原始值
 * 4、一些异步操作放里面更加的合适
 * 5、watch第三个参数处理副作用的第一个参数
 * */ 
import {ref,watchEffect,onMounted} from "vue";
const num = ref(0);
onMounted(()=>{
  console.log("onMounted");
})
// 可以设置为函数，然后下面停止调用
const stop = watchEffect((onInvalidate)=>{
  console.log("watchEffect之前调用",num.value);
  // 清除副作用，例如解除监听，解除绑定等。
  onInvalidate(()=>{

  })
},{
  onTrigger(e){
// debugger;
  }
})
// 停止调用
stop()
setTimeout(()=>{
  num.value++
},1000)
</script>

<style>

</style>
