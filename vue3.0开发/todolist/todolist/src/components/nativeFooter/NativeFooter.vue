<template>
  <div class="footer">
    <p>已完成1 / 全部4  <button>清除已完成</button></p>
  </div>
</template>

<script>
import { defineComponent } from "vue";
export default defineComponent({
  name: "NativeFooter",
  setup() {}
});
</script>
<style scoped lang="scss">
.footer{
  p{
    text-align: left;
  }
}
</style>
