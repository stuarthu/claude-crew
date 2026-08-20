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
npm test                          # all four checks; run this before every commit
node tools/verify-guard.mjs       # guard rules, replayed against fake hook payloads
node tools/verify-jobs.mjs        # the unfinished-job notice, using throwaway job folders
node tools/verify-plugin.mjs      # manifests, agent files, design rules, table drift
node tools/verify-hooks.mjs       # the hook command lines, run the way Claude Code runs them
npm run upstream ../dsh-crew      # what changed in dsh-crew since the last port pass
```

Every check runs against temporary folders. None of them may read or write the real `~/.claude` —
keep it that way when adding cases.

Run one check on its own by calling its file directly — that is the "single test" here.

`check-upstream.mjs` is deliberately **not** part of `npm test`: dsh-crew moving is news, not a
defect here. It skips out loud when no dsh-crew checkout is present.

## The two halves (the main thing to understand)

Claude Code gives a plugin no way to add to the system prompt directly, and no way to build agents
at run time. So the plugin is split, and the split is load-bearing:

| Piece | Lives in | Loaded by | Why it must be there |
| --- | --- | --- | --- |
| The default note: "the crew is here, load the skill" | `lib/invitation.md`, `scripts/session-start.mjs` | the `SessionStart` hook | It must announce the crew without changing how Claude behaves |
| The PM rules **and** the 14-step playbook | `skills/team-lane/SKILL.md` | the PM, with the Skill tool; and by the hook when `CLAUDE_CREW_ALWAYS=1` | One home for the rules. `lib/pm.mjs` reads them out from between the `crew:pm` markers |
| Role prompts and tool filters | `agents/*.md` | Claude Code, as subagents | A subagent's tool list is read from its own file; nothing else can set it |
| The guard | `lib/guard.mjs`, `scripts/guard.mjs` | the `PreToolUse` hook | A rule in prose is advice; a hook is where a call is actually stopped |
| The role table | `lib/roles.mjs` | the session-start hook and the checks | Single source of truth, checked against the agent files |

## Design rules a change must not break

These are not style preferences. Each one is checked by `tools/verify-plugin.mjs` or
`tools/verify-guard.mjs`, and most exist because a live test showed the weaker version failing.

1. **The crew is flat.** Only the PM starts agents. Three independent guards keep it: every
   deny-list role denies `Agent`, `Task`, `Workflow`, `SendMessage` and `ListAgents`; every
   allow-list role names none of them; and the `PreToolUse` hook refuses them to any crew role
   whatever its file says. That third guard names no tool list, so a hand edit cannot weaken it.
2. **Reviewers use an allow list, never a deny list.** With `Write` and `Edit` denied, a reviewer
   still created a file with `echo hello > file` — a shell is a file-writing tool. A deny list
   cannot name what a deployment has not installed yet; an allow list does not have to. So: no
   allow-list role may name `Bash`, `BashOutput` or `KillShell`, and no role whose key contains
   `review` may name `Write`, `Edit` or `NotebookEdit`.
3. **Every tool name in an allow or deny list must be real.** `verify-plugin.mjs` keeps a
   `KNOWN_TOOLS` set — extend it only after checking Claude Code really calls the tool that.
4. **The engineer and QA keep `Bash`.** They have to run the code and the tests.
5. **`lib/roles.mjs` and the agent frontmatter must agree.** The table cannot generate the files,
   so the check enforces it. A change to a role's tools is always two edits.
6. **Both hooks must exit 0 when they cannot run.** They fire in every session in every project. A
   hook that fails loudly would break work that has nothing to do with this plugin.
7. **The guard touches crew roles only.** Not your session, and not another plugin's subagent.
8. **The PM rules have exactly one copy**, inside `skills/team-lane/SKILL.md` between the
   `crew:pm` markers. Never add a second copy in `lib/`, not even one a check keeps in step —
   two files can be edited apart between test runs.
9. **The default session-start output must not change how Claude behaves.** `verify-plugin.mjs`
   fails if `lib/invitation.md` starts telling Claude it is the PM. The loud version is
   `CLAUDE_CREW_ALWAYS=1`.
10. **`.claude-plugin/plugin.json` must not set `agents`, `skills` or `hooks`.** Default discovery
   of `./agents/`, `./skills/` and `./hooks/hooks.json` works. An explicit `"agents"` string is
   rejected at install time, and an explicit array of file paths installs cleanly and then loads
   **zero** agents — a silent, total outage. Confirmed with `claude plugin details`.

## Adding or changing a role

1. Add the entry to `ROLES` in `lib/roles.mjs` with exactly **one** of `allow` or `deny`.
2. Write `agents/crew-<name>.md`. The frontmatter must match the table; the description must start
   with `Crew role.`; the body must be real instructions (the check rejects anything under 500
   characters), must say the role talks only to the PM, and must say it runs once.
3. Name the role in `skills/team-lane/SKILL.md` — the PM only uses what its playbook describes.
4. If the allow list names a tool not in `KNOWN_TOOLS`, add it there.
5. Run `npm test`.

`scripts/session-start.mjs` builds the PM's role list **from the `ROLES` table**, so the PM can
never promise a role that does not exist. Keep it that way: derive, do not retype.

## Users override, the plugin does not change

There is no configuration file. Limits, the jobs folder and the resume notice are environment
variables, listed in `README.md`. To change a role, a user edits the agent file. When you add a
setting, add it as an environment variable and document it in **both** READMEs.

## The guard

`lib/guard.mjs` is the rules; `scripts/guard.mjs` is the wrapper that reads the hook payload. It
refuses, for crew roles only: any tool that starts an agent, any git subcommand that writes,
`npm|pnpm|yarn|bun publish`, `npm dist-tag` and `gh release create`. Reading git stays open.

It reads command text, so it is a seat belt, not a locked door — a push hidden in a script file
gets through. Say so plainly in docs; do not describe it as airtight.

The hook payload carries `agent_id` and `agent_type`; `agent_type` is absent for the root session
and set to the agent's name for a subagent. That is how the guard tells them apart. It was
confirmed against a live session, not read from documentation.

## State and documents

Job state lives **outside** the repository, in `~/.claude/crew/jobs/<job>/state.json`, so a user's
`git status` stays clean. Crew documents (DoD, PRD, design, ADRs, and one module boundary contract
per pair of modules that talk, in `docs/crew/api/<caller>-<callee>.md`) live **inside** it, in
`docs/crew/`.

`lib/jobs.mjs` turns unfinished jobs into the notice the session-start hook prints — it must
return `""` when there is nothing to say, and must never throw.

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
`.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` (`metadata.version`) and
`package.json` — `verify-plugin.mjs` fails if the first two disagree — then commit and tag.
