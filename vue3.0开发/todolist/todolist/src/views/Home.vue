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
import { useStore } from "vuex" // 内置的hooks函数
import { useRouter } from "vue-router" // 内置的hooks函数

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

    let router = useRouter()
    // 跳转路由
    // push函数里面可以传入跳转的路径
    // back：回退到上一页
    // forward：去到下一页
    // go(整数) 正数代表前进，负数代表后退
    // router.push('/about')
    // router.push({
    //   path:'/about'
    // })

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
