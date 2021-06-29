<template>
<div class="child">
  <h3>这是child组件</h3>
  <p>这是父组件传过来的数据：{{msg}}</p>
  <button @click="send">传值给父组件</button>
</div>
</template>
<script>
import {defineComponent,ref,onMounted} from 'vue'
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
        let childNum = ref(10)
        console.log(props.msg);
        let send = () =>{
            // ctx相当于this，上下文作用域 通过ctx.emit分发事件
            // emit第一个参数是事件名称，第二个是传递的数据
            ctx.emit('send',{msg:childMsg.value,num:childNum.value})
        }
        onMounted(()=>{
            // 如果传递多个参数，可以使用数组或者对象
            ctx.emit('send',[childMsg.value,childNum.value])
        })
        return{
            childMsg,
            send
        }
        
    }

})
</script>