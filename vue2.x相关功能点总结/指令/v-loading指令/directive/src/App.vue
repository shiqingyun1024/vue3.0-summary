<template>
  <div id="app">
    <list :datalist="datalist"></list>
  </div>
</template>

<script>
import list from './components/list'
export default {
  name: 'App',
  components: {
    list
  },
  data(){
    return {
      datalist:[
        '有的情况下，你仍然需要对普通 DOM 元素进行底层操作，这时候就会用到自定义指令',
        '有的情况下，你仍然需要对普通 DOM 元素进行底层操作，这时候就会用到自定义指令',
        '有的情况下，你仍然需要对普通 DOM 元素进行底层操作，这时候就会用到自定义指令',
        '有的情况下，你仍然需要对普通 DOM 元素进行底层操作，这时候就会用到自定义指令',
        '有的情况下，你仍然需要对普通 DOM 元素进行底层操作，这时候就会用到自定义指令',
        '有的情况下，你仍然需要对普通 DOM 元素进行底层操作，这时候就会用到自定义指令',
        '有的情况下，你仍然需要对普通 DOM 元素进行底层操作，这时候就会用到自定义指令',
        '有的情况下，你仍然需要对普通 DOM 元素进行底层操作，这时候就会用到自定义指令',
        '有的情况下，你仍然需要对普通 DOM 元素进行底层操作，这时候就会用到自定义指令',
        '有的情况下，你仍然需要对普通 DOM 元素进行底层操作，这时候就会用到自定义指令',
      ]
    }
  },
  methods:{

  }
}
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
