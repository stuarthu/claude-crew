# High level design: port claude-crew up to dsh-crew v0.7.0

Version: 1
Language: English.
Reads from: `docs/design/prd.md` version 2 (confirmed by the user).

## What is being built

Nothing runs here. This repository is a Claude Code plugin made of markdown, two
JSON manifests and one checksum file. So "building" means one thing only:
**rewriting text files so they say what dsh-crew v0.7.0 says, in the mechanism
this port has.**

The job is a copy with edits. For every local file there is an upstream file that
feeds it, a list of things that change on the way, and a command a person can run
to see whether it happened. The design below is that mapping, plus the order the
work has to run in.

## There are no modules and no boundary contracts

A boundary contract exists so two engineers can build two sides of a running
call at the same time without talking. Here there is no call. No file in this
repository imports, invokes, reads or serves any other file in this repository.
Claude Code loads `skills/team-lane/SKILL.md` when the skill fires and
`agents/*.md` when the PM starts a role, and those two events never happen inside
the same process reading each other's data.

So:

- **there are no software modules, and there is no cross-module boundary;**
- **there are no files under `docs/design/api/`, and that is correct, not
  missing.** (`docs/design/api/` is the path upstream v0.7.0 uses for boundary
  contracts — not `docs/decisions/api/`.)

What this repository has instead of boundaries is **repeated text**. The same
rule is written in the skill, in a role prompt, in `principles.md`, in `CLAUDE.md`
and in both READMEs. That is the real risk here, and it is the reverse of a
boundary problem: nothing breaks loudly, it only drifts quietly. Every task check
in `docs/design/tasks.md` is therefore a `grep`, a `diff` or a `sha256sum -c` —
a command whose output a person can read — because reading is the only gate this
repository has.

## The riskiest file, and why `T-01` is alone

`skills/team-lane/SKILL.md` is the riskiest single file in the repository, for
three reasons:

1. **It is the only entry point.** Its frontmatter `description` is the only
   thing that makes Claude reach for the crew at all (`CLAUDE.md` design rule 8).
   A weak description means the crew silently never runs, and nothing reports it.
2. **It is the largest change in the job.** Upstream `roles/pm.md` grew from 366
   to 1,216 lines between `649ee52` and `v0.7.0`. The local skill is 664 lines
   today and lands near 1,250.
3. **Every other milestone is checked against it.** `M2`'s role prompts, `M3`'s
   principles and `M4`'s READMEs all describe the same flow. If the skill lands
   with a rule missing, three later milestones copy the gap.

That is why `M1` holds exactly one task, owning exactly one file, reviewed by the
user before anything else starts. It is the walking skeleton in the only sense
this repository allows: the thinnest real path — one file, read end to end by a
person — across the thing most likely to be wrong.

## The map: which upstream file feeds which local file

`UP` below is the throwaway clone of dsh-crew at tag `v0.7.0`, commit
`87a4332`:

```
UP=/tmp/claude-1000/-home-stuart-workspace-claude-crew/8ec5abc5-4ba3-485c-b294-04978badfddb/scratchpad/dsh-crew
```

