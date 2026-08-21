# Task breakdown: port claude-crew up to dsh-crew v0.7.0

Version: 1
Language: English.
Reads with: `docs/design/prd.md` version 2, `docs/design/hld.md` version 1,
`docs/decisions/adr/0001` to `0007`.

## Before you run any check

Every check below is a real command. Two shell variables make them short. Set
both in the shell you run the checks in:

```sh
REPO=/home/stuart/workspace/claude-crew
UP=/tmp/claude-1000/-home-stuart-workspace-claude-crew/8ec5abc5-4ba3-485c-b294-04978badfddb/scratchpad/dsh-crew
```

`UP` is a clean clone of dsh-crew at tag `v0.7.0`, commit `87a4332`. It is the
only copy of dsh-crew any task may read. **Never read, write or run anything in
`/home/stuart/workspace/dsh-crew`** — that is the user's own working copy.

Run every check with `cd "$REPO"` first, unless the check says `cd "$UP"`.

This repository has **no test framework, and none may be added** (`CLAUDE.md`
design rule 6). So a check here is a `grep`, a `diff`, a heading count or
`sha256sum -c`, and its output is what a person reads. `crew-qa` is skipped for
this whole job by the user's decision, so no task's check depends on a test
runner and no task writes under `docs/qa/`.

## Two facts every task needs

These two are written here once, because more than one task has to say them and
the engineers cannot talk to each other:

1. **Version string:** `0.3.0`. Nothing else.
2. **Parallel by default:** roles run in parallel by default; only a shared file
   or a real dependency serializes them. Never "one at a time".

## Task table

| id | M | Work, in one sentence | Files it owns | Depends on | Carried from |
| --- | --- | --- | --- | --- | --- |
| `T-01` | M1 | Rewrite the PM playbook to say what upstream `roles/pm.md` v0.7.0 says. | `skills/team-lane/SKILL.md` | — | `$UP/roles/pm.md` |
| `T-02` | M2 | Bring the architect prompt up to v0.7.0, including the whole new ADR block. | `agents/crew-architect.md` | `T-01` | `$UP/roles/architect.md` |
| `T-03` | M2 | Bring the doc reviewer prompt up to v0.7.0: scope line, checks 1..13. | `agents/crew-doc-reviewer.md` | `T-01` | `$UP/roles/doc-reviewer.md` |
| `T-04` | M2 | Bring the engineer and QA prompts up to v0.7.0, keeping their shared sections identical in meaning. | `agents/crew-engineer.md`, `agents/crew-qa.md` | `T-01` | `$UP/roles/engineer.md`, `$UP/roles/qa.md` |
| `T-05` | M2 | Bring the researcher, code reviewer and security reviewer prompts up to v0.7.0. | `agents/crew-researcher.md`, `agents/crew-code-reviewer.md`, `agents/crew-security-reviewer.md` | `T-01` | `$UP/roles/researcher.md`, `$UP/roles/code-reviewer.md`, `$UP/roles/security-reviewer.md` |
| `T-06` | M3 | Move the reasons file to the repository root and carry principles 1..20 plus `P1`..`P5`. | `principles.md` (new), `docs/principles.md` (removed) | `T-01` | `$UP/principles.md` |
| `T-07` | M3 | Re-map `docs/porting.md` to the v0.7.0 layout and rewrite the port-pass steps. | `docs/porting.md` | `T-01`, `T-06` | this port's own file; `$UP` tree |
| `T-08` | M3 | Re-pin `upstream.sums` to `v0.7.0` / `87a4332`. | `upstream.sums` | `T-01` | `$UP` tree |
| `T-09` | M4 | Make `CLAUDE.md` true for the new layout and the new rules. | `CLAUDE.md` | `T-01`..`T-08` | this repository; `$UP/CLAUDE.md` for shape only |
| `T-10` | M4 | Update both READMEs together: 0.3.0, 18 steps, parallel by default, the new paths. | `README.md`, `README-zh.md` | `T-01`..`T-08` | this repository; `$UP/README.md` for shape only |
| `T-11` | M4 | Write the `0.3.0` changelog section, set both manifests to `0.3.0`, and run the repository-wide sweeps. | `CHANGELOG.md`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | `T-01`..`T-10` | this repository |

No two tasks own the same file. `README.md` and `README-zh.md` are in one task
because `CLAUDE.md` requires them to change in the same commit.

**Order.** `T-01` runs alone. Then `T-02`, `T-03`, `T-04`, `T-05` start together
in one message. Then `T-06` and `T-08` start together, and `T-07` follows `T-06`.
Then `T-09`, `T-10` and `T-11` start together, and `T-11` is finished last
because its changelog section lists what the job did.

---

## `T-01` — the PM playbook (M1, the walking skeleton)

**Work.** Rewrite `skills/team-lane/SKILL.md` so it says what `$UP/roles/pm.md`
says, in this port's mechanism. Nothing else runs while this task is open, and
the user reviews it before `M2` starts.

