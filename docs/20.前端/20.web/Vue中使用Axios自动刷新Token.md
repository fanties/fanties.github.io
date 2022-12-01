---
title: Vue中使用Axios自动刷新Token
date: 2020-09-14 00:00:00
sidebar: auto
categories: 
  - 前端
tags: 
  - Vue
  - Axios
  - Token
publish: true
permalink: /pages/ac0f1b/
---

> 现在许多项目都是前后端分离的，前端项目访问后端接口请求对应的数据信息，通常我们都是通过登录获取accessToken和refreshToken前端保存在本地，
> 每次请求都在header中携带accessToken信息，如果accessToken过期，则后台会返回特定的错误码，前端此时就需要使用refreshToken去获取新的accessToken了。

今天我们来聊一聊Vue中实现自动刷新token。
### 需求分析
针对上面这种情况，我们知道，业务中的每次请求都需要携带token，如果失败了，我们希望能够
自动进行刷新token的操作，并且刷新成功之后，再尝试重新访问刚才的请求，这样对用户做到
无感知的刷新token。
### 思考
如果项目中有上诉需求的接口只有一个的话，我们可以很显然的想到，
判断请求结果的response的status或者自定义body中的code，
如果是后端定义的 **“accessToken过期”**的错误码，
我们就再调用刷新token的接口，获取到新的aceessToken，
然后携带新的acessToken再请求一次之前业务中请求的接口，返回给调用者即可。

但是项目中接口非常多的时候，我们不可能在每个调用的地方都重复这样的操作，
所以我们需要将这些相同的操作抽象出来统一操作。

像这种多个业务具有统一的和业务没有直接关联的功能，
如果熟悉后端开发的同学可能知道，
java中的拦截器或者过滤器，其实都可以实现类似的操作。
同时Spring提供的AOP面向切面编程则更加强大。

在axios中也有拦截器的概念，下面我们就用其来实现这个需求。

### axios实现

首先是刷新token的代码
```javascript
function refreshToken () {
    return axios.request({
        url: '/token/refresh',
        headers: {
            isToken:false
        },
        method: 'post',
        params: { refreshToken: refreshToken }
    }).then(res => res.data)
}

```
下面是axios的响应拦截器
```javascript
axios.interceptors.response.use(res => {
    const status = Number(res.status) || 200;
    const message = res.data.msg || '未知错误';
    //如果请求为200则放过，否者默认统一处理,或者在website中配置statusWhiteList白名单自行处理
    // 401  access_token错误，先尝试用refresh_token刷新
    if (status === 400 && res.data.code === 401){
        const config = res.config
        if (!isRefreshing) {
            isRefreshing = true
            return refreshToken().then(res => {
                console.log("刷新token:",res)
                let data = res.data
                // TODO 在这里保存token
                config.headers['token'] = data.accessToken
                // 已经刷新了token，将所有队列中的请求进行重试
                requests.forEach(cb => cb(data.accessToken))
                return axios(config)
            }).catch(e => {
                return Promise.reject(e)
            }).finally(() => {
                isRefreshing = false
            })
        } else {
            // 正在刷新token，返回一个未执行resolve的promise
            return new Promise((resolve) => {
                // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
                requests.push((token) => {
                    //config.baseURL = ''
                    config.headers['token'] = token
                    resolve(axios(config))
                })
            })
        }
    }
    // refresh_token错误 清空用户信息，并弹出登录窗口
    if (status === 400 && res.data.code === 402){
        // TODO 清空用户信息
        Message({
            message: "登录已过期,请重新登录",
            type: 'error'
        })
        return Promise.reject(new Error("登录已过期,请重新登录"))
    }
    console.log("进入结果拦截器：")
    if (status !== 200) {
        if (status === 400 && res.data.code === 400){
            Message({
                message: message,
                type: 'error'
            })
        }
        return Promise.reject(res)
    }
    return res;
}, error => {
    console.log(error);
    return Promise.reject(new Error(error));
})
```

下面是axios请求拦截器

```javascript
//HTTPRequest拦截
axios.interceptors.request.use(config => {
    const isToken = (config.data || {}).isToken === false
    let token = store.state.user.accessToken
    if (token && !isToken) {
        config.headers['token'] = token // 让每个请求携带token--['Authorization']为自定义key 请根据实际情况自行修改
    }
    return config
}, error => {
    return Promise.reject(error)
});
```
### 总结
以上就是axios实现的访问失败时自动刷新token
这种方式必须要后端配合，当请求携带的aceessToken过期时，返回特定的错误码