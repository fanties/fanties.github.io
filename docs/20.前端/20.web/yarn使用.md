---
title: yarn搭建与使用
date: 2021-01-28 11:29:00
sidebar: auto
categories: 
  - 环境
tags: 
  - npm
publish: true
permalink: /pages/eb33ad/
---

### 引言
> Yarn是facebook发布的一款取代npm的包管理工具。

### yarn的特点：

1，速度超快。
Yarn 缓存了每个下载过的包，所以再次使用时无需重复下载。 同时利用并行下载以最大化资源利用率，因此安装速度更快。
2，超级安全。
在执行代码之前，Yarn 会通过算法校验每个安装包的完整性。
3，超级可靠。
使用详细、简洁的锁文件格式和明确的安装算法，Yarn 能够保证在不同系统上无差异的工作。


### yarn的安装:
下载node.js，使用npm安装
```
npm install -g yarn 
```
如果npm安装后提示yarn命令不存在，去官网下载msi安装：

https://classic.yarnpkg.com/en/docs/install#windows-stable

查看版本：
```
yarn --version
```

Yarn 淘宝源安装：
```
yarn config set registry https://registry.npm.taobao.org -g 
yarn config set sass_binary_site http://cdn.npm.taobao.org/dist/node-sass -g
```
### 常用yarn命令
```
安装yarn 
npm install -g yarn
安装成功后，查看版本号： 
yarn --version
创建文件夹 yarn 
md yarn
进入yarn文件夹 
cd yarn
初始化项目 
yarn init // 同npm init，执行输入信息后，会生成package.json文件

yarn的配置项： 
yarn config list // 显示所有配置项
yarn config get <key> //显示某配置项
yarn config delete <key> //删除某配置项
yarn config set <key> <value> [-g|--global] //设置配置项

安装包： 
yarn install //安装package.json里所有包，并将包及它的所有依赖项保存进yarn.lock
yarn install --flat //安装一个包的单一版本
yarn install --force //强制重新下载所有包
yarn install --production //只安装dependencies里的包
yarn install --no-lockfile //不读取或生成yarn.lock
yarn install --pure-lockfile //不生成yarn.lock


添加包（会更新package.json和yarn.lock）：
yarn add [package] // 在当前的项目中添加一个依赖包，会自动更新到package.json和yarn.lock文件中
yarn add [package]@[version] // 安装指定版本，这里指的是主要版本，如果需要精确到小版本，使用-E参数
yarn add [package]@[tag] // 安装某个tag（比如beta,next或者latest）
//不指定依赖类型默认安装到dependencies里，你也可以指定依赖类型：

yarn add --dev/-D // 加到 devDependencies
yarn add --peer/-P // 加到 peerDependencies
yarn add --optional/-O // 加到 optionalDependencies
//默认安装包的主要版本里的最新版本，下面两个命令可以指定版本：

yarn add --exact/-E // 安装包的精确版本。例如yarn add foo@1.2.3会接受1.9.1版，但是yarn add foo@1.2.3 --exact只会接受1.2.3版
yarn add --tilde/-T // 安装包的次要版本里的最新版。例如yarn add foo@1.2.3 --tilde会接受1.2.9，但不接受1.3.0
发布包

yarn publish
移除一个包 
yarn remove <packageName>：移除一个包，会自动更新package.json和yarn.lock
更新一个依赖 
yarn upgrade 用于更新包到基于规范范围的最新版本
运行脚本 
yarn run 用来执行在 package.json 中 scripts 属性下定义的脚本
显示某个包的信息 
yarn info <packageName> 可以用来查看某个模块的最新版本信息
缓存 
yarn cache 
yarn cache list # 列出已缓存的每个包 
yarn cache dir # 返回 全局缓存位置 
yarn cache clean # 清除缓存
```

### npm与yarn命令比较

| NPM | YARN | 说明 |
| --- | --- | --- |
npm init | yarn int | 初始化某个项目
npm install/link | yarn install/link | 默认的安装依赖操作
npm install taco -save | yarn add taco | 安装某个依赖，并且默认保存到package.
npm uninstall taco -save | yarn remove taco |移除某个依赖项目
npm install taco -save -dev | yarn add taco -dev |安装某个开发时依赖项目
npm update taco -save | yarn upgrage taco | 更新某个依赖项目
npm install taco --global | yarn global add taco |安装某个全局依赖项目
npm publish/login/logout | yarn publish/login/logout | 发布/登录/登出，一系列NPM Registry操作
npm run/test | yarn run/test | 运行某个命令

### 快速删除node_modules
手动删除真的很慢：

安装： npm install rimraf -g
使用：rimraf node_modules

rimraf是node的一个包，可以快速删除node_modules，再也不用等半天了


### 参考文献

[yarn的安装和使用](https://www.cnblogs.com/yizhilin/p/12995815.html)