**Keep, do not replace.** These parts of the current file are this port's own:
the frontmatter block, "Step 0: is there unfinished work?", the roster table
("Your crew"), and "How you start a role".

**Change on the way.**

- All 18 steps, in upstream's order and with upstream's names.
- `crew_engineer` → `crew-engineer`, and the same for all seven roles.
- `~/.dsh/crew/jobs/` → `~/.claude/crew/jobs/`.
- Drop `send_message`, `interrupt_agent` and `list_agents`. A role here runs
  once, so a document change means starting a **fresh** role with the new
  version. Say that where upstream says "message every live child".
- Drop the git-guard sentences and the push approval file. Keep the rule the
  guard carried: the PM does all the git work, and no crew role ever pushes.
- Keep `docs/qa/`, `docs/release/`, `docs/research/`, `docs/design/api/` and the
  Verdicts line as rules for the **user's** project (ADR 0007).

**These exact strings must be in the file** (they are what the checks read, and
what `T-09`, `T-10` and `T-06` have to agree with):

```
- crew roles awake at the same time: **20**
- crew roles for one job in total: **no cap**
- review rounds before you bring the disagreement to the user: **3**
```

**DoD — how somebody else checks it.**

| # | Check | Expected | PRD check |
| --- | --- | --- | --- |
| 1 | `grep -cE '^[0-9]{1,2}\. \*\*' skills/team-lane/SKILL.md` | `18` | 1 |
| 2 | `grep -nE '^(13\|17\|18)\. \*\*' skills/team-lane/SKILL.md` | three lines: step 13 release and upgrade plans, step 17 merge and clean up, step 18 Finish | 1 |
| 3 | `grep -c 'Three separate yeses' skills/team-lane/SKILL.md` | `1` or more (the merge, the push of `main`, the branch delete) | 1 |
| 4 | `grep -n 'in parallel by default' skills/team-lane/SKILL.md` | at least one line inside step 10; read it and confirm the reason is given | 2 |
| 5 | `grep -c 'awake at the same time: \*\*20\*\*' skills/team-lane/SKILL.md` | `1` | 3 |
| 6 | `grep -c 'for one job in total: \*\*no cap\*\*' skills/team-lane/SKILL.md` | `1` | 3 |
| 7 | `grep -c 'the disagreement to the user: \*\*3\*\*' skills/team-lane/SKILL.md` | `1` | 3 |
| 8 | `grep -n 'Decisions about how' skills/team-lane/SKILL.md` | the ADR section heading; read it and confirm it says every option with its cost, why it lost, the marked recommendation, and that the user may overturn it at the milestone review | 4 |
| 9 | `grep -n 'A bug becomes a task row' skills/team-lane/SKILL.md` | the section heading; read it and confirm the PM writes the DoD section before the fix starts | 5 |
| 10 | `grep -c 'docs/design/prd.md' skills/team-lane/SKILL.md` | `10` or more (upstream `roles/pm.md` has 13) | 6 |
| 11 | `grep -ci 'dod\.md' skills/team-lane/SKILL.md` | `0` | 6 |
| 12 | `grep -c 'never the name of a file' skills/team-lane/SKILL.md` | `1` or more | 6 |
| 13 | `grep -c 'docs/crew' skills/team-lane/SKILL.md` | `0` (it is `17` before the task) | 7 |
| 14 | `grep -n '\^\[a-z0-9\]' skills/team-lane/SKILL.md` | the slug pattern line inside step 6 | 8 |
| 15 | `grep -c 'before you create anything' skills/team-lane/SKILL.md` | `1` or more — the PM announces the slug first | 8 |
| 16 | `grep -c 'one at a time' skills/team-lane/SKILL.md` | `0` | 9 |
| 17 | `sed -n '/^description:/p' skills/team-lane/SKILL.md` | one line; read it and confirm it still says **when** to use the crew, names the seven roles, says 18 steps, and says roles run in parallel | 9 |
| 18 | `sed -n '1,4p' skills/team-lane/SKILL.md` | `---`, `name: team-lane`, the description, `---` — the frontmatter shape is unchanged | 9 |

---

## `T-02` — the architect prompt (M2)

**Work.** Bring `agents/crew-architect.md` up to `$UP/roles/architect.md` v0.7.0.

**Change on the way.** Frontmatter is untouched. New paths
(`docs/design/hld.md`, `docs/design/api/`, `docs/design/tasks.md`,
`docs/decisions/adr/`, `docs/decisions/crd/`). The whole new **Decision records**
block: every option with its cost and why it lost, the marked recommendation,
plain words for a reader outside the code, the design never stops and waits, and
the bug-fix ADR that **quotes** the engineer's `Q-` file and never points at it.
Task rows gain a **test file** column and a **DoD section**; the flat numbered
check list goes. Milestones gain their own DoD sections. Where upstream says the
PM sends the architect back, say a **fresh** architect — a role here runs once.

**DoD.**

