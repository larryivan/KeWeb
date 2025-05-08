import { defineConfig } from "vitepress";
import { fileURLToPath, URL } from "node:url";
import { getSidebar } from "./utils/getSidebar";

export default defineConfig({
  // 标签上显示的网站标题
  title: "Ke's Lab",
  // 在标签上显示所的 logo
  head: [["link", { rel: "icon", href: "/logo.png" }]],

  // 网站描述，有利于被搜索引擎捕获
  description:
    "Welcome to Ke's Lab, where we explore human evolutionary history through paleogenomics, bioinformatics, and population genetics, integrating ancient DNA evidence with archaeological findings and linguistic theories to unravel the story of our species' origins and migrations across time.",

  // md 文件根目录
  // 【谨慎修改】：一旦修改将引起较多变动
  srcDir: "./src",

  // 主题自定义
  themeConfig: {
    // 网站左上角 logo
    logo: "/logo.png",
    // 顶部导航栏
    nav: [
      { text: "Blogs", link: "/Notes/index" },
      { text: "Publications", link: "/Publications" },
      { text: "Public Outreach", link: "./PO.md"},
      { text: "Software", link: "Software.md" },
      { text: "Members", link: "Members.md" },
      { text: "Contact", link: "/Contact.md" },
    ],
    // 顶部导航栏左侧的社交平台跳转
    socialLinks: [{ icon: "github", link: "https://github.com/wangke16" }],
    // 首页底部版权声明
    footer: {
      copyright: "Copyright © 2025-present Ke's Group in Fudan University.",
    },
    // 【文章页面左侧导航】
    sidebar: false,
    // 文章内导航栏标题
    // 是否启动搜索功能
    search: {
      provider: "local",
    },
  },
  // 数学公式支持
  markdown: {
    math: true,
  },
  // !请勿修改
  vite: {
    resolve: {
      alias: [
        {
          find: /^.*\/VPDocFooterLastUpdated\.vue$/,
          replacement: fileURLToPath(
            new URL("./components/UpdateTime.vue", import.meta.url)
          ),
        },
        {
          find: /^.*\/VPFooter\.vue$/,
          replacement: fileURLToPath(new URL("./components/Footer.vue", import.meta.url)),
        },
      ],
    },
  },
  lastUpdated: true,
});
