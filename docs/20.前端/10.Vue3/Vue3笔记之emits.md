---
title: Vue3笔记之emits
date: 2020-12-13 10:00:00
sidebar: auto
categories: 
  - 前端
tags: 
  - Vue
  - Vue3
publish: true
permalink: /pages/78f387/
---

### 概述
Vue 3增加了emits选项，和props选项很相似。
emits用于定义该组件能够emit发送给父组件的事件列表(events)

### Vue 2中用法

直接通过
```js
this.$emit("accepted")
```
向父组件发送事件。

### 在Vue 3中

可以这样定义
```js
export default {
    props: ['text'],
    emits: ['accepted']
}
// 发送
this.$emit('accepted')
```

### emits用法

emits 可以是数组或对象，从组件触发自定义事件，emits 可以是简单的数组，或者对象作为替代，允许配置和事件验证。

在对象语法中，每个 property 的值可以为 null 或验证函数。验证函数将接收传递给 $emit 调用的其他参数。如果 this.$emit('foo',1) 被调用，foo 的相应验证函数将接收参数 1。验证函数应返回布尔值，以表示事件参数是否有效。

代码案例：
```js
const app = Vue.createApp({})

// 数组语法
app.component('todo-item', {
  emits: ['check'],
  created() {
    this.$emit('check')
  }
})

// 对象语法
app.component('reply-form', {
  emits: {
    // 没有验证函数
    click: null,

    // 带有验证函数
    submit: payload => {
      if (payload.email && payload.password) {
        return true
      } else {
        console.warn(`Invalid submit event payload!`)
        return false
      }
    }
  }
})
```

:::TIPS 注意
emits 选项中列出的事件不会从组件的根元素继承，也将从 $attrs property 中移除。
:::

### 特性
在Vue 3中强烈建议在emits中声明需要向父组件发送的事件。

特别是在和html原生事件名字相同的时候，这个就和Vue 2表现不同了。

在Vue 2中，是通过.native监听原生事件

而在Vue 3中，已经移除了.native属性。所有的组件事件都被声明在emits中，没有声明的，在组件的 $attrs中会存在，这样会默认绑定到组件根节点。

举例
下面这样的代码，组件没有在emits中声明click事件，父组件监听该事件会触发两次。
```js
<template>
  <button v-on:click="$emit('click', $event)">OK</button>
</template>
<script>
export default {
  emits: [] // without declared event
}
</script>
```
父组件监听：
```html
<my-button v-on:click="handleClick"></my-button>
```
会触发两次：

一次是因为调用 $emit().
一次是因为原生事件监听器被应用到了根节点元素

### 总结
1. 在Vue 3中，我们需要将在组建中emit的事件都声明到emits中
2. emits中可以通过对象方式声明，可以包含参数校验
3. Vue 3取消了.native
4. Vue 3父组件监听事件，没有声明emits的会同时触发原生和emit事件
5. Vue 3中声明了emits的事件，父组件监听到的只有组件emit的事件

