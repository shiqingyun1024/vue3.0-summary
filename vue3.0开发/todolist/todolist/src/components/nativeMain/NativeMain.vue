<template>
  <div class="main">
    <p v-for="(item,index) in list"><input type="checkbox" name="item"><label>{{item.title}}</label></p>
  </div>
</template>

<script>
import { defineComponent } from "vue";
export default defineComponent({
  name: "NativeMain",
  setup() {
    let list = [
      {
        title:'吃饭',
        complete:false
      },
      {
        title:'睡觉',
        complete:false
      },
      {
        title:'写代码',
        complete:false
      }
    ]
    return {
      list
    }
  }
});
</script>
<style scoped lang="scss">
.main{
  p{
    text-align: left;
    font-size: 16px;
  }
}
</style>
