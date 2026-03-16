# Lab3 GDB 调试手册（QEMU + x86 汇编）

本手册面向本仓库的操作系统实验代码，重点覆盖：

- 如何让 `qemu` 停在第一条指令并等待 `gdb`
- 如何加载符号表显示汇编源码
- 如何在实模式/保护模式切换过程中下断点、单步、看寄存器
- 常见报错与排查方法

> 适用目录：`lab3/src/example-2`（也可迁移到其他实验目录）

---

## 1. 调试总流程（先记住这 6 步）

1. 编译出镜像和符号文件（`.symbol` / `.o`）。
2. 用 `qemu -s -S` 启动镜像，让 CPU 暂停并开放 gdb 端口 `1234`。
3. 另开终端启动 `gdb`。
4. `target remote :1234` 连接 qemu。
5. `add-symbol-file ...` 加载符号表。
6. 断点 + 单步 + 观察寄存器/内存，定位问题。

---

## 2. 环境准备

### 2.1 工具检查

```bash
qemu-system-i386 --version
gdb --version
nasm -v
ld -v
```

推荐 `nasm 2.15.x`（仓库 `appendix/debug_with_gdb_and_qemu/README.md` 也特别提醒了这一点）。

### 2.2 为什么要符号文件

`mbr.bin` / `bootloader.bin` 只有机器码，`gdb` 只能看地址。
要在 TUI 中看到源码行，需要 `ELF` 符号文件（如 `mbr.symbol`、`bootloader.symbol`）。

---

## 3. 示例：以 Lab3 Example-2 为例

以下命令在 `lab3/src/example-2` 下执行。

### 3.1 编译（含调试信息）

```bash
# 1) 生成可重定位目标文件（带 -g）
nasm -o mbr.o -g -f elf32 mbr.asm
nasm -o bootloader.o -g -f elf32 bootloader.asm

# 2) 链接为带符号的 ELF（供 gdb）
ld -o mbr.symbol -melf_i386 -N mbr.o -Ttext 0x7c00
ld -o bootloader.symbol -melf_i386 -N bootloader.o -Ttext 0x7e00

# 3) 生成写入镜像的二进制
ld -o mbr.bin -melf_i386 -N mbr.o -Ttext 0x7c00 --oformat binary
ld -o bootloader.bin -melf_i386 -N bootloader.o -Ttext 0x7e00 --oformat binary

# 4) 写入镜像（按实验布局）
dd if=mbr.bin of=hd.img bs=512 count=1 seek=0 conv=notrunc
dd if=bootloader.bin of=hd.img bs=512 count=5 seek=1 conv=notrunc
```

> 说明：如果你的源码里用了 `org`，而你又在 `ld -Ttext` 指定了装载地址，注意不要重复偏移。

### 3.2 终端 A：启动 QEMU 并等待 GDB

```bash
qemu-system-i386 -s -S -hda hd.img -serial null -parallel stdio
```

参数解释：

- `-s`：等价于 `-gdb tcp::1234`，开启 gdb 远程端口
- `-S`：CPU 启动即暂停，等待 gdb 发 `continue`

### 3.3 终端 B：启动 GDB 并连接

```bash
gdb
(gdb) target remote :1234
(gdb) set disassembly-flavor intel
(gdb) b *0x7c00
(gdb) c
```

到这里，通常会停在 MBR 入口。

### 3.4 加载符号表并进入源码视图

```gdb
(gdb) layout src
(gdb) add-symbol-file mbr.symbol 0x7c00
```

如果后续跳到 bootloader，再加载：

```gdb
(gdb) add-symbol-file bootloader.symbol 0x7e00
```

---

## 4. 常用命令速查（汇编调试重点）

### 4.1 执行控制

```gdb
c            # continue，继续执行到下一个断点
si           # step instruction，单步进入（汇编级）
ni           # next instruction，单步但不进入 call
```

### 4.2 断点

```gdb
b *0x7c00                  # 在物理/线性地址下断点
b protect_mode_begin       # 在符号处下断点（符号已加载时）
info b                     # 查看断点
delete 1                   # 删除编号 1 的断点
```

### 4.3 查看寄存器和内存

