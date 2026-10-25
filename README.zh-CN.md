# 仪见钟情 · Yi at First Sight

[English](README.md) | **中文**

> 本文件是英文 README 的中文备份。两者内容保持一致，以英文版为准。

这是一帆和静仪的私人双语（中文 / 英文）网站。我们一个在**中国深圳**，一个在**美国德州 College Station**，中间隔着 13 个小时的时差和一整片太平洋。

“仪见钟情”取自“一见钟情”：一**帆**（Yi-fan）和静**仪**（Jing-yi）的名字里都有一个 “Yi”。

> 私有仓库，里面有私人照片和聊天记录，请勿外传。

## 功能

| 功能 | 状态 | 文件夹 |
|---|---|---|
| 首页：生日祝福、“我们认识的第 N 天”、深圳/德州双时钟、CYF925 起飞倒计时、生日信 | ✅ 第一版 | [`src/features/home/`](src/features/home/) |
| 生日祝福地图：心形标记、跨太平洋的弧线、CYF925 飞纽约航线、回忆卡片、“播放我们的故事” | ✅ 第一版 | [`src/features/birthday-map/`](src/features/birthday-map/) |
| 恋爱时刻：记录我们每一个重要时刻（数据和照片） | ✅ 第一版（数据） | [`src/features/moments/`](src/features/moments/) |
| 五子棋：两个人在同一台设备上轮流下 | 🚧 计划中 | [`src/features/gomoku/`](src/features/gomoku/) |
| 你画我猜：在同一台设备上画画和猜词 | 🚧 计划中 | [`src/features/pictionary/`](src/features/pictionary/) |
| 礼物、每日留言、更多小游戏 | 💭 以后 | — |

所有界面文字都有中英两个版本。点右上角的语言按钮，整个网站会立即切换，不需要刷新页面，下次打开时也会记住你的选择。

## 仓库结构

```
Yi-at-First-Sight/
├── index.html                 # 页面外壳和字体
├── public/media/<功能名>/      # 照片和视频，每个功能一个文件夹
├── src/
│   ├── main.ts                # 应用外壳、路由（#/ 和 #/map）、语言切换
│   ├── styles/base.css        # 公共样式：配色变量、顶栏、卡片、动画
│   ├── core/                  # 所有功能共用的代码
│   │   ├── i18n.ts            #   中英文词典、t()、pick()、当前语言
│   │   ├── dates.ts           #   按时区计算的天数、时钟、倒计时
│   │   ├── geo.ts             #   跨国际日期变更线的大圆弧线
│   │   └── config.ts          #   名字、时区、重要日期、下一次见面
│   └── features/              # 每个功能一个文件夹，里面放代码、样式、数据和 README
│       ├── home/
│       ├── birthday-map/
│       ├── moments/
│       ├── gomoku/
│       └── pictionary/
└── docs/superpowers/          # 设计文档和实施计划
```

**新增一个功能：** 新建 `src/features/<功能名>/`，里面放这个功能自己的 `README.md`、页面模块（`renderX(root) => cleanup`）、CSS 和测试。媒体文件放进 `public/media/<功能名>/`。然后在 `src/main.ts` 里加路由，在 `src/core/i18n.ts` 里加中英两种文案。

**新增一条回忆：** 把照片放进 `public/media/moments/`，再在 `src/features/moments/memories.ts` 末尾加一条记录。如果照片文件缺失，或者中英文有一边是空的，测试会失败。

## 开发

```bash
npm install
npm run dev       # 本地开发服务器
npm test          # 单元测试（Vitest）
npm run build     # 类型检查并构建到 dist/
npm run preview   # 在本地预览 dist/
```

技术栈：Vite、TypeScript（strict 模式）、Vitest，地图用 Leaflet 加 OpenStreetMap 底图。没有后端：整个网站（包括小游戏）都在浏览器本地运行。

## 重要日期

| 日期 | 时刻 |
|---|---|
| 2026-09-20 | 我们认识（第 1 天） |
| 2026-09-25 | 一帆的生日 |
| 2026-10-31 | 静仪的生日，网站第一版上线 |
| 2027-02-05 | 航班 CYF925，深圳 → 纽约（第一次 Zoom 时一帆画的那张机票） |
| 2027-02-08 至 02-12 | 纽约 AAG 年会 |

## 文档

- 设计文档：[`docs/superpowers/specs/2026-10-24-yi-at-first-sight-design.md`](docs/superpowers/specs/2026-10-24-yi-at-first-sight-design.md)
- 实施计划第一部分（首页 + 地图）：[`docs/superpowers/plans/2026-10-24-love-site-part1.md`](docs/superpowers/plans/2026-10-24-love-site-part1.md)
