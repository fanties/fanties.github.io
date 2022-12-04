const baidutj = require("../common/baidutj.js");

// head
module.exports = [
  // 注入到页面<head> 中的标签，格式[tagName, { attrName: attrValue }, innerHTML?]
  [
    "link",
    {
      rel: "shortcut icon",
      href: "http://picqq.oss-cn-shenzhen.aliyuncs.com//pic/md/favicon.ico",
    },
  ], //favicons，资源放在public文件夹
  [
    "link",
    {
      rel: "stylesheet",
      href: "//at.alicdn.com/t/font_3114978_qe0b39no76.css",
    },
  ], // 阿里在线矢量库
  ["meta", { name: "referrer", content: "no-referrer-when-downgrade" }], // 解决 Chrome 网站统计不准确问题

  [
    "meta",
    {
      name: "keywords",
      content: "知微坚果,一念千秋,拾光小镇,Go,Golang开发,Java,Flutter,Kotlin,后端,架构",
    },
  ],
  ["meta", { name: "theme-color", content: "#11a8cd" }], // 移动浏览器主题颜色
];
