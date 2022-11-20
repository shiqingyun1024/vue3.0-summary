import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {resolve} from 'path'

console.log("--------进程--------")
console.log(process.env)
console.log("--------进程npm_config_argv--------")
console.log(process.env.npm_config_argv)
console.log("--------进程argv--------")
console.log(process.argv);
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve:{
    alias:{
      '@':resolve(__dirname,'./src')
    }
  }
})
