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

让我们扩展指令逻辑以在组件更新后重新计算固定的距离。
app.directive('pin',{
  mounted(el,binding){
    el.style.position = 'fixed'
    const s = binding.arg || 'top'
    el.style[s] = binding.value + 'px'
  },
  updated(el,binding){
    const s = binding.arg || 'top'
    el.style[s] = binding.value + 'px'
  }
})

## 函数简写
在前面的例子中，你可能想在 mounted 和 updated 时触发相同行为，而不关心其他的钩子函数。
那么你可以通过将这个回调函数传递给指令来实现：
app.directive('pin', (el, binding) => {
  el.style.position = 'fixed'
  const s = binding.arg || 'top'
  el.style[s] = binding.value + 'px'
})

## 对象字面量
如果指令需要多个值，可以传入一个 JavaScript 对象字面量。记住，指令函数能够接受所有合法的 JavaScript 表达式。
<div v-demo="{ color: 'white', text: 'hello!' }"></div>
app.directive('demo', (el, binding) => {
  console.log(binding.value.color) // => "white"
  console.log(binding.value.text) // => "hello!"
})

## 在组件中使用
和非 prop 的 attribute 类似，当在组件中使用时，自定义指令总是会被应用在组件的根节点上。
<my-component v-demo="test"></my-component>
app.component('my-component', {
  template: `
    <div> // v-demo 指令将会被应用在这里
      <span>My component content</span>
    </div>
  `
})
和 attribute 不同，指令不会通过 v-bind="$attrs" 被传入另一个元素。

有了片段支持以后，组件可能会有多个根节点。当被应用在一个多根节点的组件上时，指令会被忽略，并且会抛出一个警告。
**注意：有了片段支持以后，组件可能会有多个根节点。当被应用在一个多根节点的组件上时，指令会被忽略，并且会抛出一个警告。**
```

#### Teleport（传送门）

```
Vue鼓励我们通过将UI和相关行为封装到组件中来构建UI。我们可以将它们嵌套在另外一个内部，以构建
一个组成应用程序UI的树。

然而，有时组件模板的一部分逻辑上属于该组件，而从技术角度来看，最好将模板的这一部分移动到
DOM中Vue app之外的其他位置。

一个常见的场景是创建一个包含全屏模式的组件。在大多数情况下，你希望模态框的逻辑存在于组件中，
但是模态框的快速定位就很难通过CSS来解决，或者需要更改组件组合。

考虑下面的HTML结构。
<body>
  <div style="position:relative;">
    <h3>Tooltips with Vue 3 Teleport</h3>
    <div>
       <model-button></model-button>
    </div>
  </div>
</body>

让我们来看看 modal-button组件：
该组件将有一个button元素来触发模态框的打开，以及有一个带有class .modal的div元素，它将包含
模态框的内容和一个用于自关闭的按钮。

const app = Vue.createApp({});

app.component('modal',{
  template:`
    <button @click="modalOpen=true">
       Open full screen modal!
    </button>

    <div v-if="modalOpen" class="modal">
      <div>
        I'm a modal!
        <button @click="modalOpen=false">
        close
        </button>
      </div>
    </div>
  `,
  data() {
    return {
      modalOpen: false
    }
  }
})

当在初始的HTML结构中使用这个组件时，我们可以看到一个问题---模态框是在深度嵌套的div中
渲染的，而模态框的position:absolute 以父级相对定位的div作为引用。

Teleport提供了一种干净的方法，允许我们控制在DOM中哪个父节点下渲染了HTML，而不必求助于
全局状态或将其拆分为两个组件。

让我们修改 modal-button 已使用<teleport>，并告诉Vue”将这个HTML传送到’body‘标签下“。
app.component('modal-button',{
  template:`
    <button @click="modalOpen=true">
       Open full screen modal!(With teleport!)
    </button>

    <teleport to="body">
      <div v-if="modalOpen" class="modal">
        <div>
          I'm a teleported modal! 
          (My parent is "body")
          <button @click="modalOpen = false">
            Close
          </button>
        </div>
      </div>
    </teleport>
  `,
  data(){
    return {
      modalOpen: false
    }
  }
})

因此，一旦我们单击按钮打开模态框，Vue将正确地将模态框内容渲染为body标签的子级。

## 与Vue components一起使用
如果<teleport>包含Vue组件，则它仍将是<teleport>父组件的逻辑子组件：
const app = Vue.createApp({
  template:`
    <h1>Root instance</h1>
    <parent-component/>
  `
})

app.component('parent-component',{
  template: `
    <h2>This is a parent component</h2>
    <teleport to="#endofbody">
      <child-component name="John" />
    </teleport>
  `
})
app.component('child-component', {
  props: ['name'],
  template: `
    <div>Hello, {{ name }}</div>
  `
})
在这种情况下，即使在不同的地方渲染 child-component，它仍将是 parent-component 的子级，
并将从中接收 name prop。

这也意味着来自父组件的注入会正常工作，在 Vue Devtools 中你会看到子组件嵌套在父组件之下，而不是出现在他会被实际移动到的位置。

## 在同一目标上使用多个 teleport

一个常见的用例场景是一个可重用的 <Modal> 组件，它可能同时有多个实例处于活动状态。
对于这种情况，多个<teleport>组件可以将其内容挂载到同一个目标元素。顺序将是一个简单的追加--稍后挂载
将位于目标元素中较早的挂载之后。
<teleport to="#modals">
  <div>A</div>
</teleport>
<teleport to="#modals">
  <div>B</div>
</teleport>

<!-- result -->
<div id="modals">
  <div>A</div>
  <div>B</div>
</div>
你可以在 API 参考 查看 teleport 组件。
```
#### 渲染函数
```
Vue推荐在绝大多数情况下使用模板来创建你的HTML。然而在一些场景中，你真的需要JavaScript的完全
编程能力。这时你可以用渲染函数，它比模板更接近编译器。

让我们深入一个简单的例子，这个例子里render函数很实用。假设我们要生成一些带锚点的标题：
<h1>
   <a name="hello-world" href="#hello-world">
      Hello world!
   </a>
</h1>
锚点标题的使用非常频繁，我们应该创建一个组件：
<anchored-heading :level="1">Hello world!</anchored-heading>
当开始写一个只能通过level prop动态生成标题（heading）的组件时，我们很快就可以得出这样的结论：

const app = createApp({})

app.component('anchored-heading',{
  template: `
    <h1 v-if="level === 1">
      <slot></slot>
    </h1>
    <h2 v-else-if="level === 2">
      <slot></slot>
    </h2>
    <h3 v-else-if="level === 3">
      <slot></slot>
    </h3>
    <h4 v-else-if="level === 4">
      <slot></slot>
    </h4>
    <h5 v-else-if="level === 5">
      <slot></slot>
    </h5>
    <h6 v-else-if="level === 6">
      <slot></slot>
    </h6>
  `,
  props: {
    level: {
      type: Number,
      required: true
    }
  }
})

虽然模板在大多数组件中都非常好用，但是显然在这里它就不合适了。那么，我们来尝试使用 render 
函数重写上面的例子：

const { createApp } = vue

const app = createApp({})

