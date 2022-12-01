---
title: Idea启动Java报错Shorten command line
date: 2021-03-25 12:00:00
sidebar: auto
categories: 
  - tips
tags: 
  - Idea
  - 工具
publish: true
permalink: /pages/f59a3a/
---

### 问题描述
启动控制台报错：
Command line is too long. Shorten command line for SpringBootMainApplication or also for Application

Error running 'SpringBootMainApplication': Command line is too long. Shorten command line for SpringBootMainApplication or also for Application default configuration.


### 解决方案：

修改项目下 .idea\workspace.xml

找到标签 <component name="PropertiesComponent">。在标签里加一行  ：
```xml
<property name="dynamic.classpath" value="true" />
```

### 参考资料

[Command line is too long. Shorten command line for SpringBootMainApplication or also for Application](https://blog.csdn.net/wochunyang/article/details/84776813)


https://blog.csdn.net/weixin_42941486/article/details/105784849