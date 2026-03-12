# 本地发文使用指南：上传文件、命名、分类与日期

作者：Yuanyu Zheng

这篇文章是博客日常维护的操作手册，目标是让你在本地 1 到 2 分钟完成一篇新文章发布。

## 1. 文章文件放在哪里

所有 Markdown 文章都放在：

```txt
./posts/
```

例如你的项目目录是 `d:\MyBlog`，那新文章文件应放在：

```txt
d:\MyBlog\posts\
```

## 2. 文件名怎么取

建议格式：

```txt
YYYY-MM-DD-english-slug.md
```

示例：

```txt
2026-03-12-react-state-patterns.md
```

命名建议：

- 日期放前面，便于按时间排序。
- slug 使用英文小写和短横线，避免空格和中文文件名带来的兼容问题。
- 不要重名，`file` 字段必须唯一。

## 3. 在 index.json 登记文章信息

新建好 `.md` 文件后，需要在 `./posts/index.json` 的 `posts` 数组里新增一项。

示例：

```json
{
  "file": "2026-03-12-react-state-patterns.md",
  "title": "React 状态管理模式整理",
  "date": "2026-03-12",
  "category": "前端",
  "tags": ["react", "state", "architecture"],
  "summary": "从组件状态到全局状态，梳理常见模式与选型建议。"
}
```

字段说明：

- `file`: Markdown 文件名，必须与 `./posts/` 下实际文件一致。
- `title`: 页面展示标题，建议中文。
- `date`: 发布日期，格式固定 `YYYY-MM-DD`。
- `category`: 分类名称，例如 `前端`、`后端`、`随笔`。
- `tags`: 标签数组，用于细粒度检索。
- `summary`: 卡片摘要，一句话概括文章内容。

## 4. 推荐分类与标签规范

为了后期管理方便，建议固定分类词表：

- 前端
- 后端
- 博客搭建
- 随笔
- 工具链

标签建议：

- 3 到 5 个即可，不要太泛。
- 同义词统一一种写法，例如只用 `performance`，不要再混用 `perf`。

## 5. 本地“上传”与预览流程

这个项目是静态博客，所谓“上传”一般是指把 `.md` 文件放入 `./posts/` 并更新 `index.json`。

本地预览建议使用静态服务器（如 Live Server）：

1. 在 VS Code 中打开项目 `d:\MyBlog`
2. 启动本地静态服务
3. 浏览器访问本地地址
4. 刷新页面查看新增文章是否出现在列表里

## 6. 常见问题排查

如果文章没显示，按顺序检查：

1. 文件是否真的在 `./posts/` 下。
2. `index.json` 中 `file` 是否与文件名完全一致。
3. `index.json` 是否是合法 JSON（尤其注意最后一个逗号）。
4. `date` 是否是 `YYYY-MM-DD`。
5. 刷新页面并清除缓存后再看。

## 7. 一份可复用清单

每次发文前后都可以对照：

- 已创建 Markdown 文件
- 已填写标题与正文
- 已在 index.json 添加条目
- 已写 date/category/tags/summary
- 已本地预览通过

完成以上步骤，即可稳定维护你的博客内容。
