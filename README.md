# my-blog

这是一个纯前端博客站点，包含三个主要页面：

- 首页（index.html）：展示并阅读 Markdown 文章
- 资料与链接库（resources.html）：集中管理文档资料和常用链接，并支持分类筛选
- 个人兴趣窗口（interests.html）：展示番剧图片、评分与个人评价，并支持分类筛选

## 1. 目录说明

- posts/
  - 存放博客文章 Markdown 文件
  - index.json 是文章索引
- resources/
  - index.json 是资料与链接库索引
- interests/
  - anime.json 是番剧兴趣索引
- index.html / script.js / styles.css
  - 博客首页及其样式和逻辑
- resources.html / resources.js / resources.css
  - 资料与链接库页面及其样式和逻辑
- interests.html / interests.js / interests.css
  - 个人兴趣窗口页面及其样式和逻辑

## 2. 如何打开网站

建议使用本地静态服务器访问（不要直接双击 html 文件），避免浏览器拦截本地文件请求。

示例方式（任选一种）：

1. 使用 VS Code Live Server 扩展启动
2. 或在项目根目录运行本地服务器命令（例如 Python 的 http.server）

启动后：

1. 打开首页：/index.html
2. 点击页头“资料与链接库”进入资源页：/resources.html
3. 点击页头“个人兴趣窗口”进入兴趣页：/interests.html

## 3. 博客文章怎么维护

### 3.1 新增文章

1. 在 posts/ 下新建一个 .md 文件
2. 在 posts/index.json 的 posts 数组中新增一条记录

文章索引示例：

```json
{
  "file": "my-new-post.md",
  "title": "我的新文章",
  "date": "2026-03-12",
  "category": "前端",
  "tags": ["css", "performance"],
  "summary": "这篇文章讲了什么。"
}
```

字段说明：

- file：文章文件名（必须与 posts/ 下文件一致）
- title：文章标题
- date：展示日期（建议 YYYY-MM-DD）
- category：文章分类（用于首页分类筛选和分组）
- tags：标签数组（可选）
- summary：文章摘要（可选）

### 3.2 新增文章时 URL 怎么写

这里分两种情况：

1. 在 `posts/index.json` 里登记文章时，不需要写 `url` 字段，只写 `file`。
2. 在 `resources/index.json` 里给文章做跳转入口时，`url` 写法是：`./index.html#post=文章文件名.md`

示例：

- 文章文件：`posts/图论第一章随记.md`
- 资源跳转：`./index.html#post=图论第一章随记.md`

注意：

- `post=` 后面的文件名要和 `posts/index.json` 的 `file` 完全一致（含 `.md`）
- 中文文件名可以直接写（当前项目支持）

### 3.3 分类展示规则

- 首页会根据 category 自动生成筛选按钮
- 在“全部”状态下，会按分类分组展示文章卡片
- category 相同会归为同一组

## 4. 资料与链接库怎么维护

资源数据文件：resources/index.json

每条资源结构：

```json
{
  "title": "资源标题",
  "url": "链接地址（可站内可站外）",
  "category": "分类名称",
  "type": "document | link | tool",
  "tags": ["标签1", "标签2"],
  "summary": "简介"
}
```

字段说明：

- title：资源名称
- url：跳转地址
- category：分类名称（用于筛选和分组）
- type：资源类型
  - document：文档
  - link：普通链接
  - tool：工具类链接
- tags：标签（可选）
- summary：简介（可选）

### 4.1 站内文档链接写法

如果你要跳转到博客里的某篇文章，可这样写：

./index.html#post=git.md

### 4.2 站外链接写法

直接写完整地址，例如：

https://caniuse.com/

### 4.3 分类展示规则

- 资源页会根据 category 自动生成筛选按钮
- 在“全部”状态下，会自动按分类分组
- category 相同的资源会显示在同一分组

## 5. 日常使用流程（推荐）

1. 写文章：在 posts/ 新建 .md
2. 登记文章：更新 posts/index.json
3. 补资源：在 resources/index.json 增加文档或外链
4. 维护兴趣页：在 interests/anime.json 增加或修改番剧条目
5. 本地预览：检查分类是否正确、链接与图片是否可显示
6. 提交发布

## 6. 个人兴趣窗口怎么维护

兴趣数据文件：interests/anime.json

每条番剧结构：

```json
{
  "title": "番剧名称",
  "image": "图片地址（建议本地文件路径）",
  "category": "分类名称",
  "year": "年份",
  "score": "评分",
  "tags": ["标签1", "标签2"],
  "review": "个人评价"
}
```

字段说明：

- title：番剧标题
- image：封面图路径（示例：./assets/anime/saekano.svg）
- category：分类（用于筛选和分组）
- year：年份（可选）
- score：评分（字符串或数字都可以）
- tags：标签（可选）
- review：你的主观评价

展示规则：

- 兴趣页会根据 category 自动生成筛选按钮
- 在“全部”状态下，按分类自动分组展示
- 图片建议放在 assets/anime/ 目录，便于统一管理

## 7. 常见问题

### Q1：页面显示“加载失败”或空白

- 先确认是通过本地服务器访问，而不是 file:// 方式直接打开
- 再检查 JSON 是否有语法错误（多逗号、缺引号等）

### Q2：点击资源没有打开

- 检查 url 是否正确
- 站内链接要确认 post 参数的文件名与 posts/ 内实际文件一致

### Q3：分类没有出现

- 检查 category 是否为空
- 检查 JSON 条目是否成功加载

### Q4：兴趣页图片不显示

- 检查 image 路径是否正确
- 建议使用相对路径，例如：./assets/anime/your-cover.svg
