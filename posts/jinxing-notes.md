
# Markdown CheatSheet (程序员速查表)

Markdown 是一种轻量级标记语言，广泛用于 **README、技术文档、博客、笔记**。

---

# 1 标题

```markdown
# H1
## H2
### H3
#### H4
##### H5
###### H6
```


# 2 文本格式

| **效果**     | **语法**               |
| ------------------ | ---------------------------- |
| **加粗**     | ****text****     |
| **斜体**     | ***text***           |
| **删除线**   | **~~text~~**          |
| **粗斜体**   | *****text***** |
| **行内代码** | **`code`**           |

**示例：**
bold
italic
~delete~
print("hello")


# 3 列表

## 无序列表

**code**Markdown

**效果：**

* **item1**
* **item2**

  * **subitem**

## 有序列表

**code**Markdown

```
1. first
2. second
3. third
```

---

# 4 任务列表

**code**Markdown

```
- [x] 已完成
- [ ] 未完成
```

**效果：**

[ ]

**已完成**

[ ]

**未完成**

---

# 5 引用

**code**Markdown

```
> quote
>> nested quote
```

**效果：**

> **quote**
>
>> **nested quote**
>>

---

# 6 代码块

**示例：**

**code**Python

```
print("Hello Markdown")
```

**常见语言标识：**

**code**Text

```
```c
```cpp
```python
```bash
```json
```javascript
```html
```

---

# 7 分割线

**code**Markdown

```
---
```

## 效果：

# 8 链接

**code**Markdown

```
[Google](https://google.com)
```

**效果：**
[Google](https://www.google.com/url?sa=E&q=https%3A%2F%2Fgoogle.com)

---

# 9 图片

**code**Markdown

```
![alt](image_url)
```

**示例：**
![logo](https://www.markdownguide.org/assets/images/tux.png)

---

# 10 表格

**code**Markdown

```
| name | age | city |
|-----|-----|-----|
| Tom | 20 | Tokyo |
| Bob | 22 | NYC |
```

**效果：**

| **name** | **age** | **city**  |
| -------------- | ------------- | --------------- |
| **Tom**  | **20**  | **Tokyo** |
| **Bob**  | **22**  | **NYC**   |

---

# 11 转义字符

**如果想显示 Markdown 符号本身：**

**code**Markdown

```
\*
\#
\`
```

---

# 12 常用技巧

### 代码高亮

**code**Python

```
def add(a, b):
    return a + b
```

### 折叠内容 (GitHub/GitLab 常用)

**code**Markdown

```
<details>
<summary>点击展开</summary>

隐藏内容（如：详细日志、长配置）

</details>
```


# 一句话总结

**Markdown 记住 6 个核心语法就够了：**

* **# 标题**
* **- 列表**
* ****加粗****
* **`代码`**
* **```代码块**
* **[链接]**

**基本可以完成 90% 技术文档。**
