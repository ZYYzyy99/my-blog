# C程序编译四个阶段详解

编译一个 C 程序，通常可以分为四个阶段：

1. 预处理（Preprocessing）
2. 生成汇编代码（Compilation）
3. 汇编（Assembling）
4. 链接（Linking）

下面按顺序说明每个阶段做了什么、输入输出是什么，以及常见命令。

---

## 1. 预处理（Preprocessing）

### 作用

预处理器会处理源码中的预处理指令，例如：

- `#include`：把头文件内容展开到当前文件
- `#define`：进行宏替换
- `#if/#ifdef/#ifndef`：进行条件编译
- 删除注释

### 输入与输出

- 输入：`.c` 源文件
- 输出：预处理后的文件（通常扩展名为 `.i`）

### 示例命令

```bash
gcc -E main.c -o main.i
```

这个命令只做预处理，不进行后续编译。

---

## 2. 生成汇编代码（Compilation）

### 作用

编译器会把预处理后的 C 代码进行语法分析、语义分析和优化，然后转换为汇编代码。

### 输入与输出

- 输入：`.i` 文件（或编译器内部直接接收预处理结果）
- 输出：汇编文件（通常扩展名为 `.s`）

### 示例命令

```bash
gcc -S main.i -o main.s
```

也可以一步从 `.c` 到 `.s`：

```bash
gcc -S main.c -o main.s
```

---

## 3. 汇编（Assembling）

### 作用

汇编器将汇编代码翻译成机器指令，生成目标文件。

目标文件里已经包含机器码，但通常还不能直接运行，因为外部符号（例如库函数）还没解析完成。

### 输入与输出

- 输入：`.s` 汇编文件
- 输出：目标文件（通常扩展名为 `.o`）

### 示例命令

```bash
gcc -c main.s -o main.o
```

也可以一步从 `.c` 到 `.o`：

```bash
gcc -c main.c -o main.o
```

---

## 4. 链接（Linking）

### 作用

链接器把一个或多个目标文件与所需库文件组合起来，解析符号引用，最终生成可执行文件。

链接主要做两件事：

- 符号解析：找到函数和全局变量的定义位置
- 地址重定位：把代码和数据放到最终内存布局中的正确地址

### 输入与输出

- 输入：`.o` 文件（以及静态库 `.a` 或动态库 `.so/.dll`）
- 输出：可执行文件（如 `main` 或 `main.exe`）

### 示例命令

```bash
gcc main.o -o main
```

如果在 Windows + MinGW 环境中，通常会生成 `main.exe`。

---

## 一条命令完成四个阶段

平时最常见的是直接：

```bash
gcc main.c -o main
```

这条命令会自动完成上述四个阶段。

---

## 阶段总结表

| 阶段         | 主要工具        | 输入      | 输出       |
| ------------ | --------------- | --------- | ---------- |
| 预处理       | 预处理器（cpp） | `.c`      | `.i`       |
| 生成汇编代码 | 编译器（cc1）   | `.i`      | `.s`       |
| 汇编         | 汇编器（as）    | `.s`      | `.o`       |
| 链接         | 链接器（ld）    | `.o` + 库 | 可执行文件 |

通过把完整流程拆开，你可以更清楚地定位问题。例如：

- 头文件或宏问题，多半出在预处理阶段
- 语法或优化相关问题，多半出在编译阶段
- 未定义引用（undefined reference）问题，多半出在链接阶段

---

## 使用 Makefile 的入门手册（从零到可用）

你前面看到的四个阶段，本质上就是 Makefile 要自动化的内容。

如果每次都手敲：

```bash
gcc -c main.c -o main.o
gcc -c util.c -o util.o
gcc main.o util.o -o app
```

文件一多就容易漏掉步骤。Makefile 的作用就是：

- 把构建步骤写成规则
- 只重编译改动过的文件（增量编译）
- 一条 `make` 命令完成构建

### 1. 一个能直接跑起来的例子

先假设项目结构是：

```text
project/
  main.c
  util.c
  util.h
  Makefile
```

