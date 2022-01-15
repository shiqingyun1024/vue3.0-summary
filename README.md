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
## 可复用 & 组合

### 组合式 API

#### 什么是组合式 API？ 介绍

```
假设我们的应用中有一个显示某个用户的仓库列表的视图。此外，我们还希望有搜索和筛选功能。实现此视图组件的代码可能如下所示：
// src/components/UserRepositories.vue

export default {
  components: { RepositoriesFilters, RepositoriesSortBy, RepositoriesList },
  props: {
    user: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      repositories: [], // 1
      filters: { ... }, // 3
      searchQuery: '' // 2
    }
  },
  computed: {
    filteredRepositories () { ... }, // 3
    repositoriesMatchingSearchQuery () { ... }, // 2
  },
  watch: {
    user: 'getUserRepositories' // 1
  },
  methods: {
    getUserRepositories () {
      // 使用 `this.user` 获取用户仓库
    }, // 1
    updateFilters () { ... }, // 3
  },
  mounted () {
    this.getUserRepositories() // 1
  }
}

之前使用 (data、computed、methods、watch) 组件选项来组织逻辑通常都很有效。然而，当我们的组件开始变得更大时，逻辑关注点的列表也会增长。
尤其对于那些一开始没有编写这些组件的人来说，这会导致组件难以阅读和理解。
问题点：这种碎片化使得理解和维护复杂组件变得困难。选项的分离掩盖了潜在的逻辑问题。此外，在处理单个逻辑关注点时，我们必须不断地“跳转”相关代码的选项块。
如果能够将同一个逻辑关注点相关代码收集在一起会更好。而这正是组合式 API 使我们能够做到的。=== 这就是组合式API的由来。

组合式API基础
既然我们知道了为什么，我们就可以知道怎么做。为了开始使用组合式API，我们首先需要一个可以实际使用它的地方。在Vue组件中，我们将此位置称为 setup 。

setup组件选项
新的setup选项在组件创建之前执行，一旦props被解析，就将作为组合式API的入口。
注意：在setup中你应该避免使用this，因为它不会找到组件实例。setup的调用发生在data property、computed property或者 methods被解析之前，
所以它们无法在setup中被获取。

setup选项是一个接收props和context的函数，我们将在之后进行讨论。此外，我们将setup返回的所有内容都暴露给组件的其余部分（计算属性、方法、生命周期钩子等等）
以及组件的模板。

让我们把setup添加到组件中：

// src/components/UserRepositories.vue

export default {
  components: { RepositoriesFilters, RepositoriesSortBy, RepositoriesList },
  props: {
    user: {
      type: String,
      required: true
    }
  },
  setup(props){
      console.log(props) // { user: '' }

      return {} // 这里返回的任何内容都可以用于组件的其余部分
  }
  // 组件的“其余部分”
}

现在让我们从提取第一个逻辑关注点开始（在原始代码段中标记为'1'）。
1.从假定的外部API获取该用户的仓库，并在用户有任何更改时进行刷新

我们将从最明显的部分开始：
- 仓库列表
- 更新仓库列表的函数
- 返回列表和函数，以便于其他组件选项可以对它们进行访问

// src/components/UserRepositories.vue `setup` function
import { fetchUserRepositories } from '@/api/repositories'

// 在我们的组件内
setup (props) {
   let repositories = []
   const getUserRepositories = async () => {
       repositories = await fetchUserRepositories(props.user)
   }

   return {
       repositories,
       getUserRepositories  // 返回的函数与方法的行为相同
   }
}

这是我们的出发点，但是它无法生效，因为repositories变量是非响应式的。这意味着从用户的角度来看，藏仓库列表始终为空。让我们来解决这个问题！

带ref的响应式变量 (疑问点：ref的原理是什么？为什么能够实现响应式？)
在Vue3.0中，我们可以通过一个新的ref函数使任何响应式变量在任何地方起作用，如下所示：
import { ref } from 'vue'

const counter = ref(0)

ref 接收参数并将其包裹在一个带有value property的对象中返回，然后可以使用该property访问或更改响应式变量的值：
import { ref } from 'vue'
const counter = ref(0)
console.log(counter) // {value:0}
console.log(counter.value) // 0

counter.value++
console.log(counter.value) // 1

将值封装在一个对象中，看似没有必要，但是为了保持JavaScript中不同数据类型的行为统一，这是必须的。这是因为在JavaScript中，
Number 或 String等基本类型是通过值而非引用传递的：
按引用传递与按值传递
在任何值周围都有一个封装对象，这样我们就可以在整个应用中安全地传递它，而不必担心在某个地方是去它的响应式。
换句话说，ref为我们的值创建了一个响应式引用。在整个组合式API中会经常使用引用的概念。
回到我们的例子，让我们创建一个响应式的repositories变量：

// src/components/UserRepositories.vue `setup` function
import { fetchUserRepositories } from '@/api/repositories'
import { ref } from 'vue'

// 在我们的组件内
setup (props) {
   const repositories = ref([])
   const getUserRepositories = async () => {
       repositories.value = await fetchUserRepositories(props.user)
   }

   return {
       repositories,
       getUserRepositories  // 返回的函数与方法的行为相同
   }
}
完成！现在，每当我们调用 getUserRepositories时，repositories都将发生变化，视图也会更新以反映变化。
我们的组件现在应该如下表示：

// src/components/UserRepositories.vue
import { fetchUserRepositories } from '@/api/repositories'
import { ref } from 'vue'

export default {
    components: { RepositoriesFilters, RepositoriesSortBy, RepositoriesList },
    props: {
        user: {
            type: String,
            required: true
        }
    },
    setup (props) {
        const repositories = ref([])
        const getUserRepositories = async () => {
            repositories.value = await fetchUserRepositories(props.user)
        }

        return {
            repositories,
            getUserRepositories  // 这个方法return出去之后， 在外面也是可以使用的，在watch和mounted里面
        }

    },
    data () {
        return {
            filters: { ... }, // 3
            searchQuery: '' // 2
        }
    },
    computed: {
        filteredRepositories () { ... }, // 3
        repositoriesMatchingSearchQuery () { ... }, // 2
    },
    watch: {
      user: 'getUserRepositories' // 1
    },
    methods: {
       updateFilters () { ... }, // 3
    },
    mounted () {
      this.getUserRepositories() // 1
    }
}

我们已经将第一个逻辑关注点中的几个部分移到了setup方法中，它们彼此非常接近。剩下的就是在mounted钩子中调用getUserRepositories，并设置一个监听器，
以便于在user prop发生变化时执行此操作。

我们将从生命周期钩子开始。

在setup内注册生命周期钩子（**注意：Vue导出的几个新函数**）
为了使组合式API的功能和选项式API一样完整，我们还需要一种在setup中注册生命周期钩子的方法。
这要归功于Vue导出的几个新函数。组合式API上的生命周期钩子与选项式API的名称相同，但前缀为on: 即mounted看起来会像 onMounted 。
这些函数接受一个回调，当钩子被组件调用时，该回调将被执行。

让我们将其添加到 setup 函数中：

// src/components/UserRepositories.vue `setup` function
import { fetchUserRepositories } from '@/api/repositories'
import { ref, onMounted } from 'vue'

// 在我们的组件中
setup (props) {
    const repositories = ref([])
    const getUserRepositories = async () => {
        repositories.value = await fetchUserRepositories(props.user)
    }

    onMounted(getUserRepositories) // 在'mounted'时调用'getUserRepositories'

    return {
        repositories,
        getUserRepositories
    }
}
现在我们需要对user prop的变化做出反应。为此，我们将使用独立的watch函数。

## watch 响应式更改

就像我们在组件中使用watch选项并在user property上设置侦听器一样，我们也可以使用从Vue导入的watch函数执行相同的操作。它接受3个参数：
- 一个想要侦听的响应式引用或getter函数
- 一个回调
- 可选的配置选项

下面让我们快速了解一下它是如何工作的
import { ref, watch } from 'vue'
const counter = ref(0)
watch(counter,(newValue,oldValue)=>{
    console.log('The new counter value is:' + counter.value)
})
每当 counter 被修改时，例如 counter.value=5，侦听将触发并执行回调（第二个参数），在本例中，
它将把'The new counter value is:5' 记录到控制台中。
以下是等效的选项式API：
export default {
    data() {
        return {
            counter:0
        }
    },
    watch: {
        counter(newValue,oldValue){
            console.log('The new counter value is:' + this.counter)
        }
    }
}
有关watch的详细信息，请参阅深入指南。

现在我们将其应用到我们的示例中：
// src/components/UserRepositories.vue `setup` function
import { fetchUserRepositories } from '@/api/repositories'
import { ref, onMounted, watch, toRefs } from 'vue'

// 在我们组件中
setup (props) {
  // 使用'toRefs'创建对’props‘中的’user‘property的响应式引用
  const { user } = toRefs(props)

  const repositories = ref([])
  const getUserRepositories = async () => {
    // 更新’prop.user‘到’user.value‘访问引用值
    repositories.value = await fetchUserRepositories(user.value) // 原先传入的值为props.user
  }
  
  // vue暴露出来的生命周期钩子函数
  onMounted(getUserRepositories)

  // 在user prop的响应式引用上设置一个侦听器
  watch(user,getUserRepositories)

  return {
    repositories,
    getUserRepositories
  }
}

你可能已经注意到我们的setup的顶部使用了toRefs。这是为了确保我们的侦听器能够根据user prop的变化做出反应。

有了这些变化，我们就把第一个逻辑关注点移到了一个地方。我们现在可以对第二个关注点执行相同的操作---基于searchQuery进行过滤，
这次是使用计算属性。

## 独立的 computed 属性
与ref和watch类似，也可以使用从Vue导入的computed函数在Vue组件外部创建计算属性。
让我们回到counter的例子：
import { ref,computed } from 'vue'

const counter = ref(0)
const twiceTheCounter = computed(() => counter.value * 2)

counter.value++
console.log(counter.value) // 1
console.log(twiceTheCounter.value) // 2  **注意点：使用computed计算属性返回的值要用value。

这里我们给computed函数传递了第一个参数，它是一个类似getter的回调函数，输出的是一个只读的
响应式引用（**注意点**）。为了访问新创建的计算变量value，我们需要像ref一样使用.value property。 （**注意点**）

让我们将搜索功能移到setup中：
// src/components/UserRepositories.vue `setup` function
import { fetchUserRepositories } from '@/api/repositories'
import { ref, onMounted, watch, toRefs, computed } from 'vue'

// 在我们的组件中
setup (props) {
  // 使用’toRefs‘创建对props中的’user‘ property的响应式引用
  const { user } = toRefs(props)

  const repositories = ref([])
  const getUserRepositories = async () => {
    // 更新’props.user‘到’user.value‘访问引用值
    repositories.value = await fetchUserRepositories(user.value)
  }

  // onMounted这个钩子函数是从vue中导出的方法，所以可以直接使用。
  onMounted(getUserRepositories)

  // 在user prop的响应式引用上设置一个侦听器
  watch(user,getUserRepositories)

  const searchQuery = ref('')
  const repositoriesMatchingSearchQuery = computed(() => {
     return repositories.value.filter(
        repository => repository.name.includes(searchQuery.value)
     )
  })

  return {
    repositories,
    getUserRepositories,
    searchQuery,
    repositoriesMatchingSearchQuery
  }
}

对于其他的逻辑关注点我们也可以做，但是你可能已经在问这个问题了----这不就是把代码移到
setup 选项并使它变得非常大吗？嗯，确实是这样的。这就是为什么我们要在继续其他任务之前，我们
首先要将上述代码提取到一个独立的组合式函数中。让我们从创建 useUserRepositories函数开始：
// src/composables/useUserRepositories.js
import { fetchUserRepositories } from '@/api/repositories'
import { ref, onMounted, watch } from 'vue'

export default function useUserRepositories(user) {
  const repositories = ref([])
  const getUserRepositories = async () => {
    repositories.value = await fetchUserRepositories(user.value)
  }

  onMounted(getUserRepositories)
  watch(user,getUserRepositories)

  return {
    repositories,
    getUserRepositories
  }
}

然后是搜索功能
// src/composables/useRepositoryNameSearch.js
import { ref, computed } from 'vue'

export default function useRepositoryNameSearch(repositories) {
   const searchQuery = ref('')
   const repositoriesMatchingSearchQuery = computed(()=>{
     return repositories.value.filter(repository=>{
       return repository.name.includes(searchQuery.value)
     })
   })

   return {
     searchQuery,
     repositoriesMatchingSearchQuery
   }
}

现在我们有了两个单独的功能模块，接下来就可以开始在组件中使用它们了。以下是如何做到这一点：
// src/components/UserRepositories.vue
import useUserRepositories from '@/composables/useUserRepositories'
import useRepositoryNameSearch from '@/composables/useRepositoryNameSearch'
import { toRefs } from 'vue'

export default {
  components: { RepositoriesFilters, RepositoriesSortBy, RepositoriesList },
  props: {
    user: {
      type: String,
      required: true
    }
  },
  setup(props){
    const { user } = toRefs(props)

    const { repositories,getUserRepositories } = useUserRepositories(user)

    const { searchQuery, repositoriesMatchingSearchQuery} = useRepositoryNameSearch(repositories)

    return {
      // 因为我们并不关心未经过滤的仓库
      // 我们可以在’repositories‘名称下暴露过滤后的结果
      repositories:repositoriesMatchingSearchQuery,
      getUserRepositories,
      searchQuery
    }
  },
  data (){
    return {
      filters: {...}, // 3
    }
  },
  computed:{
    filteredRepositories() {...}, // 3
  },
  methods: {
    updateFilters(){...}, // 3
  }
}

此时，你可能已经知道了其中的奥妙，所以让我们跳到最后，迁移剩余的过滤功能。我们不需要深入了解
实现细节，因为这并不是本指南的重点。

// src/components/UserRepositories.vue
import { toRefs } from 'vue'
import useUserRepositories from '@/composables/useUserRepositories'
import useRepositoryNameSearch from '@/composables/useRepositoryNameSearch'
import useRepositoryFilters from '@/composables/useRepositoryFilters'

export default {
  components: { RepositoriesFilters, RepositoriesSortBy, RepositoriesList },
  props: {
    user: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { user } = toRefs(props)

    const { repositories, getUserRepositories } = useUserRepositories(user)

    const {
      searchQuery,
      repositoriesMatchingSearchQuery
    } = useRepositoryNameSearch(repositories)

    const {
      filters,
      updateFilters,
      filteredRepositories
    } = useRepositoryFilters(repositoriesMatchingSearchQuery)

    return {
      // 因为我们并不关心未经过滤的仓库
      // 我们可以在 `repositories` 名称下暴露过滤后的结果
      repositories: filteredRepositories,
      getUserRepositories,
      searchQuery,
      filters,
      updateFilters
    }
  }
}

我们完成了！

请记住，我们只触及了组合式 API 的表面以及它允许我们做什么。要了解更多信息，请参阅深入指南。

```

