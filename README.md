# claude-crew

> **Version 0.6.0.**

claude-crew is a plugin for [Claude Code](https://claude.com/claude-code). When
the work is bigger than one small change, your session becomes the **product
manager (PM)**, and the PM runs the work as a small crew of role agents:
researcher, architect, engineer, test engineer, code engineer, QA, code
reviewer, security reviewer and doc reviewer. You talk to the PM, and only to
the PM. The roles never talk to each other. A job's documents go in a folder
outside your project, so your project folder stays clean. They are read while
the job runs and are not kept after it. The files that do stay in your project
are the five that ship: the two READMEs, `CHANGELOG.md`, `CLAUDE.md` and
`principles.md`. The plugin is markdown and nothing else — no hooks, no
scripts, no code — and it
adds nothing to your session until it is used. It is a port of
[dsh-crew](https://github.com/stuarthu/dsh-crew), the same idea built for
DeepSeek Harness; `porting.md` says what is different here.

## Install

```sh
/plugin marketplace add stuarthu/claude-crew
/plugin install crew@claude-crew
```

Or, from a script or an agent:

```sh
claude plugin marketplace add stuarthu/claude-crew && \
  claude plugin install crew@claude-crew -y
```

Then start a new session. There is nothing to configure.

To try it from a local clone instead:

```sh
/plugin marketplace add /path/to/your/claude-crew
/plugin install crew@claude-crew
```

## The crew

A role is a real Claude Code subagent with a locked prompt and a locked tool
list. It is not a prompt the PM pastes in.

| Role | Agent name | Tools |
| --- | --- | --- |
| Researcher | `crew-researcher` | **only** `Read`, `Glob`, `Grep`, `WebSearch`, `WebFetch` — it can search and open web pages, it has no shell, and it writes no file: its answer comes back in its report |
| Architect | `crew-architect` | everything **except** the tools that start, message or list an agent |
| Engineer | `crew-engineer` | everything **except** the tools that start, message or list an agent |
| Test engineer | `crew-test-engineer` | everything **except** the tools that start, message or list an agent |
| Code engineer | `crew-code-engineer` | everything **except** the tools that start, message or list an agent |
| QA | `crew-qa` | everything **except** the tools that start, message or list an agent — it must run the software |
| Code reviewer | `crew-code-reviewer` | an allow list: **only** `Read`, `Glob`, `Grep` |
| Security reviewer | `crew-security-reviewer` | an allow list: **only** `Read`, `Glob`, `Grep` |
| Doc reviewer | `crew-doc-reviewer` | an allow list: **only** `Read`, `Glob`, `Grep` |

Claude Code enforces those lists itself, so a reviewer **cannot** change a file
even if it decides it wants to. The prompts are plain markdown in `agents/`, and
`CLAUDE.md` says what the rules are and which of them nothing enforces.

## License

MIT
