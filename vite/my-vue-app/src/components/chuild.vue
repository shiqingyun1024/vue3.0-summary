<template>
  <div>{{state.count}}</div>
</template>

<script lang="ts">
// watch
import { defineComponent,inject,Ref,watchEffect} from "vue"
export default defineComponent({
  name:"child",
  setup(){
    const theme = inject("test","努力")
  }
})


</script>

<style>

</style>
