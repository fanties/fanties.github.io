---
title: 事务专题一SpringBoot事务
date: 2021-02-06 20:50:00
sidebar: auto
categories: 
  - 后端
tags: 
  - 事务
  - 分布式事务
publish: true
permalink: /pages/8d33c7/
---

### 一、事务传播机制：
事务的传播行为是针对嵌套事务而言。
示例：

@Transactional(propagation = Propagation.REQUIRED)

在TransactionDefinition定义中包括了如下几个表示传播行为的常量：

| 常量 | 含义 |
| --- | --- |
TransactionDefinition.PROPAGATION_REQUIRED | 如果当前存在事务，则加入该事务；如果当前没有事务，则创建一个新的事务。这是默认值。
TransactionDefinition.PROPAGATION_REQUIRES_NEW | 创建一个新的事务，如果当前存在事务，则把当前事务挂起。
TransactionDefinition.PROPAGATION_SUPPORTS | 如果当前存在事务，则加入该事务；如果当前没有事务，则以非事务的方式继续运行。
TransactionDefinition.PROPAGATION_NOT_SUPPORTED | 以非事务方式运行，如果当前存在事务，则把当前事务挂起。
TransactionDefinition.PROPAGATION_NEVER | 以非事务方式运行，如果当前存在事务，则抛出异常。
TransactionDefinition.PROPAGATION_MANDATORY | 如果当前存在事务，则加入该事务；如果当前没有事务，则抛出异常。
TransactionDefinition.PROPAGATION_NESTED | 如果当前存在事务，则创建一个事务作为当前事务的嵌套事务来运行；如果当前没有事务，则该取值等价于TransactionDefinition.PROPAGATION_REQUIRED。

#### 2.1.1 REQUIRED
spring默认的事务传播行为就是它。

支持事务。如果业务方法执行时已经在一个事务中，则加入当前事务，否则重新开启一个事务。

外层事务提交了，内层才会提交。

内/外只要有报错，他俩会一起回滚。

只要内层方法报错抛出异常，即使外层有try-catch，该事务也会回滚！

因为内外层方法在同一个事务中，内层只要抛出了异常，这个事务就会被设置成rollback-only，即使外层try-catch内层的异常，该事务也会回滚。

例子：

外层方法在调用内层方法的时候包裹住try-catch，内层方法报错抛出异常。

外层方法：
```java
@Service
public class UserServiceImp implements UserService {
 
    @Resource
    private UserMapper userMapper;
 
    @Autowired
    StudentService studentService;
 
    @Override
    @Transactional
    public int addUser(User user) {
        int i = userMapper.insertSelective(user);
        Student student = new Student();
        student.setCourse("cs");
        student.setName("sid");
        try {
            studentService.addStudent(student);
        }catch (Exception e){
            //不抛出
        }
        return  i;
    }
}
```
内层方法：
```java
@Service
public class StudentServiceImp implements StudentService {
 
    @Resource
    private StudentMapper studentMapper;
 
    @Override
    @Transactional//(propagation = Propagation.NESTED)
    public int addStudent(Student student) {
        int i = studentMapper.insertSelective(student);
        int j =  10/ 0;  // 内层报错抛出异常
        return i;
    }
}
```
结果：

事务回滚，user表和student表都没有插入数据。

因为内外层方法在同一个事务中，内层只要抛出了异常，这个事务就会被设置成rollback-only，即使外层try-catch内层的异常，该事务也会回滚。

报错

org.springframework.transaction.UnexpectedRollbackException: Transaction rolled back because it has been marked as rollback-only
#### 2.1.2 REQUIRES_NEW
支持事务。每次都是创建一个新事物，如果当前已经在事务中了，会挂起当前事务。

内层事务结束，内层就提交了，不用等着外层一起提交。

外层报错回滚，不影响内层。

内层报错回滚，外层try-catch内层的异常，外层不会回滚。

内层报错回滚，然后又会抛出异常，外层如果没有捕获处理内层抛出来的这个异常，外层还是会回滚的。这是重点！！！网上有些文章的例子给错了！！！

例子：

1.调用addStudent的外层方法有事务，外层报错回滚，内层无错