把下面内容保存为 `Makefile`：

```makefile
# 编译器与编译选项
CC = gcc
CFLAGS = -Wall -Wextra -O2

# 目标程序名
TARGET = app

# 源文件与目标文件
SRCS = main.c util.c
OBJS = $(SRCS:.c=.o)

# 默认目标：make 不带参数时会执行它
all: $(TARGET)

# 链接阶段：把 .o 链接成可执行文件
$(TARGET): $(OBJS)
	$(CC) $(OBJS) -o $(TARGET)

# 编译规则：任意 .c 编译成同名 .o
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# 伪目标（不是实际文件）
.PHONY: all clean run

clean:
	rm -f $(OBJS) $(TARGET)

run: $(TARGET)
	./$(TARGET)
```

注意：命令行前面的缩进必须是 Tab，不是空格。很多新手报错都卡在这里。

### 2. 怎么使用

```bash
make            # 构建 app
make run        # 构建并运行
make clean      # 清理中间文件和可执行文件
make -j4        # 4线程并行构建
```

如果是第一次学习，建议按这个顺序操作：

1. 先 `make`，确认能生成可执行文件。
2. 再改动一个 `.c` 文件后再次 `make`，观察只重编译了改动文件。
3. 最后 `make clean` 看清理效果。

### 3. 关键语法逐行理解

#### 3.1 变量

- `CC`：编译器。
- `CFLAGS`：编译参数（告警、优化等）。
- `SRCS`：源文件列表。
- `OBJS = $(SRCS:.c=.o)`：把 `main.c util.c` 自动替换成 `main.o util.o`。

#### 3.2 规则格式

```makefile
目标: 依赖
	命令
```

含义是：当依赖比目标新，或者目标不存在时，执行命令生成目标。

#### 3.3 自动变量（最常用）

- `$@`：当前规则的目标名。
- `$<`：当前规则的第一个依赖。
- `$^`：当前规则的所有依赖（去重后）。

例如：

```makefile
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@
```

这里 `$<` 是 `main.c` 这类源文件，`$@` 是 `main.o` 这类目标文件。

### 4. Makefile 和“编译四阶段”的对应关系

- `gcc -c xxx.c -o xxx.o`：内部完成“预处理 + 生成汇编 + 汇编”。
- `gcc *.o -o app`：完成“链接”。

所以 Makefile 不是新编译器，它是对四阶段命令的组织与调度。

### 5. 头文件变化时自动重编译（实战常用）

新手常见问题：改了 `util.h`，`make` 却没触发某些 `.c` 重编译。

可以加上自动依赖生成：

```makefile
CC = gcc
CFLAGS = -Wall -Wextra -O2 -MMD -MP
TARGET = app
SRCS = main.c util.c
OBJS = $(SRCS:.c=.o)
DEPS = $(OBJS:.o=.d)

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(OBJS) -o $(TARGET)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

-include $(DEPS)

.PHONY: all clean
clean:
	rm -f $(OBJS) $(DEPS) $(TARGET)
```

其中 `-MMD -MP` 会为每个 `.c` 生成对应 `.d` 文件，记录头文件依赖，保证改头文件后能正确触发重编译。

### 6. 常见报错与排查

#### 报错 1：`missing separator. Stop.`

原因：规则命令前用了空格而不是 Tab。

#### 报错 2：`No rule to make target 'xxx.o', needed by 'app'.`

原因通常是：

- 文件名写错
- `SRCS` 列表漏了文件
- 目录结构变化后规则没更新

#### 报错 3：`undefined reference to ...`

这是链接阶段问题，常见原因：

- 某个 `.c` 没加入 `SRCS`
- 链接库顺序不对
- 忘了链接数学库（如 `-lm`）

### 7. 一句话记忆

Makefile = 把“编译四阶段命令”写成可重复执行、可增量更新、可一键构建的规则文件。

---

## 参考资料

- https://www.cnblogs.com/linzworld/p/13690620.html
- GNU Make 官方手册：https://www.gnu.org/software/make/manual/make.html
