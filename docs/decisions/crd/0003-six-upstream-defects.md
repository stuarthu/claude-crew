# CRD 0003 — six defects that dsh-crew v0.7.0 has, and this port copied faithfully

## Who asked

The PM, after three read-only reviews of task `T-01` (`crew-code-reviewer`,
`crew-doc-reviewer`, `crew-security-reviewer`, all on 2026-08-21).

## What this is about

The three reviewers raised **eight blocking findings** on `skills/team-lane/SKILL.md`.
The PM checked every one against the source, `roles/pm.md` at dsh-crew tag `v0.7.0`.
The split is:

**Two are this port's own, and are being fixed in `T-01`'s fix round. Not part of
this CRD.**

- The "After a restart" section promised a note headed **"Unfinished crew work"** at
  the start of a session. Nothing produces it here: it comes from dsh's
  `tools/lib/boot-log.mjs`, which the PRD's "Not in scope" list drops. Found
  independently by the code reviewer and the doc reviewer.
- Upstream blocks a crew role's git writes with running code (`host/git-guard.js`).
  This port ships no hooks, so a role that commits anyway is caught only if its own
  report admits it — and new step 17 then merges that commit into `main`, pushes it,
  and deletes the branch that held it. The rule has to be carried with a mechanism
  this port actually has: an unconditional `git log` check the PM runs itself.

**Six are upstream's own defects, copied here word for word.** Each line number
below is in `/tmp/.../scratchpad/dsh-crew/roles/pm.md` at `v0.7.0`:

| # | Upstream | The defect | What it costs a real job |
| --- | --- | --- | --- |
| 1 | 638-641 | Step 11 stages the task's files plus "the documents this task produced: QA's case files, `gaps.md`, and any ADR or CRD you wrote" — and then says "If a file changed that no task owns, stop." The PM's own `docs/design/prd.md` and the architect's `docs/design/tasks.md` and `hld.md` are owned by no task. | The first commit of every job stops on the PM's own PRD. Step 17's "`git status --short` is empty" can then never pass. **This job hit it: the PM had to commit the design documents in a commit of its own, outside any task, using judgement the file does not grant.** |
| 2 | 748, 771 | Step 13 says to put the shipping gap list and the two plans "in this milestone's commit" / "in the commit". Line 724 says "You commit once per task", and step 13 runs after every task in the milestone is already committed. | There is no such commit. The same hole swallows step 14's README, `CHANGELOG.md` and rules-file edits, and step 17 then demands a clean tree. |
| 3 | 715 | "**Ship this milestone** — do step 13, then come back here and treat it as `go on`." Step 13 only *writes plans*; the push, the tag and the publish live in step 16. | Two readings, and one of them publishes a package. The user asked to ship and may get only two documents — or an unasked-for release. |
| 4 | 571-573 | "A task is finished when code review passes, security review passes or was skipped for a stated reason, and QA says pass" — three checks. The **Verdicts** line (650-676, 1013) carries **four** values, the fourth being the doc review, and "A task with no Verdicts line is not finished". | A PM that reads 571 first commits with no doc review and still writes a complete-looking Verdicts line. |
| 5 | 286, 331, 347, 468 | "in both lanes" appears four times. Upstream names **three** lanes at 214-218: `ask`, `quick`, `team`. | Read literally, the PM writes `docs/design/prd.md` for a typo — which lines 216-217 forbid in the same file. The intended meaning is "small work and big work, both inside `team`", and it is never said. |
| 6 | 546-547, 1043 | QA writes `docs/qa/run-all.sh` and `docs/qa/gaps.md`; 1043 says "**QA writes it**". Roles run in parallel by default, and the parallel test is only whether *engineers'* file lists overlap. | Two QA roles that finish together overwrite both files. The second write wins, `run-all.sh` still reports a clean total, and one task's cases silently drop out of the suite. Silent test-coverage loss. |

Defects 1, 2 and 3 stop or mislead a PM in the middle of a real job. Defect 6 loses
work silently. None of them is a mistake this port made.

## Why this is a change request and not just a fix

The PRD's stated goal is that the two projects **say the same thing**: "Its only
value is that the two projects say the same thing. Drift between them is the single
risk this repository has." Fixing an upstream rule here creates exactly that drift.
But copying it faithfully ships a document whose step 11 stops on its own PRD.

Fidelity cannot mean "faithfully broken", and the PM may not quietly decide which of
the two the project is for. So it comes to the user.

## What it touches

- `skills/team-lane/SKILL.md` (task `T-01`, fix round) for defects 1 to 6.
- `agents/crew-qa.md` (task `T-04`) for defect 6's other half.
- `porting.md` (task `T-07`) — whatever is decided has to be written where the next
  port pass will read it, or the next pass re-opens all six.
- `upstream.sums` (task `T-08`) — the comment above `roles/pm.md`'s line.
- No milestone changes. No task is added or removed.

## The options

### Option A — fix all six here, and write each one down for a port-back **(recommended)**

Fix them in this job. For each one, record in `porting.md` exactly what this port
says, what upstream says, and why — so the divergence is a written decision, not a
surprise. Then a separate, later job carries the six fixes **upstream** into
dsh-crew, after which the two match again.

