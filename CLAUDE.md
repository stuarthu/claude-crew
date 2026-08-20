# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## What this repository is

`claude-crew` is a **Claude Code plugin**, not an application. Nothing here runs on its own.
Claude Code loads the agent files, the skill and the hooks, and the result is a "crew": your
session becomes a product manager (PM) that starts role agents (architect, engineer, reviewers,
QA, researcher) one at a time.

It is a **port of [dsh-crew](https://github.com/stuarthu/dsh-crew)**. Read `docs/porting.md`
before changing anything a role says — the two projects share their rules, and drift between them
is the main risk this repository has.

There is no build step and no bundler. Plain ES modules, no dependencies.

## Commands

```sh
node tools/check.mjs                        # the whole check; run this before every commit
node tools/check-upstream.mjs ../dsh-crew   # what changed in dsh-crew since the last port pass
```

Both are **contributor** tools. Nothing in this repository runs on a user's machine: the plugin is
seven agent files and one skill file, and that is all. Node is acceptable in `tools/` and nowhere
else, because the checks compare lists across files.

There is no `package.json`, no npm, and no dependencies. Do not add one to get `npm test` back.

`check-upstream.mjs` is deliberately not part of `check.mjs`: dsh-crew moving is news, not a defect
here, and it needs a checkout this machine may not have. It skips out loud when there is none.

## What the plugin is made of

| Piece | Lives in | Why there |
| --- | --- | --- |
| The PM rules **and** the 14-step playbook | `skills/team-lane/SKILL.md` | One file. Its `description` is the only thing that makes Claude reach for the crew, so the description is load-bearing |
| Role prompts and tool filters | `agents/*.md` | A subagent's tool list is read from its own file; nothing else can set it |
| The design rules | `tools/check.mjs` | A wrong word in frontmatter is invisible in a diff and total in effect |

Nothing else. No hooks, no scripts, no library code — see `docs/principles.md` 15.

## Design rules a change must not break

Each one is checked by `tools/check.mjs`, and most exist because a live test showed the weaker
version failing.

1. **The crew is flat.** Only the PM starts agents. Every deny-list role denies `Agent`, `Task`,
   `Workflow`, `SendMessage` and `ListAgents`; every allow-list role names none of them. Claude
   Code applies both itself.
2. **Reviewers use an allow list, never a deny list.** With `Write` and `Edit` denied, a reviewer
   still created a file with `echo hello > file` — a shell is a file-writing tool. A deny list
   cannot name what a deployment has not installed yet; an allow list does not have to. So: no
   allow-list role may name `Bash`, `BashOutput` or `KillShell`, and no reviewer may name `Write`,
   `Edit` or `NotebookEdit`.
3. **Every tool name must be real.** `KNOWN_TOOLS` in `tools/check.mjs` is the list. Extend it only
   after checking Claude Code really calls the tool that.
4. **The engineer and QA keep `Bash`.** They have to run the code and the tests.
5. **Every role that owns a shell is told, in its own prompt, that the PM does all the git work.**
   Nothing enforces it. That is stated plainly in both READMEs, and must stay stated.
6. **The plugin stays markdown.** No `hooks/`, `scripts/`, `lib/` or `package.json`. The check
   fails if any of them comes back.
7. **`.claude-plugin/plugin.json` must not set `agents`, `skills` or `hooks`.** Default discovery
   of `./agents/` and `./skills/` works. An explicit `"agents"` string is rejected at install time,
   and an explicit array of file paths installs cleanly and then loads **zero** agents — a silent,
   total outage. Confirmed with `claude plugin details`.
8. **The skill description must say when to use the crew, not what the file contains.** It is the
   only entry point. The check fails if it gets short.

## Adding or changing a role

1. Write `agents/crew-<name>.md` with exactly **one** of `tools` or `disallowedTools`. The
   description must start with `Crew role.`; the body must be real instructions (the check rejects
   anything under 500 characters), must say the role talks only to the PM, and must say it runs
   once. A role with a shell must also say the PM does the git work.
2. Add it to the `ROLES` list in `tools/check.mjs`, naming which filter it uses.
3. Name the role in the roster table and the steps of `skills/team-lane/SKILL.md` — the PM only
   uses what its playbook describes, and the check fails if the skill never names it.
4. If the allow list names a tool not in `KNOWN_TOOLS`, add it there.
5. Run `node tools/check.mjs`.

## Users override, the plugin does not change

There is no configuration, because there is no code to read it. Every setting is a file: a role's
tools are its frontmatter, the limits and the whole flow are in the skill. Never add a setting that
needs code to read it.

## The rule nothing enforces

A crew role must never commit, push or publish. The engineer and QA need `Bash`, and `Bash` is one
tool, so this cannot be expressed in frontmatter. It lives in their prompts, and both READMEs say
plainly that nothing stops it, plus offer a `PreToolUse` hook the **user** can add to their own
settings.

That snippet matches on `"agent_type":"crew-` in the hook payload. `agent_type` is absent for the
root session and set to the agent's name for a subagent — confirmed against a live session, not
read from documentation. It reads command text, so it is a seat belt, not a locked door.

Do not ship it as a hook in this repository. `docs/principles.md` 15 says why.

## State and documents

Job state lives **outside** the repository, in `~/.claude/crew/jobs/<job>/state.json`, so a user's
`git status` stays clean. Crew documents (DoD, PRD, design, ADRs, and one module boundary contract
per pair of modules that talk, in `docs/crew/api/<caller>-<callee>.md`) live **inside** it, in
`docs/crew/`.

Nothing announces an unfinished job. Step 0 of the skill tells the PM to look in
`~/.claude/crew/jobs/` for a `state.json` whose `repo` is this folder, and to ask the user one
question before anything moves.

## Documentation

`docs/principles.md` holds the **reasons** behind the crew's rules. Principles 1 to 12 are shared
with dsh-crew and **the numbers match on purpose**; 13 to 17 belong to this port. Role prompts are
written short and bossy on purpose, so the reasoning has to live somewhere else. When you change a
rule in `agents/*.md` or in the skill, update the principle that carries it; when you reject an
idea, add it to the table so the next person does not re-run the same search.

`docs/porting.md` holds the file-by-file map to dsh-crew and the steps of a port pass.
`upstream.json` records what each ported file looked like at port time — update it with
`node tools/check-upstream.mjs --update ../dsh-crew`, never by hand.

`README.md` (English) and `README-zh.md` (Chinese) say the same thing and must be updated together
whenever user-visible behaviour changes; write the English first, then match the Chinese. Keep the
plain, short-sentence style already in both files, and keep the version line near the top of each
README in step with `.claude-plugin/plugin.json`.

Releases: add the new version's section to `CHANGELOG.md`, bump `version` in
`.claude-plugin/plugin.json` and `metadata.version` in `.claude-plugin/marketplace.json` —
`tools/check.mjs` fails if the two disagree — then commit and tag.
