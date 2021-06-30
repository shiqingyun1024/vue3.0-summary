<template>
  <div class="header">
    <input type="text" placeholder="请输入要做的内容">
  </div>
</template>

<script>
import { defineComponent } from "vue";
export default defineComponent({
  name: "NativeHeader",
  setup() {}
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
