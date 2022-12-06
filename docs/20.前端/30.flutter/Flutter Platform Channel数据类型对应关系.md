---
title: Flutter Platform channel 数据类型与Java对应关系
date: 2021-05-29 22:46:00
sidebar: auto
categories: 
  - 前端
tags: 
  - Flutter
  - Dart
publish: true
permalink: /pages/0e0bfe/
---


### Flutter Platform channel简介

Flutter中通过Platform Channel实现Flutter和原生端的数据传递

### 类型对照表
The following table shows how Dart values are received on the platform side and vice versa:

Dart | Java | Kotlin | Obj-C | Swift
--- | --- | --- | --- | ---
null | null | null | nil (NSNull when nested) | nil
bool | java.lang.Boolean | Boolean | NSNumber numberWithBool: | NSNumber(value: Bool)
int | java.lang.Integer | Int | NSNumber numberWithInt: | NSNumber(value: Int32)
int, if 32 bits not enough | java.lang.Long | Long | NSNumber numberWithLong: | NSNumber(value: Int)
double | java.lang.Double | Double | NSNumber numberWithDouble: | NSNumber(value: Double)
String | java.lang.String | String | NSString | String
Uint8List | byte[] | ByteArray | FlutterStandardTypedData typedDataWithBytes: | FlutterStandardTypedData(bytes: Data)
Int32List | int[] | IntArray | FlutterStandardTypedData typedDataWithInt32: | FlutterStandardTypedData(int32: Data)
Int64List | long[] | LongArray | FlutterStandardTypedData typedDataWithInt64: | FlutterStandardTypedData(int64: Data)
Float64List | double[] | DoubleArray | FlutterStandardTypedData typedDataWithFloat64: | FlutterStandardTypedData(float64: Data)
List | java.util.ArrayList | List | NSArray | Array
Map | java.util.HashMap | HashMap | NSDictionary | Dictionary

### 拓展

**FIDL**：Flutter与原生通讯的新姿势，不局限于基础数据类型

### 参考资料

Flutter官方文档：
[Writing custom platform-specific code](https://flutter.dev/docs/development/platform-integration/platform-channels)