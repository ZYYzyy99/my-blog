# Signal Notes — 项目概览

个人纯前端博客站点，作者：Yuanyu Zheng。无构建工具、无框架、无后端，纯 HTML/CSS/JS。

## 快速启动

```bash
# 必须通过本地静态服务器访问（不可直接双击 html）
python -m http.server 8080 -d .
# 或 VS Code Live Server 扩展
```

## 项目结构

```
/
├── index.html          # 博客首页 - 文章列表 + 阅读视图（含目录、图片灯箱）
├── script.js           # 首页逻辑：加载文章索引、渲染列表、文章展示
├── styles.css          # 首页样式
│
├── resources.html      # 资料与链接库页
├── resources.js        # 资源页逻辑
├── resources.css       # 资源页样式
│
├── interests.html      # 个人兴趣窗口页（番剧 + 视频 + 图集入口）
├── interests.js        # 兴趣页逻辑
├── interests.css       # 兴趣页样式
│
├── wanleguanxi-gallery.html   # 玩乐关系图集页（独立图集）
├── wanleguanxi-gallery.js     # 图集逻辑（触屏滑动、双击缩放灯箱）
├── wanleguanxi-gallery.css    # 图集样式
│
├── posts/              # 博客文章 Markdown 文件
│   ├── index.json      # 文章索引（title, date, category, tags, summary）
│   └── *.md            # Markdown 文章（支持中文文件名）
├── posts/image/        # 文章引用的图片资源（按文章名分目录存放）
├── resources/
│   └── index.json      # 资源索引（title, url, category, type, tags, summary）
├── interests/
│   └── anime.json      # 番剧索引（title, image, category, score, review）
├── assets/anime/       # 番剧封面图（SVG）
├── img/                # 头像、图集图片等
└── CLAUDE.md           # 本文件
```

## 页面与功能

| 页面 | 文件 | 功能 |
|------|------|------|
| 首页 | index.html + script.js | 文章卡片列表、分类筛选、Markdown 渲染阅读、目录生成、图片灯箱 |
| 资料库 | resources.html + resources.js | 资源卡片列表、分类筛选、站内/外链跳转 |
| 兴趣页 | interests.html + interests.js | 番剧卡片（封面+评分）、分类筛选、视频嵌入、图集入口 |
| 图集 | wanleguanxi-gallery.html + .js | 图片网格、触屏滑动切图、双击缩放灯箱 |

## 技术栈

- **零构建工具**、零框架、零后端
- 纯 CSS 渐变背景 + 毛玻璃面板 (`backdrop-filter`)
- `marked.js` (CDN) — Markdown → HTML
- `DOMPurify` (CDN) — 防 XSS
- CSS 变量主题系统（所有页面共享 `--bg`, `--panel`, `--text`, `--accent`, `--accent-2` 等命名约定）
- `12-column grid` 布局系统（所有页面统一使用 `grid-template-columns: repeat(12, 1fr)`）
- 卡片入场动画 `fade-slide`

## 三个独立的数据驱动页面

首页、资源页、兴趣页采用相同架构模式：

1. HTML 定义 `<template>` 卡片模板
2. JS 在顶部获取所有 DOM 引用
3. `normalizeCatalog()` 规范化 JSON 数据
4. `getCategoryStats()` 统计分类数量
5. `renderCategoryFilters()` 生成分类筛选按钮
6. 分类 = "全部" 时按 category 分组展示，其余按筛选展示
7. `bootstrap()` 入口函数，fetch JSON → 渲染

### 共同模式/约定

- 数据文件：`index.json` / `anime.json`，放在对应目录下
- 分类筛选：按钮点击切换 `activeCategory`，重新渲染列表
- 空态/错误态：`listHint` 显示提示文字
- 无路由库：首页通过 `window.location.hash` (`#post=文件名.md`) 控制文章视图切换

## 首页文章系统

- `posts/index.json` 中 `posts` 数组登记文章元数据
- 支持两种加载方式：优先 `index.json`，fallback 到目录列表
- 通过 `#post=文件名.md` hash 定位文章（`toSlugFromHash()`）
- `renderPostByFile()`：fetch Markdown → marked.parse → DOMPurify → 注入 DOM
- `rewritePostAssetUrls()`：将 Markdown 中相对图片路径解析为相对于 `posts/` 目录
- `renderPostToc()`：从文章 h1/h2/h3 自动生成目录
- 图片点击灯箱：`openImageLightbox()`, `Esc` 关闭

## 如何维护

### 新增文章
1. 在 `posts/` 下创建 `.md` 文件
2. 在 `posts/index.json` 的 `posts` 数组中添加条目（file, title, date, category, tags, summary）
3. 文章内图片放在 `posts/image/<文章名>/` 下，Markdown 中用相对路径引用

### 新增资源
在 `resources/index.json` 的 `resources` 数组中添加条目（title, url, category, type, tags, summary）
- 站内文章 url 格式：`./index.html#post=文件名.md`
- 站外 url：完整 URL

### 新增番剧
在 `interests/anime.json` 的 `anime` 数组中添加条目（title, image, category, year, score, tags, review）
- 封面图建议放 `assets/anime/` 下，用相对路径引用

### 字段说明

| 场景 | 字段 | 备注 |
|------|------|------|
| 文章 | `file`, `title`, `date`, `category`, `tags[]`, `summary` | file 必须与 posts/ 下文件名一致 |
| 资源 | `title`, `url`, `category`, `type(文档/链接/工具)`, `tags[]`, `summary` | 无 url 会被跳过 |
| 番剧 | `title`, `image`, `category`, `year`, `score`, `tags[]`, `review` | image 建议用本地相对路径 |

## CSS 约定

- 所有页面共享相同命名体系的 CSS 变量（`:root`）
- 分类筛选按钮：`.category-filters` > `.category-filter.is-active`
- 列表网格：`.xxx-list` / `.xxx-group` / `.xxx-group-grid`
- 卡片统一命名：`.xxx-card`，hover 时 `translateY(-4px)`
- 响应式断点：`900px`（卡片变全宽）、`640px`（缩小内边距）

## 特殊功能

- **图集灯箱**（wanleguanxi-gallery.js）：支持触屏左右滑动切图、双击缩放/还原、键盘 ← → Esc、`position: fixed` 滚动锁定
- **文章图片灯箱**（script.js）：点击图片放大预览，`Esc` 关闭
- **分类自动推导**：文章未指定 category 时取第一个 tag 作为分类
