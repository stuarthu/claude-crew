# claude-crew

在 [Claude Code](https://claude.com/claude-code) 里，用一个小团队（多个角色 agent）
来完成工作。

你自己的 Claude Code 会话会变成**产品经理（PM）**。PM 是唯一直接和你对话的角色。它先
写清楚"什么算做完"，请你确认，然后启动**架构师**做设计、**工程师**写代码、**评审**来
把关。各角色之间不能互相说话——他们通过磁盘上的文件协作，一切都由 PM 转达。

> **0.1.0 版本。** 包含 PM、调研、架构师、工程师、QA、代码评审、安全评审、文档评审；
> 并且有需要你确认的里程碑、在你许可下推送、监控 CI，中断后还能接着干。

本项目是 [dsh-crew](https://github.com/stuarthu/dsh-crew) 的移植版，那是同样的想法，
为 DeepSeek Harness 写的。规则一样，机制不同，因为 Claude Code 不是 dsh——见
[和 dsh-crew 的区别](#和-dsh-crew-的区别)。

## 安装

```sh
/plugin marketplace add stuarthu/claude-crew
/plugin install crew@claude-crew
```

然后开一个新会话就行。没有任何需要配置的东西。

想从本地克隆试用：

```sh
/plugin marketplace add ~/workspace/claude-crew
/plugin install crew@claude-crew
```

## 你会看到什么

默认情况下，几乎什么都看不到。会话开始时，插件只加一段短提示：这里有团队可用；比一处
小改动更大的工作，应该加载 `crew:team-lane` 这个 skill。它不会改变 Claude 回答你的方式。

团队是在那个 skill 被加载时才开始的。skill 会把这个会话变成**产品经理（PM）**，PM 的
第一步是选一条"车道"：

| 车道 | 什么时候 | 会发生什么 |
| --- | --- | --- |
| `ask` | 你想要一个答案或解释 | 直接回答。不启动团队，不写文档，不建分支 |
| `quick` | 一处小而明确的改动，没有设计选择 | 它自己动手。不启动团队 |
| `team` | 真正的工作：多步骤、代码加测试、任何设计选择 | 走完整的团队流程 |

车道会用一行打印出来，比如 `[lane: team]`，你一个词就能把它调高或调低。

只有 `team` 车道才会真正启动团队。那个 skill 包含十四个步骤、文档格式、里程碑规则和状态
文件格式——大约四百行，只有用到时才付出代价。

### 如果你想让每个会话都是 PM

```sh
export CLAUDE_CREW_ALWAYS=1
```

这样 PM 规则会在每个项目的每个会话开始时加载，不管你问什么，Claude 都按 PM 的方式做事。
[dsh-crew](https://github.com/stuarthu/dsh-crew) 就是这样工作的；如果团队就是你的工作
方式，这个设置很合适。

但它**不是**默认值。一个插件在每个项目里都改写 Claude 的说话方式，在你自己特意选择时没
问题，在它和另外五个插件一起装进来时就很失礼。

PM 规则只有一个存放处——在那个 skill 里，`<!-- crew:pm:start -->` 标记之间。常驻模式是
从那里读出来的，所以两条路径永远不会各自漂移。

## 团队成员

一个角色是真正的 Claude Code 子 agent，带着锁定的提示词和锁定的工具清单。它不是 PM
粘贴进去的一段话。

| 角色 | agent 名字 | 工具 |
| --- | --- | --- |
| 调研 | `crew-researcher` | **只有** `Read`、`Glob`、`Grep`、`Write`、`WebSearch`、`WebFetch`——没有 shell |
| 架构师 | `crew-architect` | 除了能启动 agent 的工具，**其余都有** |
| 工程师 | `crew-engineer` | 除了能启动 agent 的工具，**其余都有** |
| QA | `crew-qa` | 除了能启动 agent 的工具，**其余都有**——它必须能真正运行软件 |
| 代码评审 | `crew-code-reviewer` | **只有** `Read`、`Glob`、`Grep` |
| 安全评审 | `crew-security-reviewer` | **只有** `Read`、`Glob`、`Grep` |
| 文档评审 | `crew-doc-reviewer` | **只有** `Read`、`Glob`、`Grep` |

所以代码评审**改不了任何文件**，哪怕它自己想改。

评审用的是白名单，不是黑名单。dsh-crew 里的两次实测就是原因：

1. 只禁掉 `Write` 和 `Edit` 时，评审用 `echo hello > file` 照样建了文件。shell 本身
   就是一个写文件的工具。
2. 连 shell 也禁掉之后，它的工具清单里仍然有 workflow 工具和桌面控制类 MCP 工具——
   每一个都是出口。

黑名单没法写出一个部署还没安装的工具名字，白名单不需要写。评审要看的 diff 由 PM 粘贴
进任务里，评审需要运行的命令也由 PM 代跑。

## 一个角色只跑一次

这是最需要理解的一点。

PM 用 Agent 工具启动一个角色。角色干活、写文件，在最后一条消息里汇报。**然后它就没
了。** 没有办法给它发第二条消息。

所以：

- 每份任务说明都必须是完整的。仓库路径、分支、文档路径、任务号、这个任务拥有的确切
  文件、验收标准、测试命令、文档版本——每次都要写全。
- 第二轮评审是一个**全新**的评审，任务说明里带着第一轮的阻塞项。
- 卡住的角色把问题写进汇报然后停下。PM 在文档里回答，再启动一个新角色。
- 角色没写进文件的东西，全部丢失。

最后这一条就是团队要写这么多文档的原因，也是架构师的模块边界契约重要的原因：边界两侧
的两个工程师既不能互相说话，也不能问架构师。

## 为什么团队是"扁平"的

只有 PM 能启动 agent。三道互相独立的防线保证这一点：

1. 每个"制造型"角色（架构师、工程师、QA）在自己的 agent 文件里**禁用** `Agent`、
   `Task`、`Workflow`、`SendMessage`、`ListAgents`。
2. 每个评审角色用**白名单**，里面一个都没有。
3. 一个 `PreToolUse` 钩子对任何 crew 角色拒绝这些工具，不管文件里写了什么。这一道完全
   不依赖任何工具名单，所以手改文件也削弱不了它。

一个角色如果启动了自己的角色，那个"孙子"就永远脱离了 PM 的掌控，而且两个角色本来也无法
通信。所以答案是：不允许。

## 守卫

`hooks/hooks.json` 装了一个 `PreToolUse` 钩子。它读 `Bash` 调用的命令文本，**只对
crew 角色**拒绝两类事：

- **启动另一个 agent**——见上文。
- **写 git、发布、发版**——`push`、`commit`、`add`、`tag`、`branch`、`switch`、
  `stash`、`reset`、`rebase`、`remote` 等等，再加上 `npm publish`、`npm dist-tag`
  和 `gh release create`。

读 git 是放行的，因为角色需要：`status`、`diff`、`log`、`show`。

你自己的会话完全不受影响。钩子能区分开，是因为 Claude Code 会在钩子数据里放
`agent_type`——你自己的会话没有这个字段，子 agent 会被填上 agent 的名字。

**别的插件**的子 agent 也被放行，这是故意的。本插件是常驻的，不该悄悄改变不属于它的
工作。

**要说实话的限制：** 守卫读的是命令文本。藏在脚本文件里的推送，或者藏在 shell 别名后
面的推送，都能绕过去。它是一根结实的安全带，不是一把锁。

## 东西放在哪

| 内容 | 位置 | 为什么 |
| --- | --- | --- |
| 团队文档（DoD、PRD、设计、ADR、边界契约、QA 计划、调研） | 仓库**里面**的 `docs/crew/` | 它们是工作的一部分，要提交进版本库 |
| 任务状态（`state.json`） | 仓库**外面**的 `~/.claude/crew/jobs/<job>/` | 这样你的 `git status` 始终是干净的 |

如果有任务没做完，下一个会话会在做别的事之前先告诉 PM，然后 PM 问你一个问题：接着干，
还是从头开始。

## 设置

插件没有配置文件。几个环境变量覆盖了真正会被改的东西：

| 变量 | 默认 | 作用 |
| --- | --- | --- |
| `CLAUDE_CREW_ALWAYS` | 未设置 | 设为 `1`，每个会话都加载 PM 规则 |
| `CLAUDE_CREW_DISABLED` | 未设置 | 设为 `1`，本会话什么都不加载 |
| `CLAUDE_CREW_JOBS_DIR` | `~/.claude/crew/jobs` | 任务状态放在哪 |
| `CLAUDE_CREW_RESUME_NOTICE` | 未设置 | 设为 `0`，不再提示未完成的任务 |
| `CLAUDE_CREW_LIVE_AGENTS` | `4` | 同时运行的 crew 角色数 |
| `CLAUDE_CREW_AGENTS_PER_JOB` | `20` | 一个任务总共能用多少个 crew 角色 |
| `CLAUDE_CREW_REVIEW_ROUNDS` | `3` | 评审几轮之后 PM 请你来定 |

想改一个角色能做什么，就编辑 `agents/` 里它的文件——frontmatter 里的 `tools`（白名单）
或 `disallowedTools`（黑名单）。想改一个角色怎么干活，就编辑 frontmatter 下面的正文。

想彻底关掉：`/plugin uninstall crew@claude-crew`。

## 跑检查

```sh
node tools/check.mjs            # 全部四项检查
node tools/verify-guard.mjs     # 用假的钩子数据回放守卫规则
node tools/verify-jobs.mjs      # 未完成任务提示，用临时文件夹
node tools/verify-plugin.mjs    # 清单文件、agent 文件、设计规则、有没有走样
node tools/verify-hooks.mjs     # 按 Claude Code 的方式真的跑一遍钩子命令行
```

这里没有 npm。本仓库没有任何依赖，插件也是通过 marketplace 以 git 仓库的形式交付的，
从来不是一个包——放一个 `package.json` 只会让人误以为它发到了某个registry。

每项检查都只用临时文件夹。没有一项会读写真正的 `~/.claude`。

其中最重要的是 `verify-plugin.mjs`。`lib/roles.mjs` 是角色表的唯一真相来源，但
Claude Code 需要静态的 agent 文件，所以这张表没法在运行时生成它们。当 agent 文件的
frontmatter 和这张表对不上时，这项检查会让整轮测试失败。

## 和 dsh-crew 的区别

规则一样。有四处必须变，因为 Claude Code 不是 dsh。

| | dsh-crew | claude-crew |
| --- | --- | --- |
| PM 规则 | 一整段提示词，始终完整加载 | 默认不加载：只有一段短提示指向 skill，规则由 skill 携带。`CLAUDE_CREW_ALWAYS=1` 可以恢复 dsh-crew 的行为 |
| 角色 | 一直活着，PM 可以发消息、可以打断 | 只跑一次然后汇报；第二轮是全新的角色 |
| 未完成任务提示 | 每一轮都重新读一次 | 会话开始时打印一次 |
| 角色推送 | 你手动创建一次性批准文件后可以推 | 完全不可能 |

`docs/principles.md` 说明每条规则为什么存在，也列出了看过但没有采纳的想法。

### 跟上 dsh-crew

dsh-crew 会继续变，而 Claude Code 不会察觉。所以 `upstream.json` 记下了本移植版所依据
的每个 dsh-crew 文件的 SHA-256，以及每个文件对应本仓库的哪些文件。运行：

```sh
node tools/check-upstream.mjs ../dsh-crew
```

它会打印哪些上游文件变了、本仓库要回头看哪些文件，以及查看这次改动的确切 git 命令。
如果那个检出目录里有未提交的改动，它也会警告你，免得把没写完的编辑搬过来。搬完之后用
`--update` 重新盖章。

它**不在** `node tools/check.mjs` 里，这是故意的：dsh-crew 有变化是消息，不是本仓库的缺陷。没有
dsh-crew 检出目录时，这条命令会明确说自己跳过了。

`docs/porting.md` 里有逐文件对照表和一次移植的完整步骤。

## 许可

MIT
