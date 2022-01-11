<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>
<script lang="ts" setup>
import { ref,computed } from 'vue'

const counter = ref(0)
const twiceTheCounter = computed(() => counter.value*2)
counter.value++
console.log(counter.value);
console.log(twiceTheCounter.value); // 注意computed返回的值要用value

</script>

<style scoped lang="scss">
</style>

