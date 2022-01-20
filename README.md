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

vue2.X中生命周期钩子函数所做的事情（和vue3.0对比一下）：

    1、beforeCreate：在实例初始化之后，**数据观测(data observer) ** 和 event/watcher事件配置 之前被调用，注意是 之前，此时data、watcher、methods统统滴没有。
    这个时候的vue实例还什么都没有，但是$route对象是存在的，可以根据路由信息进行重定向之类的操作。

    2、created：在实例已经创建完成之后被调用。在这一步，实例已完成以下配置：数据观测(data observer) ，属性和方法的运算， watch/event 事件回调。然而，挂载阶段还没开始，$el属性目前不可见。
    此时 this.$data 可以访问，watcher、events、methods也出现了，若根据后台接口动态改变data和methods的场景下，可以使用。

    3、beforeMount：在挂载开始之前被调用，相关的 render 函数 首次被调用。但是render正在执行中，此时DOM还是无法操作的。我打印了此时的vue实例对象，相比于created生命周期，此时只是多了一个$el的属性，然而其值为undefined。
    使用场景我上文已经提到了，页面渲染时所需要的数据，应尽量在这之前完成赋值。

    4、mounted：在挂载之后被调用。在这一步 创建vm.$el并替换el，并挂载到实例上。（官方文档中的 “如果root实例挂载了一个文档内元素，当mounted被调用时vm.$el也在文档内” 这句话存疑）
    此时元素已经渲染完成了，依赖于DOM的代码就放在这里吧~比如监听DOM事件。

    5、beforeUpdate：$vm.data更新之后，虚拟DOM重新渲染 和打补丁之前被调用。
    你可以在这个钩子中进一步地修改$vm.data，这不会触发附加的重渲染过程。

    6、updated：虚拟DOM重新渲染 和打补丁之后被调用。
    当这个钩子被调用时，组件DOM的data已经更新，所以你现在可以执行依赖于DOM的操作。但是不要在此时修改data，否则会继续触发beforeUpdate、updated这两个生命周期，进入死循环！

    7、beforeDestroy：实例被销毁之前调用。在这一步，实例仍然完全可用。
    实例要被销毁了，赶在被销毁之前搞点事情吧哈哈~

    8、destroyed：Vue实例销毁后调用。此时，Vue实例指示的所有东西已经解绑定，所有的事件监听器都已经被移除，所有的子实例也已经被销毁。
    这时候能做的事情已经不多了，只能加点儿提示toast之类的东西吧。

注：beforeMount、mounted、beforeUpdate、updated、beforeDestroy、destroyed这几个钩子函数，在服务器端渲染期间不被调用。

```
#### 对于Provide/Inject的认识和了解
```
通常，当我们需要从父组件向子组件传递数据时，我们使用props。想象一下这样的结构：有一些深度嵌套的组件，而深层的子组件只需要父组件的部分内容。在这种情况下，如果仍然将prop沿着组件链逐级传递下去，可能会很麻烦。

对于这种情况，我们可以使用一对provide和inject。无论组件层次结构有多深，父组件都可以作为其所有子组件的依赖提供者。这个特性有两个部分：父组件有一个provide选项来提供数据，子组件有一个inject选项来开始使用这些数据。
例如，我们有这样的层次结构：
Root
  |
TodoList
  |
TodoListFooter   TodoItem
  |
ClearTodosButton  TodoListStatistics

如果要将todo-items的长度直接传递给TodoListStatistics，我们要将prop逐级传递下去：
TodoList -> TodoListFooter -> TodoListStatistics。通过Provide/Inject的方式，我们可以直接执行以下操作：

const app = Vue.createApp({})
app.component('todo-list',{
  data() {
    return {
      todos:['Feed a cat', 'Buy tickets']
    }
  },
  provide:{
    user:'John Doe'
  },
  template:`
    <div>
      {{todos.length}}
      <!-- 模板的其余部分 -->
    </div>
  `
})

