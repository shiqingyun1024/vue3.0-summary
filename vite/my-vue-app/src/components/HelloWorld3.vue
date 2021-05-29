<template>
  <div>默认的count:{{count}}</div>
  <div>name:{{obj.name}}</div>
  <div>age:{{age}}</div>
</template>

<script setup lang="ts">
// ref,reactive具体使用和对比
import { ref,reactive, toRefs } from "vue"
// ref就是一般某个元素 简单数据类型
// reactive一遍用于对象
const count = ref(0);
console.log('count:',count.value);
// 使用reactive包裹单独的ref
const state = reactive({
  count
})
console.log('state',state.count);

const obj = reactive({
  name:'lili',
  age:'12'
})

const {age} = {...toRefs(obj)}
</script>

<style>

</style>
