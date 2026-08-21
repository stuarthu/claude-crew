# ADR 0006: principle 20's flow table is ported in full and adapted, not summarised

Version: 1

## The choice

The local `principles.md` has a house style, stated at the top of the file:
numbered principles are **kept short** here — the rule, a short why, the files
that carry it locally, and the outside source — because "the long version, with
the live tests behind each one, is in that project's `principles.md` under the
same number".

Upstream principle 20 is 255 lines and contains a **27-row table** that holds the
whole flow: which step, which lane, who does it, what it produces, where that
lives, and whether it survives the job. Two things make it different from every
other principle:

- upstream `roles/doc-reviewer.md` **check 13** tells the reviewer to run that
  table against the repository, in both directions. In this port that becomes
  `agents/crew-doc-reviewer.md` check 13, and a reviewer cannot run a check
  against a table that is not there;
- the table is the rule, not an explanation of it. Summarising it removes the
  thing itself.

So: does the local file carry that table?

## Every option

### Option A — carry principle 20 in full, table included, with the paths and names adapted **(recommended)**

Adapted means: `~/.dsh/crew/jobs/` → `~/.claude/crew/jobs/`, `crew_engineer` →
`crew-engineer`, `roles/pm.md` → `skills/team-lane/SKILL.md`, `roles/*.md` →
`agents/*.md`, and the `tools/verify-tasks.mjs` / `npm test` column entries
replaced by the rule without the machinery (see ADR 0007).

- **Cost.** `principles.md` grows by roughly 150 lines over the short-style
  version, and the table has to be re-read every time a step changes.
- **Where it hurts later.** Every adapted cell is a place where the local table
  can drift from upstream's. `upstream.sums` pins the upstream file, so a pass
  will notice, but a person still has to compare 27 rows.
- **Why it wins.** It is the only option under which `agents/crew-doc-reviewer.md`
  check 13 can actually be run. And principle 20's own text says the match "is
  meant to be checked" — a rule that says it is meant to be checked, shipped
  without the thing to check against, is worse than not shipping it.

### Option B — keep the short house style and point at upstream's copy for the table

- **Cost.** Free, and consistent with principles 1 to 19.
- **Where it hurts later.** The doc reviewer's check 13 would have to read a file
  in another repository the plugin's user does not have. The reviewer has no
  shell and no network, so it simply cannot run the check, and it would report
  "not in scope" every single time.
- **Why it lost.** It ships a check that can never run.

### Option C — carry the table, but drop the `Lane` column and the `bug` and `small` rows

- **Cost.** About 4 rows shorter.
- **Where it hurts later.** The `bug` and `small` rows are exactly where this
  crew lost 75 checks, according to upstream's own account. They are the rows the
  table exists for.
- **Why it lost.** It cuts the part that was paid for in a real failure.

### Option D — carry the table into a file of its own, `docs/flow.md`, and point at it from principle 20

- **Cost.** One new file, one pointer.
- **Where it hurts later.** A rule split across two files drifts, and the doc
  reviewer's check 13 names `principles.md` 20 by number. It also creates a
  standing product document under `docs/`, which ADR 0002 just argued against.
- **Why it lost.** Same drift risk as option B, plus a layout the job is
  cleaning up.

## The recommendation

**Option A.** Principle 20 is carried in full, table included, adapted. Every
other principle keeps the short house style, and `principles.md` says out loud
why 20 is the exception — otherwise the next editor "tidies" it back down.

## Consequence for the file's own header

The header paragraph that promises the short style needs one added sentence:
principle 20's flow table is carried in full because a role prompt tells a
reviewer to check the repository against it.
