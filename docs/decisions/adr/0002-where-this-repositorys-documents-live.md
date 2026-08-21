# ADR 0002: how upstream's new document layout is expressed in this repository

Version: 1

## The choice

Upstream v0.7.0 abolished `docs/crew/` and split crew documents by how long they
live (upstream CRD 0006, 0007 and 0008):

```
principles.md          the repository root
docs/design/           prd.md, hld.md, tasks.md, api/
docs/decisions/adr/    decisions about how
docs/decisions/crd/    decisions about what, scope, contracts
docs/qa/               runnable cases, run.sh, gaps.md
docs/research/         the researcher's findings
docs/release/          release and upgrade plans, shipping gap lists
```

Two questions follow for this repository. First: which of those folders does
**this** repository actually create, as opposed to telling a role to create in
the user's project? Second: does `docs/porting.md` move, now that `docs/` means
"crew job output"?

## Every option, question 1: which folders exist here

### Option A — create only what this job really writes **(recommended)**

`docs/design/prd.md`, `docs/design/hld.md`, `docs/design/tasks.md` and
`docs/decisions/adr/*.md` exist because this job wrote them. `docs/qa/`,
`docs/release/`, `docs/research/` and `docs/design/api/` are **not** created:
this job has no QA (the user skipped `crew-qa`), no boundary, no research and no
release plan.

- **Cost.** A reader of the new rules sees only half the layout in the one
  repository that ships those rules.
- **Where it hurts later.** Somebody may read the absence as "this port dropped
  those folders". `docs/porting.md` and `hld.md` both have to say plainly that
  they are paths for the **user's** project.
- **Why it wins.** Principle 20's matching rule, which this job is carrying
  across, says a file that no step produced is a misalignment. An empty
  `docs/qa/` folder is exactly that. Upstream itself lives with the same
  absence: its own principle 20 lists `docs/design/api/`, `docs/release/` and
  `docs/research/` as "paths the table names but this repository does not hold
  yet", and calls that **not** a misalignment.

### Option B — create every folder with a `README` placeholder inside

- **Cost.** Seven files no rule asked for, in a repository whose stated design
  is "markdown only, nothing that is not needed".
- **Where it hurts later.** A placeholder is a document that nobody keeps true.
  The next reader cannot tell it from a real one.
- **Why it lost.** It breaks the matching rule this same job is shipping.

### Option C — keep this job's own documents in the old `docs/crew/` layout

- **Cost.** Free today.
- **Where it hurts later.** The repository would contradict its own new rules for
  the whole length of the job, and `M1`'s acceptance check 7 (`docs/crew/`
  appears nowhere) could never pass.
- **Why it lost.** The confirmed PRD already rules it out in its "Where this
  job's own documents live" section.

## Every option, question 2: does `docs/porting.md` move?

### Option A — it stays at `docs/porting.md` **(recommended)**

- **Cost.** `docs/` then holds two different kinds of thing: this job's crew
  output under `design/` and `decisions/`, and one permanent product document.
  That is the exact untidiness upstream CRD 0007 moved `principles.md` to fix.
- **Where it hurts later.** A reader who has read CRD 0007's reasoning will ask
  why `principles.md` moved and `porting.md` did not. The answer has to be
  written down, which is what this ADR is for.
- **Why it wins.** The confirmed PRD's acceptance check 13 names the path
  `docs/porting.md` in so many words. Moving it would make a confirmed
  acceptance check false, and a confirmed check changes only through a CRD the
  user says yes to. Cheap and honest beats tidy and unilateral.

### Option B — move it to the root as `porting.md`, beside `principles.md`

- **Cost.** `git mv`, plus the references in `CLAUDE.md`, both READMEs and
  `upstream.sums`. Small.
- **Where it hurts later.** Root markdown files go from 5 to 6.
- **Why it lost, for now.** It contradicts acceptance check 13 of a PRD the user
  already confirmed. It is a good idea arriving through the wrong door: it needs
  a CRD, not an architect's decision. The PM should offer it to the user.

### Option C — move it to `docs/design/porting.md`

- **Cost.** Same small move.
- **Where it hurts later.** `docs/design/` is defined upstream as one job's
  design output — `prd.md`, `hld.md`, `tasks.md`. A standing product document in
  there is worse placed than where it is now, and the next job's design would
  sit beside it.
- **Why it lost.** It picks the one folder whose meaning it does not fit.

## The recommendation

Question 1: **Option A** — create only what this job writes, and say in
`docs/porting.md` and in `hld.md` that the other paths belong to the user's
project.

Question 2: **Option A** — `docs/porting.md` stays. The PM may raise a CRD with
the user if the root is wanted; this architect will not make a confirmed
acceptance check false.