外层方法：
```java
@Service
public class UserServiceImp implements UserService {
 
    @Resource
    private UserMapper userMapper;
 
    @Autowired
    StudentService studentService;
 
    @Override
    @Transactional
    public int addUser(User user) {
        int i = userMapper.insertSelective(user);
        Student student = new Student();
        student.setCourse("cs");
        student.setName("sid");
        studentService.addStudent(student);
        int j =  10/ 0; // 外层报错
        return  i;
    }
}
```
内层方法：
```java
@Service
public class StudentServiceImp implements StudentService {
 
    @Resource
    private StudentMapper studentMapper;
 
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public int addStudent(Student student) {
        int i = studentMapper.insertSelective(student);
        
        return i;
    }
}
```
结果：

内层的addStudent方法执行结束后，这个内层的事务就提交了，student表中就已经插入了数据了。

外层addUser方法报错，只是回滚了外层的这个事务，user表中没有插入数据。

2.调用addStudent的外层方法有事务，外层无错，内层报错回滚

外层方法：
```java
@Service
public class UserServiceImp implements UserService {
 
    @Resource
    private UserMapper userMapper;
 
    @Autowired
    StudentService studentService;
 
    @Override
    @Transactional
    public int addUser(User user) {
        int i = userMapper.insertSelective(user);
        Student student = new Student();
        student.setCourse("cs");
        student.setName("sid");
        studentService.addStudent(student);
        return  i;
    }
}
```
内层方法：
```java
@Service
public class StudentServiceImp implements StudentService {
 
    @Resource
    private StudentMapper studentMapper;
 
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public int addStudent(Student student) {
        int i = studentMapper.insertSelective(student);
        int j =  10/ 0;
        return i;
    }
}
```
结果：

内层的addStudent方法执行报错 ，内层事务回滚，然后再向外抛出这个异常。student表中没有插入数据。

外层addUser，如果没有捕获处理内层抛出来的异常，外层一会回滚。user表中没有插入数据。

#### 2.1.3 NESTED：
该传播行为解释：支持事务。如果当前已经在一个事务中了，则嵌套在已有的事务中作为一个子事务。如果当前没在事务中则开启一个事务。

内层事务结束，要等着外层一起提交。

外层回滚，内层也回滚。

如果只是内层回滚，不影响外层。

这个内层回滚不影响外层的特性是有前提的，否则内外都回滚。

使用前提：

1.JDK版本要在1.4以上，有java.sql.Savepoint。因为nested就是用savepoint来实现的。

2.事务管理器的nestedTransactionAllowed属性为true。

3.外层try-catch内层的异常。

例子：

1.调用addStudent的外层方法有事务，外层报错回滚，内层无错

外层调用方法：
```java
@Service
public class UserServiceImp implements UserService {
 
    @Resource
    private UserMapper userMapper;
 
    @Autowired
    StudentService studentService;
 
    @Override
    @Transactional
    public int addUser(User user) {
        int i = userMapper.insertSelective(user);
        Student student = new Student();
        student.setCourse("cs");
        student.setName("sid");
        studentService.addStudent(student);
        int i1 =  10/ 0; // 外层报错回滚
        return  i;
    }
}
```
内层调用方法：
```java
@Service
public class StudentServiceImp implements StudentService {
 
    @Resource
    private StudentMapper studentMapper;
 
    @Override
    @Transactional(propagation = Propagation.NESTED)
    public int addStudent(Student student) {
        int i = studentMapper.insertSelective(student);
        return i;
    }
}
```
结果：

studentMapper.insertSelective(student);方法执行后，数据库student表中并没有插入数据，要等到外层addUser方法的事务结束后，才一起提交。而此时，外层报错了，回滚，student表和user表都无数据插入。

2.调用addStudent的外层方法有事务，外层无错，内层报错回滚

外层调用方法：
```java
@Service
public class UserServiceImp implements UserService {
 
    @Resource
    private UserMapper userMapper;
 
    @Autowired
    StudentService studentService;
 
    @Override
    @Transactional
    public int addUser(User user) {
        int i = userMapper.insertSelective(user);
        Student student = new Student();
        student.setCourse("cs");
        student.setName("sid");
        // 强调一下，内层是nested模式下，外层要try-catch内层的异常，外层才不会回滚
        // 而内层是REQUIRED模式的话，即是外层try-catch内层异常，外层同样会回滚的
        try {
            studentService.addStudent(student); 
        }catch (Exception e){
            //不抛出
        }
        return  i;
    }
}
```
内层调用方法：
```java
@Service
public class StudentServiceImp implements StudentService {
 
    @Resource
    private StudentMapper studentMapper;
 
    @Override
    @Transactional(propagation = Propagation.NESTED)
    public int addStudent(Student student) {
        int i = studentMapper.insertSelective(student);
        int j =  10/ 0; // 内层报错
        return i;
    }
}
```
结果：

