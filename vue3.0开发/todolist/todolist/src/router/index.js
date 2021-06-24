import { createRouter, createWebHistory } from 'vue-router'
import Start from '../views/Start.vue'

// 路由的配置
// path：路由路径 必须以/开头  url跳转时的路径  必填的属性
// component：对应的路由组件 也就是跳转到哪个页面需要加载对应的组件 必填的属性
// name：路由名字 可选属性
const routes = [
  //  /代表首页，所以需要把Home组件引入进来，其他的路由组件可以按需加载（节省首屏加载时间，按需加载，节省了性能）。
  {
    path: '/',
    name: 'Start',
    component: Start
  },
  {
    path: '/Home',
    name: 'Home',
    // 懒加载，也可以称之为按需加载
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // webpackChunkName: "about"指的是这个组件被打包之后的名字
    component: () => import(/* webpackChunkName: "about" */ '../views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    // 懒加载，也可以称之为按需加载
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // webpackChunkName: "about"指的是这个组件被打包之后的名字
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

// createRouter创建路由对象，可以对比一下之前的router的用法 new Router
const router = createRouter({
  // history模式
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