app.component('todo-list-statistics',{
  inject:['user'],
  created(){
    console.log(`Injected property:${this.user}`) // > 注入的property：John Doe
  }
})

但是，如果我们尝试在此处provide一些组件的实例property，这将不起作用的：**注意：这一点很重要**
app.component('todo-list',{
  data() {
    return {
      todos:['Feed a cat', 'Buy tickets']
    }
  },
  provide:{
    todoLength:this.todos.length  // 将会导致错误'cannot read property ’length‘ of undefined'
  },
  template:`
    <div>
      ....
    </div>
  `
})

要访问组件实例property，我们需要将provide转换为返回对象的函数：**注意：这是对上述报错的解决方案**
app.component('todo-list',{
  data() {
    return {
      todos: ['Feed a cat', 'Buy tickets']
    }
  },
  // **注意：这样就会起作用了**
  provide() {
    return {
      todoLength: this.todos.length
    }
  },
  template:`
    <div>
      ....
    </div>
  `
})

这使我们能够更安全地继续开发该组件，而不必担心可能会更改/删除子组件所依赖的某些内容。这些组件
之间的接口仍然是明确定义的，就像props一样。
实际上，你可以将依赖注入看作是’长距离的prop‘，除了：
- 父组件不需要知道哪些子组件使用了它provide的property
- 子组件不需要知道inject的property来自哪里

## 处理响应式
在上面的例子中，如果我们更改了todos的列表，这个变化并不会反映在inject的todoLength
property中。这是因为默认情况下，provide/inject绑定并不是响应式的。我们可以通过传递一个
ref property或者reactive对象给provide来改变这种行为。在我们的例子中，如果我们相对祖先
组件中的更改做出响应，我们需要为provide的todoLength分配一个组合式API computed property：

app.component('todo-list', {
  // ...
  provide() {
    return {
      todoLength: Vue.computed(() => this.todos.length)
    }
  }
})

app.component('todo-list-statistics', {
  inject: ['todoLength'],
  created() {
    console.log(`Injected property: ${this.todoLength.value}`) // > 注入的 property: 5
  }
})

