<template>
  <div class="list" v-loading>
    <ul v-for="item in datalist">
      <li>{{item}}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "list",
  props: {
    datalist: {
      type: Array,
      default: []
    }
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
