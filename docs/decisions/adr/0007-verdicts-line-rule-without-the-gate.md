# ADR 0007: the Verdicts line is carried as a rule; its automated gate is not

Version: 1

## The choice

Upstream v0.7.0 added the **Verdicts line**: every task section in
`docs/design/tasks.md` opens with one bullet carrying four values — `code`,
`security`, `qa`, `doc` — each `not run` or `skipped` carrying its own reason, and
each `changes needed` naming the task that fixes it. Upstream also added a check
that reads that line, `node tools/verify-tasks.mjs`, wired as the last stage of
its own `npm test` (upstream CRD 0011).

This repository has no test command, no `tools/` folder and no `package.json`,
and design rule 6 forbids adding any of them. The PRD's "Not in scope" list names
CRD 0011 **as machinery**. So: how much of this comes across?

## Every option

### Option A — carry the rule and the honest limit, name the gate as an example, add no machinery **(recommended)**

`skills/team-lane/SKILL.md` step 11 carries the Verdicts line rule word for word:
the four values, the wording, a reason on every `not run` and every `skipped`, a
task id on every `changes needed`, and "a task with no Verdicts line is not
finished: do not commit it". It then says what upstream says next: **another
project may have no such check; the rule holds either way.** It keeps upstream's
own paragraph on what the line can and cannot prove — the PM writes it, so it
proves the line was written and every skip has a reason, and it cannot prove a
review happened.

- **Cost.** In this repository, nothing reads the line. The rule is kept by a
  person, like every other rule here.
- **Where it hurts later.** A PM in a hurry can type `code: pass` for a review it
  never started, and nothing goes red. Upstream has the same hole and says so;
  here the hole is one step wider, because there is no `npm test` behind it.
- **Why it wins.** The rule is about the crew running on the **user's** project,
  where a test command usually does exist. Carrying the rule while naming the
  missing check is exactly what principle P3 already does for the git guard, and
  the READMEs already have the section for it: "what is not enforced".

### Option B — carry the rule and add a checker script to this repository

- **Cost.** A `tools/verify-tasks.mjs`, or a shell equivalent, plus something to
  run it.
- **Where it hurts later.** It puts scripts back into a plugin that was cleaned
  of them twice, on purpose (principle P3, design rule 6). It would also need a
  runner, which means `package.json`, which is forbidden.
- **Why it lost.** It breaks a binding design rule, and the PRD's "Language and
  stack" section already recorded shipping runnable checks as the runner-up that
  was **not** picked.

### Option C — drop the Verdicts line entirely, since nothing here can check it

- **Cost.** Free.
- **Where it hurts later.** The line is one of the two headline additions of
  v0.7.0's task table, and it exists because a real PM skipped code review on
  about 20 tasks and doc review on most of a job, with nobody noticing until the
  user asked. Dropping it removes the rule that made that visible.
- **Why it lost.** The rule applies to the user's project whether or not this
  repository can check it. Skipping a rule because *we* cannot verify it is the
  mistake this whole port exists to avoid.

### Option D — carry the rule but rewrite it as advice ("consider adding a Verdicts line")

- **Cost.** Free.
- **Where it hurts later.** Upstream CRD 0004 already showed what permission-style
  wording does: "several engineers **may** run at the same time" gave the PM a
  default of one at a time, and the user asked why everything was so slow. Advice
  is read as "optional", and an optional honesty rule is not one.
- **Why it lost.** It weakens the rule to match this repository's tooling, which
  is backwards.

## The recommendation

**Option A.** The rule lands in full in `skills/team-lane/SKILL.md` step 11 and in
`agents/crew-doc-reviewer.md`; the gate does not land as code. `principles.md` 20
keeps upstream's paragraph on what the gate proves and adds one line saying this
repository has no such check, and both READMEs' "what is not enforced" section
gains the Verdicts line beside the git rule.

## The same treatment for two neighbours

Two other v0.7.0 additions are the same shape and get the same handling in the
same tasks:

- **QA's cases wired into the default test command** (upstream CRD 0009). The
  rule — the PM adds the one config line, and "those cases cannot run" is a
  blocking finding, not a resting place — is carried. Upstream's concrete example
  (`bash docs/qa/run-all.sh` inside `scripts.test`) is kept as an example and
  labelled as upstream's own, not as this repository's.
- **CI on every push.** Not carried at all: there is no CI here, and step 16
  already tells the PM to check whether CI exists before it promises to watch a
  run.
