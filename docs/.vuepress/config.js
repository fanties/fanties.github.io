const head = require("./config/head.js");
const plugins = require("./config/plugins.js");
const themeConfig = require("./config/themeConfig.js");

const { penName, title } = require("./common/info");

module.exports = {
  // 使用npm包主题 vuepress-theme-vdoing
  theme: "vdoing",
  // 仓库地址
  base: "/",
  head,
  markdown: {
    lineNumbers: true, // 显示代码块的行号
    extractHeaders: ["h2", "h3", "h4"], // 支持 h2、h3、h4 标题
  },
  // 多语言支持
  locales: {
    "/": {
      lang: "zh-CN",
      title: penName + title,
      description:
        "道虽迩，不行不至，事虽小，不为不成。",
    },
  },
  plugins,
  themeConfig,
};
