# CRD 0005 — step 10c changes the project's test command with nobody's permission

## Who asked

`crew-security-reviewer`, blocking finding 3 on task `T-01` (2026-08-21). The second
architect round found it unaccounted for: no task builds a fix, and `T-01` cannot get
a `security: pass` verdict while it stands.

## What the text says

`skills/team-lane/SKILL.md` step 10c, lines 687-699, carried faithfully from upstream
`roles/pm.md` 556-561 and `principles.md` 13:

> Then **you add the one config line** that lets the runner see the folder ... Put that
> line in the project's **default test command**, not in a second command somebody has
> to remember ... "Those cases cannot run" is not an ending you may settle for.

## The two defects in it

**One — it changes the stack with no CRD and no yes, in a file that forbids exactly
that.** Lines 388-389 make "the **test framework and the exact test command**" part of
the **Language and stack** section. Lines 400-402: "Once confirmed, the stack is fixed.
It changes only through a CRD." The Hard rules (1324-1329) say a stack change needs the
user's yes. Step 10c then edits that same command with no CRD, no yes, and no mention
of either — and the last sentence **forbids the PM from declining**. The 0.2.0 text
this replaced let the PM decline; the v0.7.0 text does not.

**Two — the thing being wired in has been read by nobody.** `docs/qa/<task-id>/run.sh`
and the case files are written by `crew-qa`, which owns a shell. They are not in the
engineer's file list, so they are not in the `git diff` pasted to the code reviewer at
step 10a — and step 10 runs QA **in parallel** with that review, so they do not exist
yet when the diff is taken. Step 10b's trigger list is scoped to what "the task
touches", so it never fires for them. The doc-review-on-landing list names no script.
The script is committed at step 11 having been read by no reviewer at all.

From that commit on, **every contributor's test command and every CI job runs shell
written by a subagent** — in CI, where the repository's secrets are in the environment.

ADR 0010 moved `docs/qa/run-all.sh` to the PM, which helps: the PM writes that one. It
does not touch the per-task `run.sh` or the case files, which QA still writes and which
`run-all.sh` calls.

## Why this is a change request

Same shape as CRD 0003: the text is upstream's, so fixing it here is a **seventh
deliberate divergence**, and it changes what the plugin tells a user to do. The PM may
not decide that alone.

It is also the one finding where copying faithfully has a cost outside the repository:
it puts unreviewed shell into other people's CI.

## What it touches

- `skills/team-lane/SKILL.md` step 10c, step 10a's reviewer file list, and step 10b's
  trigger list — task `T-01`, fix round.
- `agents/crew-qa.md` and `agents/crew-code-reviewer.md` — tasks `T-04` and `T-05`,
  neither started.
- `porting.md` and `upstream.sums` — a seventh divergence row (`T-07`, `T-08`).
- `~/dsh-crew-0.7.0-defects.md` — a seventh section (`T-12`).
- No milestone changes. No task is added.

## The options

### Option A — fix both halves here **(recommended; the architect's reading too)**

- The test-command edit becomes what the file already says it is: the PM writes a CRD
  and asks the user. If the user says no, the honest ending is allowed — "these cases
  cannot run from the default command yet, and here is the command that does run
  them" — and it goes in the milestone report.
- QA's `run.sh` and its case files join the code reviewer's file list, so a human-read
  review happens before they are committed. Where QA runs in parallel with the review,
  the reviewer is started again on those files after QA reports.

**Cost.** Two clauses in step 10c, one line in step 10a's briefing list, one line in
step 10b's trigger list, and one sentence each in `crew-qa` and `crew-code-reviewer`.
All but `T-01` are unstarted, so it is cheap today and costs a re-run of `M2` after
`M3`.

**Why it wins.** It removes a contradiction the file already contains — this is not
inventing a new rule, it is making step 10c obey step 3 and the hard rules. And it is
the only option that stops unreviewed shell reaching a stranger's CI.

### Option B — fix only the permission half

Make the test-command edit go through a CRD; leave QA's scripts unreviewed.