studentMapper.insertSelective(student);方法执行后，数据库student表中并没有插入数据，要等到外层addUser方法的事务结束后，才一起提交。而此时，自己内层报错了回滚，并不影响外层addUser方法的事务。 student表无数据插入。User表数据插入成功。

强调一下：

内层是nested模式下，外层要try-catch内层的异常，外层才不会回滚
而内层是REQUIRED模式的话，即是外层try-catch内层异常，外层同样会回滚的

#### 2.1.4.SUPPORTS：
该传播行为解释：支持事务。当前有事务就支持。当前没有事务就算了，不会开启一个事物。

例子：

1.直接从外面调这个addStudent方法，外面没有事务，这个addStudent方法的事务传播行为是SUPPORTS。
```java
@Service
public class StudentServiceImp implements StudentService {
 
    @Resource
    private StudentMapper studentMapper;
 
    @Override
    @Transactional(propagation = Propagation.SUPPORTS)// 这个addStudent方法的事务传播行为是SUPPORTS。
    public int addStudent(Student student) {
        int i = studentMapper.insertSelective(student);
        return i;
    }
}
```
结果：

此时相当于addStudent方法没有事务。执行了insertSelective后，数据就已经插入到Mysql对应的student表中了。

等于说@Transactional(propagation = Propagation.SUPPORTS)修饰的方法本身是没有事务性的。

2.调用addStudent的外层方法有事务

外层调用方法：
```java
@Service
public class UserServiceImp implements UserService {
 
    @Resource
    private UserMapper userMapper;
 
    @Autowired
    StudentService studentService;
 
    @Override
    @Transactional //有事务
    public int addUser(User user) {
        int i = userMapper.insertSelective(user);
        Student student = new Student();
        student.setCourse("cs");
        student.setName("sid");
        studentService.addStudent(student);// 调用addStudent方法，addStudent方法的事务传播机制是SUPPORTS
        return  i;
    }
 
}
```
 内层传播机制为SUPPORTS的方法：强调，外层方法和内层方法不在同一个类中
```java
@Service
public class StudentServiceImp implements StudentService {
 
    @Resource
    private StudentMapper studentMapper;
 
    @Override
    @Transactional(propagation = Propagation.SUPPORTS) // 这个addStudent方法的事务传播行为是SUPPORTS
    public int addStudent(Student student) {
        int i = studentMapper.insertSelective(student);
        return i;
    }
}
```
结果：

studentMapper.insertSelective(student);方法执行后，数据库student表中并没有插入数据，要等到外层addUser方法的事务结束后，才一起提交。

#### 2.1.5.MANDATORY
该传播行为解释：支持事务，如果业务方法执行时已经在一个事务中，则加入当前事务。否则抛出异常。

例子：

1.直接从外面调这个addStudent方法，外面没有事务
```java
@Service
public class StudentServiceImp implements StudentService {
 
    @Resource
    private StudentMapper studentMapper;
 
    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public int addStudent(Student student) {
        int i = studentMapper.insertSelective(student);
        return i;
    }
}
```
结果：抛出异常

org.springframework.transaction.IllegalTransactionStateException: No existing transaction found for transaction marked with propagation 'mandatory'
 2.调用addStudent的外层方法有事务

外层调用方法：
```java
@Service
public class UserServiceImp implements UserService {
 
    @Resource
    private UserMapper userMapper;
 
    @Autowired
    StudentService studentService;
 
    @Override
    @Transactional //有事务
    public int addUser(User user) {
        int i = userMapper.insertSelective(user);
        Student student = new Student();
        student.setCourse("cs");
        student.setName("sid");
        studentService.addStudent(student);// 调用addStudent方法
        return  i;
    }
 
}
```
内层方法：
```java
@Service
public class StudentServiceImp implements StudentService {
 
    @Resource
    private StudentMapper studentMapper;
 
    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public int addStudent(Student student) {
        int i = studentMapper.insertSelective(student);
        return i;
    }
}
```
结果：

studentMapper.insertSelective(student);方法执行后，数据库student表中并没有插入数据，要等到外层addUser方法的事务结束后，才一起提交。

#### 2.1.6.NOT_SUPPORTED
不支持事务，如果业务方法执行时已经在一个事务中，则挂起当前事务，等方法执行完毕后，事务恢复进行。

