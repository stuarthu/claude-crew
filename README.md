# claude-crew

Run work in [Claude Code](https://claude.com/claude-code) as a small crew of role
agents.

When the work is bigger than one small change, your session becomes the **product
manager (PM)**. The PM writes down what "done" means, asks you to confirm it,
then starts an **architect** to design the work, **engineers** to write the code,
and **reviewers** to judge both. The roles never talk to each other — they share
work through files on disk, and the PM passes everything between them.

> **Version 0.1.0.** PM, researcher, architect, engineer, QA, code reviewer,
> security reviewer, doc reviewer — plus milestones you approve, pushing with
> your permission, and picking a job up after a restart.

This is a port of [dsh-crew](https://github.com/stuarthu/dsh-crew), the same idea
built for DeepSeek Harness. The rules are the same. The machinery is different —
see [What changed from dsh-crew](#what-changed-from-dsh-crew).

## Install

```sh
/plugin marketplace add stuarthu/claude-crew
/plugin install crew@claude-crew
```

Then start a new session. There is nothing to configure.

To try it from a local clone instead:

```sh
/plugin marketplace add ~/workspace/claude-crew
/plugin install crew@claude-crew
```

## It is markdown, and nothing else

There are no hooks, no scripts, and no code of any kind in this plugin. It is
seven agent files and one skill file. It runs on any machine that runs Claude
Code, and it adds nothing to your session until it is used.

That is on purpose, and `docs/principles.md` 15 says why.

## What you will notice

Nothing, until the work is big enough.

Claude reads the description of the `crew:team-lane` skill and loads it when a
request is more than one small clear change — a feature, a refactor, several
steps, code plus tests, or any open design choice. You can also ask for it by
name: "use the crew for this".

Once the skill loads, the session is the PM, and the PM picks a lane:

| Lane | When | What happens |
| --- | --- | --- |
| `ask` | you want an answer or an explanation | it just answers. No crew, no documents, no branch |
| `quick` | one small clear change, no design choice | it does the work itself. No crew |
| `team` | real work | the full crew flow |

The lane is printed in one line, like `[lane: team]`, so you can move it up or
down with one word.

## The crew

A role is a real Claude Code subagent with a locked prompt and a locked tool
list. It is not a prompt the PM pastes in.

| Role | Agent name | Tools |
| --- | --- | --- |
| Researcher | `crew-researcher` | **only** `Read`, `Glob`, `Grep`, `Write`, `WebSearch`, `WebFetch` — no shell |
| Architect | `crew-architect` | everything **except** the tools that start an agent |
| Engineer | `crew-engineer` | everything **except** the tools that start an agent |
| QA | `crew-qa` | everything **except** the tools that start an agent — it must run the software |
| Code reviewer | `crew-code-reviewer` | **only** `Read`, `Glob`, `Grep` |
| Security reviewer | `crew-security-reviewer` | **only** `Read`, `Glob`, `Grep` |
| Doc reviewer | `crew-doc-reviewer` | **only** `Read`, `Glob`, `Grep` |

Claude Code enforces those lists itself, so a code reviewer **cannot** change a
file even if it decides it wants to.

The reviewers use an allow list, not a deny list, and two live tests in dsh-crew
are the reason:

1. With `Write` and `Edit` denied, a reviewer created a file anyway with
   `echo hello > file`. A shell is a file-writing tool.
2. With the shell denied too, its own tool list still held workflow tools and
   desktop-control MCP tools — every one of them a way out.

A deny list cannot name what a deployment has not installed yet. An allow list
does not have to. The PM pastes the diff into the review briefing and runs any
command the reviewer asks for.

## A role runs once

This is the biggest thing to understand.

The PM starts a role with the Agent tool. The role does its work, writes its
files, and reports back in its last message. **Then it is gone.** There is no way
to send it a second message.

So:

- Every briefing must be complete: the repository path, the branch, the document
  paths, the task id, the exact files the task owns, the acceptance checks, the
  test command, the document version.
- Review round two is a **fresh** reviewer, briefed with round one's blocking
  findings.
- A role that gets stuck writes the question in its report and stops. The PM
  answers it in the document and starts a new role.
- Anything a role does not write to a file is lost.

That is why the crew writes so much down, and why the architect's boundary
contracts matter: two engineers building the two sides of the same boundary
cannot talk to each other, and cannot talk to the architect either.

## Why the crew is flat

Only the PM starts agents. Every maker role denies `Agent`, `Task`, `Workflow`,
`SendMessage` and `ListAgents`; every reviewer uses an allow list that names none
of them. Claude Code applies both, so a role simply does not have the tool.

A role that started its own role would put that grandchild out of the PM's reach,
and two roles can never talk anyway.

## What is not enforced

One rule has nothing behind it but the words in the prompts: **a crew role must
never commit, push or publish.** The engineer and QA need a shell to run the code
and the tests, and a shell is one tool — you cannot allow "`Bash`, but not
`git push`".

Every role that owns a shell is told this plainly in its own prompt, and the PM
does all the git work. In normal use Claude Code also asks you before each `Bash`
call, so you would see it coming.

If you run with `--dangerously-skip-permissions`, nothing asks. If you want it
enforced, add this to your **own** `~/.claude/settings.json` — it is yours, not
the plugin's, so it stays under your control:

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

It refuses only calls coming from a `crew-*` role. Your own session is untouched,
and so is every other plugin's subagent. It reads command text, so it is a seat
belt, not a locked door — a push hidden in a script file gets through.

## Where things live

| What | Where | Why |
| --- | --- | --- |
| Crew documents (DoD, PRD, design, ADRs, boundary contracts, QA plans, research) | `docs/crew/` **inside your repository** | they are part of the work, and they get committed |
| Job state (`state.json`) | `~/.claude/crew/jobs/<job>/` **outside your repository** | so your `git status` stays clean |

If a job is left unfinished, the PM finds it at step 0 of the playbook and asks
you one question: carry on, or start clean.

## Changing it

There are no settings, because there is no code to read them. Everything is a
file you can edit:

- **What a role may do** — the `tools` or `disallowedTools` line in
  `agents/crew-<name>.md`.
- **How a role works** — the markdown under that line.
- **The limits** (roles at once, roles per job, review rounds) and every step of
  the flow — `skills/team-lane/SKILL.md`.

To turn it off: `/plugin uninstall crew@claude-crew`.

## Running the checks

```sh
node tools/check.mjs                        # the whole check
node tools/check-upstream.mjs ../dsh-crew   # what moved in dsh-crew
```

These are contributor tools and never run on a user's machine. Node is used only
because the checks compare lists across files, which is unpleasant in shell.

The check is worth reading before you edit a role. It catches the mistakes a diff
does not show: a reviewer quietly handed `Write`, an agent whose frontmatter name
no longer matches its file, a version that disagrees between the two manifests, a
`hooks/` folder creeping back in.

## What changed from dsh-crew

The rules are the same. Five things had to change.

| | dsh-crew | claude-crew |
| --- | --- | --- |
| PM rules | a prompt section, always loaded | inside the skill, loaded when the work needs it |
| Roles | stay alive; the PM messages and interrupts them | run once and report; a second round is a fresh role |
| Unfinished jobs | pushed at the PM every turn | step 0 of the playbook |
| Git guard | middleware that refused every child | prompt rules, plus an optional hook **you** own |
| Delivery | an npm package | a git repository, through a marketplace |

`docs/principles.md` says why each rule exists, and lists the ideas that were
looked at and rejected.

### Keeping up with dsh-crew

dsh-crew keeps moving, and nothing in Claude Code notices. So `upstream.json`
records the SHA-256 of every dsh-crew file this port was made from, and which
claude-crew files each one feeds:

```sh
node tools/check-upstream.mjs ../dsh-crew
```

It prints the upstream files that changed, the files to revisit, and the exact
git command to read the change. It also warns when that checkout has uncommitted
work, so a port pass does not carry across a half-finished edit. When you have
carried a change over, re-stamp with `--update`.

`docs/porting.md` holds the file-by-file map and the steps of a port pass.

## License

MIT
