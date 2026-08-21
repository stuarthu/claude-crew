# ADR 0010: who owns `docs/qa/run-all.sh` and `docs/qa/gaps.md` (CRD 0003 defect 6)

Version: 2

## The choice

CRD 0003 defect 6: upstream `roles/pm.md` 546-547 and 1043 make **QA** write
`docs/qa/run-all.sh` and `docs/qa/gaps.md` — "QA writes it" — while roles run in
parallel by default and the parallel test only asks whether *engineers'* file
lists overlap. Two QA roles that finish together overwrite both files. The second
write wins, `run-all.sh` still prints a clean total, and one task's cases have
silently left the suite.

Two reviewers proposed **different fixes**, and they cannot both be built:

- the doc reviewer (finding 7): start those QA roles one after another;
- the security reviewer (finding 2): make the two files the PM's own.

`T-01` writes the skill and `T-04` writes `agents/crew-qa.md`. Two engineers who
cannot talk to each other build the two halves, so the fix has to be decided here
and written out word for word.

## Every option

### Option A — the two files are the PM's; QA writes only its own folder **(recommended)**

QA writes only inside `docs/qa/<task-id>/`. `docs/qa/run-all.sh` and
`docs/qa/gaps.md` are the PM's files. QA reports the gap lines and the PM writes
them, in the same turn it commits the task. `run-all.sh` finds cases **by
pattern**, so it needs no edit when a task is added.

- **Cost.** Two more small things for the PM to do at step 10c and step 11: create
  `run-all.sh` the first time any QA writes cases, and paste QA's gap lines into
  `docs/qa/gaps.md`. It diverges from upstream principle 13, which says QA writes
  `gaps.md` "there itself, in the same turn it reports", so principle 13's local
  text and `upstream-defects.md` both have to carry the difference.
- **Where it hurts later.** The PM is now the author of a shell script that goes
  into the project's test command. That is the *second* half of the security
  review's blocking finding 3 (a script nobody reviewed, wired into every test
  run) — this option moves who writes it, and does **not** close that finding.
  Finding 3 is still open and still the PM's to decide.
- **Why it wins.** It makes the file-ownership rule true again — one task, one set
  of files — instead of scheduling around a rule that is broken. Parallel QA
  survives, which is one of the headline rules this port is carrying across
  (principle 18). And the failure it removes is the silent one: a lost gap entry
  is information nobody ever learns was lost.

### Option B — serialize the QA roles (the doc review's proposal)

When more than one task reaches QA together, start those QA roles one after
another, and say so in the summary.

- **Cost.** QA stops being parallel for every milestone with more than one task,
  which is most of them. The parallel test grows a special case a PM has to
  remember under time pressure.
- **Where it hurts later.** The broken rule stays broken: two tasks still own one
  file, and the only thing standing between that and lost tests is the PM
  remembering. The day it is forgotten, the loss is silent, exactly as it is
  today.
- **Why it lost.** It pays with the rule the port is here to carry, and it does
  not actually fix the ownership breach.

### Option C — per-task files only: `docs/qa/<task-id>/gaps.md`, and no `run-all.sh`

- **Cost.** Free, and no shared file at all.
- **Where it hurts later.** Upstream principle 13 says `gaps.md` is a standing
  list about the product's testability, "grouped by the thing that cannot be
  checked and never by task id". Per-task files reproduce precisely the grouping
  it forbids. Dropping `run-all.sh` also removes the single command that step 10c
  and step 18 both run, and the regression promise ("every past task's cases run
  again") loses its mechanism.
- **Why it lost.** It fixes the race by deleting the feature.

### Option D — QA appends (`>>`) instead of rewriting

- **Cost.** Free.
- **Where it hurts later.** Two appends can still interleave inside one line, the
  order is undefined, and correctness now depends on a shell redirect that no rule
  can check and no reader can see in the file afterwards.
- **Why it lost.** It turns a visible rule into an invisible one.

### Option E — keep both files with QA, but make `run-all.sh` discovery-based

`run-all.sh` loops over `docs/qa/*/run.sh`, so two QAs writing it write the same
bytes.

- **Cost.** Free.
- **Where it hurts later.** It closes the `run-all.sh` race and leaves the
  `gaps.md` one wide open — and `gaps.md` is the half that loses information
  nobody can recover, because only that QA role knew why a thing could not be
  tested.
- **Why it lost.** Half a fix. Its good half is taken into Option A.

## The recommendation

**Option A, with Option E's good half.** These sentences are the contract between
`T-01`, `T-04` and `T-06`, and they are copied word for word:

- **In `skills/team-lane/SKILL.md` (step 10c), `agents/crew-qa.md` and
  `principles.md` principle 13:**

  > QA writes only inside `docs/qa/<task-id>/`: its case files and a `run.sh`
  > beside them.

  > `docs/qa/run-all.sh` and `docs/qa/gaps.md` are the PM's files. QA never writes
  > either one: it reports the lines to add and the PM writes them.

- **In `skills/team-lane/SKILL.md` only, at step 10c:**

  > Write `docs/qa/run-all.sh` so it finds every `docs/qa/*/run.sh` by pattern,
  > never as a list of names, so a new task needs no edit.

  and at step 11, beside the staging list: the PM adds QA's reported gap lines to
  `docs/qa/gaps.md` in the same turn it commits that task.

`agents/crew-qa.md` keeps its new step 6 — the standing testability list is still
QA's judgement, and QA is still the only role that knows why a thing could not be
tested. What changes is that QA **reports** those lines instead of writing the
file.

This is a Class A divergence (ADR 0009): it gets defect 6's entry in
`upstream-defects.md`, a row in `porting.md`'s divergence table, and a note in
`principles.md` principle 13.

## Revision one — CRD 0005 closes this ADR's one open cost, and adds a review

Checked on 2026-08-21 against CRD 0005, accepted in the shape of its revision
one. **The recommendation stands as written**: `S1`, `S2` and `S3` are unchanged,
and QA still writes only inside `docs/qa/<task-id>/`. Two notes have to change.

**The "where it hurts later" note is now closed, not open.** It said:

> The PM is now the author of a shell script that goes into the project's test
> command ... this option moves who writes it, and does **not** close that
> finding.

After CRD 0005 nothing the crew writes goes into the project's test command at
all — the crew never edits that command, and `bash docs/qa/run-all.sh` is a
separate thing the user runs on purpose. So the blast radius that made the
security review's finding 3 serious (unreviewed shell in a stranger's CI) is gone
by a different route than this ADR could take. Finding 3 is closed by CRD 0005,
not left open by this one.

**`run-all.sh` gains a reader.** Making it the PM's file meant nobody would ever
review it, which was fine while it was three lines of glob and is not a principle
worth keeping. ADR 0015 puts it in the code reviewer's file list the first time
the PM creates it — once per project, not once per task.

**The boundary CRD 0005 draws does not move anything here.** A unit test belongs
to `crew-engineer` and lives in the project's own suite; a QA test belongs to
`crew-qa` and lives in `docs/qa/<task-id>/`. This ADR was only ever about who
owns the two files **above** that folder, and both are still the PM's.
