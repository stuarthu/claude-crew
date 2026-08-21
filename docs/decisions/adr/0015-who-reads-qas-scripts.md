# ADR 0015: who reads QA's scripts before they are committed, and when

Version: 2

## The choice

CRD 0005 keeps one half of its original Option A: QA writes `run.sh` and case
files, they are committed, and other people then run them — so a reviewer has to
read them first. Its words:

> They join the code reviewer's file list, and where QA ran in parallel with the
> review, a fresh reviewer is started on those files after QA reports.

CRD 0004, accepted the same day, makes "a fresh reviewer" no longer the only
option: a finished `crew-code-reviewer` can be resumed, with its round-1 reading
still in hand — measured, evidence file section 3.

The two CRDs were written in parallel and this is where they touch. Whoever
writes step 10 needs one answer, because the two sides of it — the skill (`T-01`)
and `agents/crew-code-reviewer.md` (`T-05`) — are built by two engineers who
cannot talk.

## Every option

### Option A — resume the reviewer that read the task, and fall back to a fresh one **(recommended)**

When QA reports, the PM sends the code reviewer that already reviewed this task a
message: the QA file list, the pasted content of `run.sh` and the case files, and
nothing else. If that reviewer cannot be reached, start a fresh one scoped to
those files, with the task's DoD section and the diff pasted again.

- **Cost.** The task's `code` verdict now has two moments, so the Verdicts line
  has to say which round it is — `code: pass (round 2)` — and the PM has to
  remember that QA's report is what triggers it.
- **Where it hurts later.** A resumed reviewer is cheap enough that it could be
  used to slip a second review past the record. The Verdicts line is the guard:
  the round number is written down, and a task with no round number for a review
  that happened twice is a defect the doc reviewer can see.
- **Why it wins.** QA's cases are judged against exactly one thing — the task's
  DoD items — and this reviewer already holds them, and the diff, and its own
  round-1 findings. It is both the cheapest reading and the best-informed one.

### Option B — always a fresh reviewer scoped to QA's files (CRD 0005's literal wording)

- **Cost.** A full re-brief: the task row, its DoD section, the diff pasted
  again, and a reader starting from nothing on shell scripts whose whole purpose
  is to check DoD items it has not read.
- **Where it hurts later.** A reviewer that has not read the diff cannot tell a
  case that proves the DoD item from a case that proves the code does what the
  code does — which is the single most common bad QA case.
- **Why it lost.** It pays for context that a resume gives free. It stays as the
  **fallback**, word for word, for when the reviewer cannot be reached.

### Option C — serialize QA before the code review, so QA's files are in the diff

Run 10c first, then 10a, always.

- **Cost.** Step 10's three checks stop running in parallel for every task.
- **Where it hurts later.** Parallel-by-default is one of the headline rules this
  whole port is carrying across (principle 18), and step 10 is the place the
  README points at to show it. Giving it up to solve a review-scoping problem
  trades the rule for the plumbing.
- **Why it lost.** The file already offers serializing as the **exception** for a
  risky change, with the cost said out loud. Making it the rule reverses that.

### Option D — nobody reviews them; they are QA's own files under QA's own folder

- **Cost.** Free.
- **Where it hurts later.** They are committed shell scripts that every later
  contributor runs on purpose. That is the half of the security review's finding
  3 that CRD 0005 kept precisely because it can hurt somebody who never used this
  plugin.
- **Why it lost.** It is the defect.

## The recommendation

**Option A, with Option B as the stated fallback.** What lands where:

- `skills/team-lane/SKILL.md` step 10a: QA's `run.sh` and its case files are in
  the code reviewer's file list. Step 10c: when QA reports, the PM sends those
  files to the reviewer that read this task; if it cannot be reached, a fresh
  reviewer, scoped to those files, with the diff pasted again. Step 11: the
  Verdicts line names the round.
- `agents/crew-code-reviewer.md` (`T-05`): the reviewer is told it may be given
  QA's scripts and case files, that they are judged against the task's **DoD
  items**, and that a case which only proves the code does what the code does is
  a finding.
- `agents/crew-qa.md` (`T-04`): QA's report names the files it wrote, because
  that list is what the PM hands to the reviewer.

**`docs/qa/run-all.sh` goes the same way.** ADR 0010 makes it the PM's own file,
which means nobody would ever have read it. It is created once per project, so
the cost is one review, once: the first time the PM creates it, it goes into the
same round as the first QA files.

## Revision one — the contradiction with `S6` is closed, from `S6`'s side

Round 2 of the `T-01` review found that this ADR contradicted shared sentence
`S6`. It was right. This ADR tells the PM to send a reviewer "the QA file list,
the pasted content of `run.sh` and the case files"; `S6` said a message carries a
document path and a version number **and nothing else**.

`S6` was the wrong sentence, not this one. It has been rewritten (see
`docs/design/tasks.md` version 4, fact 11): a message may carry a **pointer** and
**evidence you could copy again** — a diff, a command's output, a log, the text of
a file — and nothing that is a decision. The pasted content of `run.sh` is
evidence: it is a copy of a file that exists, and losing the message loses
nothing.

Nothing in this ADR changes. What it orders was always safe; the sentence that
forbade it was too tight.