在这种情况下，任何对 todos.length 的改变都会被正确地反映在注入 todoLength 的组件中。在响应式计算和侦听章节中阅读更多关于 computed 的信息，以及在组合式 API 章节中阅读更多关于 reactive provide/inject 的信息。
```

#### Provide/Inject的深入
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

provide函数允许你通过两个参数定义property：
1. name（<string> 类型）
2. value
使用MyMap组件后，provide的值可以按如下方式重构：
<!-- src/components/MyMap.vue -->
<template>
  <MyMarker />
</template>
<script>
import { provide } from 'vue'
import MyMarker from './MyMarker.vue'

export default {
  components:{
    MyMarker
  },
  setup(){
    provide('location', 'North Pole')
    provide('geolocation', {
      longitude: 90,
      latitude: 135
    })
  }
}
</script>

## 使用inject
在setup() 中使用inject时，也需要从vue显式导入。导入以后，我们就可以调用它来定义暴露给我们的组件方式。
inject函数有两个参数：
1. 要inject的property的name
2. 默认值（可选）

使用MyMarker组件，可以使用以下代码对其进行重构：
<!-- src/components/MyMarker.vue -->
<script>
import { inject } from 'vue'

export default {
  setup() {
    const userLocation = inject('location','The Universe')
    const userGeolocation = inject('geolocation')

    return {
      userLocation,
      userGeolocation
    }
  }
}
</script>

## 响应式

添加响应性
为了增加provide值和inject值之间的响应性，我们可以在provide值时使用ref或reactive。
使用MyMap组件，我们的代码可以更新如下：

<!-- src/components/MyMap.vue -->
<template>
  <MyMarker />
</template>

<script>
import { provide, reactive, ref } from 'vue'
import MyMarker from './MyMarker.vue'

export default {
  components:{
    MyMarker
  },
  setup(){
    const location = ref('North Pole')
    const geolocation = reactive({
      longitude: 90,
      latitude: 135
    })

    provide('location', location)
    provide('geolocation', geolocation)
  }
}
</script>

现在，如果这两个property中有任何更改，MyMarker组件也将自动更新！

## 修改响应式property
当使用响应式provide/inject值时，建议尽可能将对响应式property的所有修改限制在定义provide的组件内部。
例如，也需要更改用户位置的位置下，我们最好在MyMap组件中执行此操作。
<!-- src/components/MyMap.vue -->
<template>
  <MyMarker />
</template>

<script>
import { provide, reactive, ref } from 'vue'
import MyMarker from './MyMarker.vue'

export default {
  components: {
    MyMarker
  },
  setup(){
    const location = ref('North Pole')
    const geolocation = reactive({
      longitude: 90,
      latitude: 135
    })

    provide('location', location)
    provide('geolocation', geolocation)

    return {
      location
    }
  },
  methods: {
    updateLocation() {
      this.location = 'South Pole'
    }
  }
}
</script>

然而，有时我们需要在注入数据的组件内部更新inject的数据。在这种情况下，我们建议provide一个方法
来负责改变响应式property。

<!-- src/components/MyMap.vue -->
<template>
  <MyMarker />
</template>

<script>
import { provide, reactive, ref } from 'vue'
import MyMarker from './MyMarker.vue'

export default {
  components: {
    MyMarker
  },
  setup() {
    const location = ref('North Pole')
    const geolocation = reactive({
      longitude: 90,
      latitude: 135
    })

    const updateLocation = () => {
      location.value = 'South Pole'
    }

    provide('location', location)
    provide('geolocation', geolocation)
    provide('updateLocation', updateLocation)
  }
}
</script>

<!-- src/components/MyMarker.vue -->
<script>
import { inject } from 'vue'

export default {
  setup() {
    const userLocation = inject('location', 'The Universe')
    const userGeolocation = inject('geolocation')
    const updateUserLocation = inject('updateLocation')

    return {
      userLocation,
      userGeolocation,
      updateUserLocation
    }
  }
}
</script>
```

#### 模板引用