app.component('anchored-heading',{
  template: `
    <h1 v-if="level === 1">
      <slot></slot>
    </h1>
    <h2 v-else-if="level === 2">
      <slot></slot>
    </h2>
    <h3 v-else-if="level === 3">
      <slot></slot>
    </h3>
    <h4 v-else-if="level === 4">
      <slot></slot>
    </h4>
    <h5 v-else-if="level === 5">
      <slot></slot>
    </h5>
    <h6 v-else-if="level === 6">
      <slot></slot>
    </h6>
  `,
  props: {
    level: {
      type: Number,
      required: true
    }
  }
})

虽然模板在大多数组件中都非常好用，但是显然在这里它就不合适了。那么，我们来尝试使用 render 
函数重写上面的例子：

const { createApp, h } = vue

const app = createApp({})

app.component('anchored-heading',{
  render(){
    return h(
      'h'+this.level, // 标签名
      {}, // prop 或 attribute
      this.$slots.default() // 包含其子节点的数组
    )
  },
  props: {
    level: {
      type:Number,
      required: true
    }
  }
})

render() 函数的实现要精简得多，但是需要非常熟悉组件的实例property。在这个例子中，你需要知道，
向组件中传递不带v-slot指令的子节点时，比如anchored-heading中的Hello world!，这
些子节点被存储在组件实例中的 $slots.default 中。如果你还不了解，在深入渲染函数之前推荐阅读
实例 property API。

## DOM树

在深入渲染函数之前，了解一些浏览器的工作原理是很重要的。以下面这段HTML为例：
<div>
  <h1>My title</h1>
  Some text content
  <!-- TODO: Add tagline -->
</div>
当浏览器读到这些代码时，它会建立一个 ”DOM 节点“ 树 来保持追踪所有内容，
如同你会画一张家谱树来追踪家庭成员的发展一样。

上述 HTML 对应的 DOM 节点树如下图所示
                    div