#### Setup
```
参数

使用setup函数时，它将接收两个参数：
1. props
2. context
让我们更深入地研究如何使用每个参数。

## props
setup函数中的第一个参数是props。正如在一个标准组件中所期望的那样，setup函数中的props是响应式的，
当传入新的prop时，它将被更新。（**注意点：props是第一个参数，而且是响应式的。**）

// MyBook.vue
export default {
  props: {
    title: String
  },
  setup(props){
    console.log(props.title)
  }
}
**警告：但是，因为props是响应式的，你不能使用ES6解构，它会消除prop的响应性。**
如果需要解构prop，可以在setup函数中使用toRefs函数来完成此操作：

// MyBook.vue
import { toRefs } from 'vue'
export default {
  props: {
    title:String
  },
  setup(props){
    const {title } = toRefs(props)
    console.log(title.value)  // **注意点：使用toRefs包裹之后，解构赋值之后的值使用时要用.value**
  }
}

如果title是可选的prop，则传入的props中可能没有title。在这种情况下，toRefs将不会为title创建一个ref。
你需要使用toRef替代它：

// MyBook.vue
import { toRef } from 'vue'
setup(props){
  const title = toRef(props,title) // **注意点：toRef和toRefs的使用的区别和场景。**
  console.log(title.value)
}
** 个人补充点：toRef和toRefs的使用的区别和场景**
****
## toRef

可以用来为源响应式对象上的某个property新建一个ref。然后，ref可以被传递，它会保持对其源property的响应式连接。
const state = reactive({
  foo:1,
  bar:2
})
const fooRef = toRef(state,'foo')
fooRef.value++
console.log(state.foo) // 2

state.foo++
console.log(fooRef.value) // 3

当你要将props的ref传递给复合函数时，toRef很有用：
export default {
  setup(props){
    useSomeFeature(toRef(props,'foo'))
  }
}
即使源property不存在，toRef也会返回一个可用的ref。这使得它在使用可选prop时特别有用，
可选prop并不会被toRefs处理。

## toRefs
将响应式对象转换为普通对象，其中结果对象的每个property都是指向原始对象相应property的ref。
const state = reactive({
  foo:1,
  bar:2
})
const stateAsRefs = toRefs(state)
/*
stateAsRefs的类型：
{
  foo:Ref<number>,
  bar:Ref<number>
}
*/
// ref和原始property已经“链接”起来了
state.foo++
console.log(stateAsRefs.foo.value) // 2

stateAsRefs.foo.value++
console.log(state.foo) // 3

当从组合式函数返回响应式对象时，toRefs非常有用，这样消费组件就可以在不丢失响应性的情况下对返回的对象进行解构/展开：
function useFeatureX(){
  const state = reactive({
    foo:1,
    bar:2
  })

  // 操作state的逻辑
  // 返回时转换为ref
  return toRefs(state)
}

export default {
  setup(){
    // 可以在不失去响应性的情况下解构
    const { foo,bar } = useFeatureX()

    return {
      foo,
      bar
    }
  }
}

toRefs只会为源对象中包含的property生成ref（**注意：如果源对象中没有，那就没法生成**）。
如果要为特定的property创建ref，则应当使用toRef
****

## Context
传递给setup函数的第二个参数是context。context是一个普通JavaScript对象，暴露了其它
可能在setup中有用的值：

// MyBook.vue
export default {
  setup(props,context) {
    // Attribute (非响应式对象，等同于$attrs)
    console.log(context.attrs)

    // 插槽（非响应式对象，等同于$slots）
    console.log(context.slots)

    // 触发事件（方法，等同于$emit）
    console.log(context.emit)

    // 暴露公共property（函数）
    console.log(context.expose)
  }
}

context是一个普通的JavaScript对象，也就是说，它不是响应式的，这意味着你可以安全地对
context使用ES6解构。

// MyBook.vue
export default {
  setup(props, {attrs, slots, emit, expose}){

  }
}

attrs和slots是有状态的对象，它们总是会随组件本身的更新而更新。这意味着你应该避免对它们
进行解构，并始终以attrs.x或slots.x的方式引用property。请注意，与props不同，attrs和
slots的property是非响应式的。如果你打算根据attrs或者slots的更改应用副作用，那么应该在
onBeforeUpdate生命周期钩子中执行此操作。

我们将在稍后解释expose所扮演的角色。

## 访问组件的property

执行setup时，组件实例尚未被创建。因此，你只能访问以下property：
- props
- attrs
- slots
- emit

换句话说，你将无法访问以下组件选项：
- data
- computed
- methods
- refs（模板ref）

**注意点：这个时候要注意生命周期钩子函数执行的顺序。**

## 结合模板使用

如果setup返回一个对象，那么该对象的property以及传递给setup的props参数中的
property就都可以在模板中访问到：

<!-- MyBook.vue -->
<template>
  <div>{{collectionName}}: {{readersNumber}} {{book.title}}</div>
</template>
<script>
    import { ref, reactive } from 'vue'

    export default {
      props: {
        collectionName: String
      },
      setup(props){
        const readersNumber = ref(0)
        const book = reactive({title:'Vue 3 Guide'})

        // 暴露给 template
        return {
          readersNumber,
          book
        }
      }
    }
</script>

注意，从setup返回的refs在模板中访问时是被自动浅解包的，因此不应在模板中使用.value

## 使用渲染函数
setup 还可以返回一个渲染函数，该函数可以直接使用在同一作用域中声明的响应式状态：

// MyBook.vue
import { h, ref, reactive } from 'vue'

export default {
  setup() {
    const readersNumber = ref(0)
    const book = reactive({ title: 'Vue 3 Guide'})
    // 请注意这里我们需要显示使用ref的value
    return () => h('div', [readersNumber.value, book.title])
  }
}
**注意点：关于渲染函数h里面的写法，目前我还不熟悉，需要好好梳理一下。**
****
关于渲染函数h的理解：
h函数就是vue中的createElement方法，这个函数作用就是创建虚拟dom，追踪dom变化的。
function h(tag,props,...children){//h函数，返回一个虚拟dom对象
    return {
        tag,
        props:props || {},
        children:children.flat()//扁平化数组，降至一维数组
    }
}

createElment参数（也就是h函数）：

我们还是以官方文档的解释来讲，createElment函数接受三个参数，分别是：

     参数一：tag（标签名）、组件的选项对象、函数（必选）；

     参数二：一个对象，标签的属性对应的数据（可选）；

     参数三：子级虚拟节点，字符串形式或数组形式，子级虚拟节点也需要使用createElement构建。

// main.jsx
function getVDOM(){
  return (
    <div id="app">
       <p nameProperty="vue">my name is vue</p>
    </div>
  )
}
如果要用h函数来写上面的内容：
function getVDOM(){
  return h(
    "div",
    {id:"app"},
    h("p",
    {className:"text"},
    "hello world!!!"
    )
  )
}
****

返回一个渲染函数将阻止我们返回任何其它的东西。从内部来说这不应该成为一个问题，但当我们想要将
这个组件的方法通过模板ref暴露给父组件时就不一样了。

我们可以通过调用expose(它可以通过对context的解构赋值来得到)来解决这个问题，给它传递一个对象，其中定义的property将可以被外部组件
实例访问：

import { h, ref } from 'vue'
export default {
  setup(props, { expose }){
    const count = ref(0)
    const increment = () => ++count.value

    expose({
      increment
    })
    return () => h('div', count.value)
  }
}

这个increment方法现在将可以通过父组件的模板ref访问。
（**注意：意思就是在父组件中引入上面写的这个子组件时，在父组件中的模板中通过在子组件中设置ref属性，然后在父组件中就可以
通过ref来代表子组件，并可以使用expose暴露出来的方法。
**）

## 使用 this
在setup() 内部，this不是该活跃实例的引用，因为setup()是在解析其它组件选项之前被调用的，所以setup()内部的this的行为
与其它选项中的this完全不同。这使得setup()在和其它选项式 API 一起使用时可能会导致混淆。
```
#### 生命周期钩子
```
你可以通过在生命周期钩子加上“on”来访问组件的生命周期钩子。
选项式API         Hook inside （setup）
beforeCreate     Not needed
created          Not needed
beforeMount      onBeforeMount
mounted          onMounted
beforeUpdate     onBeforeUpdate
updated          onUpdated
beforeUnmount    onBeforeUnmount
unmounted        onUnmounted
errorCaptured    onErrorCaptured
renderTracked    onRenderTracked
renderTriggered  onRenderTriggered
activated        onActivated
deactivated      onDeactivated

**注意：因为setup是围绕beforeCreate 和 created 生命周期钩子运行的，所以不需要显式地定义它们。换句话说，
在这些钩子中编写的任何代码都应该直接在setup函数中编写。**

这些函数接受一个回调函数，当钩子被组件调用时将会被执行：
// MyBook.vue
export default {
  setup() {
    // mounted
    onMounted(()=>{
      console.log('Component is mounted')
    })
  }
}

```
#### Provide/Inject
```
我们也可以在组合式API中使用Provide/Inject。两者都只能在当前活动实例的setup()期间调用。

## 设想场景
假设我们要重写以下代码，其中包括一个MyMap组件，该组件使用组合式API为MyMarker组件提供
用户的位置。

<!-- src/components/MyMap.vue -->
<template>
  <MyMarker/>
</template>
<script>
import MyMarker from './MyMarker.vue'

export default {
  components: {
    MyMarker
  },
  provide: {
    location: 'North pole',
    geolocation: {
      longitude: 90,
      latitude: 135
    }
  }
}
</script>

<!-- src/components/MyMarker.vue -->
<script>
export default {
  inject: ['location', 'geolocation']
}
</script>

## 使用 Provide

在setup() 中使用provide时，我们首先从vue显式导入 provide 方法，这使我们能够调用
provide来定义每个Property。
```

#### 组合式 API 基础

```

```


