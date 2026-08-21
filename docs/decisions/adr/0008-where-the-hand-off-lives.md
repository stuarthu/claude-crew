# ADR 0008: where the hand-off document lives, and what shape it has

Version: 2

## The choice

CRD 0003 was accepted in the form the user chose: fix the six dsh-crew v0.7.0
defects here, and **write a document about them that the user hands to upstream**.
Their words: "fix it here, and write a doc about this, I'll let upstream read the
doc."

So there is a new document. Two things about it were still open: **where it
lives**, and **what shape it has** so a reader who does not know this project can
act on it.

The CRD's Decision section already names the root. The PM wrote that line, and it
is a layout question, so it comes to the architect to confirm or to overturn —
this job is shipping the layout rules that decide it (upstream principle 19:
documents are split by how long they live; CRD 0002 moved `porting.md` out of
`docs/` for that reason).

## Every option

### Option A — `upstream-defects.md` at the repository root, its own file **(recommended in version 1; overturned by the user — see revision one)**

A sibling of `porting.md`, `principles.md` and `CLAUDE.md`. A permanent product
document, not crew job output.

- **Cost.** Root markdown files go from six to seven: `README.md`, `README-zh.md`,
  `CHANGELOG.md`, `CLAUDE.md`, `principles.md`, `porting.md`,
  `upstream-defects.md`. `CLAUDE.md` and both READMEs have to name it, so
  `T-09` and `T-10` each gain a DoD item.
- **Where it hurts later.** Every defect upstream fixes means editing this file,
  and if nobody does, it slowly lies. ADR 0009 puts that edit inside the port-pass
  steps so it is not left to memory.
- **Why it wins.** It matches the rule this job is carrying across: `docs/` is
  crew job output, and a document that outlives every job sits at the root. It is
  also a document with **one reader outside this project**, so it has to be
  handable on its own — a file the user can send, with nothing in it about our
  task ids.

### Option B — `docs/upstream-defects.md`

- **Cost.** Free today.
- **Where it hurts later.** `docs/` after this job means crew job output —
  `docs/design/`, `docs/decisions/`, `docs/qa/`, `docs/research/`,
  `docs/release/`. A permanent document there re-opens the decision CRD 0002 just
  closed for `porting.md`, and the doc reviewer's matching rule (principle 20)
  then finds a document in the crew space that no crew step produces.
- **Why it lost.** It contradicts a rule this same job is shipping, in the same
  release.

### Option C — a section inside `porting.md`

- **Cost.** One file fewer.
- **Where it hurts later.** `porting.md` is written for the next person who runs a
  port pass **here**. This document is written for dsh-crew's author. Mixed
  together, the copy handed to upstream carries our port steps, our checksum
  commands and our "never read `~/workspace/dsh-crew`" rule, none of which mean
  anything to them; and `porting.md` grows a section that changes on upstream's
  schedule instead of ours.
- **Why it lost.** Wrong reader. The user asked for a document they can hand
  over, and a hand-over document with the wrong reader's instructions in it gets
  read as noise. `porting.md` still gets the **divergence table** that points
  here (ADR 0009) — a pointer, not the content.

### Option D — no new document: hand `docs/decisions/crd/0003` to upstream

- **Cost.** Free.
- **Where it hurts later.** A CRD is written for this crew: it argues about
  fidelity to upstream, weighs a port-back job, names `T-01`, `T-04`, `T-07`,
  `T-08` and quotes our PRD. It also holds two options the user rejected. An
  outsider reading it has to sort our internal decision from their bug list. And
  a CRD is frozen once accepted, while this list gains a row every time we find
  something.
- **Why it lost.** It makes the reader do our filing.

### Option E — no file: open issues in the dsh-crew tracker instead

- **Cost.** Free in this repository.
- **Where it hurts later.** Nothing survives in the repository, which principle 20
  forbids for a record; and the crew has no account, no network permission and no
  instruction to write into another project. The user said they would carry it
  across themselves.
- **Why it lost.** It is not a record here, and it is not this job's to do.

## The recommendation

**Option A.** `upstream-defects.md` at the repository root, written for one
outside reader, with this shape:

1. **A header** — what this document is; who it is for; that claude-crew is a
   port of dsh-crew; the tag and commit it was read at (`v0.7.0`, `87a4332`) and
   that **every line number is at that tag**; the date; how it was found (three
   read-only reviews of one file, 2026-08-21); and that CRD 0003 records the
   decision to fix the six here.
2. **`## Defect 1` to `## Defect 6`**, numbered exactly as CRD 0003's table
   numbers them, each with the same four labelled parts — **Where** (upstream file
   and line numbers), **What it says** (the text, quoted), **How it fails** (in a
   real job, with the consequence), **What this port says instead** (the local
   file and the rule) — plus one added line, **Suggested fix**, naming the
   smallest change that would close it upstream. The four parts are what CRD 0003
   requires; the fifth is added because the reader is the person who would make
   the change.
3. **`## Smaller things noticed in the same read`** — one short table row per
   Class B difference (ADR 0009): the optional findings this port took, each with
   its upstream line and one sentence. Marked as not blocking, no reply needed.
   This section is additive; it can be cut without touching anything else.
4. **No path from this machine.** No `/home/...`, no `/tmp/...`, no task ids. The
   document has to make sense to somebody who has never seen this repository.

**One numbering across four files.** Defect 1 in CRD 0003 is defect 1 in
`upstream-defects.md`, in `porting.md`'s divergence table and in the comment in
`upstream.sums`. Nothing renumbers.

**Which milestone.** `M3`, with `porting.md` (`T-07`) and `upstream.sums`
(`T-08`) — the reasoning is in `docs/design/tasks.md` under `T-12`, because it is
about the order the work runs in, not about the document's shape.

## Revision one — the user moved it out of the repository

On 2026-08-21, after this ADR was written, the user overturned Option A in two
messages recorded in CRD 0003 revision one: "do not put it in our repo, put it in
my home dir", then "it is like a issue we sent to upstream, we don't need to
record that".

That is the milestone-review right this project gives the user over every ADR,
used exactly as intended, and it names an option none of the six above did.

### Option F — `~/dsh-crew-0.7.0-defects.md`, outside the repository, no copy kept **(the decision)**

The hand-off is written the way an issue filed against dsh-crew would be written.
The user sends it. This repository keeps no copy, no pointer and no record of it.

- **Cost.** Nothing in the plugin names it, so `T-09`, `T-10` and `T-11` gain no
  line about it and the repository root keeps **six** markdown files, not seven.
  If the file is lost before it is sent, nothing here reproduces it: the six
  defects would have to be found again from CRD 0003, which stays in the
  repository as this crew's own decision record.
- **Where it hurts later.** A reader of this repository can see *that* six
  paragraphs deliberately differ from upstream, and *what* they say, but not the
  argument that was made to upstream about them. That is deliberate: the argument
  is a message to another project, and a message to another project is not this
  project's record.
- **Why it wins, on the user's reasoning.** An issue is not documentation. It is
  sent once, it is answered or it is not, and keeping a copy creates a second
  thing to keep true for as long as the repository lives — for no reader here.

### What this changes in the four documents that were going to point at it

The pointer is removed everywhere, and one thing has to grow to replace it:

- **`porting.md`'s divergence table must be self-contained** (`T-07`). It was
  going to be a pointer table. It is now the whole record: each row carries the
  upstream file and lines, what upstream says, what this port says, and the local
  file that says it — enough for the next port pass to decide, with no other
  document open.
- **`upstream.sums`** (`T-08`) points at that table, not at the hand-off.
- **`CLAUDE.md` and both READMEs** (`T-09`, `T-10`) say nothing about it at all.
- **The numbering survives**, because CRD 0003's table is still where the numbers
  come from: defect 1 is defect 1 in `porting.md`, in `upstream.sums`'s comments
  and in the hand-off. CRD 0005 adds defect 7.

Everything else in the shape above still applies to the hand-off itself: the
labelled parts per defect, the tag its line numbers belong to, and no path from
this machine — with one addition, now that it lives in a home directory and no
check in this repository can reach it. It must name **dsh-crew v0.7.0 and commit
`87a4332`** in its first paragraph, because nothing else around it will say which
version it is about.