h1            some text content       <!-- TODO: Add tagline -->
                 (#text)                        (#comment)
My title
(#text) 

每个元素都是一个节点。每段文字也是一个节点。甚至注释也都是节点。一个节点就是页面的一个部分。
就像家谱树一样，每个节点都可以有孩子节点（也就是说每个部分可以包含其它的一些部分）。

高效地更新所有这些节点会是比较困难的，不过所幸你不必手动完成这个工作。你只需要告诉Vue你希望
页面上的HTML是什么，这可以是一个模板里：
<h1>{{blogTitle}}}</h1>
或者一个渲染函数里：
render() {
  return h('h1',{},this.blogTitle)
}
在这两种情况下， Vue都会自动保持页面的更新，即便blogTitle发生了改变。

## 虚拟DOM树
Vue通过建立一个虚拟DOM来追踪自己要如何改变真实DOM。请仔细看这行代码：

return h('h1',{},this.blogTitle)
h()到底会返回什么呢？其实不是一个实际的DOM元素。它更准确的名字可能是
createNodeDescription，因为它所包含的信息会告诉Vue页面上需要渲染什么样的节点，包括及其子
节点的描述信息。我们把这样的节点描述为’虚拟节点（virtual node）‘,也常简写它为VNode。
“虚拟DOM”是我们对由Vue组件树建立起来的整个VNode树的称呼。

## h() 参数

h()函数是一个用于创建于VNode的使用程序。也许可以更准确地将其命名为createVNode()，但由于
频繁使用和简洁，它被称为h().它接受三个参数：
// @returns {VNode}
h(
  // {String | Object | Function} tag
  // 一个HTML标签名、一个组件、一个异步组件、或
  // 一个函数式组件。
  // 
  // 必需的。
  ‘div’,

  // { Object } props
  // 与attribute、prop和事件相对应的对象。
  // 这会在模板中用到
  //
  //可选的。
  {},

  // {String | Array | Object} children
  // 子 VNodes，使用`h()`构建，
  // 或使用字符串获取“文本VNode”或者
  // 有插槽的对象。
  //
  // 可选的。
  [
    'Some text comes first.',
    h('h1', 'A headline'),
    h(MyComponent, {
      someProp: 'foobar'
    })
  ]
)

如果没有prop，那么通常可以将children作为第二个参数传入。如果会产生歧义，可以null作为
第二个参数传入，将children作为第三个参数传入。

## 完整实例

有了这些知识，我们现在可以完成我们最开始想实现的组件：
const { createApp, h } = Vue

const app = createApp({})

/** 递归地从子节点获取文本 */
function getChildrenTextContent(children) {
  return children
    .map(node => {
      return typeof node.children === 'string' ? node.children : Array.isArray(node.children)
        ? getChildrenTextContent(node.children)
        : ''
    })
    .join('')
}

app.component('anchored-heading', {
  render() {
    // 从 children 的文本内容中创建短横线分隔 (kebab-case) id。
    const headingId = getChildrenTextContent(this.$slots.default())
      .toLowerCase()
      .replace(/\W+/g, '-') // 用短横线替换非单词字符
      .replace(/(^-|-$)/g, '') // 删除前后短横线

    return h('h' + this.level, [
      h(
        'a',
        {
          name: headingId,
          href: '#' + headingId
        },
        this.$slots.default()
      )
    ])
  },
  props: {
    level: {
      type: Number,
      required: true
    }
  }
})

## 约束
VNode是必须唯一
组件树中的所有VNode必须是唯一的。这意味着，下面的渲染函数是不合法的：

render() {
  const myParagraphVNode = h('p','hi')
  return h('div',[
    // 错误 - 重复的Vnode！
    myParagraphVNode, myParagraphVNode
  ])
}

如果你真的需要重复很多次的元素/组件，你可以使用工厂函数来实现。例如，下面这渲染函数用完全合
法的方式渲染了20个相同的段落：
render() {
  return h('div',
     Array.from({length:20}).map(()=>{  // 还可以这样创建数组Array.from({length:20})
       return h('p', 'hi')
     })
  )
}

## 创建组件VNode
要为某个组件创建一个VNode，传递给 h 的第一个参数应该是组件本身。
render() {
  return h(ButtonCounter)
}

如果我们需要通过名称来解析一个组件，那么我们可以调用resolveComponent：
const { h, resolveComponent } = Vue

// ... 
render() {
  const ButtonCounter = resolveComponent('ButtonCounter')
  return h(ButtonCounter)
}

resolveComponent 是模板内部用来解析组件名称的同一个函数。

render函数通常只需要对全局注册的组件使用resolveComponent。而对于局部注册的却可以跳过，
请看下面的例子：
// 此写法可以简化
components: {
  ButtonCounter
},
render() {
  return h(resolveComponent('ButtonCounter'))
}
我们可以直接使用它，而不是通过名称注册一个组件，然后再查找：
render() {
  return h(ButtonCounter)
}

## 使用JavaScript代替模板功能
## v-if和v-for
只要在原生的JavaScript中可以轻松完成的操作，Vue的渲染函数就不会提供专有的替代方法。比如，
在模板中使用的v-if和v-for：
<ul v-if="items.length">
  <li v-for="item in items">{{ item.name }}</li>
</ul>
<p v-else>No items found.</p>

这些都可以在渲染函数中用JavaScript的if / else 和 map() 来重写：
props: ['items'],
render() {
  if(this.items.length) {
    return h('ul',this.items.map((item)=>{
      return h('li',item.name)
    }))
  } else {
    return h('p','No items found')
  }
}

## v-model

v-model指令扩展为modelValue和onUpdate:modelValue在模板编译过程中，我们必须自己提供这些prop：
props: ['modelValue'],
emits: ['update:modelValue'],
render() {
  return h(SomeComponent,{
    modelValue:this.modelValue,
    'onUpdate:modelValue':value => this.$emit('update:modelValue',value) 
  })
}

## v-on

我们必须为事件处理程序提供一个正确的prop名称，例如，要处理click事件，prop名称应该是onClick。
render() {
  return h('div',{
    onClick:$event => console.log('clicked',$event.target)
  })
}

## 事件修饰符

对于.passive、.capture和.once事件修饰符，可以使用驼峰写法将他们拼接在事件名后面：
实例：
render() {
  return h('input',{
    onClickCapture: this.doThisInCapturingMode,
    onKeyupOnce: this.doThisOnce,
    onMouseoverOnceCapture: this.doThisOnceInCapturingMode
  })
}

对于所有其它的修饰符，私有前缀都不是必须的，因为你可以在事件处理函数中使用事件方法：

修饰符	        处理函数中的等价操作
.stop	         event.stopPropagation()
.prevent	     event.preventDefault()
.self	         if (event.target !== event.currentTarget) return
按键：
.enter, .13	   if (event.keyCode !== 13) return (对于别的按键修饰符来说，可将 13 改为另一个按键码
修饰键：
.ctrl, .alt, .shift, .meta	   if (!event.ctrlKey) return (将 ctrlKey 分别修改为 altKey, shiftKey, 或 metaKey)

这里是一个使用所有修饰符的例子：

render() {
  return h('input',{
    onKeyUp: event => {
      // 如果触发事件的元素不是事件绑定的元素
      // 则返回
      if(event.target !== event.currentTarget) return
      // 如果向上不是回车键，则终止。
      // 没有同时按下按键（13）和 shift键
      if(!event.shiftKey || event.keyCode !== 13) return
      // 停止事件传播
      event.stopPropagation()
      // 阻止该元素默认的keyup事件
      event.preventDefault()
      // ...
    }
  })
}

## 插槽

你可以通过this.$slots访问静态插槽的内容，每个插槽都是一个VNode数组：

render() {
  // `<div><slot></slot></div>`
  return h('div', {}, this.$slots.default())
}

<!-- 类似于具名插槽 -->
props: ['message'],
render() {
  // `<div><slot :text="message"></slot></div>`
  return h('div', {}, this.$slots.default({
    text: this.message
  }))
}

要使用渲染函数将插槽传递给子组件，请执行以下操作：

const { h, resolveComponent } = Vue

render() {
  // `<div><child v-slot="props"><span>{{ props.text }}</span></child></div>`
  return h('div', [
    h(
      resolveComponent('child'),
      {},
      // 将 `slots` 以 { name: props => VNode | Array<VNode> } 的形式传递给子对象。
      {
        default: (props) => Vue.h('span', props.text)
      }
    )
  ])
}

插槽以函数的形式传递，允许子组件控制每个插槽内容的创建。任何响应式数据都应该在插槽函数内访问，
以确保它被注册为子组件的依赖关系，而不是父组件。相反，对 resolveComponent 的调用应该在插槽函数之外进行，
否则它们会相对于错误的组件进行解析。

// `<MyButton><MyIcon :name="icon" />{{ text }}</MyButton>`
render() {
  // 应该是在插槽函数外面调用 resolveComponent。
  const Button = resolveComponent('MyButton')
  const Icon = resolveComponent('MyIcon')

  return h(
    Button,
    null,
    {
      // 使用箭头函数保存 `this` 的值
      default: (props) => {
        // 响应式 property 应该在插槽函数内部读取，
        // 这样它们就会成为 children 渲染的依赖。
        return [
          h(Icon, { name: this.icon }),
          this.text
        ]
      }
    }
  )
}
如果一个组件从它的父组件中接收到插槽，它们可以直接传递给子组件。
render() {
  return h(Panel,null,this.$slots)
}
也可以会根据情况单独传递或包裹住。
render() {
  return h(
    Panel,
    null,
    {
      //如果我们想传递一个槽函数，我们可以通过
      header: this.$slots.header,
      //如果我们需要以某种方式对插槽进行操作，
      //那么我们需要用一个新的函数来包裹它
      dafault: (props)=>{
        const children = this.$slots.default ? this.$slots.default(props):[]

        return children.concat(h('div','Extra child'))
      }
    }
  )
}

## <component> 和 is
在底层实现里，模板使用 resolveDynamicComponent 来实现 is attribute。如果我们在 render 
函数中需要 is 提供的所有灵活性，我们可以使用同样的函数：
const { h,resolveDynamicComponent } = Vue
// ...

// `<component :is="name"></component>`
render() {
  const Component = resolveDynamicComponent(this.name)
  return h(Component)
}

就像is，resolveDynamicComponent 支持传递一个组件名称、一个HTML元素名称或一个组件选项对象。
通常这种程度的灵活性是不需要的。通常resolveDynamicComponent可以被换做一个更直接的替代方案。

例如，如果我们只需要支持组件名称，那么可以使用resolveComponent来代替。
如果VNode始终是一个HTML元素，那么我们可以直接把它的名字传递给h：
// '<component :is="bold ? 'strong':'em'"></component>'
render() {
  return h(this.bold?'strong':'em')
}
同样，如果传递给is的值是一个组件选项对象，那么不需要解析什么，可以直接作为h的第一个参数传递。
与<template>标签一样，<component>标签仅在模板中作为语法占位符需要，当迁移到render函数时，
应被丢弃。

## 自定义指令
可以使用 withDirectives 将自定义指令应用于 VNode：
const { h, resolveDirective, withDirectives } = Vue

// ...

// <div v-pin:top.animate="200"></div>
render(){
  const pin = resolveDirective('pin')

  return withDirectives(h('div'),[
    [pin,200,'top',{animate:true}]
  ])
}

resolveDirective是模板内部用来解析指令名称的同一个函数。只有当你还没有直接访问指令的定义
对象时，才需要这样做。

## 内置组件
诸如<kepp-alive>、<transition>、<transition-group>和<teleport>等内置组件默认并没
有被全局注册。这使得打包工具可以tree-shake，因此这些组件只会在被用到的时候被引入构建。不过这
也意味着我们无法通过resolveComponent 或 resolveDynamicComponent访问它们。

在模板中这些组件会被特殊处理，即在它们被用到的时候自动导入。当我们编写自己的render函数时
，需要自行导入它们：
const { h, KeepAlive, Teleport, Transition, TransitionGroup } = Vue
// ...
render(){
  return h(Transition,{mode:'out-in'},/*...*/)
}

## 渲染函数的返回值
在我们目前看过的所有示例中，render函数返回的是单个根VNode。但其实也有别的选项。
返回一个字符串时会创建一个文本VNode，而不被包裹任何元素：

render(){
  return 'hello world!'
}

我们也可以返回一个子元素数组，而不把它们包裹在一个根结点里。这会创建一个片段（fragment）：
// 相当于模板’Hello<br>world!‘
render(){
  return [
    'Hello',
    h('br'),
    'world!'
  ]
}

可能是因为数据依然在加载中的关系，组件不需要渲染，这时它可以返回null。这样我们在DOM中会
渲染一个注释节点。

## JSX
如果你写了很多渲染函数，可能会觉得下面这样的代码写起来很痛苦：
h(
  'anchored-heading',
  {
    level: 1
  },
  {
    default: () => [h('span', 'Hello'), ' world!']
  }
)

特别是对应的模板如此简单的情况下：
<anchored-heading :level="1"> <span>Hello</span> world! </anchored-heading>
这就是为什么会有一个Babel插件，用于在Vue中使用JSX语法，它可以让我们回到更接近于模板的语法上。

import AnchoredHeading from './AnchoredHeading.vue'

const app = createApp({
  render() {
    <!-- JSX的写法 -->
    return (
      <AnchoredHeading level={1}>
        <span>Hello</span> world!
      </AnchoredHeading>
    )
  }
})

app.mount('#demo')
有关 JSX 如何映射到 JavaScript 的更多信息，请参阅使用文档。

## 函数式组件

函数式组件是自身没有任何状态的组件的另一种形式。它们在渲染过程中不会创建组件实例，并跳过常规
的组件生命周期。

我们使用的是一个简单函数，而不是一个选项对象，来创建函数式组件。该函数实际上就是该组件的render函数。
而因为函数式组件里没有this引用，Vue会把props当作第一个参数传入：
const FunctionalComponent = (props, context) => {
  // ...
}

第二个参数 context 包含三个 property：attrs、emit 和 slots。
它们分别相当于实例的 $attrs、$emit 和 $slots 这几个 property。

大多数常规组件的配置选项在函数式组件中都不可用。然而我们还是可以把props和emits作为
property加入，以达到定义它们的目的：
FunctionalComponent.props = ['value']
FunctionalComponent.emits = ['click']

如果这个 props 选项没有被定义，那么被传入函数的 props 对象就会像 attrs 一样会包含所有 attribute。
除非指定了 props 选项，否则每个 prop 的名字将不会基于驼峰命名法被一般化处理。

函数式组件可以像普通组件一样被注册和消费。如果你将一个函数作为第一个参数传入 h，
它将会被当作一个函数式组件来对待。

## 模板编译
你可能会有兴趣知道，Vue 的模板实际上被编译成了渲染函数。这是一个实现细节，通常不需要关心。
但如果你想看看模板的功能具体是怎样被编译的，可能会发现会非常有意思。
下面是一个使用 Vue.compile 来实时编译模板字符串的简单示例：
```
### 插件
```
插件是自包含的代码，通常向Vue添加全局级功能。它可以是公开install()方法的object，也可
以是function

插件的功能范围没有严格的限制--- 一般有下面几种：
1、添加全局方法或者property。如：vue-custom-element
2、添加全局资源：指令/过渡。如：vue-touch
3、通过全局mixin来添加一些组件选项。（如vue-router）
4、添加全局实例方法，通过把它们添加到config.globalProperties上实现。
5、一个库，提供自己的API，同时提供上面提到的一个或多个功能。如vue-router

## 编写插件
为了更好地理解如何创建自己的Vue.js版插件，我们将创建一个非常简化的插件版本，它显示i18n准备好的字串。

每当这个插件被添加到应用程序中，如果它是一个对象，就会调用install方法。如果它是一个
function，则函数本身将被调用。在这两种情况下--它都会收到两个参数：
由Vue的createApp生成的app对象和用户传入的选项。

让我们从设置插件对象开始。建议在单独的文件中创建它并将其导出，如下所示，以保持包含的逻辑和分离的逻辑。

// plugins/i18n.js
export default {
  install:(app,options)=>{
    // Plugin code goes here
  }
}

我们想要一个函数来翻译整个应用程序可用的键，因此我们将使用 app.config.globalProperties 暴露它。

该函数将接收一个key字符串，我们将使用它在用户提供的选项中查找转换后的字符串。
// plugins/i18n.js
export default {
  install:(app,options)=>{
    app.config.globalProperties.$translate = key => {
      return key.split('.').reduce((o, i) => {
        if (o) return o[i]
      }, options)
    }
  }
}

我们假设用户使用插件时，将在options参数中传递一个包含翻译后的键的对象。
我们的$translate函数将使用诸如greetings.hello之类的字符串，查看用户提供的配置
内部并返回转换后的值-在这种情况下为Bonjour!。

例如：
greetings: {
  hello:'Bonjour!'
}

插件还允许我们使用inject为插件的用户提供功能或attribute。例如，我们可以允许应用程序访问
options参数以能够使用翻译对象。
// plugins/i18n.js
export default {
  install: (app, options) => {
    app.config.globalProperties.$translate = key => {
      return key.split('.').reduce((o, i) => {
        if (o) return o[i]
      }, options)
    }

    app.provide('i18n', options)
  }
}

插件用户现在可以将 inject[i18n] 注入到他们的组件并访问该对象。

另外，由于我们可以访问app对象，因此插件可以使用所有其他功能，例如使用mixin和
directive。要了解有关createApp和应用程序实例的更多信息，请查看Application API文档。

// plugins/i18n.js
export default {
  install: (app, options) => {
    app.config.globalProperties.$translate = (key) => {
      return key.split('.')
        .reduce((o, i) => { if (o) return o[i] }, options)
    }

    app.provide('i18n', options)

    app.directive('my-directive', {
      mounted (el, binding, vnode, oldVnode) {
        // some logic ...
      }
      ...
    })

    app.mixin({
      created() {
        // some logic ...
      }
      ...
    })
  }
}

## 使用插件
在使用createApp() 初始化Vue应用程序后，你可以通过调用use()方法将插件添加到你的应用程序中。
我们将使用在编写插件部分中创建的i18nPlugin进行演示。
use()方法有两个参数。第一个是要安装的插件，在这种情况下为i18nPlugin。
它还会自动阻止你多次使用同一个插件，因此在同一个插件上多次调用只会安装一次插件。

第二个参数是可选的，并且取决于每个特定的插件。在演示i18nPlugin的情况下，它是带有转换后的
字符串的对象。
INFO
如果你使用的是第三方插件 (例如 Vuex 或 Vue Router)，
请始终查看文档以了解特定插件期望作为第二个参数接收的内容。

import { createApp } from 'vue'
import Root from './App.vue'
import i18nPlugin from './plugins/i18n'

const app = createApp(Root)
const i18nStrings = {
  greetings: {
    hi: 'Hallo!'
  }
}

app.use(i18nPlugin, i18nStrings)
app.mount('#app')

awesome-vue 集合了大量由社区贡献的插件和库。
```
## 高阶指南
### Vue 与 Web Components
```
Web Components是一组Web原生API的总称，允许开发人员创建可重用的自定义组件。
我们认为Vue和Web Components大体上是互补的技术。Vue能很好地解析和创建自定义元素。不论是
在将自定义元素整合到已有的Vue应用中，还是使用Vue构建和分发自定义元素，你都能获得很好的支持。

## 在Vue中使用自定义元素
Vue 在 Custom Elements Everywhere 测试中获得了 100% 的完美分数。
Vue 应用程序中解析出的自定义元素大体上和原生 HTML 元素相同，但需要牢记以下几点：

### 跳过组件的解析

默认情况下，Vue会优先尝试将一个非原生的HTML标签解析为一个注册的Vue组件，如果失败则会将
其渲染为自定义元素。这种行为会导致在开发模式下的Vue发出”failed to resolve component“
的警告。如果你希望Vue能将某些确切的元素作为自定义元素处理并跳过组件解析，请指定
compilerOptions.isCustomElement 选项。

如果你正在构建步骤中使用Vue，则此选项需要通过构建配置传递，因为这是一个编译时选项。

### 浏览器内配置示例
// 仅当使用浏览器内编译时有效
// 如果你正在使用构建工具，请查看下方的配置示例
app.config.compilerOptions.isCustomElement = tag => tag.includes('-')

### Vite 配置示例
// vite.config.js
import vue from '@vitejs/plugin-vue'

export default {
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 将所有包含短横线的标签作为自定义元素处理
          isCustomElement: tag => tag.includes('-')
        }
      }
    })
  ]
}

