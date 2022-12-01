---
title: Vue3笔记之自定义指令
date: 2020-12-13 10:00:00
sidebar: auto
categories: 
  - 前端
tags: 
  - Vue
  - Vue3
publish: true
permalink: /pages/04bd0a/
---

### 2.x 语法
在 Vue 2，自定义指令是通过使用下面列出的钩子来创建的，这些钩子都是可选的

bind - 指令绑定到元素后发生。只发生一次。
inserted - 元素插入父 DOM 后发生。
update - 当元素更新，但子元素尚未更新时，将调用此钩子。
componentUpdated - 一旦组件和子级被更新，就会调用这个钩子。
unbind - 一旦指令被移除，就会调用这个钩子。也只调用一次。
下面是一个例子：
```js
<p v-highlight="'yellow'">高亮显示此文本亮黄色</p>
Vue.directive('highlight', {
  bind(el, binding, vnode) {
    el.style.background = binding.value
  }
})
```
在这里，在这个元素的初始设置中，指令通过传递一个值来绑定样式，该值可以通过应用程序更新为不同的值。

### 3.x 语法
然而，在 Vue 3 中，我们为自定义指令创建了一个更具凝聚力的 API。正如你所看到的，它们与我们的组件生命周期方法有很大的不同，即使我们正与类似的事件钩子，我们现在把它们统一起来了：

bind → beforeMount
inserted → mounted
beforeUpdate：新的！这是在元素本身更新之前调用的，很像组件生命周期钩子。
update → 移除！有太多的相似之处要更新，所以这是多余的，请改用 updated。
componentUpdated → updated
beforeUnmount：新的！与组件生命周期钩子类似，它将在卸载元素之前调用。
unbind -> unmounted
最终 API 如下：
```js
const MyDirective = {
  beforeMount(el, binding, vnode, prevVnode) {},
  mounted() {},
  beforeUpdate() {}, // 新
  updated() {},
  beforeUnmount() {}, // 新
  unmounted() {}
}
```
生成的 API 可以这样使用，与前面的示例相同：
```js
<p v-highlight="'yellow'">高亮显示此文本亮黄色</p>
const app = Vue.createApp({})

app.directive('highlight', {
  beforeMount(el, binding, vnode) {
    el.style.background = binding.value
  }
})
```
既然定制指令生命周期钩子映射了组件本身的那些，那么它们就更容易推理和记住了！

### 参数中组件实例获取方式

在Vue 2中，通过vnode获取组件实例：
```js
bind(el, binding, vnode) {
  const vm = vnode.context
}
```
在Vue 3中, 通过binding获取组件实例:
```
mounted(el, binding, vnode) {
  const vm = binding.instance
}
```
::: WARNING 注意！
有了[片段(fragments)支持](https://v3.cn.vuejs.org/guide/migration/fragments.html)，组件可能有多个根节点。当应用于多根组件时，将忽略指令并记录警告。
:::

### 总结

在Vue 3中，自定义指令发生了不少变化，我们总结以下几点：

1. Vue2中自定义组件是全局API，即通过Vue.directive()使用
2. Vue3中自定义组件是应用API，即通过createApp({})返回的实例来调用：app.directive()
3. 生命周期的钩子函数调整，Vue3中和组件生命周期钩子函数进行了统一
4. 在Vue 2中，通过vnode获取组件实例，在Vue 3中, 通过binding获取组件实例
5. 在Vue3中，有多个根节点的组件，自定义组件应用于多根组件时，不会生效。