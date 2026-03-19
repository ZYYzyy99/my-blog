# Linux命令速查手册

这是一份面向日常开发与运维的 Linux 常用命令速查表，按场景分类，便于快速查阅。

---

## 1. 基础信息与帮助

```bash
uname -a                # 查看内核与系统信息
cat /etc/os-release     # 查看发行版信息
date                    # 查看当前时间
whoami                  # 当前用户名
id                      # 当前用户UID/GID与组
hostname                # 主机名
man ls                  # 查看命令手册
ls --help               # 查看命令帮助
```

---

## 2. 文件与目录操作

```bash
pwd                     # 当前路径
ls -lah                 # 列出详细信息（含隐藏文件）
cd /path/to/dir         # 切换目录
mkdir -p a/b/c          # 递归创建目录
touch file.txt          # 新建空文件
cp -r src dst           # 复制目录
mv old new              # 移动/重命名
rm -rf target           # 强制递归删除（慎用）
find . -name "*.log"    # 查找文件
locate nginx.conf       # 快速查找（依赖数据库）
```

---

## 3. 文件内容查看与文本处理

```bash
cat file.txt                    # 输出全文
less file.txt                   # 分页查看（推荐）
head -n 20 file.txt             # 查看前20行
tail -n 50 file.txt             # 查看后50行
tail -f app.log                 # 实时跟踪日志
grep -rn "error" .              # 递归搜索关键字
sed -n '1,20p' file.txt         # 打印指定行
awk '{print $1,$3}' file.txt    # 按列处理文本
sort data.txt                   # 排序
uniq -c data.txt                # 去重并计数
wc -l file.txt                  # 统计行数
```

---

## 4. 权限与所有权

```bash
ls -l                     # 查看权限
chmod 644 file.txt        # 修改权限（rw-r--r--）
chmod +x script.sh        # 增加可执行权限
chown user:group file.txt # 修改所有者与组
umask 022                 # 设置默认权限掩码
sudo command              # 以管理员权限执行
```

常见权限数字：

- `7` = `rwx`
- `6` = `rw-`
- `5` = `r-x`
- `4` = `r--`

---

## 5. 进程与系统资源

```bash
ps -ef | grep nginx       # 查进程
top                       # 实时资源监控
htop                      # 增强版top（需安装）
kill -9 PID               # 强制结束进程
pkill -f "python app.py"  # 按命令匹配杀进程
free -h                   # 内存使用
df -h                     # 磁盘分区使用
du -sh *                  # 当前目录各项大小
uptime                    # 运行时长与负载
```

---

## 6. 网络相关

```bash
ip a                      # 查看网卡与IP
ip route                  # 查看路由表
ping 8.8.8.8              # 网络连通性测试
curl -I https://example.com # 请求响应头
wget URL                  # 下载文件
ss -tulnp                 # 查看监听端口
netstat -tulnp            # 端口信息（部分系统仍可用）
traceroute example.com    # 路由追踪
nslookup example.com      # DNS解析测试
```

---

## 7. 压缩与归档

```bash
tar -czf backup.tar.gz dir/   # 打包并gzip压缩
tar -xzf backup.tar.gz        # 解压tar.gz
tar -cjf backup.tar.bz2 dir/  # bzip2压缩
zip -r archive.zip dir/       # zip压缩
unzip archive.zip             # 解压zip
```

---

## 8. 软件包管理

### Debian/Ubuntu（apt）

```bash
sudo apt update               # 更新软件源索引
sudo apt upgrade              # 升级已安装软件
sudo apt install nginx        # 安装软件
sudo apt remove nginx         # 卸载软件
sudo apt search redis         # 搜索软件
```

### CentOS/RHEL/Fedora（yum/dnf）

```bash
sudo yum install nginx        # 安装（老版本常见）
sudo dnf install nginx        # 安装（新版本常见）
sudo dnf update               # 更新
sudo dnf remove nginx         # 卸载
```

---

## 9. 服务管理（systemd）

```bash
sudo systemctl status nginx      # 查看服务状态
sudo systemctl start nginx       # 启动服务
sudo systemctl stop nginx        # 停止服务
sudo systemctl restart nginx     # 重启服务
sudo systemctl enable nginx      # 开机自启
sudo systemctl disable nginx     # 取消开机自启
journalctl -u nginx -f           # 实时查看服务日志
```

---

## 10. SSH与远程操作

```bash
ssh user@host                 # 远程登录
ssh -p 2222 user@host         # 指定端口
scp file.txt user@host:/tmp/  # 上传文件
scp user@host:/tmp/a.txt .    # 下载文件
rsync -avz src/ host:/dst/    # 增量同步
```

---

## 11. 常用快捷技巧

```bash
./app                        # 运行当前目录下可执行文件
./script.sh                  # 运行当前目录脚本（通常先 chmod +x script.sh）
sh script.sh                 # 不加执行权限也可用sh解释执行
history                     # 历史命令
!123                        # 执行历史编号123的命令
!!                          # 执行上一条命令
Ctrl + r                    # 反向搜索历史命令
command1 | command2         # 管道
command > out.txt           # 覆盖重定向
command >> out.txt          # 追加重定向
command 2> err.txt          # 错误输出重定向
command &                   # 后台运行
jobs                        # 查看后台任务
fg %1                       # 拉回前台
```

---

## 12. 故障排查最小命令集

当你刚登录一台异常机器时，常用这组命令快速定位问题：

```bash
uptime
free -h
df -h
top
ss -tulnp
journalctl -xe --no-pager | tail -n 80
```

---

## 13. 使用建议

- 在生产环境谨慎使用 `rm -rf`、`kill -9`、`chmod -R`。
- 优先先查状态再操作，例如先 `systemctl status` 再 `restart`。
- 重要变更前建议做好备份，例如先打包归档。

这份速查手册覆盖了大多数高频 Linux 命令场景，适合日常开发、服务器维护与面试复习。