### Vue CLI 配置示例
// vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => ({
        ...options,
        compilerOptions: {
          // 将所有以 ion- 开头的标签作为自定义元素处理
          isCustomElement: tag => tag.startsWith('ion-')
        }
      }))
  }
}

### 传递DOM Property
由于DOM attribute只能是字符串，因此我们得将复杂数据作为DOM property传递给自定义元素。在自
定义元素上配置prop时，Vue3会自动使用in操作符检查是否存在DOM-property，如果此键存在则会优先
将值配置为一个DOM property。也就是说大多数情况下，如果自定义元素遵守推荐的最佳实践，则无需考虑这一点。

但是，在极少数情况下，数据必须作为DOM property传递，但自定义元素没有正确定义/反映property
（导致in检查失败）。此时，可以使用.prop修饰符强制将一个v-bind绑定设置为一个DOM property:

<my-element :user.prop="{ name: 'jack' }"></my-element>
<!-- 等效的简写 -->
<my-element .user="{ name: 'jack' }"></my-element>

### 使用Vue构建自定义元素
自定义元素的一大好处就是它们可以与任何框架一起使用，甚至可以在没有框架的情况下使用。当你需要
向可能使用不同前端技术栈的终端用户分发组件时，或者希望向最终应用程序隐藏其所用组件的实现细节时，
使用自定义元素非常适合。