| # | Check | Expected | PRD check |
| --- | --- | --- | --- |
| 1 | `grep -c 'docs/crew' agents/crew-architect.md` | `0` (it is `6` before the task) | 7, 10 |
| 2 | `grep -c 'why it lost' agents/crew-architect.md` | `1` or more | 10 |
| 3 | `grep -c 'recommend' agents/crew-architect.md` | `3` or more | 10 |
| 4 | `grep -n 'never points' agents/crew-architect.md` | the "an ADR quotes, it never points" rule | 10 |
| 5 | `grep -c 'DoD section' agents/crew-architect.md` | `4` or more | 10 |
| 6 | `grep -ci 'acceptance check' agents/crew-architect.md` | `1` — only the sentence saying there is no numbered list of checks any more. If it is `0`, that sentence is missing; if it is `2` or more, a real pointer at a flat list survived | 10 |
| 7 | `git diff -- agents/crew-architect.md \| grep -E '^[-+](name\|description\|tools\|disallowedTools):'` | prints nothing — the frontmatter did not change | 11 |
| 8 | `sed -n '1,5p' agents/crew-architect.md` | `disallowedTools: Agent, Task, Workflow, SendMessage, ListAgents`, exactly one of `tools` / `disallowedTools`, description starting `Crew role.` | 11 |

---

## `T-03` — the doc reviewer prompt (M2)

**Work.** Bring `agents/crew-doc-reviewer.md` up to `$UP/roles/doc-reviewer.md`
v0.7.0. This is the largest of the seven role changes.

**Change on the way.** Frontmatter is untouched. Read **only** what the PM names,
and put the scope on the first line of the report. Checks renumbered 1 to 13:
new check 1 (every task row and every milestone has a DoD section that can be
checked), new check 7 (ADR options are all on the table), new check 13 (the flow
table in `principles.md` 20 matches the repository, run in both directions). New
paths throughout. The "later rounds" section says a later round reaches a
**fresh** reviewer here, so the PM's briefing must carry the earlier round's
blocking findings — that is this port's mechanism, and the upstream sentence
about a message does not apply. Check 13's list of what counts as a crew document
uses this repository's names: files under `docs/`, plus `principles.md`,
`CLAUDE.md`, `CHANGELOG.md` and both READMEs.

**DoD.**

| # | Check | Expected | PRD check |
| --- | --- | --- | --- |
| 1 | `grep -c 'docs/crew' agents/crew-doc-reviewer.md` | `0` (it is `10` before the task) | 7, 10 |
| 2 | `grep -cE '^[0-9]{1,2}\. \*\*' agents/crew-doc-reviewer.md` | `13` | 10 |
| 3 | `grep -n 'scope:' agents/crew-doc-reviewer.md` | the first-line scope rule in "How you report" | 10 |
| 4 | `grep -c 'principles.md 20' agents/crew-doc-reviewer.md` | `1` or more — check 13 names the flow table | 10 |
| 5 | `grep -c 'not in scope' agents/crew-doc-reviewer.md` | `1` or more — the rule for a check the scope does not reach | 10 |
| 6 | `grep -c 'docs/principles.md' agents/crew-doc-reviewer.md` | `0` | 12 |
| 7 | `git diff -- agents/crew-doc-reviewer.md \| grep -E '^[-+](name\|description\|tools\|disallowedTools):'` | prints nothing | 11 |
| 8 | `sed -n '1,5p' agents/crew-doc-reviewer.md` | `tools: Read, Glob, Grep` — an allow list, no shell, no write tool | 11 |

---

## `T-04` — the engineer and QA prompts (M2)

**Work.** Bring `agents/crew-engineer.md` up to `$UP/roles/engineer.md` and
`agents/crew-qa.md` up to `$UP/roles/qa.md`, both v0.7.0.

**Why they are one task.** Both gain a section called "a false red is not
evidence", and both describe the same bug-fix flow from the two ends. One
engineer writing both keeps the two readings consistent; two engineers who cannot
talk would not.

**Change on the way, `crew-engineer.md`.** Frontmatter untouched. Reads
`docs/design/prd.md` and its task row in `docs/design/tasks.md`, with that row's
**DoD section**. New "a false red is not evidence" section. New "when you fix a
bug: find at least two ways first" section, including the six differences that
mean stopping, the three extra things the `Q-` file must hold, "recommend one,
always", and that the bug's DoD section comes from the PM before the fix starts.

**Change on the way, `crew-qa.md`.** Frontmatter: only the `description` changes,
because it still names `docs/crew/qa/`. The plan moves **out** of the repository
to `<job folder>/<task-id>-plan.md`; the cases stay, under `docs/qa/<task-id>/`.
New **Git** section. New "a false red is not evidence" section. New **step 6**,
the standing testability list `docs/qa/gaps.md`. Every "acceptance check" becomes
"DoD item". Keep the rule that the PM adds the one config line and that "the
cases cannot run" is a blocking finding, and label upstream's `npm test` example
as upstream's own (ADR 0007).

**DoD.**

