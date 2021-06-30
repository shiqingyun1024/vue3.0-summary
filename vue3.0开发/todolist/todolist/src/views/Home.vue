<template>
  <div class="home">
    <NativeHeader @add="add"></NativeHeader>
    <NativeMain :list="list"></NativeMain>
    <NativeFooter></NativeFooter>
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
    let list = store.state.list
    let add = value => {
      store.commit('addTodo',{title:value,complete:false})
      console.log(value);
    };
    return {
      add,
      store,
      list
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