#### defineCustomElement
Vue支持使用 defineCustomElement 方法创建自定义元素，并且使用与Vue组件完全一致的API。该方法
接受与defineComponent相同的参数，但是会返回一个扩展自HTMLElement的自定义元素构造函数：

<my-vue-element></my-vue-element>
import { defineCustomElement } from 'vue'

const MyVueElement = defineCustomElement({
  // 在此提供正常的 Vue 组件选项
  props: {},
  emits: {},
  template: `...`,

  // defineCustomElement 独有特性: CSS 会被注入到隐式根 (shadow root) 中
  styles: [`/* inlined css */`]
})

// 注册自定义元素
// 注册完成后，此页面上的所有的 `<my-vue-element>` 标签会被更新
customElements.define('my-vue-element', MyVueElement)

// 你也可以编程式地实例化这个元素：
// (只能在注册后完成此操作)
document.body.appendChild(
  new MyVueElement({
    // initial props (optional)
  })
)

#### 生命周期
- 当元素的connectedCallback被首次调用时，Vue自定义元素会在其隐式根部挂载一个内部的
Vue组件实例。
- 当元素的disconnectedCallback 被调用时，Vue会在很短的时间后检查此元素是否已被移出页面。
  如果元素仍在文档中，说明是移动，组件实例将被保留；
  如果元素已被移出文档，说明是移除，组件实例将被卸载。

#### Props
- 所有使用props选项声明的prop都将在自定义元素上定义为property。Vue将在合适的时候自动处理
attribute/property之间的映射。
   Attribute总是映射为相应的property。
   基础类型（string、boolean 或 number）的property会被映射为attribute。
- Vue也会自动将声明为Boolean或Number类型的attribute prop (始终为字符串)转换为所需的类型。
例如给出以下 prop 声明：  
props: {
  selected: Boolean,
  index: Number
}
以及自定义元素用法：

<my-element selected index="1"></my-element>
在组件中，selected 会被转换为 true (boolean)，index 会被转换为 1 (number)。

 
#### 事件
在自定义元素中，通过 this.$emit 或在 setup 中的 emit 发出的事件会被调度为原生 CustomEvents。
附加的事件参数 (payload) 会作为数组暴露在 CustomEvent 对象的 details property 上。

#### 插槽
在组件内部，可以像往常一样使用<slot/>渲染插槽。但是在解析最终生成的元素时，它只接受原生插槽语法：
不支持作用域插槽。
传递命名插槽时，请使用slot attribute而非v-slot指令：
<my-element>
  <div slot="named">hello</div>
</my-element>

#### Provide / Inject
Provide / Inject API 和组合式 API 中的 Provide / Inject 在 Vue 定义的自定义元素之间可以正常工作。
但是请注意这仅适用于自定义元素之间，即 Vue 定义的自定义元素将无法注入非自定义元素的 Vue 组件提供的属性。

## 将SFC作为自定义元素
defineCustomElement也适用于Vue单文件组件（SFC）。但是，在默认工具链配置下，生产构建时SFC内部的<style>
会被提取并合并到单独的CSS文件中。当使用SFC作为自定义元素时，通常需要将<style>标签注入自定义元素的隐式根。

要选用此模式，只需使用 .ce.vue 作为文件拓展名即可：
import { defineCustomElement } from 'vue'
import Example from './Example.ce.vue'

console.log(Example.styles) // ["/* 内联的css */"]

// 转换为自定义元素构造器
const ExampleElement = defineCustomElement(Example)

// 注册
customElements.define('my-example',ExampleElement)

如果你希望指定应在自定义元素模式下导入的文件（例如将所有SFC视为自定义元素），你可以将
customElement 选项传递给相应的构建插件：
@vitejs/plugin-vue
vue-loader

## Vue 自定义元素库的提示
如果使用 Vue 构建自定义元素，则此元素将依赖于 Vue 的运行时。这会导致一个 16kb 左右的基础大小开销 
(具体取决于使用了多少特性)。这意味着如果你准备发布单个自定义元素，使用 Vue 可能不是最佳方案——
你可能想要使用纯 JavaScript，petite-vue，或是其他专注于轻量化运行时的框架。
但是，如果你要发布具有复杂逻辑的自定义元素集合，那么这点基础大小就会显得合理了，
因为 Vue 可以使用非常精简的代码耦合每个组件。你准备发布的元素越多，开销权衡就越好。

如果自定义元素会在同样使用 Vue 的项目中使用，你可以选择从构建的包中外部化 Vue，
这样元素就会使用与宿主应用程序相同的 Vue 副本。

我们推荐你提供一个导出独立元素的构造函数，这样你的用户就可以灵活地按需导入它们并使用他们所需的标签名注册自定义元素。
你还可以导出一个能自动注册所有元素的函数以便于使用。这是一个 Vue 自定义元素库示例的入口点：

