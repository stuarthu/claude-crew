# ADR 0003: `principles.md` moves to the repository root, and which references follow it

Version: 1

## The choice

Upstream CRD 0007 moved `docs/principles.md` to `principles.md`. The confirmed
PRD's acceptance check 12 requires the same here, and adds: "`docs/principles.md`
no longer exists, and every reference to that path in the repository points at
the new one."

There are 17 references to `docs/principles.md` in this repository, in 6 files.
Two of them are in the published `0.2.0` section of `CHANGELOG.md`, which the
PRD's "Not in scope" list says must not be rewritten. So the real choice is
**what "every reference" means**, and how the file is moved.

## Every option, question 1: how the move is done

### Option A — `git mv docs/principles.md principles.md`, then rewrite in place **(recommended)**

- **Cost.** None beyond the rewrite the job needs anyway.
- **Where it hurts later.** Nothing.
- **Why it wins.** `git mv` keeps the file's history, so `git log --follow
  principles.md` still reaches the 0.1.0 version. Upstream CRD 0007 chose the
  same, for the same reason.

### Option B — write a new `principles.md` and delete `docs/principles.md`

- **Cost.** Same amount of typing.
- **Where it hurts later.** Git records one deletion and one addition. The
  file's history stops at this job, and the reasons behind `P1`..`P5` lose their
  first commit.
- **Why it lost.** It throws away history for nothing.

### Option C — keep `docs/principles.md` and add a one-line pointer file at the root

- **Cost.** Free.
- **Where it hurts later.** Two paths for one document is the drift this whole
  repository is fighting. And acceptance check 12 says the old path must not
  exist.
- **Why it lost.** It fails a confirmed check.

## Every option, question 2: which references change

### Option A — every reference outside the historical CHANGELOG sections **(recommended)**

Changed: `CLAUDE.md` (5), `README.md` (2), `README-zh.md` (2),
`docs/porting.md` (3), `principles.md`'s own 2 self-references, and
`upstream.sums`'s map comment. Left alone: the 2 references inside
`CHANGELOG.md`'s `0.2.0` section, because that section is a record of what was
true on the day 0.2.0 shipped.

- **Cost.** A `grep` for `docs/principles.md` still returns two hits, so the
  check has to name the exclusion instead of expecting zero.
- **Where it hurts later.** Somebody re-running the check without the exclusion
  reports a false failure. The exclusion is therefore written into the task row,
  as a literal command.
- **Why it wins.** A changelog entry that is edited to describe a later state is
  no longer a changelog. Upstream hit the same problem with `docs/crew/` and
  settled it the same way: the remaining hits are "records of what was true at
  the time". The new `0.3.0` section says the file moved, which is how a reader
  finds out.

### Option B — change all 17, the CHANGELOG included

- **Cost.** Two lines.
- **Where it hurts later.** The `0.2.0` section would then describe a layout
  that did not exist in `0.2.0`. Anyone using the changelog to understand an
  older install is misled.
- **Why it lost.** The PRD's "Not in scope" list forbids rewriting the published
  `0.2.0` section, and the reason is sound.

### Option C — leave the README references, since they are prose

- **Cost.** Free.
- **Where it hurts later.** A reader following the README's link lands on
  nothing. The README is the file most outsiders read.
- **Why it lost.** A broken path in the front door is the worst place to leave
  one.

## The recommendation

**Option A on both questions.** `git mv`, then fix every reference except the two
inside `CHANGELOG.md`'s published `0.2.0` section, and write the exclusion into
the check so nobody reads those two as a failure.

## Note on upstream references inside the file

`principles.md`'s own text points at upstream files as `roles/*.md` and
`docs/principles.md`. Upstream moved its own file to the root too, so those
pointers become `principles.md` there as well. Both changes happen in `T-06`.
