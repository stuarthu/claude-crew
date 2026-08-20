# claude-crew

在 [Claude Code](https://claude.com/claude-code) 里，用一个小团队（多个角色 agent）
来完成工作。

当工作比一处小改动更大时，你的会话会变成**产品经理（PM）**。PM 先写清楚"什么算做完"，
请你确认，然后启动**架构师**做设计、**工程师**写代码、**评审**来把关。各角色之间不能
互相说话——他们通过磁盘上的文件协作，一切都由 PM 转达。

> **0.1.0 版本。** 包含 PM、调研、架构师、工程师、QA、代码评审、安全评审、文档评审；
> 并且有需要你确认的里程碑、在你许可下推送，中断后还能接着干。

本项目是 [dsh-crew](https://github.com/stuarthu/dsh-crew) 的移植版，那是同样的想法，
为 DeepSeek Harness 写的。规则一样，机制不同——见
[和 dsh-crew 的区别](#和-dsh-crew-的区别)。

## 安装

```sh
/plugin marketplace add stuarthu/claude-crew
/plugin install crew@claude-crew
```

然后开一个新会话。没有任何需要配置的东西。

想从本地克隆试用：

```sh
/plugin marketplace add ~/workspace/claude-crew
/plugin install crew@claude-crew
```

## 它只有 markdown，没有别的

这个插件里没有 hook，没有脚本，没有任何代码。它就是七个 agent 文件加一个 skill 文件。
任何能跑 Claude Code 的机器都能用它，而且在被用到之前，它不会给你的会话增加任何东西。

这是故意的，`docs/principles.md` 第 15 条说明了原因。

## 你会看到什么

在工作还不够大的时候，什么都看不到。

Claude 会读 `crew:team-lane` 这个 skill 的描述，当一个请求比一处小而明确的改动更大时
——一个功能、一次重构、多个步骤、代码加测试、或者任何未定的设计选择——它就会加载这个
skill。你也可以直接点名："用团队来做这件事"。

skill 一加载，会话就是 PM 了，PM 会选一条"车道"：

| 车道 | 什么时候 | 会发生什么 |
| --- | --- | --- |
| `ask` | 你想要一个答案或解释 | 直接回答。不启动团队，不写文档，不建分支 |
| `quick` | 一处小而明确的改动，没有设计选择 | 它自己动手。不启动团队 |
| `team` | 真正的工作 | 走完整的团队流程 |

车道会用一行打印出来，比如 `[lane: team]`，你一个词就能把它调高或调低。

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

这些清单由 Claude Code 自己执行，所以代码评审**改不了任何文件**，哪怕它自己想改。

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

- 每份任务说明都必须是完整的：仓库路径、分支、文档路径、任务号、这个任务拥有的确切
  文件、验收标准、测试命令、文档版本。
- 第二轮评审是一个**全新**的评审，任务说明里带着第一轮的阻塞项。
- 卡住的角色把问题写进汇报然后停下。PM 在文档里回答，再启动一个新角色。
- 角色没写进文件的东西，全部丢失。

这就是团队要写这么多文档的原因，也是架构师的模块边界契约重要的原因：边界两侧的两个
工程师既不能互相说话，也不能问架构师。

## 为什么团队是"扁平"的

只有 PM 能启动 agent。每个"制造型"角色都禁用了 `Agent`、`Task`、`Workflow`、
`SendMessage`、`ListAgents`；每个评审角色用的白名单里一个都没有。这两件事都由
Claude Code 执行，所以角色根本就没有那个工具。

一个角色如果启动了自己的角色，那个"孙子"就永远脱离了 PM 的掌控，而且两个角色本来也
无法通信。

## 有一条规则没有强制手段

只有一条规则背后除了提示词里的文字之外什么都没有：**crew 角色绝不能 commit、push 或
发布。** 工程师和 QA 必须有 shell 才能运行代码和测试，而 shell 是一个整体的工具——你
没法只允许"`Bash`，但不许 `git push`"。

每个拥有 shell 的角色，都在自己的提示词里被明确告知这一点，而且所有 git 操作都由 PM
来做。在正常使用中，Claude Code 每次 `Bash` 调用前都会问你，所以你能看见它要做什么。

如果你用 `--dangerously-skip-permissions` 运行，就没有人会问了。想要强制执行，可以把
下面这段加进**你自己的** `~/.claude/settings.json`——它属于你，不属于插件：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "p=$(cat); case \"$p\" in *'\"agent_type\":\"crew-'*) case \"$p\" in *\"git push\"*|*\"git commit\"*|*\"git add\"*|*\"npm publish\"*|*\"gh release create\"*) echo \"claude-crew: a crew role must not write git or publish. Report to the PM instead.\" >&2; exit 2;; esac;; esac; exit 0"
          }
        ]
      }
    ]
  }
}
```

它只拒绝来自 `crew-*` 角色的调用。你自己的会话不受影响，别的插件的子 agent 也不受影响。
它读的是命令文本，所以它是一根安全带，不是一把锁——藏在脚本文件里的推送还是能绕过去。

## 东西放在哪

| 内容 | 位置 | 为什么 |
| --- | --- | --- |
| 团队文档（DoD、PRD、设计、ADR、边界契约、QA 计划、调研） | 仓库**里面**的 `docs/crew/` | 它们是工作的一部分，要提交进版本库 |
| 任务状态（`state.json`） | 仓库**外面**的 `~/.claude/crew/jobs/<job>/` | 这样你的 `git status` 始终是干净的 |

如果有任务没做完，PM 会在手册的第 0 步发现它，然后问你一个问题：接着干，还是从头开始。

## 怎么改

没有设置项，因为没有代码去读设置。所有东西都是你可以直接编辑的文件：

- **一个角色能做什么**——`agents/crew-<名字>.md` 里的 `tools` 或 `disallowedTools` 行。
- **一个角色怎么干活**——那一行下面的 markdown。
- **各种上限**（同时几个角色、一个任务总共几个、几轮评审）和流程的每一步——
  `skills/team-lane/SKILL.md`。

想关掉：`/plugin uninstall crew@claude-crew`。

## 跑检查

```sh
node tools/check.mjs                        # 全部检查
node tools/check-upstream.mjs ../dsh-crew   # dsh-crew 有什么变了
```

这些是给贡献者用的工具，永远不会在用户的机器上运行。这里用 node，只是因为这些检查要跨
文件比对清单，用 shell 写很难受。

改一个角色之前值得先读一遍这个检查。它能抓住 diff 看不出来的错误：评审被悄悄给了
`Write`、某个 agent 的 frontmatter 名字和文件名对不上、两个清单文件里的版本号不一致、
或者 `hooks/` 目录又偷偷回来了。

## 和 dsh-crew 的区别

规则一样。有五处必须变。

| | dsh-crew | claude-crew |
| --- | --- | --- |
| PM 规则 | 一段提示词，始终加载 | 放在 skill 里，工作需要时才加载 |
| 角色 | 一直活着，PM 可以发消息、可以打断 | 只跑一次然后汇报；第二轮是全新的角色 |
| 未完成的任务 | 每一轮都推到 PM 面前 | 手册的第 0 步 |
| git 守卫 | 拦截每一个子 agent 的中间件 | 提示词里的规则，加上一个**你自己**拥有的可选 hook |
| 交付方式 | 一个 npm 包 | 一个 git 仓库，通过 marketplace |

`docs/principles.md` 说明每条规则为什么存在，也列出了看过但没有采纳的想法。

### 跟上 dsh-crew

dsh-crew 会继续变，而 Claude Code 不会察觉。所以 `upstream.json` 记下了本移植版所依据
的每个 dsh-crew 文件的 SHA-256，以及每个文件对应本仓库的哪些文件：

```sh
node tools/check-upstream.mjs ../dsh-crew
```

它会打印哪些上游文件变了、要回头看哪些文件，以及查看这次改动的确切 git 命令。如果那个
检出目录里有未提交的改动，它也会警告你，免得把没写完的编辑搬过来。搬完之后用
`--update` 重新盖章。

`docs/porting.md` 里有逐文件对照表和一次移植的完整步骤。

## 许可

MIT
