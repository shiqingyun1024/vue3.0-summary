<template>
  <div class="footer">
    <p>已完成{{completeCount}} / 全部{{allCount}}  <button v-if="completeCount>0" @click="clear">清除已完成</button></p>
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
    let allCount = computed(()=>{
      return props.list.length
    })
    let clear = ()=>{
      console.log('子清空');
      let notCompleteList = props.list.filter(item=>!item.complete)
       context.emit('clear',notCompleteList)
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