| # | Check | Expected | PRD check |
| --- | --- | --- | --- |
| 1 | `grep -c 'docs/crew' agents/crew-engineer.md agents/crew-qa.md` | `0` for both (`3` and `17` before the task) | 7, 10 |
| 2 | `grep -c 'a false red is not evidence' agents/crew-engineer.md agents/crew-qa.md` | `1` or more in each — case-insensitive if the heading is capitalised, so use `grep -ci` | 10 |
| 3 | `grep -n 'find at least two ways first' agents/crew-engineer.md` | the section heading | 10 |
| 4 | `grep -c 'the tree was moving' agents/crew-engineer.md agents/crew-qa.md` | `1` or more in each | 10 |
| 5 | `grep -n '^## Git' agents/crew-qa.md` | the new Git section | 10 |
| 6 | `grep -c 'docs/qa/gaps.md' agents/crew-qa.md` | `3` or more — step 6 and the report list | 10 |
| 7 | `grep -c 'job folder' agents/crew-qa.md` | `3` or more — the plan lives there now | 10 |
| 8 | `grep -ci 'acceptance check' agents/crew-qa.md` | `0` | 10 |
| 9 | `git diff -- agents/crew-engineer.md \| grep -E '^[-+](name\|description\|tools\|disallowedTools):'` | prints nothing | 11 |
| 10 | `git diff -- agents/crew-qa.md \| grep -E '^[-+](name\|tools\|disallowedTools):'` | prints nothing — only `description:` may change | 11 |
| 11 | `sed -n '1,5p' agents/crew-engineer.md agents/crew-qa.md` | both `disallowedTools: Agent, Task, Workflow, SendMessage, ListAgents`; neither names `tools:`; both keep `Bash` by not denying it | 11 |
| 12 | `sed -n '/^description:/p' agents/crew-qa.md` | one line; it names `docs/qa/`, and the words `docs/crew/qa/` are gone | 7, 11 |

---

## `T-05` — the researcher and the two read-only reviewers (M2)

**Work.** Bring three small prompts up to v0.7.0:
`agents/crew-researcher.md`, `agents/crew-code-reviewer.md`,
`agents/crew-security-reviewer.md`.

**Change on the way, `crew-researcher.md`.** Frontmatter untouched. Writes to
`docs/research/`. New section: what a release plan and an upgrade plan look like
for a given **project type**, with a source and a date for every claim.
**Carried with a change, and this is the one place the port disagrees with
upstream on purpose:** upstream says "this preset has no `web_fetch`, so a page
you must read in full is a request to the PM". Our researcher's frontmatter is
`tools: Read, Glob, Grep, Write, WebSearch, WebFetch`, so it **may** open a page
itself. Rewrite that paragraph to say so, and keep the part that is still true:
it has **no shell**, so any command is still a request to the PM.

**Change on the way, `crew-code-reviewer.md`.** Frontmatter untouched. Reads
`docs/design/prd.md` plus the task row in `docs/design/tasks.md` with its **DoD
section**. "Acceptance checks in the DoD" becomes "every item of the task's DoD
section", in both places upstream changed.

**Change on the way, `crew-security-reviewer.md`.** Frontmatter untouched. Gains
the new "First, read" section: the PRD and the task row with its DoD section, the
diff (and asking the PM for it when it is missing, rather than guessing from file
names), and enough surrounding code to see how outside input reaches the change.

**DoD.**

| # | Check | Expected | PRD check |
| --- | --- | --- | --- |
| 1 | `grep -c 'docs/crew' agents/crew-researcher.md agents/crew-code-reviewer.md agents/crew-security-reviewer.md` | `0` for all three (`2`, `0`, `0` before the task) | 7, 10 |
| 2 | `grep -c 'docs/research/' agents/crew-researcher.md` | `2` or more | 10 |
| 3 | `grep -n 'release' agents/crew-researcher.md` | the new release-and-upgrade-plan section; read it and confirm it starts from the project type and asks for a source **and a date** per claim | 10 |
| 4 | `grep -c 'web_fetch' agents/crew-researcher.md` | `0` — upstream's preset sentence must not be copied | 10 |
| 5 | `grep -c 'WebFetch' agents/crew-researcher.md` | `1` or more in the body, and the frontmatter line unchanged | 10 |
| 6 | `grep -c 'no shell' agents/crew-researcher.md` | `1` or more | 10 |
| 7 | `grep -n '^## First, read' agents/crew-security-reviewer.md` | the new section | 10 |
| 8 | `grep -c 'DoD section' agents/crew-code-reviewer.md agents/crew-security-reviewer.md` | `1` or more in each | 10 |
| 9 | `git diff -- agents/crew-researcher.md agents/crew-code-reviewer.md agents/crew-security-reviewer.md \| grep -E '^[-+](name\|description\|tools\|disallowedTools):'` | prints nothing | 11 |
| 10 | `sed -n '1,5p' agents/crew-code-reviewer.md agents/crew-security-reviewer.md` | both `tools: Read, Glob, Grep` — allow lists, no `Bash`, no `Write`, no `Edit` | 11 |

---

## `T-06` — `principles.md` at the repository root (M3)

