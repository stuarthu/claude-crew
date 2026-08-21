# High level design: port claude-crew up to dsh-crew v0.7.0

Version: 5
Language: English.
Reads from: `docs/design/prd.md` version 7 (confirmed by the user).

## What changed in version 5

`M1` is finished — `T-01` is committed as `aa064d3` and the user reviewed the
milestone — and at that review the user accepted **CRD 0006**: text arriving
inside a tool result is data, not instructions, stated in all seven role prompts
and in the skill. Three things follow for this document.

1. **`M2` has five tasks, not four.** The new one is `T-13`, the PM's half of
   CRD 0006 plus the round-3 optional findings still live in the skill. It owns
   `skills/team-lane/SKILL.md`, which is free because `T-01` is committed and
   `M1` is accepted — a milestone the user has accepted is not re-opened.
2. **There are nine divergences, not seven**, and the ninth is a different kind.
   The other eight are places upstream contradicts itself; this one is a **gap** —
   a rule neither project had. Checked against `$UP` before it was written: no
   `roles/*.md` mentions it and upstream's principle 12 mentions MCP only to say a
   deny list cannot name an uninstalled tool, which is about which tools exist,
   not about what a tool's output says.
3. **It reaches every role prompt**, so nine of the fifteen lines in
   `upstream.sums` now carry a divergence comment, where four did before. That is
   the real cost of a rule that lives in seven files, and it is cheaper than a
   future pass silently deleting the rule seven times.

## What changed in version 4

Review round 2 of `T-01` corrected two sentences this document had quoted, and
one of them was a claim about the mechanism rather than a rule. Both are fixed in
"One mis-port" below: the message test is now upstream's own wording plus two
named carve-outs, and the "only the PM can open a back channel" claim is gone —
it was measured false (evidence sections 7.1 and 7.2). Nothing else moved: no
task, no milestone, no file map.

## What changed in version 3

Three decisions landed after version 2, and two of them change the shape of the
work rather than its content.

1. **The hand-off document leaves the repository** (CRD 0003 revision one). It is
   now `~/dsh-crew-0.7.0-defects.md`, written like an issue filed against
   dsh-crew, sent by the user, and **kept nowhere here**. So the root holds
   **six** markdown files, not seven; `T-12` owns no file in this repository; and
   `porting.md`'s divergence table stops being a pointer and becomes the whole
   record (ADR 0008 revision one, ADR 0009 revision one).
2. **A central claim of this port is false, and was measured false** (CRD 0004).
   "A role runs once and cannot be messaged" is not the mechanism: the `Agent`
   tool returns at once so roles run in the background, `ListAgents` lists them,
   and a finished role can be reached again with its context intact. This is a
   **mis-port**, not a divergence — fixing it moves this port closer to upstream,
   which has `send_message` and uses it. It reaches nine files.
3. **A unit test and a QA test are two different things** (CRD 0005, in the shape
   of its revision one). The user named the cause under the security review's
   third blocking finding: one word, "test", was doing two jobs. The crew never
   edits the project's test command, and QA's scripts get read before they are
   committed. This is a seventh deliberate divergence, and the largest.

New decisions: ADR 0013, ADR 0014, ADR 0015. Revised to version 2: ADR 0008,
ADR 0009, ADR 0010.

## What changed in version 2

The shape of the work changed in three ways, all after `T-01` was built and
reviewed. Nothing else in this document moved.

1. **Two files move to the repository root**, not one: `principles.md` (`T-06`)
   and `porting.md` (`T-07`, CRD 0002). Version 1 said `docs/porting.md` keeps
   its path; that is no longer true.
2. **A new document class arrives**: a hand-off written for a reader **outside
   this project** (`T-12`, CRD 0003, ADR 0008). Version 2 put it at the root of
   this repository; **version 3 moves it out** — see above.
3. **Local files now differ from their upstream twin on purpose**, so the port
   map gains a ledger and a procedure (ADR 0009). Version 2 said three files and
   six differences; version 3 makes it four and seven. See "The nine divergences"
   below.

