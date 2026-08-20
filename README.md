# claude-crew

Run work in [Claude Code](https://claude.com/claude-code) as a small crew of role
agents.

Your own Claude Code session becomes the **product manager (PM)**. The PM is the
only one who talks to you. It writes down what "done" means, asks you to confirm
it, then starts an **architect** to design the work, **engineers** to write the
code, and **reviewers** to judge both. The roles never talk to each other — they
share work through files on disk, and the PM passes everything between them.

> **Version 0.1.0.** PM, researcher, architect, engineer, QA, code reviewer,
> security reviewer, doc reviewer — plus milestones you approve, pushing with
> your permission, CI watching, and picking a job up after a crash.

This is a port of [dsh-crew](https://github.com/stuarthu/dsh-crew), the same idea
built for DeepSeek Harness. The rules are the same. The machinery is different,
because Claude Code is different — see [What changed from dsh-crew](#what-changed-from-dsh-crew).

## Install

```sh
/plugin marketplace add stuarthu/claude-crew
/plugin install crew@claude-crew
```

Then start a new session. That is all — there is nothing to configure.

To try it from a local clone instead:

```sh
/plugin marketplace add ~/workspace/claude-crew
/plugin install crew@claude-crew
```

## What you will notice

The plugin is **always on**. In every session, in every project, the PM rules
load at the start. They are short on purpose — about fifty lines. The PM's first
move is to pick a lane:

| Lane | When | What happens |
| --- | --- | --- |
| `ask` | you want an answer or an explanation | it just answers. No crew, no documents, no branch |
| `quick` | one small clear change, no design choice | it does the work itself. No crew |
| `team` | real work: several steps, code plus tests, any design choice | the full crew flow |

The lane is printed in one line, like `[lane: team]`, so you can move it up or
down with one word.

Only the `team` lane loads the full playbook — a skill called `crew:team-lane`,
about four hundred lines, holding the fourteen steps, the document shapes, the
milestone rules and the state file format. An `ask` session never pays for it.

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

So a code reviewer **cannot** change a file, even if it decides it wants to.

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

- Every briefing must be complete. The PM writes the repository path, the branch,
  the document paths, the task id, the exact files the task owns, the acceptance
  checks, the test command and the document version — every time.
- Review round two is a **fresh** reviewer, briefed with round one's blocking
  findings.
- A role that gets stuck writes the question in its report and stops. The PM
  answers it in the document and starts a new role.
- Anything a role does not write to a file is lost.

That last line is why the crew writes so much down. It is also why the
architect's boundary contracts matter: two engineers building the two sides of
the same boundary cannot talk to each other, and cannot talk to the architect
either.

## Why the crew is flat

Only the PM starts agents. Three separate guards keep it that way:

1. Every maker role (architect, engineer, QA) **denies** `Agent`, `Task`,
   `Workflow`, `SendMessage` and `ListAgents` in its agent file.
2. Every reviewer role uses an **allow list** that names none of them.
3. A `PreToolUse` hook refuses those tools to any crew role, whatever its file
   says. This one names no tool list at all, so a hand edit cannot weaken it.

A role that started its own role would put that grandchild out of the PM's reach,
and two roles can never talk anyway. So the answer is: they do not.

## The guard

`hooks/hooks.json` installs a `PreToolUse` hook. It reads the command text of
`Bash` calls and refuses two things **for crew roles only**:

- **Starting another agent** — see above.
- **Writing git, publishing, releasing** — `push`, `commit`, `add`, `tag`,
  `branch`, `switch`, `stash`, `reset`, `rebase`, `remote` and the rest, plus
  `npm publish`, `npm dist-tag` and `gh release create`.

Reading git stays open, because a role needs it: `status`, `diff`, `log`, `show`.

Your own session is never touched. The hook can tell the difference because
Claude Code puts `agent_type` in the hook payload — it is absent for your session
and set to the agent's name for a subagent.

A subagent from **another** plugin is also left alone, on purpose. This plugin is
always on, and it must not quietly change work that is not its own.

**Honest limit:** the guard reads command text. A push hidden inside a script
file, or behind a shell alias, gets through. It is a strong seat belt, not a
locked door.

## Where things live

| What | Where | Why |
| --- | --- | --- |
| Crew documents (DoD, PRD, design, ADRs, boundary contracts, QA plans, research) | `docs/crew/` **inside your repository** | they are part of the work, and they get committed |
| Job state (`state.json`) | `~/.claude/crew/jobs/<job>/` **outside your repository** | so your `git status` stays clean |

If a job is left unfinished, the next session tells the PM about it before
anything else, and the PM asks you one question: carry on, or start clean.

## Settings

The plugin has no configuration file. A few environment variables cover the
things people really change:

| Variable | Default | What it does |
| --- | --- | --- |
| `CLAUDE_CREW_DISABLED` | unset | set to `1` to load nothing at all in this session |
| `CLAUDE_CREW_JOBS_DIR` | `~/.claude/crew/jobs` | where job state lives |
| `CLAUDE_CREW_RESUME_NOTICE` | unset | set to `0` to stop the unfinished-job notice |
| `CLAUDE_CREW_LIVE_AGENTS` | `4` | crew roles running at the same time |
| `CLAUDE_CREW_AGENTS_PER_JOB` | `20` | crew roles one job may use in total |
| `CLAUDE_CREW_REVIEW_ROUNDS` | `3` | review rounds before the PM asks you to decide |

To change what a role may do, edit its file in `agents/` — the frontmatter holds
`tools` (an allow list) or `disallowedTools` (a deny list). To change how a role
works, edit the markdown under the frontmatter.

To turn the plugin off for good: `/plugin uninstall crew@claude-crew`.

## Running the checks

```sh
npm test                        # all four checks
node tools/verify-guard.mjs     # the guard rules, replayed against fake payloads
node tools/verify-jobs.mjs      # the unfinished-job notice, using throwaway folders
node tools/verify-plugin.mjs    # manifests, agent files, design rules, no drift
node tools/verify-hooks.mjs     # the hook command lines, run the way Claude Code runs them
```

Every check runs against temporary folders. None of them reads or writes the real
`~/.claude`.

`verify-plugin.mjs` is the one that matters most. `lib/roles.mjs` is the single
source of truth for the role table, but Claude Code needs static agent files, so
the table cannot build them at run time. That check fails the test run when an
agent file's frontmatter drifts from the table.

## What changed from dsh-crew

The rules are the same. Four things had to change, because Claude Code is not
dsh.

| | dsh-crew | claude-crew |
| --- | --- | --- |
| PM rules | a prompt section, always in full | a thin core always on, the full playbook in a skill loaded for team work |
| Roles | stay alive; the PM messages and interrupts them | run once and report; a second round is a fresh role |
| Job notice | re-read every turn | printed once at the start of the session |
| Role pushes | possible with a one-shot approval file you create | never possible at all |

`docs/principles.md` says why each rule exists, and lists the ideas that were
looked at and rejected.

### Keeping up with dsh-crew

dsh-crew keeps moving, and nothing in Claude Code notices. So `upstream.json`
records the SHA-256 of every dsh-crew file this port was made from, and which
claude-crew files each one feeds. Run:

```sh
npm run upstream ../dsh-crew
```

It prints the upstream files that changed, the claude-crew files to revisit, and
the exact git command to read the change. It also warns when that checkout has
uncommitted work, so a port pass does not carry across a half-finished edit. When
you have carried a change over, re-stamp with `--update`.

This is not part of `npm test` on purpose: dsh-crew moving is news, not a defect
in this repository. With no dsh-crew checkout the command skips out loud.

`docs/porting.md` holds the file-by-file map and the steps of a port pass.

## License

MIT
