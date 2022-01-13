<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <Hello collectionName="Welcome to Your Vue.js + TypeScript App"/>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Hello from '@/components/hello1.vue'; // @ is an alias to /src

@Options({
  components: {
    Hello,
  },
})
export default class Home extends Vue {}
</script>
