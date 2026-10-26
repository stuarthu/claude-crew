# claude-crew

> **0.6.0 版本。**

claude-crew 是 [Claude Code](https://claude.com/claude-code) 的一个插件。当工作比一处
小改动更大时，你的会话会变成**产品经理（PM）**，由 PM 带着一个小团队来做这份工作，团队
成员是这些角色 agent：调研、架构师、工程师、QA、代码评审、安全
评审、文档评审。PM 跑**一个角色 at a time**——它 start 一个，wait 它的 report，然后 start
下一个，而且 role 变化 as the step needs one。你只和 PM 说话。各角色之间不互相说话。一个 job 的文档在 your
project 外一个 folder 里，所以 your project folder 保持干净。它们 job 运行里被
read 而，而且 job 结束之后 nothing 的 kept 是。留在 your project 里那 do stay
文件是 the five 那 ship: the two READMEs, `CHANGELOG.md`, `CLAUDE.md` and
`principles.md`。这个插件只有 markdown，没有别的——没有 hook，没有脚本，
没有代码——而且在被用到之前，它不会给你的会话增加任何东西。它是
[dsh-crew](https://github.com/stuarthu/dsh-crew) 的移植版，那是同样的想法，为 DeepSeek
Harness 写的。

## 安装

```sh
/plugin marketplace add stuarthu/claude-crew
/plugin install crew@claude-crew
```

或者，从脚本或 agent 里安装：

```sh
claude plugin marketplace add stuarthu/claude-crew && \
  claude plugin install crew@claude-crew -y
```

然后开一个新会话。没有任何需要配置的东西。

想从本地克隆试用：

```sh
/plugin marketplace add /path/to/your/claude-crew
/plugin install crew@claude-crew
```

## 团队成员

一个角色是真正的 Claude Code 子 agent，带着锁定的提示词和锁定的工具清单。它不是 PM
粘贴进去的一段话。

| 角色 | agent 名字 | 工具 |
| --- | --- | --- |
| 调研 | `crew-researcher` | **只有** `Read`、`Glob`、`Grep`、`WebSearch`、`WebFetch`——它能搜索、能打开网页，没有 shell，而且不写任何文件：它的答案在它的汇报里 |
| 架构师 | `crew-architect` | 除了能启动、给 agent 发消息或列出 agent 的工具，**其余都有** |
| 工程师 | `crew-engineer` | 除了能启动、给 agent 发消息或列出 agent 的工具，**其余都有** |
| QA | `crew-qa` | 除了能启动、给 agent 发消息或列出 agent 的工具，**其余都有**——它必须能真正运行软件 |
| 代码评审 | `crew-code-reviewer` | 白名单：**只有** `Read`、`Glob`、`Grep` |
| 安全评审 | `crew-security-reviewer` | 白名单：**只有** `Read`、`Glob`、`Grep` |
| 文档评审 | `crew-doc-reviewer` | 白名单：**只有** `Read`、`Glob`、`Grep` |

这些清单由 Claude Code 自己执行，所以评审**改不了任何文件**，哪怕它自己想改。这些提示词
都是 `agents/` 里的纯 markdown；规则是什么、其中哪些没有任何东西在强制执行，写在
`CLAUDE.md` 里。

## 许可

MIT
