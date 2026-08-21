# CRD 0009 — after the scope is set, the PM does not edit the opening document either

## Who asked

The user, on 2026-08-21, immediately after CRD 0008: "and pm should not edit prd after scope
is set", "unless user approved change", "also an upstream issue".

## What CRD 0008 left open

CRD 0008 stopped a **role** editing the document that judges it. It did not stop the **PM**,
and the PM is the one who edits it most.

The skill already says a change to scope, an acceptance check, the stack or the milestone list
needs a CRD and the user's yes. What it does not say is that a **correction** is one of those.
So the PM corrected. Repeatedly.

## The audit, because a rule written without it would be a rule about somebody else

`docs/design/prd.md` reached **version 15** in this job. **Five versions had the user's yes.
Nine did not.**

| Version | Change | The user's yes? |
| --- | --- | --- |
| 1 | written, then confirmed by the user | — (this is the confirmation) |
| 2 | added "where this job's own documents live" | **no** |
| 3 | CRD 0001, acceptance checks 7 and 12 | yes |
| 4 | CRD 0002, `porting.md` to the root | yes |
| 5 | CRD 0004 and CRD 0005, checks 19 and 20 added | yes |
| 6 | reworded check 19 so it stopped forbidding `S9` | **no** |
| 7 | check 19 requoted after `S6` was rewritten | **no** |
| 8 | check 2 reworded, check 19 again | **no** |
| 9 | review intensity: `crew-doc-reviewer` only | yes (the user decided it) |
| 10 | the note explaining why the PRD's own shape breaks its own rules | **no** |
| 11 | check 21 added for CRD 0006 | **no** |
| 12 | `docs/porting.md` → `porting.md` in five places | **no** |
| 13 | all review moved to the last milestone | yes (the user decided it) |
| 14 | the step count corrected from 14 to 16 | **no** |
| 15 | checks 6 and 13 reworded, the ownership note added | **no** |

Every one of the nine felt like a correction rather than a change. That is exactly the shape of
the gap: **a standard its own author may quietly correct is not a standard.** Several of those
nine were genuinely wrong before the edit — check 13 required a file it also required to exist,
check 19 forbade a sentence the job had just mandated — and the fix was still the PM adjusting
what its own work is measured against, without asking.

## The decision

**Accepted.** After the user confirms the opening document, the PM edits it only with the
user's yes — and a **correction is not an exception.**

The rule, for the skill:

> **Once the user has confirmed it, the opening document is theirs, not yours.** You may not
> change a word of its scope, its acceptance checks, its milestone list or its **Language and
> stack** section without the user's yes — and that includes a correction. If a check is
> impossible, contradicts another check, or asks for something the job has since decided
> against, **that is a finding, not a licence**: write the CRD, show the user the check and the
> real output, and let them decide. A standard you may quietly correct is not a standard.
>
> Two things are still yours without asking, because they change nothing the user agreed to:
> raising the version number in `state.json`, and writing the **Applied** line of a CRD the
> user has already accepted.

## Why the exception has to be that narrow

The nine unapproved edits above were all defensible one at a time. What made them a pattern was
that each looked smaller than the last. The only line that holds is at the document's edge:
**text the user agreed to is not editable without the user.**

## What it reaches

- `skills/team-lane/SKILL.md` — the rule above, beside the CRD section, and step 5 (Confirm)
  gains the sentence that the document becomes the user's at that moment.
- `principles.md` — the reason, next to `P4` and CRD 0008's write-set table. Same shape: a rule
  the author may correct cannot bind the author.
- `CLAUDE.md` — the "State and documents" section, which describes who owns what.
- `docs/design/tasks.md` — fact 10's count, and the shared-sentence list if the skill's wording
  becomes one.
- `porting.md` and `upstream.sums` — divergence **eleven**. Upstream has no such rule; verify in
  the clone before writing it.
- `~/dsh-crew-0.7.0-defects.md` — a third gap entry. The user asked for it: "also an upstream
  issue".
- **This document itself is not corrected retroactively.** The nine versions stand as they are,
  with this audit as their record. Rewriting them would be the same mistake with better
  handwriting.

## Cost

One rule in three shipped files, one row in two records, one entry in the hand-off. Nothing is
rebuilt. It costs the PM a question in every future job where a check turns out to be wrong —
which is the point.

## Applied

**Not implemented in this repository. Sent upstream only.** The user: "you don't need to change
it in this repo", "just upstream", "I'll port upstream when it is fixed", "just accept upstream
for now", "we will consolidate the next port".

So this repository keeps upstream's shape: the skill still says a change to scope, an acceptance
check, the stack or the milestone list needs a CRD and the user's yes, and it still says nothing
about a correction. **The nine unapproved PRD edits audited above stand as the record of why the
rule is needed**, and they are the evidence the hand-off document carries.

**No divergence row.** The count stays at ten (CRD 0008's is the tenth).

What reaches upstream: `~/dsh-crew-0.7.0-defects.md`, as a third gap entry, with the audit — a
PM edited the standard its own work was judged against nine times in one job, each time
believing it was a correction rather than a change.

**The next port pass consolidates.** When upstream carries the rule, it comes back here through
the normal map rather than as a local invention, and `porting.md`'s divergence table loses a row
instead of gaining one.
