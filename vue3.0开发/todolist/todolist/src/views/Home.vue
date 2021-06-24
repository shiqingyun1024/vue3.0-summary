<template>
  <div class="home">
    <div>
      {{num1}}----{{num2}}
      两数之和为{{addNum}}
    </div>
    <button @click="add">改变数值</button>
  </div>
</template>

<script>
// @ is an alias to /src
import NativeHeader from "@/components/nativeHeader/NativeHeader.vue";
import NativeMain from "@/components/nativeMain/NativeMain.vue";
import NativeFooter from "@/components/nativeFooter/NativeFooter.vue";
import { defineComponent, ref, computed } from "vue";
import { useStore } from "vuex"

export default defineComponent({
  name: "Home",
  components: {
    NativeHeader,
    NativeMain,
    NativeFooter
  },
  setup() {
    let store = useStore()
    let list = computed(()=>{
      return store.state.list
    })

    let num1 = ref(10);
    let num2 = ref(20);
    let addNum = computed(() => {
      // 必须返回一个值
      // 逻辑代码
      // 购物车总价经常用
      return num1.value + num2.value;
    });
    let add = () => {
      num1.value++;
      num2.value++;
    };
    return {
      num1,
      num2,
      addNum,
      add
    };
  }
});
</script>
