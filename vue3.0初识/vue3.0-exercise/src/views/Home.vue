<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <Hello collectionName="Welcome to Your Vue.js + TypeScript App"/>
    <hello2></hello2>
    <hello3></hello3>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Hello from '@/components/hello1.vue'; // @ is an alias to /src
import hello2 from '@/components/hello2.vue'; // @ is an alias to /src
import hello3 from '@/components/hello3.vue'; // @ is an alias to /src

@Options({
  components: {
    Hello,
    hello2,
    hello3
  },
})
export default class Home extends Vue {}
</script>
