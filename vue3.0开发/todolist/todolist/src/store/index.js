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
  },
  actions: {
  },
  modules: {
  }
})