- **Cost.** Six local edits, most of them one clause. `porting.md` gains a
  "deliberate divergence" table with six rows. Until the port-back job runs, six
  paragraphs differ between the two projects, and the next `sha256sum -c` pass must
  read that table before touching `roles/pm.md`'s line.
- **Why it wins.** The plugin a user installs is executable. Nothing is hidden: the
  divergence is a document, and the port-back closes it. This is also the only
  option that improves dsh-crew, which is where these defects actually live.

### Option B — copy upstream faithfully, fix nothing, record all six

Ship as-is. Write the six into `porting.md` as known upstream defects.

- **Cost.** The plugin's step 11 stops on its own PRD; step 13 names a commit that
  does not exist; "ship" is ambiguous in the direction of publishing; two QA roles
  can silently drop a task's tests. Every user of the plugin meets these.
- **Why it lost.** This job's own PM already had to step outside the written rule to
  commit the design documents. A rule that the author cannot follow once is not a
  rule.

### Option C — fix all six here **and** port them back upstream inside this job

Same fixes, plus the dsh-crew side, in this job.

- **Cost.** dsh-crew is a different repository with running code, a test suite and
  CI. Its `roles/pm.md` is pinned by its own QA cases (`docs/qa/T-01/case-*`), so
  changing it means changing those too, and running its `npm test`. That is a second
  job's worth of work, on a repository this job has been told only to read.
- **Why it lost.** The user's instruction for this job is explicit: read the
  scratchpad clone, never touch `~/workspace/dsh-crew`. Writing upstream needs its
  own job, its own branch and its own review.

## Cost

Option A: no task is re-run. `T-01` is in its fix round already, so the six edits
ride along with the two port fixes. `T-04` and `T-07` have not started. One extra
table in `porting.md`.

## Decision

**Accepted, as a fourth option the user chose on 2026-08-21: fix all six here, and
write a document about them that the user hands to upstream.**

Their words: "fix it here, and write a doc about this, I'll let upstream read the
doc."

This is Option A without the port-back job. The difference matters: Option A closed
the divergence by a later job that edits dsh-crew. Here the divergence is closed by
handing dsh-crew's author a document they can act on themselves. That is cheaper,
and it puts the fix where the defect lives without this job writing into a
repository it was told only to read.

So:

- The six upstream defects are fixed in `skills/team-lane/SKILL.md` (task `T-01`,
  fix round) and in `agents/crew-qa.md` (task `T-04`).
- A new document, **`upstream-defects.md` at the repository root**, states each
  defect for dsh-crew's author: the upstream file and line numbers at `v0.7.0`, what
  the text says, how it fails in a real job, and what this port says instead. It is
  a permanent product document, a sibling of `porting.md` and `principles.md` — not
  crew job output, so it does not belong under `docs/`.
- `porting.md` gains a **deliberate divergence** table with one row per defect,
  pointing at `upstream-defects.md`, so the next `sha256sum -c` pass does not read
  the six differences as a missed port.
- `upstream.sums` gains a comment above `roles/pm.md`'s line saying the same.

## Revision one — the hand-off is an issue, not a repository document

On 2026-08-21 the user changed where the hand-off goes, in two messages: "do not put
it in our repo, put it in my home dir", then "it is like a issue we sent to upstream,
we don't need to record that".

So the hand-off is **`~/dsh-crew-0.7.0-defects.md`**, in the user's home directory. It
is written the way an issue filed against dsh-crew would be written, the user sends it,
and **this repository keeps no copy and no record of it**. It is not part of the
plugin, not committed, and not something a later job has to keep true.

Task `T-12` still exists — somebody has to write the issue — but it owns **no file in
this repository**, and nothing in the plugin points at it.

**What is still recorded, and why it is not the same thing.** The issue is about
upstream's defects. `porting.md`'s "deliberate divergence" table is about **this
port's own six paragraphs that deliberately differ from upstream**. That record stays
in the repository, and it has to be self-contained, because the next person to run
`sha256sum -c upstream.sums` will see `roles/pm.md: FAILED` and needs to know which
differences are decisions and which are a missed port. Without it they either copy the
defects back in or delete the fixes. That is the exact failure `upstream.sums` exists
to prevent (principle `P5`). Task `T-07` writes it, and `T-08` puts the same warning in
the comment above `roles/pm.md`'s line in `upstream.sums`.

## Revision two — a seventh defect, found by code review round 3

`skills/team-lane/SKILL.md` carried upstream's Hard rule "Push `main`, a tag, **or with
force** only when the user has just said yes" (`roles/pm.md` 1164). Upstream's own step
17 (933-934) already forbids a force push. So a PM reading only the Hard rules could get
a force push with one yes, while the step it would run says the opposite — the same shape
as the six above: **upstream contradicting itself.**

`F-50` removed the clause and the file now says a force push is not something this
playbook does; if the user wants one, they are handed the command. The change is already
in the file — the architect ordered it from security review round 2's pre-existing note,
and fix round 3 made it.

What was missing was the record. It is divergence **eight** (this CRD's six, CRD 0005's
one, and this), `docs/design/tasks.md` fact 10 is corrected at version 7, and the PM must
put it in front of the user with the rest.

**It is a safety improvement, not a loosening**: the port's answer is the stricter of the
two readings upstream offers.

## Applied

Not yet — waiting on the architect round that writes these into
`docs/design/tasks.md`. Revision one above must be folded into that same version.