- **Cost.** The louder half is fixed and the dangerous half is not. The script still
  lands in CI unread.
- **Why it lost.** The permission half is a paperwork bug. The unreviewed-script half
  is the one that can hurt somebody who never used this plugin.

### Option C — fix nothing here; make it a seventh entry in the hand-off document

- **Cost.** Every user of the plugin meets both defects. The PM is instructed to change
  their test command without asking, and told it may not decline.
- **Why it lost.** CRD 0003's own reasoning: fidelity cannot mean faithfully broken.
  This one is worse than the six, because its blast radius is other people's CI.

## Revision one — the user names the real cause

On 2026-08-21 the user rejected all three options and named what is underneath them:

> we need to distinguish test engineer and qa engineer. test engineer is still
> programmer, not qa. test engineer write unit tests, and qa write qa tests

That is a better diagnosis than this CRD's. Both defects above are symptoms of one
thing: **the documents use a single word, "test", and a single phrase, "the project's
test command", for two different jobs done by two different roles.**

Measured in `skills/team-lane/SKILL.md`:

- "unit test" appears **once**, at line 481. Everywhere else it is "test", "test file",
  "its test", "the project's test command".
- Line 679 puts the two side by side as if they were the same kind of thing: "It runs
  all three: the project's test command, this task's `run.sh`, and `run-all.sh`."
- Line 691 then pushes one into the other: put `bash docs/qa/run-all.sh` inside the
  project's **default test command**.

Once the two are named apart, the first defect does not need a fix — **it disappears**.
A QA test is not a unit test, so it was never the project's unit-test command's job to
run it, and there is nothing to ask the user's permission for because there is nothing
to change.

### The distinction, as it will be written

| | who writes it | it is | where it lives | what runs it | who reviews it |
| --- | --- | --- | --- | --- | --- |
| **unit test** | `crew-engineer` — **a programmer, not QA** | the proof that one piece of behaviour works, written **before** the code | the project's own test suite, in the naming that project already uses | the project's own test command | the code reviewer, inside the task's diff |
| **QA test** | `crew-qa` | the proof that the **task's DoD items** are met, written from the document **before** QA reads the code | `docs/qa/<task-id>/` | `bash docs/qa/run-all.sh` | the code reviewer, in its own round |

Three rules fall out of it, and they replace this CRD's Option A:

1. **The crew never edits the project's test command.** Step 10c's "you add the one
   config line" goes. The stack stays fixed, as step 3 and the hard rules already say,
   and no CRD is needed because nothing is changed.
2. **"Those cases cannot run from the default command" stops being a failure.** It is
   the normal state. The PM reports the command that *does* run them, at the milestone
   review, and the user decides whether they want it in their CI. The crew never puts
   it there.
3. **The two words are never swapped.** "Unit test" and "QA test" each mean one thing in
   every document. "The project's test command" runs unit tests and nothing else.

The second defect still needs its fix, unchanged: QA's `run.sh` and its case files are
committed, so a reviewer must read them first. They join the code reviewer's file list,
and where QA ran in parallel with the review, a fresh reviewer is started on those files
after QA reports.

### What this costs

It is a **larger** divergence than the six in CRD 0003. Upstream's own CRD 0009 exists
precisely to wire QA's cases into `npm test` and to run them in CI on every push. This
port now says that was the wrong shape: it mixes two kinds of test, and it makes a
subagent's shell part of every contributor's test run.

So `~/dsh-crew-0.7.0-defects.md` gains a seventh section that argues it rather than just
reporting it, and `porting.md`'s divergence table gains the row.

## Decision

**Accepted, in the shape of revision one.** The user confirmed it on 2026-08-21.

Option A of the original three is superseded: its first half is not built, because the
distinction removes the need for it, and its second half (a reviewer reads QA's scripts
before they are committed) is kept.

## Applied

Not yet — the edits land in `T-01`'s fix round, in `T-04` (`crew-qa`) and `T-05`
(`crew-code-reviewer`), and in `T-07`, `T-08` and `T-12` for the divergence record.
