# AI Agent 学习路线与资料库

> 本文内容整理自 [Datawhale Agent-Learning-Hub](https://github.com/datawhalechina/Agent-Learning-Hub)，一份面向真正想构建有用、可靠 Agent 的开发者的系统学习路线图。

---

## 当前最值得投入的方向

Agent 领域变化很快，以下方向更贴近真实生产力：

| 优先级 | 学习方向 | 原因 |
|--------|----------|------|
| 1 | Claude Code / Codex 类 coding agents | 真实代码库、shell、文件编辑、测试、权限、上下文压缩，是最好的 agent 工程样本 |
| 2 | Agent harness engineering | Agent 的能力很大一部分来自 harness：工具协议、权限、状态、反馈、回放、CI、评测 |
| 3 | OpenClaw / Hermes 类 personal agents | 长运行、本地优先、跨应用、记忆、skills、消息入口，更像"个人操作系统" |
| 4 | Skills / MCP / A2A / ACP | Skills 负责能力复用，MCP 连接工具，A2A 连接 agent，ACP 连接宿主应用 |
| 5 | Evaluation and safety | 没有 eval、trace、权限边界的 agent 只能算 demo |

> 不建议把精力重押在已经泛化成模板的老式 crew/role-play 框架上。它们可以了解，但不应成为主线。

---

## Learning Todo List

### Stage 0：理解什么是 Agent

- [ ] 区分 chatbot、workflow、agent、multi-agent
- [ ] 理解 agent 的基本循环：observe → think → act → observe
- [ ] 明白什么时候不该用 agent：任务可预测、流程稳定、普通脚本能解决时，agent 反而增加不确定性
- [ ] 读完 [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [ ] 读完 [OpenAI: A practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)

**产出**：写一页短笔记，回答"我的场景为什么需要 agent，而不是普通 workflow？"

### Stage 1：构建最小 Agent Loop

- [ ] 会用一个 LLM API 完成普通对话
- [ ] 会让模型输出结构化 JSON
- [ ] 会定义一个工具函数，例如 search、calculator、read_file
- [ ] 会解析模型的 tool call / function call
- [ ] 会执行工具，并把工具结果喂回模型
- [ ] 会给 agent loop 加最大步数、超时和错误处理

**推荐阅读**：
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Gemini API Function Calling](https://ai.google.dev/gemini-api/docs/function-calling)
- [Claude Tool Use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview)

**产出**：一个 50-150 行的最小 agent，可以选择工具、执行工具、返回最终答案。

### Stage 2：学习 Tool Use、RAG 和 Memory

- [ ] 会做检索增强生成：chunk、embed、retrieve、answer with citations
- [ ] 会把搜索、数据库、文件、浏览器、代码执行接成工具
- [ ] 会区分短期上下文、会话记忆、长期记忆
- [ ] 会处理工具失败、空结果、重复调用、幻觉引用
- [ ] 会让 agent 在回答里给出来源或证据

**推荐阅读**：[LlamaIndex Agents](https://docs.llamaindex.ai/en/stable/use_cases/agents/)、[LangChain Docs](https://docs.langchain.com/)、[Model Context Protocol](https://modelcontextprotocol.io/)

**参考项目**：

| 项目 | 适用点 |
|------|--------|
| [GPT Researcher](https://github.com/assafelovic/gpt-researcher) | 资料研究助手：搜索、抓取、筛选、引用、生成长报告 |
| [Open Deep Research](https://github.com/langchain-ai/open_deep_research) | 多轮搜索、状态管理和引用输出 |
| [STORM](https://github.com/stanford-oval/storm) | 研究写作系统，outline、多视角资料综合 |
| [Khoj](https://github.com/khoj-ai/khoj) | 个人 second brain，本地语义搜索和长期记忆 |
| [mem0](https://github.com/mem0ai/mem0) | 记忆层组件，给 agent 加长期 memory |
| [Letta](https://github.com/letta-ai/letta) | 面向 stateful agents 的 memory/context 平台 |

**产出**：一个资料研究助手，输入主题后自动搜索、筛选、总结并输出引用链接。

### Stage 3：深入研究一个现代 Agent Harness

先选一个现代 agent 系统学深。重点不是"框架 API 怎么调"，而是它如何组织工具、上下文、权限、状态、日志、子任务和反馈。

| 系统 | 学习重点 |
|------|----------|
| [learn-claude-code](https://github.com/shareAI-lab/learn-claude-code) | 从 0 到 1 复刻 Claude Code-like harness |
| [claw0](https://github.com/shareAI-lab/claw0) | 从 agent loop 一路构建 session、channel、gateway、memory |
| [hello-agents](https://github.com/datawhalechina/hello-agents) | 从零构建智能体，系统补 Agent 原理与实践 |
| [OpenClaw](https://github.com/openclaw/openclaw) | 本地长运行 agent、skills、系统工具和安全边界 |
| [LangGraph](https://langchain-ai.github.io/langgraph/) | 状态图、可恢复执行和可控编排 |

- [ ] 读懂一个 agent harness 的目录结构
- [ ] 找出它的 agent loop、tool registry、permission gate、session store、context compaction
- [ ] 跑通最小示例，并加一个你自己的工具
- [ ] 观察一次完整 trace，解释每一步为什么发生

**产出**：一个可调试的 agent harness demo，包含 README、运行步骤、示例输入输出和失败记录。

### Stage 4：Multi-Agent 是协调，不是魔法

- [ ] 理解 planner / executor / reviewer / critic / router 等常见角色
- [ ] 学会用 supervisor 或 graph 管理多 agent，而不是让 agent 随便聊天
- [ ] 会定义每个 agent 的职责边界、输入输出 schema、停止条件
- [ ] 会处理循环、争论、任务漂移、上下文膨胀
- [ ] 会判断什么时候单 agent 更好

**推荐阅读**：[Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)、[Google ADK](https://google.github.io/adk-docs/)、[Agent2Agent Protocol](https://google-a2a.github.io/A2A/specification/)

**产出**：一个小型多 agent 系统，例如 research → write → review → revise。

### Stage 5：学习 Skills、协议和能力封装

一个好的 skill 像一份小型操作手册：告诉 agent 什么时候使用、怎么使用、需要哪些脚本/资源、如何验证结果。

- [ ] 理解 Skill 和 Tool、Prompt、MCP 的区别
- [ ] 阅读 Claude Code Skills 的文件结构和触发机制
- [ ] 写一个最小 SKILL.md，包含 name、description、何时使用、步骤、验收标准
- [ ] 给 skill 加一个脚本或模板文件
- [ ] 给 skill 写一个 smoke test

**推荐阅读**：[Claude Code Skills](https://code.claude.com/docs/en/skills)、[OpenClaw Skills](https://github.com/openclaw/openclaw/blob/main/docs/tools/skills.md)

**产出**：一个可复用 skill，例如 code-review、research-report、migration-helper 等。

### Stage 6：Browser 和 Computer-Use Agents

- [ ] 理解 browser agent 和普通 API tool 的区别
- [ ] 会用 Playwright 或 browser-use 做网页观察和点击
- [ ] 会给浏览器操作加安全限制
- [ ] 会处理页面变化、弹窗、加载失败

**推荐阅读**：[Claude Computer Use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/computer-use-tool)、[browser-use](https://github.com/browser-use/browser-use)

**产出**：一个只操作公开网页的 browser agent。

### Stage 7：评估、可观测性和安全

- [ ] 为 agent 准备固定测试集，而不是只看 demo
- [ ] 记录成功率、失败原因、工具调用次数、成本、延迟
- [ ] 会看 trace，知道失败发生在哪一环
- [ ] 给危险工具加人工确认
- [ ] 了解 prompt injection、data exfiltration、tool abuse 等风险

**推荐阅读**：[OpenAI Evals](https://platform.openai.com/docs/guides/evals)、[LangSmith](https://docs.smith.langchain.com/)

**产出**：一个 agent eval 表格，至少包含 20 个任务、期望结果、实际结果、失败分类。

### Stage 8：发布一个真实 Agent

- [ ] 有明确用户、明确任务、明确成功标准
- [ ] 有日志、trace、错误重试、超时、成本上限
- [ ] 有权限边界和人工确认机制
- [ ] 有部署方式：CLI、Web app、Slack bot、GitHub Action 或后台任务
- [ ] 有 README：怎么运行、怎么配置 key、怎么扩展工具、有哪些限制

**产出**：一个别人能 clone 下来跑的 agent 项目。

---

## Project Ladder 项目阶梯

| 等级 | 项目 | 学什么 |
|------|------|--------|
| 1 | Calculator Agent | 最小 tool call loop |
| 2 | Web Research Agent | 搜索、筛选、引用、总结 |
| 3 | PDF QA Agent | RAG、chunk、retrieval、citation |
| 4 | Coding Review Agent | 读取 diff、风险排序、测试建议 |
| 5 | Browser Agent | 页面观察、点击、提取、失败恢复 |
| 6 | Claude Code-like Nano Agent | shell、文件编辑、权限、session、compact |
| 7 | OpenClaw-like Gateway | channel、routing、session、memory、heartbeat |
| 8 | Reusable Skill Pack | SKILL.md、脚本、模板、smoke test |
| 9 | Multi-Agent Writer | planner、writer、reviewer 协作 |
| 10 | Personal Agent | 记忆、skills、消息入口 |
| 11 | Production Harness | evals、trace、权限、CI、runner、回放 |

---

## 精选论文

| 论文 | 主题 |
|------|------|
| [ReAct](https://arxiv.org/abs/2210.03629) | Reasoning + Acting 的基础范式 |
| [Toolformer](https://arxiv.org/abs/2302.04761) | 模型学习何时调用工具 |
| [Reflexion](https://arxiv.org/abs/2303.11366) | 语言反馈和自我改进 |
| [Generative Agents](https://arxiv.org/abs/2304.03442) | 记忆、反思、规划驱动的模拟 agent |
| [AgentBench](https://arxiv.org/abs/2308.03688) | Agent 能力评测 |
| [SWE-bench](https://arxiv.org/abs/2310.06770) | 真实 GitHub issue 修复评测 |
| [AI Harness Engineering](https://arxiv.org/abs/2605.13357) | 把 harness 作为 agent 能力来源来研究 |

---

## 学习原则

- **先构建，再深入阅读** — 动手做比收集链接有用得多
- **偏好小型可靠的 agent**，而不是印象深刻的 demo
- **使用严格 schema 的工具**
- **在加更多 agent 之前先加 eval**
- **追踪每一次重要运行**
- **把多 agent 视为协调问题**，而不是让 agent 随便聊天
- **让人类保持在循环中**，尤其是风险操作
- **尊重平台规则、版权和数据访问边界**

---

*原文链接：[github.com/datawhalechina/Agent-Learning-Hub](https://github.com/datawhalechina/Agent-Learning-Hub)*
*整理：Yuanyu Zheng | Signal Notes*