```gdb
info registers             # 查看通用寄存器
x/10i $pc                  # 从当前指令开始看 10 条汇编
x/12xw $esp                # 从栈顶地址看 12 个 4 字节单元（16进制）
x/16xb 0x7c00              # 从 0x7c00 看 16 字节
```

`x/FMT address` 规则：

- `x/10i $pc`：10 条指令（`i`）
- `x/12xw $esp`：12 个 word（4 字节）按 16 进制（`x`）

### 4.4 TUI 窗口操作

```gdb
layout src
layout asm
layout split
layout regs
focus cmd
focus src
```

---

## 5. 典型调试路径（实战模板）

### 5.1 验证 MBR 是否正确加载 bootloader

1. `b *0x7c00`，`c`，确认停在 MBR。
2. `add-symbol-file mbr.symbol 0x7c00`。
3. 用 `si` 走到读盘逻辑。
4. `x/16xb` 查看目标缓冲区是否有变化。
5. `b *0x7e00`，`c`，检查是否成功跳到 bootloader。

### 5.2 验证进入保护模式的关键点

1. 在 `lgdt`、`mov cr0, ...`、远跳转处下断点。
2. 观察 `cr0` 的 PE 位是否从 0 变 1。
3. 远跳转后检查 `cs` 是否切到预期段选择子。
4. 检查 `ds/es/ss` 是否已重载，避免段寄存器残留导致异常。

可用命令：

```gdb
info registers
x/10i $pc
```

---

## 6. 常见问题与排查

### 6.1 `Remote communication error` / 连不上 `:1234`

- 检查 qemu 是否用 `-s -S` 启动且未退出。
- 检查端口是否被占用。
- 在 Windows 下优先用同一套环境（例如都在 WSL）运行 qemu 与 gdb。

### 6.2 加载符号后源码行错位

- 确认 `add-symbol-file` 地址与实际装载地址一致。
- 确认链接地址 `-Ttext` 与运行地址匹配。
- 检查是否同时用了 `org` 与 `-Ttext` 造成重复偏移。

### 6.3 看不到源码，只看到反汇编

- 确认用 `-g` 生成了目标文件。
- 确认加载的是 `.symbol`（ELF），不是 `.bin`。
- 检查 `nasm` 版本，建议 `2.15.x`。

### 6.4 `x/10i $pc` 显示位宽不对

仓库附录提到：较新 gdb 版本下 `set architecture i8086` 可能仍显示 32 位风格。
实操上优先依赖符号表 + 源码窗口定位，而不是只靠反汇编样式。

---

## 7. 推荐最小命令序列（可直接照抄）

```gdb
target remote :1234
set disassembly-flavor intel
b *0x7c00
c
layout split
add-symbol-file mbr.symbol 0x7c00
si
info registers
x/10i $pc
b *0x7e00
c
add-symbol-file bootloader.symbol 0x7e00
```

---

## 8. 报告可复用模板（截图占位）

你可以把下面结构直接放到实验报告中：

- 调试目标：验证 MBR 跳转 bootloader 正确性。
- 调试环境：qemu + gdb + nasm 版本。
- 关键命令：`qemu -s -S`、`target remote :1234`、`add-symbol-file`。
- 断点设计：`0x7c00`、`0x7e00`、`protect_mode_begin`。
- 观察结果：寄存器变化、内存变化、控制流变化。
- 结论：问题定位与修复说明。

截图位置建议：

- 【截图1：停在 `0x7c00`】
- 【截图2：加载 `mbr.symbol` 后源码窗口】
- 【截图3：跳到 `0x7e00`】
- 【截图4：保护模式关键寄存器变化】

---

## 9. 附：建议的 `.gdbinit`（可选）

```gdb
set disassembly-flavor intel
set pagination off
layout split
```

如果你已经在仓库里使用了专门的 `gdbinit` 文件，也可以：

```bash
gdb -x gdbinit
```

这样能减少重复输入命令。

---

## 10. 另一条路线：保留 org 的 bin 调试手册

如果你希望保留 `org`，不走 `-f elf32 + .symbol` 这条路，请看：

- `lab3/gdb调试手册-bin路线.md`

该手册提供了完整的 `-f bin` 编译、写盘、地址级下断点与调试流程。

---

如果你需要，我可以继续给你再生成一份“按你实验报告格式排版”的版本（带章节号、结论段、问题复盘段），你直接粘贴到报告里即可。
