<template>
  <div class="footer">
    <p>已完成{{completeCount}} / 全部{{allCount}}  <button @click="clear">清除已完成</button></p>
  </div>
</template>

<script>
import { defineComponent,computed,ref } from "vue";
export default defineComponent({
  name: "NativeFooter",
  props:{
    list:{
      default:[],
      type:Array
    }

  },
  setup(props,context) {
    let completeCount = computed(()=>{
      let list = props.list.filter(item=>{
        return item.complete
      })
      return list.length
    })
    let allCount = ref('')
    allCount = props.list.length
    let clear = ()=>{
       context.emit('clear')
    }
    return {
      completeCount,
      allCount,
      clear
    }
  }
});
</script>
<style scoped lang="scss">
.footer{
  p{
    text-align: left;
  }
}
</style>
