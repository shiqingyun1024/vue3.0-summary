<template>
  <div class="list" v-loading="loading">
    <ul >
      <li v-for="(item,index) in datalist" :key="index">{{item}}</li>
    </ul>
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
  computed:{
      loading(){
          return this.datalist.length
      }
  },
  mounted(){
      console.log(this.loading);
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