import { defineCustomElement } from 'vue'
import Foo from './MyFoo.ce.vue'
import Bar from './MyBar.ce.vue'

const MyFoo = defineCustomElement(Foo)
const MyBar = defineCustomElement(Bar)

// 导出独立的元素
export { MyFoo, MyBar }

export function register() {
  customElements.define('my-foo', MyFoo)
  customElements.define('my-bar', MyBar)
}

如果你有许多组件，你可以利用构建工具提供的功能，例如Vite的glob导入或者是webpack的
require.context.

## 对比Web Components 与 Vue 组件
一些开发人员认为应该避免使用框架专有的组件模型，并且仅使用自定义元素已便于应用程序“面向未来”。
我们将在此处尝试解释为什么我们认为这种看法过于简单化了问题。

自定义元素和 Vue 组件之间确实存在一定程度的功能重叠：它们都允许我们定义具有数据传递、
事件发出和生命周期管理功能的可重用组件。然而，Web Components API 是相对低级和简单的。
为了构建一个实际可用的应用程序，我们需要很多平台没有涵盖的附加功能：

- 一个声明式的、高效的模板系统；

- 一个有助于跨组件逻辑提取和重用的响应式状态管理系统；

- 一个能在服务器端渲染组件并在客户端集成的高效方法(SSR)，这对于 SEO 和 Web 关键指标 (例如 LCP) 来说很重要。
原生自定义元素 SSR 通常涉及在 Node.js 中模拟 DOM，然后序列化被改变的 DOM，而 Vue SSR 会尽可能编译为字符串连接，
后者的效率更高。

作为一个考虑周到的系统，Vue 的组件模型在设计时就考虑到了这些需求。

如果你拥有一支称职的工程团队，或许可以基于原生自定义元素构建出近似效果的产品——但这也意味着你需要承担对内部框架的长期维护负担，
同时失去了像 Vue 这样拥有生态系统和社区贡献的成熟的框架。

也有使用自定义元素作为其组件模型基础构建的框架，但它们都不可避免地要针对上面列出的问题引入自己的专有解决方案。
使用这些框架需要学习或是购买他们对这些问题的技术决策——尽管他们可能会打广告宣传——这依旧无法使你免除后顾之忧。

我们还找到了一些自定义元素无法胜任的应用场景：

激进的插槽定值会阻碍组件的整合。Vue 的作用域插槽提供了非常强大的组件整合机制，这是原生插槽所没有的，
因为原生插槽的激进特性。激进特性插槽同样意味着接收组件无法控制何时或是否需要渲染一段插槽内容。

目前，发布带有隐式 DOM scoped CSS 的自定义元素需要将 CSS 嵌入到 JavaScript 中，
以便它们可以在运行时注入到隐式根中。在 SSR 场景中，它们还会导致重复定义样式。
该领域有一些平台特性正在开发中——但截至目前，它们尚未得到普遍支持，并且仍有生产环境性能/ SSR 问题需要解决。
而与此同时，Vue SFC 已经提供了 CSS 作用域机制，支持将样式提取到纯 CSS 文件中。

Vue 将始终与 Web 平台中的最新标准保持同步，如果平台提供的任何内容能使我们的工作更轻松，我们将很乐意利用它。
但是，我们的目标是提供运行良好且开箱即用的解决方案。这意味着我们必须以批判的心态整合新的平台功能——
这会涉及到在遵循现有标准的前提下弥补标准的不足。

```
### 深入响应性原理
```
现在是时候深入了！Vue最独特的特性之一，是其非侵入性的响应式系统。数据模型是被代理的
JavaScript对象。而当你修改它们时，视图会进行更新。这让状态管理非常简单直观，不过理解其工作原理
同样重要，这样你可以避开一些常见的问题。在这个章节，我们将研究一下Vue响应式系统的底层的细节。

什么是响应性
这个术语在程序设计中经常被提及，但这是什么意思呢？响应性是一种允许我们以声明式的方式去适应变化
的编程范例。人们通常展示的典型例子，是一份excel电子表格（一个非常好的例子）。

如果将数字 2 放在第一个单元格中，将数字 3 放在第二个单元格中并要求提供 SUM，则电子表格会将其计算出来给你。
不要惊奇，同时，如果你更新第一个数字，SUM 也会自动更新。

JavaScript 通常不是这样工作的——如果我们想用 JavaScript 编写类似的内容：
let val1 = 2
let val2 = 3
let sum = val1 + val2

console.log(sum) // 5

val1 = 3

console.log(sum) // 仍然是 5
如果我们更新第一个值，sum 不会被修改。

那么我们如何用 JavaScript 实现这一点呢？

作为一个高阶的概述，我们需要做到以下几点：
1、当一个值被读取时进行追踪，例如 val1 + val2 会同时读取val1和val2。
2、当某个值改变时进行检测，例如，当我们赋值val1 = 3。
3、重新运行代码来读取原始值，例如，再次运行 sum = val1 + val2 来更新sum的值。

我们不能直接用前面的例子中的代码来继续，但是我们后面会再来看看这个例子，以及如何调整它来兼容
Vue的响应性系统。

首先，让我们深入了解一下Vue是如何实现上述核心响应性要求的。

## Vue 如何知道哪些代码在执行
为了能够在数值变化时，随时运行我们的总和，我们首先要做的是将其包裹在一个函数中。
const updateSum = () => {
  sum = val1 + val2
}
但我们如何告知 Vue 这个函数呢？

Vue 通过一个副作用 (effect) 来跟踪当前正在运行的函数。副作用是一个函数的包裹器，
在函数被调用之前就启动跟踪。Vue 知道哪个副作用在何时运行，并能在需要时再次执行它。

为了更好地理解这一点，让我们尝试脱离 Vue 实现类似的东西，以看看它如何工作。

我们需要的是能够包裹总和的东西，像这样：

createEffect(() => {
  sum = val1 + val2
})

我们需要 createEffect 来跟踪和执行。我们的实现如下：

// 维持一个执行副作用的栈
const runningEffects = []

const createEffect = fn => {
  // 将传来的 fn 包裹在一个副作用函数中
  const effect = () => {
    runningEffects.push(effect)
    fn()
    runningEffects.pop()
  }

  // 立即自动执行副作用
  effect()
}

当我们的副作用被调用时，在调用fn之前，它会把自己推到runningEffects数组中。
这个数组可以用来检查当前正在运行的副作用。

副作用是许多关键功能的起点。例如，组件的渲染和计算属性都在内部使用副作用。任何时候，
只要有东西对数据变化做出奇妙的回应，你就可以肯定它已经被包裹在一个副作用中了。

虽然Vue的公开API不包括任何直接创建副作用的方法，但它确实暴露了一个叫做watchEffect的函数
，它的行为很像我们例子中的createEffect 函数。我们会在该指南后面的部分详细讨论这个问题。

但知道什么代码在执行只是难题的一部分。Vue如何知道副作用使用了什么值，以及如何知道它们何时发
生变化？

## Vue 如何跟踪变化
我们不能像前面的例子中那样跟踪局部变量的重新分配，在 JavaScript 中没有这样的机制。
我们可以跟踪的是对象 property 的变化。