| Upstream v0.7.0 file | Local file | Task | What changes on the way |
| --- | --- | --- | --- |
| `roles/pm.md` (1,216 lines) | `skills/team-lane/SKILL.md` | `T-01` | Keep the frontmatter. Keep step 0 (unfinished work), the roster table and the "how you start a role" section — those are this port's own. Replace everything else with the v0.7.0 text: 18 steps, the ADR section, the bug-as-task-row section, the new document paths, parallel by default, the new limits, the job-slug shape. Rename `crew_engineer` → `crew-engineer` and so on. Replace `~/.dsh/crew/jobs/` with `~/.claude/crew/jobs/`. Drop `send_message`, `interrupt_agent` and `list_agents`: a role runs once, so a document change means a **fresh** role with the new version. Drop the git-guard sentences and the push approval file. Keep `docs/qa/`, `docs/release/`, `docs/research/` and the Verdicts line as rules for the **user's** project. |
| `roles/architect.md` | `agents/crew-architect.md` | `T-02` | Frontmatter stays. New paths. The whole new **ADR** block: every option, its cost, why it lost, the marked recommendation, the design never waits, the bug-fix ADR that quotes the engineer's `Q-` file. Task rows gain a test file and a **DoD section**; the flat numbered check list goes. |
| `roles/doc-reviewer.md` | `agents/crew-doc-reviewer.md` | `T-03` | Frontmatter stays. Read only what the PM names, and say the scope on the first line. Checks renumbered 1..13: the new check 1 (DoD sections), the new check 7 (ADR options all on the table), the new check 13 (the flow table matches the repository). Later rounds reach a **fresh** reviewer here, so the round-two wording says the PM's briefing must carry the blocking findings. |
| `roles/engineer.md` | `agents/crew-engineer.md` | `T-04` | Frontmatter stays. New paths. New **"a false red is not evidence"** section. New **"when you fix a bug: find at least two ways first"** section, including that the bug's DoD section comes from the PM before the fix starts. |
| `roles/qa.md` | `agents/crew-qa.md` | `T-04` | Frontmatter stays. Plan moves **out** of the repository into the job folder; cases stay, under `docs/qa/<task-id>/`. New **Git** section. New **"a false red is not evidence"** section. New **step 6**, the standing testability list `docs/qa/gaps.md`. Every "acceptance check" becomes "DoD item". Also update the frontmatter `description`, which still names `docs/crew/qa/`. |
| `roles/researcher.md` | `agents/crew-researcher.md` | `T-05` | Frontmatter stays. Writes to `docs/research/`. New section on what a release and an upgrade plan look like, per project type, with a source and a date per claim. **Carried with a change:** upstream says "this preset has no `web_fetch`". Our researcher has `WebFetch`, so that paragraph is rewritten — it may open a page itself, and it still has no shell. |
| `roles/code-reviewer.md` | `agents/crew-code-reviewer.md` | `T-05` | Frontmatter stays. Reads `docs/design/prd.md` plus the task row in `docs/design/tasks.md`; "acceptance checks" become the task's **DoD section**. |
| `roles/security-reviewer.md` | `agents/crew-security-reviewer.md` | `T-05` | Frontmatter stays. Gains the new **"First, read"** section. |
| `principles.md` (1,106 lines, at the upstream root) | `principles.md` (new, at this repository's root) | `T-06` | `git mv docs/principles.md principles.md`, then rewrite. Principles 1..20 with upstream's exact numbers and titles, in this port's short house style, plus `P1`..`P5` written in full. Principle 20's flow table is carried in full and adapted — see ADR 0006. |
| — | `docs/porting.md` | `T-07` | No upstream twin: this file is the port's own. Re-map every row to the v0.7.0 paths, widen the "did not port" table to every item in the PRD's "Not in scope" list, and rewrite the port-pass steps to compare against a **tag in a throwaway clone** — see ADR 0005. |
| — | `upstream.sums` | `T-08` | Re-pin to `87a4332`. Header says v0.7.0 and 18 steps. The `docs/principles.md` line becomes `principles.md`. The stale mention of `tools/check.mjs` goes — that file was removed in 0.2.0. |
| `CLAUDE.md` | `CLAUDE.md` | `T-09` | Not a copy: this file is about **this** repository. The eight design rules stay eight rules and stay true. "State and documents" is rewritten for the new layout. "Documentation" says principles 1..20 are shared and `principles.md` is at the root. The upstream-check command points at a tag clone. |
| `README.md` | `README.md` + `README-zh.md` | `T-10` | Not a translation of upstream: the install and the mechanics differ. Both local files change together, in one commit. Version 0.3.0, 18 steps, parallel by default, the new document paths, the new limits. Both keep the "what is not enforced" section and the `PreToolUse` hook the user can add. |
| — | `CHANGELOG.md`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | `T-11` | A new `0.3.0` section naming dsh-crew v0.7.0 and saying plainly that `0.2.0` only reached `649ee52`. Both manifests say `0.3.0`. `plugin.json`'s `description` loses "one at a time" — see ADR 0004. |

### What is reused, not rewritten

Reuse before you invent applies here too. These parts of the local files are
**this port's own** and are kept as they are, not replaced from upstream:

- **Step 0, "is there unfinished work?"** — upstream gets this pushed at the PM
  every turn by `host/jobs.js`. Here the PM looks in `~/.claude/crew/jobs/`
  itself. Principle P2.
- **The roster table and "how you start a role"** — upstream builds this at run
  time in `host/crew.js`. Here it is written out in the skill, because nothing
  builds it.
- **Every frontmatter block in `agents/*.md`** — `name`, `description`,
  `tools` / `disallowedTools`. Confirmed: `host/roles.js` is byte-identical
  between `649ee52` and `v0.7.0` (`sha256sum -c` reports it `OK`), so **no tool
  filter changes in this job**, and design rules 1 to 4 hold unchanged. Only
  `crew-qa`'s `description` text changes, because it names the old QA path.
- **`P1`..`P5`** in `principles.md` — they belong to this port and have no
  upstream twin.
- **The "what is not enforced" section and the `PreToolUse` snippet** in both
  READMEs — principle P3.

### What is deliberately not done

Every item in the PRD's "Not in scope" list, and nothing is quietly worked
around. The reason for each one is written where the next port pass will read
it: the "did not port" table in `docs/porting.md`, or the comment above that
file's line in `upstream.sums`.

The short version:

- **dsh machinery**: `host/git-guard.js`, `host/crew.js`, `host/jobs.js`,
  `host/roles-preset.js`, `tools/verify-*.mjs`, `tools/lib/boot-log.mjs`, the
  preset installer, `preset/`, `cordis.patch.yml`, `package.json`,
  `.github/workflows/*`.
- **CRD 0009 and CRD 0011 as machinery** — QA cases wired into `npm test`, a
  Verdicts gate inside `npm test`, CI on every push. The **rule** underneath is
  in scope, because the crew applies it to the user's project. See ADR 0007.
- **The dsh preset's configuration comments** — `roleAllow`, `roleDeny`,
  `roleModels`, `rolesDir`. Claude Code has no presets.
- **Upstream's own project record** — its `docs/decisions/*`, `docs/qa/*` and
  `docs/design/tasks.md`. That is dsh-crew's history, not a rule.
- **No new folder in this repository for `docs/qa/`, `docs/release/` or
  `docs/design/api/`.** Those are paths the rules tell a role to create in the
  **user's** project. Creating them here empty would be a file no rule asked
  for, which is exactly what principle 20's matching rule calls a misalignment.

## How the layout changes

Before this job, and after it:

| Before | After | Who moves it |
| --- | --- | --- |
| `docs/principles.md` | `principles.md` (repository root) | `T-06` |
| `docs/porting.md` | `docs/porting.md` — **unchanged path** | `T-07` (content only) |
| `docs/crew/*` in prose, 75 lines across 10 files | `docs/design/`, `docs/decisions/adr/`, `docs/decisions/crd/`, `docs/qa/`, `docs/research/`, `docs/release/` | `T-01`, `T-02`, `T-03`, `T-04`, `T-05`, `T-06`, `T-09`, `T-10` |
| — | `docs/design/prd.md`, `docs/design/hld.md`, `docs/design/tasks.md`, `docs/decisions/adr/*.md` — **this job's own record** | the PM and the architect, before `T-01` starts |

`docs/porting.md` staying where it is, is a decision, not an oversight: the
confirmed PRD's acceptance check 13 names that exact path. ADR 0002 holds the
options and the cost.

## How the work moves through the milestones

The PRD's four milestones are the user's and are not changed. Inside them:

```
M1   T-01  the skill                      alone. Nothing runs beside it.
            |
            v  user reviews M1
M2   T-02  crew-architect            \
     T-03  crew-doc-reviewer          |  all four in parallel:
     T-04  crew-engineer + crew-qa    |  no two share a file
     T-05  researcher + the 2 reviewers /
            |
            v  user reviews M2
M3   T-06  principles.md at the root  \  T-06 and T-08 in parallel
     T-08  upstream.sums              /
     T-07  docs/porting.md               after T-06 (its map must name real files)
            |
            v  user reviews M3
M4   T-09  CLAUDE.md                  \
     T-10  README.md + README-zh.md    |  all three in parallel
     T-11  CHANGELOG + both manifests /
```

Every task after `T-01` depends on `T-01`, because every one of them describes
the flow the skill defines. Inside a milestone, tasks with no shared file start
together, in one message — parallel by default, which is one of the rules this
job is carrying across.

`T-11` runs last inside `M4` in one respect only: its `0.3.0` changelog section
lists what the job did, so it is written when the rest of `M4` is known. It does
not share a file with `T-09` or `T-10`, so it may still start beside them and be
finished last.

## How the "same rule, many files" risk is handled

There is no test, so the design has to place the duplication instead of removing
it. Three rules:

1. **One task owns every copy of a rule that must read the same.** The clearest
   case is `README.md` and `README-zh.md`: one task, one commit (`T-10`), because
   `CLAUDE.md` requires them to move together. The same reason puts
   `crew-engineer` and `crew-qa` in one task (`T-04`): both gain "a false red is
   not evidence", and one engineer keeps the two readings consistent.
2. **Every task's check names the exact string to `grep` for.** Not "check the
   rule is there" — the string, and the file, and the expected count.
3. **The last check of the job is repository-wide**, because a per-file check
   cannot see a copy nobody remembered. `T-11` carries the `docs/crew` sweep and
   the `docs/principles.md` sweep over the whole repository.

## What a check may look like here, and what it may not

There is no test framework and none may be added (`CLAUDE.md` design rule 6). So
every check in `docs/design/tasks.md` is one of exactly four shapes:

- `grep -c <exact string> <file>` with an expected number;
- `grep -n <exact string> <file>` where a person reads the line that comes back;
- `diff` or a heading/step count against the upstream file in the tag clone;
- `sha256sum -c upstream.sums` run inside the tag clone.

None of these needs anything installed. `grep`, `diff`, `sha256sum` and `git` are
all this job depends on.

A check may **not** be "a reviewer read it and agreed". Document review is the
gate (the PRD says so), but a gate is not a check: the PM must be able to show the
output.
