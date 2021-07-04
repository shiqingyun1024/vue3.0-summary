# vue3.0-summary
vue3.0相关的总结

### vite
### vue设计理念、源码分析
```
 1.函数式：类型支持更好，ts
 2.标准化、简化、一致性：render函数，sync修饰符删除，指令定义，v-model调整
 3.tree-shaking
 4.复用性：composition api
 5.性能优化：响应式、编译期优化
 6.扩展性：自定义渲染器

 mount的目标是什么？
 需要将组件配置解析为dom
```
### vue3.0和vue2.x的区别介绍
```
. vue3源码采用monorepo方式进行管理，将模块拆分到package目录中
. vue3采用ts开发，增强类型检测。vue2则采用flow
. vue3的性能优化，支持tree-shaking，不使用就不会被打包
. vue2后期引入RFC，使每个版本改动可控rfcs
```
#### vue3 内部代码优化有哪些
```
. vue3劫持数据采用proxy，vue2劫持数据采用defineProperty。defineProperty有性能问题和缺陷
. vue3中对模板编译进行了优化，编译时生成了Block tree，可以对子节点的动态节点进行收集，可以减少比较，并且采用了patchFlag标记动态节点
. vue3采用compositionApi进行组织功能，解决反复横跳，优化复用逻辑（mixin带来的数据来源不清晰，命名冲突等），相比optionsApi类型推断更加方便。
. 增加了Fragment，Teleport，Suspense组件
.
.
```
### 指令
```
// 注册一个全局自定义指令 `v-focus`
Vue.directive('focus', {
  // 当被绑定的元素插入到 DOM 中时……
  inserted: function (el) {
    // 聚焦元素
    el.focus()
  }
})
```
### props
```
对象或数组默认值必须从一个工厂函数获取
props: {
    // 必填的字符串
    propC: {
      type: String,
      required: true
    },
    // 带有默认值的数字
    propD: {
      type: Number,
      default: 100
    },
    // 带有默认值的对象
    propE: {
      type: Object,
      // 对象或数组默认值必须从一个工厂函数获取
      default: function () {
        return { message: 'hello' }
      }
    },
    // 带有默认值的对象
    propE: {
      type: Array,
      // 对象或数组默认值必须从一个工厂函数获取
      default: function () {
        return []
      }
    },
  }
```


