---
title: 解决Docker启动java进程号1的问题
date: 2022-11-29 19:35:36
permalink: /pages/58ac01/
categories:
  - 运维
tags:
  - 
---


### 解决spring boot应用以docker容器方式启动后，进程ID是1而导致的jstack和jmap等命令不可用的现象  

默认将spring boot工程打包成镜像的方式 
1. 当我们把spring boot打包成一个可执行jar 
2. 编写Dockerfile 将jarcopy到容器中，在cmd 中执行java -jar ***.jar 启动，Dockerfile文件如下 

```Dockerfile
#基础镜像基于openjdk，利用alpine  
FROM openjdk:8u212-jdk-alpine  
#所属团队  
MAINTAINER chengf  
  
ENV JAVA_OPTS="-server -Xms512m -Xmx512m" LOGGING_LEVEL="INFO"  
#编译时变量无法在运行时用，此处做一次转换  
ENV TARGET_JAR="spring-boot-sample-0.0.1-SNAPSHOT.jar"  
  
#将编译好的工程jar包copy到镜像容器中  
COPY ${TARGET_JAR} /usr/src/${TARGET_JAR}  
  
  
ENV OPTS=${JAVA_OPTS}" -Dfile.encoding=UTF8    -Duser.timezone=GMT+08"  
WORKDIR /usr/src  
#程序入口  
  
  
CMD java -jar ${OPTS} ${TARGET_JAR} --logging.level.root=${LOGGING_LEVEL}  
```
启动镜像后执行docker exec 进入到容器内部，执行ps可以看到容器中进程号是1的就是我们的应用启动进程 

### 解决办法

解决办法 
因为jstack jmap等jdk自带的tools放发无法对1号进程分析，那我们就想办法把java进程变为非1号进程对应的Dockerfile 

```Dockerfile
#基础镜像基于openjdk，利用alpine  
FROM openjdk:8u212-jdk-alpine  

ENV JAVA_OPTS="-server -Xms512m -Xmx512m" LOGGING_LEVEL="INFO"  
#编译时变量无法在运行时用，此处做一次转换
ENV TARGET_JAR="spring-boot-sample-0.0.1-SNAPSHOT.jar"

#将编译好的工程jar包copy到镜像容器中  
COPY ${TARGET_JAR} /usr/src/${TARGET_JAR}  

ENV OPTS=${JAVA_OPTS}" -Dfile.encoding=UTF8    -Duser.timezone=GMT+08"
WORKDIR /usr/src  
#程序入口  

#CMD java -jar ${OPTS} ${TARGET_JAR} --logging.level.root=${LOGGING_LEVEL}  

RUN echo "java -jar \${OPTS} \${TARGET_JAR} --logging.level.root=\${LOGGING_LEVEL}" > start.sh \
             && chmod 777 start.sh
# CMD ./start.sh
ENTRYPOINT ["./start.sh"]
```



这样启动后1号进程就变成了 start.sh 由1号进程启动的进程才是我们的java进程

### 总结
不管通过什么方式 只要让启动命令不是第一个执行的就能解决问题。

### 相关问题

https://github.com/alibaba/arthas/issues/362
https://github.com/docker-library/openjdk/issues/76
https://github.com/krallin/tini

### 参考资料

解决spring boot应用以docker容器方式启动后，进程ID是1而导致的jstack和jmap等命令不可用的问题
https://www.iteye.com/blog/fengyilin-2451011