当我们从一个组件的 data 函数中返回一个普通的 JavaScript 对象时，
Vue 会将该对象包裹在一个带有 get 和 set 处理程序的 Proxy 中。
Proxy 是在 ES6 中引入的，它使 Vue 3 避免了 Vue 早期版本中存在的一些响应性问题。

那看起来灵敏，不过，需要一些Proxy的知识才能理解！所以让我们深入了解一下。有很多关于Proxy
的文档，但你真正需要知道的是， Proxy是一个对象，它包装了另一个对象，并允许你拦截对该对象的任何交互。

我们这样使用它：new Proxy(target,handler)
const dinner = {
  meal:'tacos'
}

const handler = {
  get(target,property) {
    console.log('intercepted!')
    return target[property]
  }
}

const proxy = new Proxy(dinner,handler)
console.log(proxy.meal)

// intercepted!
// tacos

这里我们截获了读取目标对象 property 的举动。像这样的处理函数也称为一个捕捉器 (trap)。
有许多可用的不同类型的捕捉器，每个都处理不同类型的交互。

除了控制台日志，我们可以在这里做任何我们想做的事情。如果我们愿意，我们甚至可以不返回实际值。
这就是为什么 Proxy 对于创建 API 如此强大。

使用 Proxy 的一个难点是 this 绑定。我们希望任何方法都绑定到这个 Proxy，而不是目标对象，这样我们也可以拦截它们。
值得庆幸的是，ES6 引入了另一个名为 Reflect 的新特性，它允许我们以最小的代价消除了这个问题：
** 注意：Proxy和Reflect都需要补一下es6知识了。**

const dinner = {
  meal: 'tacos'
}

const handler = {
  get(target, property, receiver) {
    return Reflect.get(...arguments)
  }
}

const proxy = new Proxy(dinner, handler)
console.log(proxy.meal)

// tacos

使用 Proxy 实现响应性的第一步就是跟踪一个 property 何时被读取。
我们在一个名为 track 的处理器函数中执行此操作，该函数可以传入 target 和 property 两个参数。
const dinner = {
  meal: 'tacos'
}

const handler = {
  get(target, property, receiver) {
    track(target, property)
    return Reflect.get(...arguments)
  }
}

const proxy = new Proxy(dinner, handler)
console.log(proxy.meal)

// tacos

这里没有展示 track 的实现。它将检查当前运行的是哪个副作用，并将其与 target 和 property 记录在一起。
这就是 Vue 如何知道这个 property 是该副作用的依赖项。

最后，我们需要在 property 值更改时重新运行这个副作用。为此，我们需要在代理上使用一个 set 处理函数：

const dinner = {
  meal: 'tacos'
}

const handler = {
  get(target, property, receiver) {
    track(target, property)
    return Reflect.get(...arguments)
  },
  set(target, property, value, receiver) {
    trigger(target, property)
    return Reflect.set(...arguments)
  }
}

const proxy = new Proxy(dinner, handler)
console.log(proxy.meal)

// tacos

还记得前面的表格吗？现在，我们对 Vue 如何实现这些关键步骤有了答案：
1、当一个值被读取时进行追踪：proxy 的 get 处理函数中 track 函数记录了该 property 和当前副作用。
2、当某个值改变时进行检测：在 proxy 上调用 set 处理函数。
3、重新运行代码来读取原始值：trigger 函数查找哪些副作用依赖于该 property 并执行它们。

该被代理的对象对于用户来说是不可见的，但是在内部，它们使 Vue 能够在 property 的值被访问或修改的情况下进行依赖跟踪和变更通知。
有一点需要注意，控制台日志会以不同的方式对 proxy 对象进行格式化，因此你可能需要安装 vue-devtools，以提供一种更易于检查的界面。
如果我们要用一个组件重写我们原来的例子，我们可以这样做：
const vm = createApp({
  data() {
    return {
      val1: 2,
      val2: 3
    }
  },
  computed: {
    sum() {
      return this.val1 + this.val2
    }
  }
}).mount('#app')

console.log(vm.sum) // 5

vm.val1 = 3

console.log(vm.sum) // 6

data返回的对象将被包裹在响应式代理中，并存储为this.$data。Property this.val1和this.val2分别是this.$data.val1
和this.$data.val2的别名，因此它们通过相同的代理。

Vue将把sum的函数包裹在一个副作用中。当我们试图访问this.sum时，它将运行该副作用来计算数值。包裹$data的响应式代理将会
当副作用运行时，property  val1和val2被读取了。

从Vue3开始，我们的响应性现在可以在一个独立包中使用。将$data包裹在一个代理中的函数被称为reactive。我们可以自己直接
调用这个函数，允许我们在不需要使用组件的情况下将一个对象包裹在一个响应式代理中。
const proxy = reactive({
  val1:2,
  val2:3,
})

在指南接下来的几页中，我们将探索响应性包所暴露的功能。这包括我们已经见过的reactive和watchEffect等函数，以及使用其他
响应性特性的方法，如不需要创建组件的computed和watch。

## 被代理的对象

Vue在内部跟踪所有已经被转成响应式的对象，所以它总是为同一个对象返回相同的代理。

当从一个响应式代理中访问一个嵌套对象时，该对象在被返回之前也被转换成为一个代理：
const handler = {
  get(target, property, receiver) {
    track(target, property)
    const value = Reflect.get(...arguments)
    if (isObject(value)) {
      // 将嵌套对象包裹在自己的响应式代理中
      return reactive(value)
    } else {
      return value
    }
  }
  // ...
}

## Proxy vs 原始标识

Proxy的使用确实引入了一个需要注意的新警告：在身份比较方面，被代理对象与原始对象不相等（===）。例如：
const obj = {}
const wrapped = new Proxy(obj,handlers)

consoel.log(obj === wrapped) // false
其他依赖严格等于比较的操作也会受到影响，例如 .includes() 或 .indexOf()

这里的最佳实践是永远不要持有对原始对象的引用，而只使用响应式版本。
(**注意：这里的最佳实践是永远不要持有对原始对象的引用，而只使用响应式版本**)
const obj = reactive({
  count:0
}) // 未引用原始

这确保了等值的比较和响应性的行为都符合预期。

请注意，Vue不会在Proxy中包裹数字或字符串等原始值，所以你仍然可以对这些值直接使用 === 来比较：
const obj = reactive({
  count:0
})

console.log(obj.count === 0) // true

## 如何让渲染响应变化
一个组件的模板被编译成一个render函数。渲染函数创建VNodes，描述该组件应该如何被渲染。它被包裹在一个副作用中，
允许Vue在运行时跟踪被“触达”的property。

一个render函数在概念上与一个computed property非常相似。Vue并不确切地追踪依赖关系是如何被使用的，它只知道
在函数运行的某个时间点上使用了这些依赖关系。如果这些property中任何一个随后发生了变化，它将触发副作用再次运行，
重新运行render函数以生成新的VNodes。然后这些举动被用来对DOM进行必要的修改。

```
### 响应性基础
```
## 声明响应式状态
要为JavaScript对象创建响应式状态，可以使用reactive方法：
import { reactive } from 'vue'

// 响应式状态
const state = reactive({
  count: 0
})

reactive 相当于Vue2.x中的Vue.observable() API，为避免与RxJS中的observables混淆因此对其重命名。
该API返回一个响应式的对象状态。该响应式转换是“深度转换”---它会影响传递对象的所有嵌套property。

