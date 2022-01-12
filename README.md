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

#### 什么是组合式 API？

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
}

```

#### 组合式 API 基础

```

```