```
在使用组合式API时，响应式引用和模板引用的概念是统一的。为了获得对模板内元素或组件实例的引用，
我们可以像往常一样声明ref并从setup()返回：

<template>
   <div ref="root">This is a root element</div>
</template>
<script>
  import { ref, onMounted }  from 'vue'

  export default {
    setup() {
      const root = ref(null)

      onMounted(() =>{
        // DOM 元素将在初始渲染后分配给 ref
        console.log(root.value) // <div>This is a root element</div>
      })

      return {
        root
      }
    }
  }
</script>

这里我们在渲染上下文中暴露root，并通过ref="root",将其绑定到div作为其ref。在虚拟DOM
补丁算法中，如果VNode的ref键对应于渲染上下文中的ref，则VNode的相应元素或组件实例将
被分配给该ref的值。这是在虚拟DOM挂载/打补丁过程中执行的，因此模板引用只会在初始渲染之后
获得赋值。

作为模板使用的ref的行为与任何其他ref一样：它们是响应式的，可以传递到 (或从中返回) 复合函数中。

## JSX中的用法

export default {
  setup() {
    const root  = ref(null)

    return ()=> h('div',{
      ref:root
    })

    // with JSX
    return ()=> <div ref={root} />
  }
}

## v-for中的用法
组合式 API 模板引用在 v-for 内部使用时没有特殊处理。相反，请使用函数引用执行自定义处理：

<template>
  <div v-for="(item, i) in list" :ref="el => { if (el) divs[i] = el }">
    {{ item }}
  </div>
</template>

<script>
  import { ref, reactive, onBeforeUpdate } from 'vue'

  export default {
    setup() {
      const list = reactive([1, 2, 3])
      const divs = ref([])

      // 确保在每次更新之前重置ref
      onBeforeUpdate(() => {
        divs.value = []
      })

      return {
        list,
        divs
      }
    }
  }
</script>

## 侦听模板引用

侦听模板引用的变更可以替代前面例子中演示使用的生命周期钩子。

但与生命周期钩子的一个关键区别是，watch() 和 watchEffect() 在DOM挂载或更新
之前运行副作用，所以当侦听器运行时，模板引用还未被更新。

<template>
   <div></div>
</template>

<script>
  import { ref, watchEffect } from 'vue'

  export default {
    setup() {
      const root = ref(null)

      watchEffect(() => {
        // 这个副作用在 DOM 更新之前运行，因此，模板引用还没有持有对元素的引用。
        console.log(root.value) // => null
      })

      return {
        root
      }
    }
  }
</script>

因此，使用模板引用的侦听器应该用 flush: 'post' 选项来定义，这将在 DOM 更新后运行副作用，确保模板引用与 DOM 保持同步，并引用正确的元素。

<template>
  <div ref="root">This is a root element</div>
</template>

<script>
  import { ref, watchEffect } from 'vue'

  export default {
    setup() {
      const root = ref(null)

      watchEffect(() => {
        console.log(root.value) // => <div>This is a root element</div>
      }, 
      // **注意：使用模板引用的侦听器应该用 flush: 'post' 选项来定义
      // 这将在 DOM 更新后运行副作用，确保模板引用与 DOM 保持同步，并引用正确的元素。**
      {
        flush: 'post'
      })

      return {
        root
      }
    }
  }
</script>
```
#### Mixin
```
## 基础

Mixin提供了一种灵活的方式，来分发Vue组件中的可复用功能。一个mixin对象可以包含任意组件
选项。当组件使用mixin对象时，所有mixin对象的选项将被“混合”进入该组件本身的选项。

例子：
// 定义一个mixin对象
const myMixin = {
  created() {
    this.hello()
  },
  methods:{
    hello(){
      console.log('hello from mixin!')
    }
  }
}

// 定义一个使用此mixin对象的应用
const app = Vue.createApp({
  mixins:[myMixin]
})

app.mount('#mixins-basic') // => "hello from mixin!"

**注意：关于app.mount()的理解如下：**
在Vue构造函数时，需要配置一个el属性，如果没有没有el属性时，可以使用.$mount('#app')进行挂载。
配置了el属性：
new Vue({
  el:"#app",
  router
});
如果没有配置el属性，可以使用手动挂载$mount("#app")
new Vue({
  router
}).$mount('#app');

或者

var vm = new Vue({
   router
});
vm.$mount('#app');

补充知识：Vue手动挂载组件$mount()，实现js插入组件，替换组件。


## 选项合并

当组件和mixin对象含有同名选项时，这些选项将以恰当的方式进行“合并”。
比如，每个mixin可以拥有自己的data函数。每个data函数都会被调用，并将返回结果合并。在数据
的property发生冲突时，会以组件自身的数据为优先。**注意：会以组件自身的数据为优先。**

const myMixin = {
  data() {
    return {
      message: 'hello',
      foo: 'abc'
    }
  }
}

const app = Vue.createApp({
  mixins: [myMixin],
  data() {
    return {
      message: 'goodbye',
      bar: 'def'
    }
  },
  created() {
    console.log(this.$data) // => { messgae: "goodbye", foo: "abc",bar:"def" }
  }
})

同名钩子函数将合并为一个数组，因此都将被调用。另外，mixin对象的钩子将在组件自身钩子之前调用。**注意：mixin对象的钩子将在组件自身钩子之前调用。**

const myMixin = {
  created() {
    console.log('mixin 对象的钩子被调用')
  }
}

const app = Vue.createApp({
  mixins: [myMixin],
  created(){
    console.log('组件钩子被调用')
  }
})

// => mixin 对象的钩子被调用
// => 组件钩子被调用

值为对象的选项，例如 methods、components和directives（指令），将被合并为同一个对象。两个对象
键名冲突时，取组件对象的键值对。

const myMixin = {
  methods:{
    foo() {
      console.log('foo')
    },
    conflicting() {
      console.log('from mixin')
    }
  }
}

const app = Vue.createApp({
  mixins: [myMixin],
  methods: {
    bar() {
      console.log('bar')
    },
    conflicting() {
      console.log('from self')
    }
  }
})

const vm = app.mount('#mixins-basic')
vm.foo() // => "foo"
vm.bar() // => "bar"
vm.conflicting() // => "from self"

## 全局 mixin

你还可以为Vue应用程序全部应用mixin：

const app = Vue.createApp({
  myOption: 'hello!'
})
// 为自定义的选项‘myOption’注入一个处理器。
app.mixin({
  created(){
    const myOption = this.$options.myOption
    if(myOption) {
      console.log(myOption)
    }
  }
})
// 将myOption也添加到子组件中
app.component('test-component',{
  myOption:'hello from component'
})

app.mount('#mixins-global')

// => "hello!"
// => "hello from component!"

大多数情况下，只应当应用于自定义选项，就像上面示例一样。推荐将其作为插件发布，以避免重复应用mixin。

## 自定义选项合并策略
自定义选项在合并时，默认策略为简单地覆盖已有值。如果想让某个自定义选项以自定义逻辑进行合并，
可以在app.config.optionMergeStrategies中添加一个函数。

const app = Vue.createApp({})

app.config.optionMergeStrategies.customOption = (toVal, fromVal) => {
  // return mergedVal
}

合并策略接收在父实例和子实例上定义的该选项的值，分别作为第一个和第二个参数。让我们来检查一下使用 mixin 时，这些参数有哪些：

const app = Vue.createApp({
  custom: 'hello!'
})

app.config.optionMergeStrategies.custom = (toVal, fromVal) => {
  console.log(fromVal, toVal)
  // => "goodbye!", undefined
  // => "hello", "goodbye!"
  return fromVal || toVal
}

app.mixin({
  custom: 'goodbye!',
  created() {
    console.log(this.$options.custom) // => "hello!"
  }
})

如你所见，在控制台中，我们先从 mixin 打印 toVal 和 fromVal，然后从 app 打印。如果存在，我们总是返回 fromVal，
这就是为什么 this.$options.custom 设置为 hello! 最后。让我们尝试将策略更改为始终从子实例返回值：

const app = Vue.createApp({
  custom: 'hello!'
})

app.config.optionMergeStrategies.custom = (toVal, fromVal) => toVal || fromVal

app.mixin({
  custom: 'goodbye!',
  created() {
    console.log(this.$options.custom) // => "goodbye!"
  }
})

## 不足
在 Vue 2 中，mixin 是将部分组件逻辑抽象成可重用块的主要工具。但是，他们有几个问题：

Mixin 很容易发生冲突：因为每个 mixin 的 property 都被合并到同一个组件中，所以为了避免 property 名冲突，你仍然需要了解其他每个特性。

可重用性是有限的：我们不能向 mixin 传递任何参数来改变它的逻辑，这降低了它们在抽象逻辑方面的灵活性。

为了解决这些问题，我们添加了一种通过逻辑关注点组织代码的新方法：组合式 API。

**注意：mixin自定义选项合并策略在实际项目中我还没用到过，应用场景需要多注意。**
```

