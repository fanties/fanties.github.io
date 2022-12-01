---
title: Vue3笔记之v-for与v-if优先级
date: 2020-12-12 21:00:00
sidebar: auto
categories: 
  - 前端
tags: 
  - Vue
  - Vue3
publish: true
permalink: /pages/2ad2e9/
---

### Vue3中v-for与v-if优先级变化

- vue 2.x,在同一个元素中使用v-for和v-if，v-for会先生效
- vue 3.x中，v-if优先级高于v-for

### 优先级测试

在vue2中，像下面这样使用，是没有问题的
```html
<div v-for="item in list" :key="item" v-if="item =='blue'">
    {{item}}
</div>
```
在vue3中，会提示item找不到：
![20201212191530](http://picqq.oss-cn-shenzhen.aliyuncs.com//pic/md/20201212191530.png)

### 经验总结
一般eslint会提示不要再同一个节点中使用v-for和v-if，在实际开发中，这样会可能会产生一些歧义，不同版本用法不兼容，所以我们应该避免这样的用法。
```
[vue/no-use-v-if-with-v-for]
The 'list' variable inside 'v-for' directive should be replaced with a computed property that returns filtered array instead. You should not mix 'v-for' with 'v-if'.eslint-plugin-vue
```
合理的用法：
- 如果需要满足条件再渲染v-for，我们可以在外层加一个template包裹，在template上面加v-if
- 如果需要对循环之后，选择渲染某一个，我们可以v-for本身用template,v-if用在内部标签上
- 或者我们通过计算属性，来过滤要渲染的list，这会更加规范。

### 参考连接

[Vue官方风格指南](https://v3.cn.vuejs.org/style-guide)