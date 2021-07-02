<template>
  <div class="loading">
    <img src="../../images/loading.gif" alt=""/>
  </div>
</template>

<script>
export default {
  name: "list",
  props: {
    datalist: {
      type: Array,
      // vue规定，对象或数组默认值必须是从一个工厂函数获取。
      default:()=>{
          return []
      }  
    }
  },
  data(){
      return{
        // list:datalist
      }
  }
};
</script>

<style>
.loading{
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
}
.loading img{
    width: 220px;
    height: 145px;
    position: absolute;
    top: calc(50% - 72px);
    left: calc(50% - 110px);
    display: block;

}
</style>
