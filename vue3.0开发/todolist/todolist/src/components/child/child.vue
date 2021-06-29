<template>
<div class="child">
  <h3>这是child组件</h3>
  <p>这是父组件传过来的数据：{{msg}}</p>
  <button @click="send">传值给父组件</button>
</div>
</template>
<script>
import {defineComponent,ref} from 'vue'
export default defineComponent({
    name:'child',
    props:{
        msg:{
            type:String,
            // 是否必传 默认是false
            required:false,
            default:''
        }
    },
    setup(props,ctx){
        let childMsg = ref("我是子组件的数据")
        console.log(props.msg);
        let send = () =>{
            // ctx相当于this，上下文作用域 通过ctx.emit分发事件
        }
        
    }

})
</script>