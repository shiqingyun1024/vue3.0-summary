<template>
  <div>{{plusOne}}</div>
  <div>{{count}}</div>
</template>

<script setup lang="ts">
import {computed,ref} from "vue"
const count = ref(1)
// const plusOne = computed(()=>count.value + 1)
const plusOne = computed({
  get:()=>count.value+1,
  set:(val)=>{
    count.value = val - 1;
  }
})
console.log(plusOne);

</script>

<style>

</style>
