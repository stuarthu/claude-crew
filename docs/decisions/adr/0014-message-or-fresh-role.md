# ADR 0014: when the PM messages a live role, and when it starts a fresh one

Version: 3

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

## Revision one — the test was drawn in the wrong place

Round 2 of the `T-01` review found that `S11` forbids something the skill orders
**ten** times. The finding is right, and the fault is in this ADR's Option A, not
in the skill.

```sh
grep -n 'send it\|message it\|Message the\|message the' skills/team-lane/SKILL.md
```

returns ten lines, and every one of them messages a role about work it has
**already reported**: a researcher asked for a command's output, an architect
asked what a task row was missing, a code reviewer given a test run it asked for,
an engineer given CI's error text, a reviewer given QA's scripts (ADR 0015). The
PM did it too, three times, resuming finished reviewers for review round 2 — and
that was the right call, not a slip.

**Where Option A went wrong.** It used "it has finished" as the trigger for a
fresh role. Finishing is not the danger. The danger it was reaching for is
narrower and it is written in Option B's own rejection, one paragraph below:
rebuilding a task inside an old context produces a second report that quietly
replaces the first, so the milestone review can no longer see that the task was
built twice.

So the test moves from **who** to **what**: not "has this role finished?" but
"does the task's own history need a new start?"

### Option A, as revised — the new-start test **(recommended)**

> Message a role — live or finished — when you need it to look again at the work
> it already did: another round of review, a question about its own report, the
> output of a command it asked for. Start a fresh role when the work itself starts
> again: a task built from the beginning, a document version the role never read,
> or a role you cannot reach. The test is not whether it has finished. It is
> whether the task's own history should show a new start.

The rider that carries the reason stays with it:

> A role asked to build the task again inside its old context produces a second
> report that quietly replaces the first, and the milestone review can no longer
> see that the task was built twice. That is the case a fresh role exists for.

And "Either way, the fact lives in a document first" is unchanged.

**What this costs.** "Should the history show a new start?" is a judgement, where
"has it finished?" was a fact. The bound is the same as before: whichever way the
PM calls it, the content is a pointer or evidence (`S6`), so a wrong call costs a
wasted message and never a lost fact. And the expensive direction is now the
default — the PM reaches for a message first, which is what CRD 0004 was accepted
to make possible.

**Options B, C and D are unchanged and still lose.** Option B — always message
when the role can be reached — is still wrong, and its rejection is now the *whole
reason* for the revised test rather than a footnote.

**What follows.** `S11`'s copies in `skills/team-lane/SKILL.md` are the fix
engineer's work (`F-45`), and `F-32`'s check anchors on the new first words.

## Revision two — this ADR's own opening still quoted the old `S6`

Found by the document review of `T-01` round 3, as an optional finding, and it is
a document fix rather than a skill fix, so it is made here.

The opening of this ADR says CRD 0004 "settles the rule that protects the
documents (a message carries a path and a version and nothing else)". That was
`S6` version 3. `S6` has said something different since `tasks.md` version 4, and
`T-01` round 2 blocked on the old wording precisely because it forbade ten things
the same file orders.

**Read that clause as:** CRD 0004 settles the rule that protects the documents —
*never decide anything in a message; a message may carry a pointer, evidence, or a
request, and anything else is a decision.* The rule this ADR reasons from is
unchanged: a message reaches one role and dies there. Nothing in the
recommendation moves.

The `request` clause is newer than revision one and comes from code review round 3
(`T-13` item 5): a request — "send me your test-first proof" — is neither a
pointer nor evidence, so `S6`'s residue clause swept it in and forbade what step
10a orders. Fixed in `S6` itself, which is where it belongs.
