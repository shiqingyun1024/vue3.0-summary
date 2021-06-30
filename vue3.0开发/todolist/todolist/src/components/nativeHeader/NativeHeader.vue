<template>
  <div class="header">
    <input type="text" placeholder="请输入任务名称" v-model="msg" @keydown.enter="enter">
  </div>
</template>

<script>
import { defineComponent,ref } from "vue";
export default defineComponent({
  name: "NativeHeader",
  // setup接受两个参数，第一个是props，第二个是context
  setup(props,context) {
    let msg = ref('')
    let enter = ()=>{
       context.emit('add',msg.value)
       msg.value = ""
    }
    return{
      msg,
      enter
    }
  }
});
</script>
<style scoped lang="scss">
.header{
  input{
    display: block;
    width: 300px;
    height: 30px;
    line-height: 30px;
  }
}
</style>
