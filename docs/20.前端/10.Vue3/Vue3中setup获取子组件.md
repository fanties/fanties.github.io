---
title: Vue3中setup()获取子组件实例
date: 2021-01-12 16:30:00
sidebar: auto
categories: 
  - 前端
tags: 
  - Vue3
publish: true
permalink: /pages/bbc17d/
---
### 引言
在vue2中，我们可以通过this.$refs来获取子组件的实例。
我们知道，在vue3中，setup函数中this是不起作用的
所以我们在setup中不能使用this.$refs来获取实例。

### 使用方式
下面是vue3中获取实例的办法：

子组件
```vue
// childCompoment.vue
<template>
  // 渲染从父级接受到的值
  <div>Child: {{ valueRef }}</div>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const valueRef = ref('')
    
    // 该函数可以接受父级传递一个参数，并修改valueRef的值
    const acceptValue = (value: string) => (valueRef.value = value)

    return {
      acceptValue,
      valueRef
    }
  }
})
</script>
```

父组件
```vue
<template>
  <div>childRef</div>
  <button @click="sendValue">send</button>
  // 这里ref接受的字符串，要setup返回的ref类型的变量同名
  <chiled-compoment ref="childRef" />
</template>

<script>
import { ref } from 'vue'
import childCompoment from './childCompoment.vue'

export default ({
  components: {
    childCompoment
  },
  setup() {
    // 如果ref初始值是一个空，可以用于接受一个实例
    // vue3中获取实例的方式和vue2略有不同
    const childRef = ref()
    const sendValue = () => {
      // 可以拿到子组件实例，并调用其setup返回的所有信息
      console.log(childRef.value)
      // 通过调用子组件实例的方法，向其传递数据
      childRef.value.acceptValue('hello world')
    }
    return {
      childRef,
      sendValue
    }
  }
})
</script>
```
其实这种方式跟Vue2中使用this.refs,this.children的方式很相似，都是通过拿到子组件实例，直接调用子组件身上的函数。
### ref方式总结
优点：父组件可以获取快速向确定存在的子组件传递数据，传递的参数不受限制，传递方式比较灵活
缺点：ref获取的子组件必须确定存在的（不确定存在的情况：如插槽上子组件，v-if控制的子组件），子组件还需要实现接受参数的方法