Vue中响应式状态的基本用例是我们可以在渲染期间使用它。因为依赖跟踪的关系，当响应式状态改变时视图会自动更新。

这就是Vue响应式系统的本质。当从组件中的data() 返回一个对象时，它在内部交由reactive()使其成为响应式对象。模板会
被编译成能够使用这些响应式property的渲染函数。

在响应式基础API章节你可以学习更多关于reactive的内容。

## 创建独立的响应式值作为 refs
想象一下，我们有一个独立的原始值（例如，一个字符串），我们想让它变成响应式的。当然，我们可以创建一个拥有相同
字符串property的对象，并将其传递给reactive。Vue为我们提供了一个可以做相同事情的方法 --- ref：
import { ref } from 'vue'

const count = ref(0)

ref会返回一个可变的响应式对象，该对象作为一个响应式的引用维护着它内部的值，这就是ref名称的来源。该对象只包含
一个名为value的property：

import { ref } from ’vue‘
const count = ref(0)
console.log(count.value) // 0

count.value++
console.log(count.value) // 1

## Ref解包
当ref作为渲染上下文(从setup()中返回的对象)上的property返回并可以在模板中被访问时，它将自动浅层次解包内部值。
只有访问嵌套的ref时需要在模板中添加.value：**注意：只有访问嵌套的ref时需要在模板中添加.value **
<template>
  <div>
    <span>{{ count }}</span>
    <button @click="count++">Increment count</button>
    <button @click="nested.count.value++">Nested Increment count</button>
  </div>
</template>
<script>
  import { ref } from 'vue'
  export default {
    setup() {
      const count = ref(0)
      return {
        count,
        nested:{
          count
        }
      }
    }
  }
</script>
TIP
如果你不想要访问实际的对象实例，可将其用reactive包裹：
nested: reactive({
  count
})

## 访问响应式对象
当ref作为响应式对象的property被访问或更改时，为使其行为类似于普通property，它会自动解包内部值：
const count = ref(0)
const state = reactive({
  count
})
console.log(state.count) // 0
state.count = 1
console.log(state.count) // 1

如果将新的ref赋值给现有ref的property，将会替换旧的ref:
const otherCount = ref(2)
state.count = otherCount
console.log(state.count) // 2
console.log(count.value) // 1

Ref 解包仅发生在被响应式 Object 嵌套的时候。当从 Array 或原生集合类型如 Map访问 ref 时，不会进行解包：
const books = reactive([ref('Vue 3 Guide')])
// 这里需要 .value
console.log(books[0].value)

const map = reactive(new Map([['count', ref(0)]]))
// 这里需要 .value
console.log(map.get('count').value)

## 响应式状态解构
当我们想使用大型响应式对象的一些property时，可能很想使用ES6解构来获取我们想要的property：
import { reactive } from 'vue'

const book = reactive({
  author: 'Vue Team',
  year: '2020',
  title: 'Vue 3 Guide',
  description: 'You are reading this book right now ;)',
  price: 'free'
})

let { author,title } = book

遗憾的是，使用解构的两个property的响应式都会丢失。对于这种情况，我们需要将我们的响应式对象转换为
一组ref。这些ref将保留与源对象的响应式关联：
import { reactive,toRefs } from 'vue'

const book = reactive({
  author: 'Vue Team',
  year: '2020',
  title: 'Vue 3 Guide',
  description: 'You are reading this book right now ;)',
  price: 'free'
})

let { author,title } = toRefs(book)

title.value = 'Vue 3 Detailed Guide' // 我们需要使用.value作为标题，现在是ref
console.log(book.title) // 'Vue 3 Detailed Guide'

你可以在 Refs API 部分中了解更多有关 refs 的信息

## 使用readonly防止更改响应式对象
有时我们想跟踪响应式对象（ref 或 reactive）的变化，但我们也希望防止在应用程序的某个位置
更改它。例如，当我们有一个被provide的响应式对象时，我们不想让它在注入的时候被改变。为此，我们
可以基于原始对象创建一个只读的proxy对象：
import { reactiive,readonly } from 'vue'
const original = reactive({ count: 0 })

const copy = readonly(original)

// 通过 original 修改 count，将会触发依赖 copy 的侦听器

original.count++

// 通过 copy 修改 count，将导致失败并出现警告
copy.count++ // 警告: "Set operation on key 'count' failed: target is readonly."

```
### 响应式计算和侦听
```
本节使用单文件组件语法作为代码示例

## 计算值
有时我们需要依赖于其他状态的状态---- 在Vue中，这是用组件计算属性处理的，以直接创建计算值，
我们可以使用computed函数；它接受getter函数并为getter返回一个不可变的响应式ref对象。
const count = ref(1)
const plusOne = computed(()=> count.value + 1)

console.log(plusOne.value) // 2
plusOne.value++ // error ("**注意：这是不可变的，所以修改的时候会报错**")

或者，它可以使用一个带有get和set函数的对象来创建一个可写的ref对象。
const count = ref(1)
const plusOne = computed({
  get: () => count.value + 1,
  set: val => {
    count.value = val - 1
  }
})

plusOne.value = 1
console.log(count.value) // 0

```




```
把握好这一周，这一周将是属于自己时间的最后一周，后面就没有那么多的时间了。把握好，多学点。
海纳百川有容乃大。
最近老是出现拖延的现象，这个现象的本质是什么？自我剖析一下
1、马上要放假了，心里上出现了懒惰的现象。
2、缺乏计划和目标，没有进取心了。
3、...
解决的方式：
1、制定详细合理的计划和目标。
2、要有紧迫感。
3、每天都进步一点点。
4、读书、学习、扩展认知范围、改变自己的思想认知（大道至简）、多读书、技术上多探索、赚钱上多深思机会（集中在能做的、会做的事情上面，多思考）
5、小狗钱钱、富爸爸穷爸爸、明朝那些事儿、高效能人士的七个习惯、金字塔原理、毛泽东传记、毛泽东思想、毛泽东选集（真是一部好的著作）、
月亮与六便士、卡拉马佐夫兄弟、百年孤独、三体、乌合之众、非暴力沟通、原则、如何阅读一本书、硅谷钢铁侠、编码。(业余时间有事情做了)
阅读顺序：毛泽东选集、月亮与六便士、非暴力沟通、如何阅读一本书、编码、原则、卡拉马佐夫兄弟、百年孤独、三体、乌合之众、硅谷钢铁侠
https://baijiahao.baidu.com/s?id=1693542343349787787&wfr=spider&for=pc
http://www.quanxue.cn/LS_Mao/XuanJiA/XuanJiA01.html
找到一个新的方向。
6、JavaScript设计模式、你不知道的JavaScript（上中下卷）、HTML5与CSS 3权威指南（上下册）、了不起的Node.js、Node.js开发指南、移动端编程—微信小程序&MUI
https://www.douban.com/doulist/2772859/ uni-app、小程序的原理等等。
7、有时间就好好备份一下电脑上存储的东西。
8、居住积分的办理（3月8号，那年后办理居住积分就可以了）。
9、记录和总结的重要性。
10、






```




#### 组合式 API 基础

```

```


