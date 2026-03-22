# B 站视频下载教程（yt-dlp 工程化可复用版）

作者：Yuanyu Zheng

这篇教程给你一套一次配置、长期稳定可用的下载方案，核心是避免常见坑：cookies 失效、AV1 不兼容、PowerShell 换行报错、ffmpeg 未生效。

## 1. 总体思路

完整链路如下：

登录态（cookies） -> 解析视频接口 -> 下载音视频流 -> ffmpeg 合并 -> 输出 mp4

使用 yt-dlp 后，接口解析、清晰度选择、音视频合并都能自动完成。

## 2. 环境准备（必须完成）

### 2.1 安装 yt-dlp

```powershell
pip install -U yt-dlp
```

检查版本：

```powershell
yt-dlp --version
```

### 2.2 安装 ffmpeg（核心依赖）

确认系统 PATH 已包含：

```txt
D:\software\ffmpeg\ffmpeg-8.1-essentials_build\bin
```

验证：

```powershell
ffmpeg -version
```

## 3. 获取登录 cookies（关键）

目标网站：Bilibili。

推荐方式：浏览器插件 Get cookies.txt（稳定、简单）。

步骤：

1. 打开 B 站并登录。
2. 打开任意视频页面。
3. 导出 cookies.txt。

保存到目录：

```txt
D:\software\爬虫\cookies.txt
```

如果你在该目录执行命令，可直接写 cookies.txt；否则写完整路径。

## 4. 基础下载（先跑通）

先用最小命令验证链路是否可用：

```powershell
yt-dlp --cookies cookies.txt https://www.bilibili.com/video/BV1PEw1zRELR
```

## 5. 推荐参数（避开 AV1，优先可播放性）

```powershell
yt-dlp --cookies cookies.txt -f "bv*[vcodec^=avc1]+ba/b" -o "%(title)s.%(ext)s" https://www.bilibili.com/video/BV1PEw1zRELR
```

参数说明：

- --cookies cookies.txt：使用登录态，解锁更高清晰度和受限内容。
- -f "bv\*[vcodec^=avc1]+ba/b"：优先下载 H.264（avc1）视频并搭配最佳音频；若不可用则回退到 best。
- -o "%(title)s.%(ext)s"：按标题命名输出文件。

## 6. 下载结果

默认会经历三步：

1. 下载视频流。
2. 下载音频流。
3. 用 ffmpeg 自动合并。

最终输出通常为：

```txt
视频标题.mp4
```

## 7. 常见坑与解决方案

### 7.1 PowerShell 换行错误

错误写法（把 Linux/CMD 习惯直接带到 PowerShell）：

```txt
^
```

正确做法：

1. 推荐把命令写成一整行。
2. 如需换行，使用 PowerShell 的反引号。

### 7.2 AV1 编码播放不兼容

症状：下载完成但本地播放器卡顿或无法播放。

解决：在格式选择中限制为 avc1（H.264）：

```txt
vcodec^=avc1
```

### 7.3 403 或下载失败

根因：cookies 过期或无效。

解决：重新登录并导出 cookies.txt。

### 7.4 ffmpeg 合并报错

根因：PATH 未配置正确。

解决：检查 ffmpeg 所在目录是否在 PATH，并重开终端后再验证 ffmpeg -version。

## 8. 进阶用法

### 8.1 批量下载

命令：

```powershell
yt-dlp --cookies cookies.txt -a urls.txt
```

其中 urls.txt 示例：

```txt
https://www.bilibili.com/video/xxx
https://www.bilibili.com/video/xxx
```

### 8.2 下载整个合集（分 P）

```powershell
yt-dlp --cookies cookies.txt https://www.bilibili.com/video/BVxxxx
```

默认会自动抓取并下载该 BV 的所有分 P。

### 8.3 查看可用清晰度与编码

```powershell
yt-dlp -F URL
```

建议先看格式，再按需指定 -f，能显著减少重试和失败。

## 9. 一条长期可复用的推荐命令

如果你只保留一条日常命令，建议用这条：

```powershell
yt-dlp --cookies cookies.txt -f "bv*[vcodec^=avc1]+ba/b" -o "%(title)s.%(ext)s" "https://www.bilibili.com/video/BV号"
```

把 BV号 替换为目标视频即可。

## 10. 快速排查清单

每次失败都按这个顺序检查：

1. yt-dlp --version 是否正常。
2. ffmpeg -version 是否正常。
3. cookies.txt 是否最新导出。
4. 命令是否写成一行（PowerShell）。
5. 是否限制了 avc1。

按这套流程执行，通常可以把失败率降到很低，并保持长期稳定下载。