#### 自定义指令
```
## 简介
除了核心功能默认内置的指令（例如 v-model和v-show），Vue也允许注册自定义指令。注意，在Vue中，
代码复用和抽象的主要形式是组件。然而，有的情况下，你仍然需要对普通DOM元素进行底层操作，这时候
就会用到自定义指令。举个聚焦输入框的例子，如下：

当页面加载时，该元素将获得焦点 (注意：autofocus 在移动版 Safari 上不工作)。事实上，如果你在打开这个页面后还没有点击过任何内容，
那么此时这个输入框就应当处于聚焦状态。此外，你可以单击 Rerun 按钮，输入框将被聚焦。

现在让我们用指令来实现这个功能：
const app = Vue.createApp({})
// 注册一个全局自定义指令：’v-focus‘
app.directive('focus',{
  // 当被绑定的元素挂载到DOM中时.....
  mounted(el){
    // 聚焦元素
    el.focus()
  }
})

如果想注册局部指令，组件中也接受一个directives的选项：
directives: {
  focus: {
    // 指令的定义
    mounted(el) {
      el.focus()
    }
  }
}
然后你可以在模板中任何元素上使用新的v-focus  attribute,如下：
<input v-focus />

钩子函数
一个指令定义对象可以提供如下几个钩子函数（均为可选）：

- created：在绑定元素的attribute或事件监听器被应用之前调用。在指定需要附加在普通的v-on
事件监听器调用前的事件监听器中时，这很有用。

- beforeMount：当指令第一次绑定到元素并且在挂载父组件之前调用。

- mounted：在绑定元素的父组件被挂载前调用。

- beforeUpdate：在更新包含组件的VNode之前调用。

提示：我们会在稍后讨论渲染函数时介绍更多VNodes的细节。

- updated：在包含组件的VNode及其子组件的VNode更新后调用。

- beforeUnmount：在卸载绑定元素的父组件之前调用

- unmounted：当指令与元素解除绑定且父组件已卸载时，只调用一次。

接下来我们来看一下在自定义指令API钩子函数的参数（即 el、binding、vnode 和 prevVnode）

## 动态指令参数
指令的参数可以是动态的。例如，在v-mydirective:[argument]="value"中，argument参数可以根据组件实例
数据进行更新！这使得自定义指令可以在应用中被灵活使用。

例如你想要创建一个自定义指令，用来通过固定布局将元素固定在页面上。我们可以创建一个自定义指令，
它的值以像素为单位更新被固定元素的垂直位置，如下所示：
<div id="dynamic-arguments-example" class="demo">
  <p>Scroll down the page</p>
  <p v-pin="200">Stick me 200px from the top of the page</p>
</div>

const app = Vue.createApp({})
app.directive('pin',{
  mounted(el,binding){
    el.style.position = 'fixed'
    // binding.value 是我们传递给指令的值 -- 在这里就是200
    el.style.top = binding.value + 'px'
  }
})

app.mount('#dynamic-arguments-example')

这会把该元素固定在距离页面顶部200像素的位置。但如果场景是我们需要把元素固定在左侧而不是顶部
又该怎么办呢？这时使用动态参数就可以非常方便地根据每个组件实例来进行更新。
<div id="dynamicexample">
  <h3>Scroll down inside this section ↓</h3>
  <p v-pin:[direction]="200">I am pinned onto the page at 200px to the left.</p>
</div>

const app = Vue.createApp({
  data() {
    return {
      direction:'right'
    }
  }
})

app.directive('pin',{
  mounted(el,binding){
    el.style.position = 'fixed'
    // binding.arg 是我们传递给指令的参数
    const s = binding.arg || 'top'
    el.style[s] = binding.value + 'px'
  }
})

app.mount('#dynamic-arguments-example')

我们的自定义指令现在已经足够灵活，可以支持一些不同的用例。为了使其更具动态性，我们还可以允许
修改绑定值。让我们创建一个附件属性pinPadding，并将其绑定到<input type="range">

<div id="dynamicexample">
  <h2>Scroll down the page</h2>
  <input type="range" min="0" max="500" v-model="pinPadding">
  <p v-pin:[direction]="pinPadding">Stick me {{ pinPadding + 'px' }} from the {{ direction || 'top' }} of the page</p>
</div>

const app = Vue.createApp({
  data(){
    return {
      direction: 'right',
      pinPadding: 200
    }
  }
})
```


#### 组合式 API 基础

```

```