The riskiest file, the reason `M1` holds one task, and the "no modules, no
boundary contracts" finding are all unchanged. `T-01`'s fix round runs alone in
`M1`, like `T-01` itself.

## What is being built

Nothing runs here. This repository is a Claude Code plugin made of markdown, two
JSON manifests and one checksum file. So "building" means one thing only:
**rewriting text files so they say what dsh-crew v0.7.0 says, in the mechanism
this port has** — with the nine places where it deliberately says something
else, and the one place where the 0.2.0 port got the mechanism wrong and this job
puts it back.

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
| `roles/pm.md` (1,216 lines) | `skills/team-lane/SKILL.md` | `T-01` | Keep the frontmatter. Keep step 0 (unfinished work), the roster table and the "how you start a role" section — those are this port's own. Replace everything else with the v0.7.0 text: 18 steps, the ADR section, the bug-as-task-row section, the new document paths, parallel by default, the new limits, the job-slug shape. Rename `crew_engineer` → `crew-engineer` and so on. Replace `~/.dsh/crew/jobs/` with `~/.claude/crew/jobs/`. Drop `send_message`, `interrupt_agent` and `list_agents`: the PM may reach a role it started, so a document change reaches the roles building against it (CRD 0004). Drop the git-guard sentences and the push approval file. Keep `docs/qa/`, `docs/release/`, `docs/research/` and the Verdicts line as rules for the **user's** project. |
| `roles/architect.md` | `agents/crew-architect.md` | `T-02` | Frontmatter stays. New paths. The whole new **ADR** block: every option, its cost, why it lost, the marked recommendation, the design never waits, the bug-fix ADR that quotes the engineer's `Q-` file. Task rows gain a test file and a **DoD section**; the flat numbered check list goes. **Added in version 2 (ADR 0012):** a `## Git` section, which this prompt never had although its frontmatter leaves it holding `Bash` — a live breach of `CLAUDE.md` design rule 5. |
| `roles/doc-reviewer.md` | `agents/crew-doc-reviewer.md` | `T-03` | Frontmatter stays. Read only what the PM names, and say the scope on the first line. Checks renumbered 1..13: the new check 1 (DoD sections), the new check 7 (ADR options all on the table), the new check 13 (the flow table matches the repository). Later rounds reach a **fresh** reviewer here, so the round-two wording says the PM's briefing must carry the blocking findings. |
| `roles/engineer.md` | `agents/crew-engineer.md` | `T-04` | Frontmatter stays. New paths. New **"a false red is not evidence"** section. New **"when you fix a bug: find at least two ways first"** section, including that the bug's DoD section comes from the PM before the fix starts. |
| `roles/qa.md` | `agents/crew-qa.md` | `T-04` | Frontmatter stays. Plan moves **out** of the repository into the job folder; cases stay, under `docs/qa/<task-id>/`. New **Git** section. New **"a false red is not evidence"** section. New **step 6**, the standing testability list. Every "acceptance check" becomes "DoD item". Also update the frontmatter `description`, which still names `docs/crew/qa/`. **Changed in version 2 (ADR 0010):** QA writes only inside `docs/qa/<task-id>/`; `docs/qa/run-all.sh` and `docs/qa/gaps.md` are the PM's files, and QA reports the lines to add. That is CRD 0003 defect 6, and it is a deliberate difference from upstream. |
| `roles/researcher.md` | `agents/crew-researcher.md` | `T-05` | Frontmatter stays. Writes to `docs/research/`. New section on what a release and an upgrade plan look like, per project type, with a source and a date per claim. **Carried with a change:** upstream says "this preset has no `web_fetch`". Our researcher has `WebFetch`, so that paragraph is rewritten — it may open a page itself, and it still has no shell. |
| `roles/code-reviewer.md` | `agents/crew-code-reviewer.md` | `T-05` | Frontmatter stays. Reads `docs/design/prd.md` plus the task row in `docs/design/tasks.md`; "acceptance checks" become the task's **DoD section**. |
| `roles/security-reviewer.md` | `agents/crew-security-reviewer.md` | `T-05` | Frontmatter stays. Gains the new **"First, read"** section. |
| `principles.md` (1,106 lines, at the upstream root) | `principles.md` (new, at this repository's root) | `T-06` | `git mv docs/principles.md principles.md`, then rewrite. Principles 1..20 with upstream's exact numbers and titles, in this port's short house style, plus `P1`..`P5` written in full. Principle 20's flow table is carried in full and adapted — see ADR 0006. |
| — | `porting.md` (moved from `docs/porting.md`) | `T-07` | No upstream twin: this file is the port's own. `git mv` it to the root (CRD 0002), re-map every row to the v0.7.0 paths, widen the "did not port" table to every item in the PRD's "Not in scope" list, rewrite the port-pass steps to compare against a **tag in a throwaway clone** (ADR 0005), and add the **deliberate divergence** table — nine rows, self-contained, pointing at no other document — with the six-step procedure for a `FAILED` line (ADR 0009 revision one). Its "did not port" row for `send_message`, `interrupt_agent` and `list_agents` is **false** and is rewritten (CRD 0004). |
| — | `upstream.sums` | `T-08` | Re-pin to `87a4332`. Header says v0.7.0 and 18 steps. The `docs/principles.md` line becomes `principles.md`. The stale mention of `tools/check.mjs` goes — that file was removed in 0.2.0. The comments above `roles/pm.md`, `roles/qa.md`, `roles/code-reviewer.md` and `principles.md` say their local twin deliberately differs, and point at `porting.md`'s divergence table. |
| — | `~/dsh-crew-0.7.0-defects.md` — **outside this repository** | `T-12` | No upstream twin, no reader inside this project, and **no file here**: it is an issue for dsh-crew's author, in the user's home directory, sent by the user and recorded nowhere in the plugin (CRD 0003 revision one, ADR 0008 revision one). Eight defects — CRD 0003's six, CRD 0003 revision two's force-push row and CRD 0005's one — plus one gap (CRD 0006), each with the upstream file and its line numbers at `v0.7.0`, the text as it stands, how it fails in a real job, what this port says instead, and the smallest fix upstream could make. |
| `CLAUDE.md` | `CLAUDE.md` | `T-09` | Not a copy: this file is about **this** repository. The eight design rules stay eight rules and stay true. "State and documents" is rewritten for the new layout. "Documentation" says principles 1..20 are shared and `principles.md` is at the root. The upstream-check command points at a tag clone. |
| `README.md` | `README.md` + `README-zh.md` | `T-10` | Not a translation of upstream: the install and the mechanics differ. Both local files change together, in one commit. Version 0.3.0, 18 steps, parallel by default, the new document paths, the new limits. Both keep the "what is not enforced" section and the `PreToolUse` hook the user can add. |
| — | `CHANGELOG.md`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | `T-11` | A new `0.3.0` section naming dsh-crew v0.7.0 and saying plainly that `0.2.0` only reached `649ee52`. Both manifests say `0.3.0`. `plugin.json`'s `description` loses "one at a time" — see ADR 0004. |

### What is reused, not rewritten

Reuse before you invent applies here too. These parts of the local files are
**this port's own** and are kept as they are, not replaced from upstream:

- **Step 0, "is there unfinished work?"** — upstream gets this pushed at the PM
  every turn by `host/jobs.js`. Here the PM looks in `~/.claude/crew/jobs/`
  itself. Principle P2. **Its procedure is kept and its promise is not**: "every
  role from the old session is gone" is unverified, not known, so it is replaced
  by a procedure that finds out (ADR 0013).
- **The roster table and "how you start a role"** — upstream builds this at run
  time in `host/crew.js`. Here it is written out in the skill, because nothing
  builds it. **The section is kept; its central paragraph is deleted**, because
  "a role runs once and then it is gone" is false in this deployment (CRD 0004).
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
- **No port-back job.** The eight defects are fixed here and written down for
  dsh-crew's author to read; nothing in this job writes into dsh-crew. CRD 0003's
  Decision section is where the user chose that, and `~/workspace/dsh-crew` is
  never read, written or run by any task.
- **No new folder in this repository for `docs/qa/`, `docs/release/` or
  `docs/design/api/`.** Those are paths the rules tell a role to create in the
  **user's** project. Creating them here empty would be a file no rule asked
  for, which is exactly what principle 20's matching rule calls a misalignment.

## How the layout changes

Before this job, and after it:

| Before | After | Who moves it |
| --- | --- | --- |
| `docs/principles.md` | `principles.md` (repository root) | `T-06` |
| `docs/porting.md` | `porting.md` (repository root) | `T-07` (CRD 0002) |
| `docs/crew/*` in prose, 75 lines across 10 files | `docs/design/`, `docs/decisions/adr/`, `docs/decisions/crd/`, `docs/qa/`, `docs/research/`, `docs/release/` | `T-01`, `T-02`, `T-03`, `T-04`, `T-05`, `T-06`, `T-09`, `T-10` |
| — | `docs/design/prd.md`, `docs/design/hld.md`, `docs/design/tasks.md`, `docs/decisions/adr/*.md` — **this job's own record** | the PM and the architect, before `T-01` starts |

After the job the repository root holds **six** markdown files: `README.md`,
`README-zh.md`, `CHANGELOG.md`, `CLAUDE.md`, `principles.md` and `porting.md`.
`docs/` then holds only crew job output, which is what upstream principle 19 says
it is. `T-11`'s sweep 4 counts those six.

ADR 0002 holds the options for the layout; CRD 0002 is where the user said yes to
moving `porting.md`; ADR 0008 revision one is why the hand-off to upstream is
**not** a file here at all — the user's reason, in their words, is that it is an
issue sent to another project, and an issue is not documentation.

## The nine deliberate divergences, and the one mis-port

This is where the job's stated goal — the two projects say the same thing — is
knowingly given up, and where it turns out the two projects were **not** saying
the same thing already.

Three read-only reviews of `T-01` found **nine** distinct blocking findings in
`skills/team-lane/SKILL.md` (eleven raised, two of them found twice). Eight had a
settled cause: two this port's own, six dsh-crew v0.7.0's own, copied here word
for word. CRD 0003 took the six to the user, who chose: fix them all here, and
write a document dsh-crew's author can read. The ninth was CRD 0005, below.

### Nine divergences (Class A)

After this job **eleven** local files no longer say what their upstream twin
says: `skills/team-lane/SKILL.md`, all seven `agents/*.md`, `principles.md` — and
`CLAUDE.md` and both READMEs, which have no pinned twin. Eight of the nine are
defects — a place where upstream contradicts itself — and the ninth is a gap. Six
of the eight are CRD 0003's. The seventh is CRD 0005: this port says a **unit
test** and a **QA test** are two different things, written by two different roles
and run by two
different commands, and that the crew never edits the project's test command —
upstream's own CRD 0009 exists to do the opposite. The eighth is the force-push
licence this port dropped from the Hard rules (CRD 0003 revision two).

**The ninth is not a contradiction, and that changes what has to be written
about it.** CRD 0006: a third-party MCP server's instruction block was delivered,
unprompted, into a crew role's context five times in one day — once into a role
holding `Read`, `Glob` and `Grep` and nothing else, and once into the architect
writing the rule about it. Every role ignored it and reported it, which was good
behaviour rather than a rule. Neither project had a rule; this one now does, in
all seven prompts (sentence `S12`) and in the skill. Upstream cannot check that
against its own file and cannot reproduce our measurements, so the entry has to
carry its evidence with it: what was delivered, into which role, and what each
role did. `T-12`'s issue therefore has **two parts with two shapes**, which is the
one real design question this raised.

That is a new failure the design has to carry, because the next port pass sees
only a `FAILED` line from `sha256sum -c` and cannot tell a missed port from a
decision. Two ways it goes wrong, both silent: the pass copies the paragraph back
and re-imports the defect, or upstream fixes it their own way and the two projects
diverge for good.

The answer is a **ledger and a procedure** (ADR 0009):

- every difference is Class A (a rule stated differently — needs a CRD and the
  user's yes), Class B (wording, an example, a cross-reference, a clarification)
  or Class C (a mechanism difference, already in the port map);
- **`porting.md`'s divergence table is the whole ledger**, nine rows plus one
  Class B row, and every row is self-contained — it names the upstream file and
  lines, what upstream says, what this port says, and the local file that says it.
  It points at no other document, because after CRD 0003 revision one there is no
  other document: the issue sent to upstream lives in the user's home directory
  and this repository keeps no copy;
- `upstream.sums` carries the pointer on the nine lines that matter, because a
  `FAILED` line is where a pass is already looking;
- the port-pass steps say, in order, what to do when one of those nine files comes
  back `FAILED`, and the first instruction is **read the table before you read the
  diff**.

### One mis-port, which is the opposite thing (CRD 0004)

Everything above moves this port **away** from upstream on purpose. CRD 0004 moves
it **back**. The 0.2.0 port dropped `send_message`, `interrupt_agent` and
`list_agents` and wrote the reason as "a role runs once; a second round is a fresh
role". That reason is false in this deployment, and it was measured false:
`SendMessage` and `ListAgents` exist, roles run in the background, and a finished
role can be reached again with what it read.

Two things follow for the design, and both are larger than they look:

1. **The rule the falsehood was protecting has to be re-argued from a true
   reason.** It is not "you cannot message a role". It is "a message reaches one
   role and dies there", so two engineers building two sides of one boundary
   cannot compare notes. The test that carries it is upstream's own — **never
   decide anything in a message**: a new rule, a new number, a new file name or a
   new promise belongs in a document first. A message may carry a pointer and
   evidence you could copy again, and nothing else is safe to say in one.
   `principles.md`'s `P1` is built on the false premise and is rewritten (`T-06`).
2. **What may be said about a session restart is now bounded by measurement.**
   Whether a role from an earlier session can be reached is **unknown** — half
   measured since: a resume fails loudly, `No transcript found for agent ID`,
   once the session is re-keyed (evidence section 11). The documents promise
   nothing either way and give a procedure instead (ADR 0013). `state.json` gets
   the agent id back, and a list of the commits the PM made, so both the restart
   question and the git check survive a new session.

No agent frontmatter changes, and no role holds a messaging tool: the deny list
was measured and it really holds. What it does **not** do is close the channel —
three roles hold a shell, and a shell can start a separate Claude process or write
into the job folder (evidence sections 7.1 and 7.2). So the channel is closed by
the rules those roles are given, not by the tools they hold, and the PM's is the
only sanctioned one. That is the honest form of design rule 1, and it is what
keeps the document rule enforceable.

## How the work moves through the milestones

The PRD's four milestones are the user's and are not changed. Inside them:

```
M1   T-01  the skill, then four fix rounds   alone. Committed aa064d3, M1 accepted
            |
            v  user reviews M1
M2   T-02  crew-architect            \
     T-03  crew-doc-reviewer          |  all five in parallel:
     T-04  crew-engineer + crew-qa    |  no two share a file
     T-05  researcher + the 2 reviewers |
     T-13  the skill again            /   CRD 0006's PM half + round 3's leftovers
            |
            v  user reviews M2
M3   T-06  principles.md at the root  \
     T-08  upstream.sums               |  all three in parallel
     T-12  the issue for upstream     /   (no file in this repository)
     T-07  porting.md at the root        after T-06: its map must name real files
            |
            v  user reviews M3
M4   T-09  CLAUDE.md                  \
     T-10  README.md + README-zh.md    |  all three in parallel
     T-11  CHANGELOG + both manifests /
```

Every task after `T-01` depends on `T-01`, because every one of them describes
the flow the skill defines. `T-12` depends on `T-04` and `T-05` as well: it quotes
what this port says instead of the upstream text, and two of the eight defects are
written in `agents/crew-qa.md` and `agents/crew-code-reviewer.md`. Inside a
milestone, tasks with no shared file start
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
