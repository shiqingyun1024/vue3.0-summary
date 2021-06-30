<template>
  <div class="main">
    <p v-for="(item,index) in list"><input type="checkbox" name="item"><label>{{item.title}}</label> <button>删除</button></p>
  </div>
</template>

<script>
import { defineComponent } from "vue";
export default defineComponent({
  name: "NativeMain",
  props:{
    list:{
      type:Array,
      default:[],
      required:true
    }
  },
  setup(props) {
    let list = props.list
    return {
      list
    }
  }
});
</script>
<style scoped lang="scss">
.main{
  width: 300px;
  p{
    text-align: left;
    font-size: 16px;
    position: relative;
    button{
      display: inline-block;
      margin-left: 20px;
      display: none;
      position: absolute;
      right: 0;
      top: 0;
    }
    &:hover{
       button{
         display: block;
       }
    }
  }
}
</style>
