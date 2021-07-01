<template>
  <div class="main" v-if="list.length >0">
    <p v-for="(item,index) in list" :key="index"><input type="checkbox" name="item" v-model="item.complete"><label>{{item.title}}</label> <button v-if="item.complete" @click="deleteItem(index)">删除</button></p>
  </div>
  <div class="no-task" v-else>
    暂且无任务
  </div>
</template>

<script>
import { defineComponent,computed } from "vue";
export default defineComponent({
  name: "NativeMain",
  props:{
    list:{
      type:Array,
      default:[],
      required:true
    }
  },
  setup(props,context) {
    let list = computed(()=>{
      return props.list;
    })
    let deleteItem = (index)=>{
      console.log(index);
      context.emit('deleteItem',index)
    }
    return {
      list,
      deleteItem
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
.no-task{
  text-align: left;
  margin-top: 20px;
}
</style>