例子：

1.调用addStudent的外层方法有事务

外层调用方法：
```java
@Service
public class UserServiceImp implements UserService {
 
    @Resource
    private UserMapper userMapper;
 
    @Autowired
    StudentService studentService;
 
    @Override
    @Transactional
    public int addUser(User user) {
        int i = userMapper.insertSelective(user);
        Student student = new Student();
        student.setCourse("cs");
        student.setName("sid");
        studentService.addStudent(student);
        return  i;
    }
}
```
内层调用方法：
```java
@Service
public class StudentServiceImp implements StudentService {
 
    @Resource
    private StudentMapper studentMapper;
 
    @Override
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public int addStudent(Student student) {
        int i = studentMapper.insertSelective(student);
        return i;
    }
}
```
结果：

studentMapper.insertSelective(student);方法执行后，数据库student表中已经插入了数据，不用等到自己的addStudent方法的事务结束后才提交。

#### 2.1.7.NEVER
不支持事务。如果当前已经在一个事务中了，抛出异常。

例子：

1.调用addStudent的外层方法有事务

外层调用方法：
```java
@Service
public class UserServiceImp implements UserService {
 
    @Resource
    private UserMapper userMapper;
 
    @Autowired
    StudentService studentService;
 
    @Override
    @Transactional
    public int addUser(User user) {
        int i = userMapper.insertSelective(user);
        Student student = new Student();
        student.setCourse("cs");
        student.setName("sid");
        studentService.addStudent(student);
        return  i;
    }
}
```
内层调用方法：
```java
@Service
public class StudentServiceImp implements StudentService {
 
    @Resource
    private StudentMapper studentMapper;
 
    @Override
    @Transactional(propagation = Propagation.NEVER)
    public int addStudent(Student student) {
        int i = studentMapper.insertSelective(student);
        
        return i;
    }
}
```
结果：

外层addUser方法在调内层方法addStudent的时候，因为内层方法不支持事务，而外层方法开启了事务，则报错

org.springframework.transaction.IllegalTransactionStateException: Existing transaction found for transaction marked with propagation 'never'
### 二、事务的隔离机制
#### 2.1事务隔离级别
1.DEFAULT ,这是spring默认的隔离级别，表示使用数据库默认的事务隔离级别。另外四个与JDBC的隔离级别相对应。

2.READ_UNCOMMITTED 这是事务最低的隔离级别，它充许别外一个事务可以看到这个事务未提交的数据。这种隔离级别会产生脏读，不可重复读和幻读。

3.READ_COMMITTED 保证一个事务修改的数据提交后才能被另外一个事务读取。这种事务隔离级别可以避免脏读出现，但是可能会出现不可重复读和幻读。

4.REPEATABLE_READ这种事务隔离级别可以防止脏读，不可重复读。但是可能出现幻读。

5.SERIALIZABLE 事务被处理为顺序执行。防止脏读，不可重复读，防止幻读。

示例：

@Transactional(isolation=Isolation.REPEATABLE_READ)

Mysql innodb默认提供的是REPEATABLE_READ

#### 2.2脏读、不可重复读、幻读解释：
1.脏读:脏读就是指当一个事务正在访问数据，并且对数据进行了修改，而这种修改还没有提交到数据库中，这时，另外一个事务也访问这个数据，然后使用了这个数据。

Mary的原工资为1000,财务人员将Mary的工资改为了8000，但未提交事务
与此同时，Mary正在读取自己的工资.Mary发现自己的工资变为了8000，欢天喜地！ （脏读）
而财务发现操作有误，而回滚了事务,Mary的工资又变为了1000.
2.不可重复读:在一个事务中前后两次读取的结果并不致，导致了不可重复读。

在事务1中，Mary 读取了自己的工资为1000,操作并没有完成 .
在事务2中，这时财务人员修改了Mary的工资为2000,并提交了事务.
在事务1中，Mary 再次读取自己的工资时，工资变为了2000.
3.幻读：第一个事务对一个表中的全部数据行进行了修改。同时，第二个事务向表中插入一行新数据。那么操作第一个事务的用户发现表中还有未修改的数据行。

     目前工资为1000的员工有10人。

事务1,读取所有工资为1000的员工。
这时事务2向employee表插入了一条员工记录，工资也为1000
事务1再次读取所有工资为1000的员工 共读取到了11条记录

### 参考

[](https://blog.csdn.net/jy02268879/article/details/84322459)