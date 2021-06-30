import { createStore } from 'vuex'

export default createStore({
  state: {
    list:[
      {
        title:'吃饭',
        complete:false
      },
      {
        title:'睡觉',
        complete:false
      },
      {
        title:'写代码',
        complete:false
      }
    ]
  },
  mutations: {
    // 新增任务
    addTodo(state, payload){
       state.list.push(payload)
    },
    // 删除任务
    delTodo(state, payload){
      state.list.splice(payload,1)
    },
    // 清空已完成任务
    clear(state, payload){
      state.list = payload
    }
  },
  actions: {
  },
  modules: {
  }
})
