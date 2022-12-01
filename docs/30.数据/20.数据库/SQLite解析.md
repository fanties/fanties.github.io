---
title: SQLite解析
date: 2022-05-29 19:26:18
permalink: /pages/7b8498/
categories:
  - 数据
  - 数据库
tags:
  - 数据库
---



## WAL2设计

在传统wal模式下，如果Writer希望在检查点正在进行时写入数据库，它可能会将帧附加到现有wal文件中。
这意味着在检查点完成后，wal文件由一大块检查点帧组成，然后是一大块未检查点帧。
在以大量写流量为特点的部署中，这可能意味着wal文件从未被完全检查过。因此会无限增长。

另一种方法是使用"`PRAGMA journal_mode = wal2`"或类似命令强制完成wal文件的checkpoint。
但这必须：
1）等待所有现有读取操作完成
2）等待任何现有写入操作，然后阻止所有新写入操作
3）执行checkpoint
4）等待在步骤2和3期间启动的任何新读取操作。写入操作在此步骤中仍被阻止。

这意味着，为了避免wal文件在繁忙的系统中无限增长，Writer必须定期暂停以完成checkpoint。在具有长时间运行的读取操作的系统中，这种暂停可能会持续很长时间。

### 解决方案概述

Wal2模式使用两个wal文件。

Writer将第一个wal文件扩展到`pre-configured size`后，开始将事务附加到第二个wal文件。
一旦所有现有reader都在读取足够新的快照以包含整个第一个wal文件，就可以对其进行checkpoint。

与此同时，Writer正在将事务写入第二个wal文件。
一旦wal文件的大小超过`pre-configured size`，每个新的Writer都会检查：
- 第一个wal文件是否已被检查；
- 如果已被检查，是否没有reader还在读取第一个wal文件（一旦被检查，新的reader将只从第二个wal文件读取）。

如果这两个条件都为真，Writer可以切换回第一个wal文件。
最后，checkpoint可以检查第二个wal文件，依此类推。


Writer当前追加到的wal文件（写入前无需检查上述两个条件的文件）称为“当前”wal文件。
第一个wal文件的名称与传统wal模式系统中的wal文件的名称相同-`db>-wal`。
第二个名为`<db>-wal2`。

### Checkpoint

上述`pre-configured size`是由`PRAGMA journal_size_limit`设置的值。
或者，如果未设置`journal_size_limit`，则为1000页。

wal2模式中只有一种类型的检查点（没有`truncate`、`restart`等），它总是checkpoint单个wal文件的全部内容。
只有在Writer将第一个事务写入另一个wal文件，并且所有Reader都在读取包含另一个wal文件中至少一个事务的快照之后，才能检查wal文件。

> 译者注：通俗来说，就是单个WAL文件只有没有写入和读取事务的时候，才能checkpoint。



如果注册了`wal-hook`，则在提交写入事务后调用`wal-hook`，就像在传统wal模式中一样。

传递给`wal-hook`的整数参数是两个wal文件中未checkpoint帧的总数。

除此之外，如果没有可以checkpoint的帧，则该参数设置为零。这在两种情况下发生：
1. 另一个wal文件（writter还没有追加的那个文件）是完全空的
2. 另一个wal文件（writter还没有追加的那个文件）已被检查点。

WAL文件格式wal2模式下每个WAL文件使用的文件格式与传统WAL模式相同。
除此之外，文件格式字段设置为3021000，而不是3007000。

### WAL-INDEX格式

WAL索引格式也非常相似。
尽管有两个wal文件，但仍有一个wal索引共享内存区域（默认unix或win32 VFS的shm文件）。
wal索引标头的大小相同，但有以下例外：
版本字段设置为3021000，而不是3007000。
传统wal索引头中未使用的32位字段现在用于存储（a）单个位，指示两个wal文件Writer中的哪一个应该附加到wal文件，以及（b）第二个wal文件中的帧数（31位）。
wal索引中的第一个哈希表包含与存储在第一个wal文件中的第一个 HASHTABLE_NPAGE_ONE frames相对应的条目。
wal索引中的第二个哈希表包含索引第二个wal文件中第一个HASHTABLE_NPAGE帧的条目。
第三个哈希表包含第一个wal文件中的下一个HASHTABLE_NPAGE帧，依此类推。

### 锁

读锁比传统wal模式更简单。
没有包含帧编号的锁定插槽。
相反，Reader可能持有四种不同的读锁组合：

1. WAL_LOCK_PART1：第一个WAL上的“part”锁，没有第二个WAL。
2. WAL_LOCK_PART1_FULL2：“part”锁定第一个WAL，“full”锁定第二个WAL。
3. WAL_LOCK_PART2：第一个WAL上没有锁，第二个WAL上有“part”锁。
4. WAL_LOCK_PART2_FULL1：第一个WAL上“full”锁定，“part”锁定第二个WAL。

当Reader在打开读取事务时读取wal索引头时，它会对当前wal文件进行`"part" lock`。
“Part”，因为当读取事务处于活动状态时，wal文件可能会增长，在这种情况下，Reader将只读取wal文件的一部分。

`"part" lock`可防止检查点程序检查其所在的wal文件。
如果非当前wal文件中有未检查的数据，则Reader会对该wal文件进行`"full" lock`。

`"full" lock`表示Reader正在使用整个wal文件。
`"full" lock`可防止Writer覆盖其所在的wal文件，但不会阻止检查点程序对其进行检查。

仍然只有一个WRITER和一个CHECKPOINTER锁。
恢复过程仍然在整个`SQLITE_SHM_NLOCK shm-locks`范围内使用相同的独占锁。
这是因为上面的读锁使用传统wal模式使用的六个读锁插槽中的四个。


### 启动/恢复 

wal2数据库中数据库头的读写版本字段设置为0x03，而不是传统wal模式中的0x02。
wal2模式中使用的wal文件格式与传统wal模式中使用的格式相同。

但是，为了支持恢复，wal文件头字段的填充方式有两个不同，如下所示：
第一个wal文件首次创建时，wal文件头中的“nCkpt”字段设置为0。
此后，每次编写器切换wal文件时，都会将新wal文件头中的nCkpt字段设置为 `((nCkpt0 + 1) & 0x0F)`，其中nCkpt0是前一个wal文件头中的值。
这意味着第一个wal文件在nCkpt字段中始终具有偶数值，而第二个wal文件始终具有奇数值。
当Writer切换wal文件时，它会将新wal文件中的salt值设置为前一wal文件中最后一帧的校验和的副本。


恢复处理过程如下：
1. 每个wal文件都是单独恢复的。
除此之外，如果第一个wal文件不存在或大小为零字节，则第二个wal文件在“恢复”之前将被截断(truncated)为零字节。

2. 如果两个wal文件都包含有效的headers，则会比较nCkpt字段，以查看两个wal文件中哪个旧。如果第二个wal文件中的salt密钥与旧wal文件中的最终帧校验和匹配，则使用两个wal文件。否则，将忽略较新的wal文件。或者，如果只有一个或两个wal文件都没有有效的头，则只有一个或没有wal文件恢复到重建的wal索引中。