# 仪见钟情 · Yi at First Sight

[English](README.md) | **中文**

> 本文件是英文 README 的中文备份，内容保持一致，以英文版为准。

这是一帆和静仪的私人双语（中文 / 英文）网站。我们一个在**中国深圳**，一个在**美国德州 College Station**，中间隔着 13 个小时和一整片太平洋。它是 **2026 年 10 月 31 日**的生日礼物，以后会跟着我们一起长大。

“仪见钟情”取自“一见钟情”：一**帆**和静**仪**的名字里都有一个 “Yi”，标题换成了静仪的“仪”。

> 目前是私有仓库，里面有私人照片和聊天记录，请勿外传。
> 等功能做得更多以后再公开（见 [docs/DEPLOY.md](docs/DEPLOY.md)）。

<p align="center">
  <img src="docs/screenshots/home.png" width="49%" alt="首页：祝福、天数、双时钟" />
  <img src="docs/screenshots/map.png" width="49%" alt="以太平洋为中心的爱情地图" />
  <img src="docs/screenshots/moments.png" width="49%" alt="时刻时间线" />
  <img src="docs/screenshots/gomoku.png" width="49%" alt="五子棋" />
</p>

## 页面

| 路由 | 页面 | 内容 |
|---|---|---|
| `#/` | **首页** | 生日祝福、“我们认识的第 N 天”（按深圳日期）、深圳/德州双时钟（18 点后变成夜色）、实时时差、CYF925 起飞倒计时、生日信 |
| `#/map` | **爱情地图** | 以太平洋为中心；每个地点一颗心，点开是回忆卡片；两地之间的粉色弧线上有一颗小心来回飞；金色的 CYF925 航线飞向纽约；“播放我们的故事”按时间走过每段回忆，最后停在生日信 |
| `#/moments` | **时刻** | 所有回忆的时间线，每一条都标着“认识第几天” |
| `#/gomoku` | **五子棋** | 两个人在同一台设备上轮流下，紫色是静仪，绿色是一帆；记比分、可悔棋、自动存档 |
| `#/draw` | **你画我猜** | 画布画画、按住看题、打字或口头猜、每轮 90 秒、两人共同的“默契值” |

所有文字都有中英两个版本。点右上角的语言按钮，整个网站立即切换，不用刷新，下次打开也记得。小游戏完全在浏览器里运行：没有后端、不用注册，什么都不会上传。

## 进度

- [x] 首页、爱情地图、时刻、五子棋、你画我猜（第一版，2026-10-24）
- [x] 74 个单元测试；构建时做 `strict` 模式的类型检查
- [x] 在真实浏览器里按桌面、390 px、320 px 三种宽度检查过
- [ ] 一帆用自己的话重写生日信（`src/features/birthday-map/letter.ts`）
- [ ] 给你画我猜加只有我们俩懂的梗（`src/features/pictionary/words.ts`）
- [x] 在 GitHub Pages 上试发布过一次（2026-10-24），之后先下线，等功能更多再公开
- [ ] 以后：礼物、每日留言、更多小游戏、添加回忆的后台页面

## 仓库结构

```
Yi-at-First-Sight/
├── index.html                  # 页面外壳和字体
├── public/media/<功能名>/       # 照片和视频，每个功能一个文件夹
├── src/
│   ├── main.ts                 # 应用外壳、路由、语言切换
│   ├── styles/base.css         # 配色变量、顶栏、卡片、动画
│   ├── core/                   # 所有功能共用
│   │   ├── i18n.ts             #   中英文词典、t()、pick()、当前语言
│   │   ├── dates.ts            #   按时区计算的天数、时钟、倒计时
│   │   ├── geo.ts              #   跨国际日期变更线的大圆弧线
│   │   ├── html.ts             #   属性转义、“减少动态效果”检测
│   │   └── config.ts           #   名字、时区、重要日期、下一次见面
│   └── features/               # 每个功能一个文件夹：代码、样式、数据、测试、README
│       ├── home/
│       ├── birthday-map/
│       ├── moments/
│       ├── games/              #   游戏页面共用的切换标签
│       ├── gomoku/
│       └── pictionary/
├── docs/
│   ├── DEPLOY.md               # 怎么公开发布（GitHub Pages）或私密托管（Cloudflare）
│   ├── screenshots/
│   └── superpowers/            # 设计文档和实施计划
└── .github/workflows/ci.yml    # 每次推送自动跑测试和构建
```

每个功能文件夹都有自己的 README，说明里面的文件和规则。

## 日常修改

**加一条回忆：** 把照片放进 `public/media/moments/`（JPEG，长边不超过 1600 px），在 `src/features/moments/memories.ts` 末尾加一条。地图和时间线会同时出现。照片缺失或中英文有一边为空时，测试会失败。

**改生日信：** 改 `src/features/birthday-map/letter.ts` 里的段落，中英文保持对应。`{h}` 会自动换成实时时差。

**加你画我猜的题目：** 在 `src/features/pictionary/words.ts` 末尾加；`alt` 里写其他也算对的答案。两个词共用一个答案时测试会失败。

**改重要日期：** 都在 `src/core/config.ts`。

**加一个功能：** 新建 `src/features/<功能名>/`，放 README、页面模块（`renderX(root) => cleanup`）、CSS 和测试；媒体放进 `public/media/<功能名>/`；在 `src/main.ts` 加路由，在 `src/core/i18n.ts` 加中英文案。

## 开发

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # 单元测试（Vitest）
npm run build     # 类型检查并构建到 dist/
npm run preview   # 本地预览 dist/
```

技术栈：Vite、TypeScript（strict）、Vitest，地图用 Leaflet 加 OpenStreetMap 底图。Node 22。每次推送都会自动跑测试和构建。

## 重要日期

| 日期 | 时刻 |
|---|---|
| 2026-09-20 | 我们认识（第 1 天） |
| 2026-09-25 | 一帆的生日 |
| 2026-10-31 | 静仪的生日，网站第一版上线 |
| 2027-02-05 | 航班 CYF925，深圳 → 纽约（第一次 Zoom 时一帆画的那张机票） |
| 2027-02-08 至 02-12 | 纽约 AAG 年会 |

## 文档

- 托管：[`docs/DEPLOY.md`](docs/DEPLOY.md)
- 设计文档：[`docs/superpowers/specs/2026-10-24-yi-at-first-sight-design.md`](docs/superpowers/specs/2026-10-24-yi-at-first-sight-design.md)
- 实施计划第一部分（首页 + 地图）：[`docs/superpowers/plans/2026-10-24-love-site-part1.md`](docs/superpowers/plans/2026-10-24-love-site-part1.md)
