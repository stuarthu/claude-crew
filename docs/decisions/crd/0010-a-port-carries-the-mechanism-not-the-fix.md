# CRD 0010 — a port fixes the mechanism difference, never upstream's bugs

## Who asked

The user, on 2026-08-21, at the end of the v0.7.0 port:

> "I want this to be remember in this repo: the porting only fix the claude/dsh diff, not fix
> upstream bug. upstream bug should be written in a seperate file so user can create a issue to
> upstream."

## The rule

**A port pass has exactly one job: carry upstream's rules across, changing only what the
mechanism forces.** Tool names, a role's tool filter, no hooks, no approval file, `~/.claude/`
instead of `~/.dsh/` — those are the port's work, and they are the only differences it may
create.

**An upstream bug is not the port's work.** When a pass finds one — a rule that contradicts
itself, a check that cannot pass, a step that names a commit nobody makes — it goes in a
**separate file**, outside this repository, in the shape of an issue the user can file against
dsh-crew. The port does not fix it here. It waits for upstream to fix it, and then carries the
fix across like any other change.

## Why, and it is the reason this repository exists

Its only value is that the two projects say the same thing. Every local fix, however good, is a
paragraph that has to be reconciled by hand forever — and the reconciling is done by whoever
runs the next pass, reading a diff, under time pressure, with `sha256sum -c` telling them
fifteen files moved. A port that improves upstream turns `upstream.sums` from a tool into a
liability: a `FAILED` line stops meaning "upstream moved" and starts meaning "look it up".

The `v0.7.0` pass proved the cost. It carried **nine** deliberate divergences and was heading
for a tenth, and by the end:

- `porting.md` needed a self-contained nine-row table so the next pass would not undo them;
- `upstream.sums` needed a divergence warning on nine of its fifteen lines;
- two READMEs got the count wrong (four files instead of nine) and would have deleted a rule
  the user asked for on the next pass;
- `docs/design/hld.md` carried three different counts of the same nine;
- and every one of those needed finding by a reviewer.

**None of that work would have existed under this rule.** All of it was bookkeeping for
divergences that only existed because the port fixed things it was not asked to fix.

## What this job did, stated plainly

**This job did the opposite of this rule, repeatedly and with the user's approval at the time.**

| What | Where it is recorded |
| --- | --- |
| six upstream defects fixed here | CRD 0003 |
| a seventh fixed here (the test command) | CRD 0005 |
| an eighth fixed here (the force-push rule) | CRD 0003 revision two |
| a ninth rule added that upstream has no version of | CRD 0006 (`S12`) |
| a tenth started, then left half-landed | CRD 0008 (`S13`) |

Each was decided in the open, with the cost shown, and the user said yes each time. This rule is
not a reversal of those decisions — it is what the user concluded **from** them, at the end,
having seen the bookkeeping they generated.

Two of them already show what the rule would have done better: **CRD 0007** (the user chose
upstream's wording over this port's honest one) and **CRD 0009** (the PM-edits rule, sent upstream
only, never implemented here). Those two are the shape every future finding takes.

## The companion rule: on a conflict or a duplicate, follow upstream

The user, in the same breath as the rule above:

> "also remember this in repo: if there is conflict or duplicate found during porting, always
> follow upstream."

This is the tie-breaker, and it is the same rule seen from the other side. Two rules that
disagree, one rule stated twice in different words, a path written two ways — **if the
disagreement is upstream's, this port takes upstream's version.** It does not choose the better
one, merge them, or invent a third. The finding goes in the hand-off file and the port waits.

**One exception, and it is the port's reason for existing: a conflict the mechanism creates.**
Upstream says a role cannot be messaged and here it can; upstream names a tool this deployment
does not have; upstream points at a file that exists only in its own repository. Those are not
upstream's conflicts — they are the seam between the two projects, and resolving them is the
job.

**Had this rule existed at the start of this pass, this job would have looked completely
different.** CRD 0003's six defects are all "upstream contradicts itself", which is exactly the
case this rule sends upstream untouched. So are CRD 0005's and the force-push one. Nine of the
ten divergences would never have been created, and the table, the warnings, the three documents
that disagreed about the count and the reviewer time spent reconciling them would not exist.
CRD 0007 — where the user chose upstream's wording over this port's more honest one — is the one
decision in the whole job that already followed this rule, made before the rule was written.

## What happens to the nine that exist

Nothing, now. The user's decision: *"we will consolidate the next port"*, and *"leave it, we will
rewrite next port"*.

So the divergence table stays as the honest record of a port that did more than it should have.
The next pass reads this CRD first, and for each of the nine asks one question: **has upstream
fixed it?** If yes, the row disappears and the fix arrives the normal way. If no, the row stays
and the finding is in the hand-off file where it belongs.

## Where this rule lives

- **`porting.md`** — at the top, before the map. It is the first thing a port pass reads.
- **`principles.md`** — as this port's own principle, with the cost above as its reason.
- **`CLAUDE.md`** — the "Documentation" section, where the next editor looks.
- The hand-off file keeps its own shape: upstream's contradictions in one part, gaps neither
  project had in the other.

## Decision

**Accepted.** The user stated it as a standing rule for this repository, not as a question.

## Applied

`porting.md`, `principles.md` and `CLAUDE.md` — by the PM, which owns all three under CRD 0008.