**Work.** `git mv docs/principles.md principles.md`, then carry principles 1 to
20 with upstream's exact numbers and titles, plus this port's `P1` to `P5`.

**Change on the way.**

- Keep the file's house style: a numbered principle is short here — the rule, a
  short why, "Lives in" with **local** paths, and the outside source. `P1` to
  `P5` stay written in full.
- **One exception, and say so in the header:** principle 20's flow table is
  carried **in full** and adapted, because `agents/crew-doc-reviewer.md` check 13
  tells a reviewer to run the repository against it (ADR 0006).
- Adapt every path and name in that table: `~/.dsh/crew/jobs/` →
  `~/.claude/crew/jobs/`, `crew_engineer` → `crew-engineer`, `roles/pm.md` →
  `skills/team-lane/SKILL.md`, `roles/*.md` → `agents/*.md`. Where a cell names
  `node tools/verify-tasks.mjs` or `npm test`, keep the **rule** and say this
  repository has no such check (ADR 0007).
- Update the six new principles' "Lives in" lines to local files. Principles 15
  to 19: 15 (two written plans), 16 (merge and delete on the user's word), 17
  (the one who finds the choice does not make it alone), 18 (parallel by
  default), 19 (documents split by how long they live).
- Fix every reference to the old path: upstream's own file is now
  `principles.md` too, so the sentence pointing at "that project's
  `docs/principles.md`" becomes `principles.md`.
- Keep "What we looked at and did not take" and "Keeping this file honest", and
  carry upstream's new rejected ideas into that table.

**DoD.**

| # | Check | Expected | PRD check |
| --- | --- | --- | --- |
| 1 | `test -f principles.md && echo yes` | `yes` | 12 |
| 2 | `test -e docs/principles.md \|\| echo gone` | `gone` | 12 |
| 3 | `git log --follow --oneline principles.md \| tail -1` | a commit older than this job — `git mv` kept the history | 12 |
| 4 | `grep -cE '^## ([0-9]+\|P[0-9]+)\. ' principles.md` | `25` (20 numbered plus `P1`..`P5`; it is `19` before the task) | 12 |
| 5 | `cd "$UP" && grep -E '^## [0-9]+\. ' principles.md > /tmp/up.txt; cd "$REPO" && grep -E '^## [0-9]+\. ' principles.md > /tmp/loc.txt; diff /tmp/up.txt /tmp/loc.txt` | prints nothing — the 20 numbers and titles are identical to upstream's | 12 |
| 6 | `grep -c '^\| Lane \| Step, by name \|' principles.md` | `1` — the flow table header is there | 12 |
| 7 | `grep -cE '^\| (all\|team\|big\|small, bug\|bug) \| ' principles.md` | `27` — every row of the flow table | 12 |
| 8 | `grep -c 'docs/crew' principles.md` | `0` (it is `7` before the task) | 7, 12 |
| 9 | `grep -c 'docs/principles.md' principles.md` | `0` | 12 |
| 10 | `grep -c '~/.dsh/crew' principles.md` | `0` | 12 |
| 11 | `grep -c 'crew_' principles.md` | `0` — no dsh role name survived | 12 |
| 12 | `grep -n 'P1\.' principles.md` | `P1` to `P5` still present and still written in full | 12 |

---

## `T-07` — the port map (M3)

**Work.** Rewrite `docs/porting.md` for the v0.7.0 layout.

**Change on the way.**

- **The map** names every upstream v0.7.0 path this port reads:
  `roles/pm.md`, the seven other `roles/*.md`, `host/roles.js`, `host/jobs.js`,
  `host/git-guard.js`, `host/crew.js`, `host/roles-preset.js`, `principles.md`,
  `README.md`. Say for each one what changes on the way. Update the `roles/pm.md`
  row from "the 14 steps" to "the 18 steps", and the `principles.md` row to the
  new root path on both sides.
- **The "did not port" table** names every item in the PRD's "Not in scope" list,
  each with its reason: `host/git-guard.js` as code, `host/crew.js`,
  `tools/verify-*.mjs`, `tools/lib/boot-log.mjs`, the preset installer and its
  temp-folder fix, `.github/workflows/*`, `package.json`, upstream CRD 0009 and
  CRD 0011 **as machinery**, the preset configuration comments (`roleAllow`,
  `roleDeny`, `roleModels`, `rolesDir`, `cordis.patch.yml`), upstream's own
  project record (`docs/decisions/*`, `docs/qa/*`, `docs/design/tasks.md`), and
  the researcher's "no `web_fetch`" note. Keep the six rows already there.
- **A new short section: which folders this repository creates.**
  `docs/design/` and `docs/decisions/adr/` exist here because this job wrote
  them. `docs/qa/`, `docs/release/`, `docs/research/` and `docs/design/api/` are
  paths the rules tell a role to create in the **user's** project, and their
  absence here is not a gap (ADR 0002).
- **The port-pass steps** are rewritten for ADR 0005: clone the newest **tag**
  into a throwaway folder, never read `~/workspace/dsh-crew`, then
  `sha256sum -c`. Widen the by-hand check from "a new role" to "a new file under
  `roles/`, `host/` or the repository root", using
  `git -C "$TMP/dsh-crew" diff --name-status <ported tag>..<new tag>`.
- Every `docs/principles.md` becomes `principles.md`.

**DoD.**

| # | Check | Expected | PRD check |
| --- | --- | --- | --- |
| 1 | `for p in roles/pm.md roles/architect.md roles/engineer.md roles/qa.md roles/researcher.md roles/code-reviewer.md roles/security-reviewer.md roles/doc-reviewer.md host/roles.js host/jobs.js host/git-guard.js host/crew.js host/roles-preset.js principles.md README.md; do grep -q "$p" docs/porting.md \|\| echo "MISSING $p"; done` | prints nothing | 13 |
| 2 | `for s in verify- boot-log.mjs workflows package.json CRD 0009 CRD 0011 roleAllow roleDeny roleModels rolesDir cordis.patch.yml web_fetch; do grep -q "$s" docs/porting.md \|\| echo "MISSING $s"; done` | prints nothing | 13 |
| 3 | `grep -c '18 steps' docs/porting.md` | `1` or more | 13 |
| 4 | `grep -c 'docs/principles.md' docs/porting.md` | `0` | 12, 13 |
| 5 | `grep -c 'docs/crew' docs/porting.md` | `0` | 7, 13 |
| 6 | `grep -n 'workspace/dsh-crew' docs/porting.md` | at least one line, and reading it shows it is the **never read this** rule, not an instruction to use it | 13 |
| 7 | `grep -c 'tag' docs/porting.md` | `3` or more — the pass compares against a tag | 13 |
| 8 | `grep -c 'docs/design/api/' docs/porting.md` | `1` or more — the "which folders this repository creates" section | 13 |

---

## `T-08` — the checksum pin (M3)

**Work.** Re-pin `upstream.sums` to dsh-crew `v0.7.0`, commit `87a4332`.

**Change on the way.**

- Header: `Source: dsh-crew 0.7.0`, `Commit: 87a4332293bf3f5a0720a3a90bf58cba2b1120fb`.
- The `roles/pm.md` map comment says **18** steps, not 14.
- The `host/roles.js` comment loses its mention of `tools/check.mjs` — that file
  was removed in 0.2.0 and does not exist.
- `docs/principles.md` becomes `principles.md`, on the pinned line and in the
  map comment above it.
- The commands in the header comment are rewritten for ADR 0005: a clean clone of
  the tag in a throwaway folder, and a line saying `~/workspace/dsh-crew` is
  never read. Keep the macOS `shasum -a 256 -c` line.
- Fifteen pinned lines, no more and no fewer (ADR 0005). Each one carries a
  comment above it naming the local file it feeds, and a skipped file's comment
  says why it is skipped.

**DoD.**

| # | Check | Expected | PRD check |
| --- | --- | --- | --- |
| 1 | `cd "$UP" && sha256sum -c "$REPO/upstream.sums"` | every line `OK`, and no warning line at the end | 14 |
| 2 | `grep -c '87a4332293bf3f5a0720a3a90bf58cba2b1120fb' upstream.sums` | `1` | 14 |
| 3 | `grep -c 'dsh-crew 0.7.0' upstream.sums` | `1` or more | 14 |
| 4 | `grep -cE '^[0-9a-f]{64}  ' upstream.sums` | `15` | 14 |
| 5 | `grep -c 'tools/check.mjs' upstream.sums` | `0` | 14 |
| 6 | `grep -c 'docs/principles.md' upstream.sums` | `0` | 12, 14 |
| 7 | `grep -c '  principles.md$' upstream.sums` | `1` | 12, 14 |
| 8 | `grep -c '14 steps' upstream.sums` | `0` | 14 |
| 9 | `grep -c 'docs/crew' upstream.sums` | `0` | 7 |

---

## `T-09` — `CLAUDE.md` (M4)

**Work.** Make `CLAUDE.md` true for the layout and the rules the job just
shipped.

**Change on the way.**

- **The eight design rules stay eight rules**, in the same order, and every one
  must still be true. Rule 6's forbidden list is unchanged. Rule 8 keeps its
  meaning and gains the fact that the description now says roles run in parallel.
- **"What the plugin is made of"** table: "the 14-step playbook" becomes "the
  18-step playbook", and the design-rules row points at `principles.md`, not
  `docs/principles.md`.
- **"Commands"**: the upstream check command follows ADR 0005 — a clean clone of
  the newest tag in a throwaway folder, and the line saying
  `~/workspace/dsh-crew` is never read.
- **"State and documents"**: rewritten for the new layout. Job state still lives
  in `~/.claude/crew/jobs/<job>/state.json`. Crew documents are
  `docs/design/prd.md` (the one opening document in both lanes, with the DoD as a
  **section** inside it), `docs/design/hld.md`, `docs/design/tasks.md`,
  `docs/design/api/`, `docs/decisions/adr/`, `docs/decisions/crd/`, `docs/qa/`
  (cases, `run.sh`, `run-all.sh`, `gaps.md`; the plan lives in the job folder),
  `docs/research/`, `docs/release/`. Keep the two load-bearing rules and update
  the principle numbers behind them.
- **"The rule nothing enforces"**: keep the git rule and the `PreToolUse`
  snippet, and add the Verdicts line beside it (ADR 0007).
- **"Documentation"**: `principles.md` is at the root; principles **1 to 20** are
  shared with dsh-crew and the numbers match on purpose; `P1` to `P5` belong to
  this port. Keep the note that principle 20's flow table is carried in full and
  why.
- Every `docs/principles.md` becomes `principles.md`. Every `docs/crew/` becomes
  the new path.

**DoD.**

| # | Check | Expected | PRD check |
| --- | --- | --- | --- |
| 1 | `grep -cE '^[0-9]+\. \*\*' CLAUDE.md` | `8` — still eight design rules | 16 |
| 2 | `grep -c 'docs/crew' CLAUDE.md` | `0` (it is `6` before the task) | 7, 16 |
| 3 | `grep -c 'docs/principles.md' CLAUDE.md` | `0` (it is `5` before the task) | 12, 16 |
| 4 | `grep -c '18-step\|18 steps' CLAUDE.md` | `1` or more | 16 |
| 5 | `grep -c '14-step\|14 steps' CLAUDE.md` | `0` | 16 |
| 6 | `grep -c 'PreToolUse' CLAUDE.md` | `1` or more | 16 |
| 7 | `grep -c 'Verdicts' CLAUDE.md` | `1` or more | 16 |
| 8 | `grep -n '1 to 20' CLAUDE.md` | the Documentation section says principles 1 to 20 are shared | 16 |
| 9 | `grep -n 'docs/design/prd.md' CLAUDE.md` | the State and documents section names the one opening document | 16 |
| 10 | `grep -c 'never the name of a file\|is a section' CLAUDE.md` | `1` or more — the DoD is a section | 16 |
| 11 | `grep -c 'workspace/dsh-crew' CLAUDE.md` | `1` or more, and reading it shows it is the **never read this** rule | 16 |
| 12 | `for f in hooks/ scripts/ lib/ tools/ package.json; do test -e "$f" && echo "PRESENT $f"; done` | prints nothing — design rule 6 still holds | 16 |

---

## `T-10` — both READMEs (M4)

**Work.** Update `README.md` and `README-zh.md` together, in one commit. English
first, then match the Chinese.

**Change on the way.**

- Version `0.3.0` near the top of each file.
- The playbook has **18** steps, not 14.
- **Parallel by default**, with the reason, wherever the README describes how
  roles run.
- The **limits**: 20 roles awake at the same time, no cap for one job, 3 review
  rounds. The "Changing it" section's line about limits must match.
- The **new document paths** in "Where things live":
  `docs/design/prd.md` (one opening document, DoD as a section inside it),
  `docs/design/hld.md`, `docs/design/tasks.md`, `docs/design/api/`,
  `docs/decisions/adr/`, `docs/decisions/crd/`, `docs/qa/` (cases and
  `gaps.md`; QA's plan lives in the job folder), `docs/research/`,
  `docs/release/`. Job state stays outside the repository.
- `docs/principles.md` becomes `principles.md`.
- **Keep** the "what is not enforced" section and the `PreToolUse` hook the user
  can add to their own settings, in both files. Add the Verdicts line to it
  (ADR 0007).
- The "What changed from dsh-crew" table keeps its five rows and stays true.
- The "Keeping up with dsh-crew" section follows ADR 0005: clone the newest tag
  into a throwaway folder, never read `~/workspace/dsh-crew`.
- Keep code, commands, file names and settings **identical, character for
  character**, between the two files.

**DoD.**

| # | Check | Expected | PRD check |
| --- | --- | --- | --- |
| 1 | `grep -c '0\.3\.0' README.md README-zh.md` | `1` or more in each | 15 |
| 2 | `grep -c '0\.2\.0' README.md README-zh.md` | `0` in each, unless a line is plainly about the older release | 15 |
| 3 | `grep -c '^##' README.md; grep -c '^##' README-zh.md` | the two numbers are equal | 15 |
| 4 | `grep -c '18' README.md README-zh.md` | `1` or more in each; read the lines and confirm each says 18 steps | 15 |
| 5 | `grep -c 'docs/crew' README.md README-zh.md` | `0` in each (`4` and `3` before the task) | 7, 15 |
| 6 | `grep -c 'docs/principles.md' README.md README-zh.md` | `0` in each | 12, 15 |
| 7 | `grep -c 'PreToolUse' README.md README-zh.md` | `1` or more in each | 15 |
| 8 | `grep -c 'docs/design/prd.md' README.md README-zh.md` | `1` or more in each | 15 |
| 9 | `grep -c 'docs/decisions/adr' README.md README-zh.md` | `1` or more in each | 15 |
| 10 | `grep -o '\*\*20\*\*\|\*\*3\*\*\|no cap' README.md \| sort \| uniq -c; ` the same for `README-zh.md` | the same three limit values appear in both files | 15 |
| 11 | `grep -c 'one at a time' README.md README-zh.md` | `0` in each | 15 |
| 12 | `diff <(grep -o '`[^`]*`' README.md \| sort -u) <(grep -o '`[^`]*`' README-zh.md \| sort -u)` | read the output: every difference must be prose, never a command, a path or a setting | 15 |

---

## `T-11` — the changelog, the two manifests, and the closing sweeps (M4)

**Work.** Write the `0.3.0` changelog section, set both manifests to `0.3.0`,
fix `plugin.json`'s description, and run the repository-wide sweeps that no
single-file check can see.

**Change on the way.**

- **`CHANGELOG.md`**: a new `## 0.3.0` section at the top. It says which dsh-crew
  version was carried across (`v0.7.0`, commit `87a4332`), and says plainly that
  `0.2.0` only reached upstream's half-way commit `649ee52`. It names what moved:
  the 18 steps, parallel by default, the new limits, the new document layout,
  `principles.md` at the root, the ADR rules, a bug as a task row, the Verdicts
  line. **Do not rewrite the published `0.2.0` section** — it is a record of what
  was true then, and it is the one place `docs/crew/` and `docs/principles.md`
  are allowed to survive.
- **`.claude-plugin/plugin.json`**: `"version": "0.3.0"`, and the `description`
  loses "started one at a time" for wording that says roles run in parallel by
  default where their files do not overlap (ADR 0004). Do **not** add `agents`,
  `skills` or `hooks` — design rule 7.
- **`.claude-plugin/marketplace.json`**: `metadata.version` becomes `0.3.0`.

**DoD.**

| # | Check | Expected | PRD check |
| --- | --- | --- | --- |
| 1 | `grep -c '"version": "0.3.0"' .claude-plugin/plugin.json` | `1` | 17 |
| 2 | `grep -c '"version": "0.3.0"' .claude-plugin/marketplace.json` | `1` | 17 |
| 3 | `grep -c 'one at a time' .claude-plugin/plugin.json` | `0` | 17, and ADR 0004 |
| 4 | `grep -cE '"(agents\|skills\|hooks)":' .claude-plugin/plugin.json` | `0` — design rule 7 | 17 |
| 5 | `node -e 'JSON.parse(require("fs").readFileSync("./.claude-plugin/plugin.json"))' ` — or `python3 -c 'import json,sys;json.load(open(".claude-plugin/plugin.json"))'`, whichever exists | exits `0` for both JSON files. If neither runtime is on the machine, say so and read the two files by eye instead | 17 |
| 6 | `grep -n '^## 0.3.0' CHANGELOG.md` | one line, above `## 0.2.0` | 17 |
| 7 | `grep -c '0\.7\.0' CHANGELOG.md` | `1` or more | 17 |
| 8 | `grep -c '649ee52' CHANGELOG.md` | `1` or more, inside the `0.3.0` section | 17 |
| 9 | `grep -c '87a4332' CHANGELOG.md` | `1` or more | 17 |
| 10 | **Repository-wide sweep 1:** `grep -rn 'docs/crew' . --include='*.md' --include='*.json' --include='*.sums' \| grep -vE '^(CHANGELOG\.md\|docs/design/\|docs/decisions/)'` | prints nothing. It prints `75` lines before the job starts | 7 |
| 11 | **Repository-wide sweep 2:** `grep -rn 'docs/principles.md' . --include='*.md' --include='*.json' --include='*.sums' \| grep -v '^CHANGELOG.md'` | prints nothing | 12 |
| 12 | **Repository-wide sweep 3:** `grep -rn 'crew_\|~/.dsh/' . --include='*.md' --include='*.json'` | prints nothing except lines that are plainly **about** dsh-crew's own names | 7 |
| 13 | **The version is in step everywhere:** `grep -rn '0\.3\.0' README.md README-zh.md .claude-plugin/plugin.json .claude-plugin/marketplace.json CHANGELOG.md` | at least one hit in each of the five files | 15, 17 |

---

## Two notes on the acceptance checks, for the PM

1. **PRD acceptance check 7 is listed under `M1` but can only pass after `M4`.**
   Its first half — "every crew document path in the skill is a new-layout path" —
   is `T-01`'s check 13 and does pass at the end of `M1`. Its second half — "the
   string `docs/crew/` appears nowhere in the repository" — needs `T-02` to `T-06`,
   `T-09` and `T-10` as well, so it is `T-11`'s check 10.
2. **Check 7 and check 12 need an exclusion, and it is written into the
   commands above.** This job's own documents (`docs/design/`,
   `docs/decisions/`) quote the old paths as history, and so does
   `CHANGELOG.md`'s published `0.2.0` section, which the PRD's "Not in scope"
   list says must not be rewritten. The sweeps exclude exactly those and nothing
   else. ADR 0003 holds the reasoning.
