# ADR 0014: when the PM messages a live role, and when it starts a fresh one

Version: 1

## The choice

CRD 0004 restores PM-to-role messaging and settles the rule that protects the
documents (a message carries a path and a version and nothing else). It does not
settle the operational question underneath, and that question appears in
**fourteen** places in `skills/team-lane/SKILL.md` — every place the file today
says "start a fresh role", listed in the CRD as "true but now needlessly
expensive".

A fix engineer editing fourteen places without a rule will invent one per place,
and inconsistency here is invisible: nothing fails, the job just costs more some
days than others.

So: one sentence, applied fourteen times.

## Every option

### Option A — the live-and-inside test **(recommended)**

> Message the role that is still live when what changed is inside the work it is
> doing now. Start a fresh role when it has finished, when you cannot reach it,
> or when the task has to be built again from the beginning. Either way, the fact
> lives in a document first.

- **Cost.** One judgement per event, and the PM has to know which roles are live
  — which `ListAgents` now answers. The summary gains one line: which role got
  which document version.
- **Where it hurts later.** "Inside the work it is doing now" is a judgement, and
  a tired PM can read it widely. The bound is the document rule: whatever the
  message says, it is a pointer at a file and a version, so a wrong call costs a
  wasted message, never a lost fact.
- **Why it wins.** It removes the waste CRD 0004 measured — a boundary contract
  change no longer discards every in-flight task on that boundary — while keeping
  the one thing a fresh role gives you that a message does not: a clean start
  when the work itself has to be redone.

### Option B — message whenever the role can be reached, finished or not

- **Cost.** Free to write, and the cheapest in tokens.
- **Where it hurts later.** A role that has finished has already reported, and
  its report is the record of that task. Resuming it to build the task again puts
  a rebuild inside an old context and produces a second report that quietly
  replaces the first. "This task was built again" stops being visible, which is
  the one thing the milestone review needs to see.
- **Why it lost.** It hides a rebuild.

### Option C — always start a fresh role (today's text)

- **Cost.** Free, and already written.
- **Where it hurts later.** The measured waste: every in-flight task on a
  changed boundary is discarded and re-briefed, and each re-brief pays again for
  reading the documents and the diff.
- **Why it lost.** CRD 0004 was accepted precisely to end this.

### Option D — no rule; the PM judges each of the fourteen places on the day

- **Cost.** Free.
- **Where it hurts later.** Fourteen places, one reader, under time pressure. The
  file's own habit is the opposite: closed lists, so nobody has to judge under
  pressure (step 10b's trigger list, the doc-review-on-landing list).
- **Why it lost.** It is the shape this document does not use anywhere else.

## The recommendation

**Option A**, written once and copied to all fourteen places, plus two riders
that keep it honest:

1. **A message never carries the change itself.** Write the document, raise its
   version, then send the pointer — CRD 0004's test, unchanged.
2. **When a message changes what a role is building, say so in the summary**:
   which role, which document, which version. Otherwise the milestone review
   cannot see that a task's inputs moved while it was being built.

And the wording for the seven role prompts, which is upstream's own
(`roles/doc-reviewer.md` 242-244) and is what makes a role safe whichever way it
is reached:

> A later round may reach you as a message, or as a fresh role. Either way,
> everything you need is in the documents the briefing names.

This is also why no role needs `SendMessage`: the rule is written so that being
messaged and being replaced are the same thing from the role's side.
