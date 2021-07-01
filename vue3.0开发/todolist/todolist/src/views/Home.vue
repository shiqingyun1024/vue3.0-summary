<template>
  <div class="home">
    <NativeHeader @add="add"></NativeHeader>
    <NativeMain :list="list" @deleteItem="deleteMainItem"></NativeMain>
    <NativeFooter :list="list" @clear="clear"></NativeFooter>
  </div>
</template>

<script>
import NativeHeader from "@/components/nativeHeader/NativeHeader.vue";
import NativeMain from "@/components/nativeMain/NativeMain.vue";
import NativeFooter from "@/components/nativeFooter/NativeFooter.vue";
import { defineComponent, ref, computed } from "vue";
import { useStore } from "vuex"; // 内置的hooks函数
import { useRouter, useRoute } from "vue-router"; // 内置的hooks函数

export default defineComponent({
  name: "Home",
  components: {
    NativeHeader,
    NativeMain,
    NativeFooter
  },
  setup() {
    let store = new useStore();
    let list = computed(()=>{
      return store.state.list
    })
    let add = value => {
      let flag = true;
      list.value.forEach(item=>{
        if(item.title === value){
            alert('任务已存在')
            flag = false
        }
      })
      flag?store.commit('addTodo',{title:value,complete:false}):''
    };
    let deleteMainItem = (index)=>{
      console.log(index);
       store.commit('delTodo',index)
    }
    let clear = (val)=>{
      console.log('父清空');
      store.commit('clear',val)
    }
    return {
      add,
      store,
      list,
      deleteMainItem,
      clear
    };
  }
});
</script>
<style scoped lang="scss">
.home {
  margin-top: 100px;
  margin-left: calc(50% - 80px);
}
</style>
