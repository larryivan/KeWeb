import { defineConfig } from "vitepress";
import { fileURLToPath, URL } from "node:url";
import { getSidebar } from "./utils/getSidebar";

export default defineConfig({
  // 标签上显示的网站标题
  title: "王轲课题组",
  // 在标签上显示所的 logo
  head: [["link", { rel: "icon", href: "/logo.png" }]],

  // 网站描述，有利于被搜索引擎捕获
  description:
    "Welcome to Ke's Lab, where we explore human evolutionary history through paleogenomics, bioinformatics, and population genetics, integrating ancient DNA evidence with archaeological findings and linguistic theories to unravel the story of our species' origins and migrations across time.",

  // md 文件根目录
  // 【谨慎修改】：一旦修改将引起较多变动
  srcDir: "./src",

  // 多语言支持
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      title: "Ke's Lab",
      description:
        "Welcome to Ke's Lab, where we explore human evolutionary history through paleogenomics, bioinformatics, and population genetics, integrating ancient DNA evidence with archaeological findings and linguistic theories to unravel the story of our species' origins and migrations across time.",
      themeConfig: {
        lastUpdatedText: 'Last Updated',
        footer: {
          copyright: "Copyright © 2025-present Ke's Group in Fudan University.",
          contactTitle: "Contact",
          locationTitle: "Location",
          linksTitle: "Links",
          addressLine1: "School of Life Sciences Fudan University",
          addressLine2: "2005 Songhu Road, Shanghai 200438",
          researchFocus: "Ancient Human DNA Research"
        }
      }
    },
    zh: {
      label: '中文',
      lang: 'zh-CN',
      link: '/zh/',
      title: "王轲课题组",
      description: '欢迎来到王轲课题组，我们通过古基因组学、生物信息学和群体遗传学探索人类进化历史，整合古DNA证据与考古发现和语言学理论，揭示我们物种起源和迁徙的故事。',
      themeConfig: {
        nav: [
          { text: "博客", link: "/zh/Notes/index" },
          { text: "学术成果", link: "/zh/Publications" },
          { text: "公众科普", link: "/zh/PO."},
          { text: "媒体报道", link: "/zh/Press"},
          { text: "软件", link: "/zh/Software." },
          { text: "成员", link: "/zh/Members" },
          { text: "联系我们", link: "/zh/Contact" },
        ],
        footer: {
          copyright: "版权所有 © 2025-present 复旦大学王轲课题组.",
          contactTitle: "联系方式",
          locationTitle: "地址",
          linksTitle: "链接",
          addressLine1: "复旦大学生命科学学院",
          addressLine2: "上海市杨浦区淞沪路2005号 (邮编: 200438)",
          researchFocus: "古人类DNA研究"
        },
        lastUpdatedText: '最后更新于'
      }
    }
  },

  // 主题自定义
  themeConfig: {
    // 网站左上角 logo
    logo: "/logo.png",
    // 顶部导航栏
    nav: [
      { text: "Blogs", link: "/Notes/index" },
      { text: "Publications", link: "/Publications" },
      { text: "Public Outreach", link: "/PO"},
      { text: "Press", link: "/Press"},
      { text: "Software", link: "/Software" },
      { text: "Members", link: "/Members" },
      { text: "Contact", link: "/Contact" },
    ],
    // 顶部导航栏左侧的社交平台跳转
    socialLinks: [{ icon: "github", link: "https://github.com/wangke16" }],
    // 首页底部版权声明
    footer: {
      copyright: "Copyright © 2025-present Ke's Group in Fudan University.",
      contactTitle: "Contact",
      locationTitle: "Location",
      linksTitle: "Links",
      addressLine1: "School of Life Sciences Fudan University",
      addressLine2: "2005 Songhu Road, Shanghai 200438",
      researchFocus: "Ancient Human DNA Research"
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
  sitemap: {
    hostname: 'https://wangke-evoanthropology.site'
  },
});
