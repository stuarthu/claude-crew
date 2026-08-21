# ADR 0009: what the next port pass does with a file that deliberately differs

Version: 2

## The choice

After this job, three local files no longer say what their upstream twin says, on
purpose:

- `skills/team-lane/SKILL.md` — six rules changed (CRD 0003, defects 1 to 6);
- `agents/crew-qa.md` — defect 6's other half (ADR 0010);
- `principles.md` — principle 13 and principle 20's flow table, which state the
  same two rules (ADR 0010).

`upstream.sums` pins `roles/pm.md`, `roles/qa.md` and `principles.md`. The pinned
sum is the **upstream** file's sum, so it still reads `OK` today. The moment
upstream commits anything to one of those three files, `sha256sum -c` reports
`FAILED`, and the next port pass reads the diff and carries it across.

That is the moment this ADR is about. Two ways it can go wrong, and both are
silent:

- the pass copies upstream's paragraph across again and **re-imports the defect**;
- upstream fixed the defect its own way, the pass keeps our text, and the two
  projects now say two different correct things forever.

So: how does a person who has never read CRD 0003 find out, at the moment they
need to?

## Every option

### Option A — a three-class ledger, plus a written procedure for a `FAILED` line **(recommended)**

Every deliberate difference is one of three classes, and each class has one place
it is written down and one thing a pass does with it.

- **Class A — a rule this port states differently**, because a blocking review
  finding forced it. Needs a CRD with the user's yes. Gets a full entry in
  `upstream-defects.md` and a row in `porting.md`'s **deliberate divergence**
  table. Today: the six of CRD 0003.
- **Class B — a smaller difference made while carrying the file across**: an
  optional review finding taken, a wrong cross-reference fixed, a clarification, a
  plain-English rewording, formatting, an example. No CRD — a review round exists
  to change the work. Listed as one short row in `upstream-defects.md`'s second
  section, and covered by **one** summary row in `porting.md`'s table saying the
  local file is not a byte copy.
- **Class C — a mechanism difference**: a tool name, a role that runs once, no
  hooks, no preset. Already in `porting.md`'s map and in `upstream.sums`'s
  comments. Nothing new.

The procedure, written into `porting.md`'s port-pass steps:

1. `sha256sum -c` reports `roles/pm.md: FAILED` (or `roles/qa.md`, or
   `principles.md`).
2. **Before you read the diff**, open `upstream-defects.md` and `porting.md`'s
   divergence table.
3. For each Class A row on that file: read upstream's text at the new tag.
   - Upstream fixed it — their wording now carries the same rule, or a better one:
     take upstream's wording, delete the row from both files, and say so in the
     pass's notes.
   - Upstream still has it: keep the local text, leave the row, and update the
     row's line numbers to the new tag.
4. Anything the diff touches that no row names is carried across normally.
5. Re-apply Class B after the copy. The summary row is a reminder that the file is
   not a byte copy, not a list to work through.
6. Replace the sum line only when the pass is finished, and update the tag line in
   `upstream-defects.md`'s header.

- **Cost.** Three places to write it (`porting.md`, the comment in
  `upstream.sums`, `upstream-defects.md`'s header) and one more thing for a pass
  to do before it starts copying.
- **Where it hurts later.** Three copies can drift from each other. They are
  short and they point at one file, which is the cheapest shape available; and the
  doc reviewer's matching rule reads `porting.md`, so a missing pointer there is
  findable.
- **Why it wins.** The pass meets the warning **where it is already looking** — at
  the `FAILED` line and in `porting.md` — instead of somewhere it would have to
  know to look. And it names the second failure, the one nobody thinks of: upstream
  fixing it their own way.

### Option B — the CRD is the record; a pass reads `docs/decisions/crd/`

- **Cost.** Free. It is already written.
- **Where it hurts later.** A pass reads `porting.md` and `upstream.sums`, because
  that is what `CLAUDE.md` and both READMEs point it at. `docs/decisions/crd/` is
  this job's own record, and a year from now it is one CRD among many. Nothing
  connects a `FAILED` line to CRD 0003.
- **Why it lost.** A record nobody is told to read is not a control.

### Option C — write upstream's original paragraph beside each local change, inside the file itself

An "upstream says X, we say Y" note in `skills/team-lane/SKILL.md` at each of the
six places.

- **Cost.** Six paragraphs of text in the file Claude loads to run the crew.
- **Where it hurts later.** That file is a set of instructions being followed. A
  rule that does not apply, sitting next to one that does, is exactly the shape
  that makes a reader do the wrong one; and the file's own rule says a role's
  prompt says what to do, not what another project does.
- **Why it lost.** It puts the port's bookkeeping into the runtime document.

### Option D — pin the diverging files section by section instead of whole

- **Cost.** `sha256sum` hashes files. Sections would need something to cut them
  up, which means a script.
- **Where it hurts later.** Design rule 6 forbids `tools/`, `scripts/` and
  `package.json`, and principle P3 explains why they were removed twice.
- **Why it lost.** It breaks a binding design rule to buy precision the ledger
  gives for free.

### Option E — stop pinning `roles/pm.md`, so nothing reports `FAILED`

- **Cost.** Free, and one less thing to explain.
- **Where it hurts later.** `roles/pm.md` is the largest and most important
  upstream file this port carries. Un-pinning it removes the only signal that it
  moved.
- **Why it lost.** The whole repository exists to notice that signal.

## The recommendation

**Option A.** The three classes and the six-step procedure land in `porting.md`
(`T-07`), the pointer lands in `upstream.sums`'s comments above `roles/pm.md`,
`roles/qa.md` and `principles.md` (`T-08`), and the header of
`upstream-defects.md` says which tag its line numbers belong to (`T-12`).

Two things follow from it, and both are written into `docs/design/tasks.md`:

- A Class A difference needs a CRD, so no task may invent one. A task that finds a
  seventh defect reports it to the PM; the PM writes the CRD and the user decides.
- A Class B difference needs no CRD, but it must end up in
  `upstream-defects.md`'s second section, or the next pass silently drops it.

## Revision one — the ledger has one home, not two, and there are seven rows

Two things changed on 2026-08-21, after this ADR was written.

**CRD 0003 revision one took the hand-off out of the repository.** Option A above
put a Class A entry in two places: a full entry in `upstream-defects.md` and a row
in `porting.md`'s table. There is no `upstream-defects.md` in this repository any
more (ADR 0008 revision one). So:

- **`porting.md`'s deliberate divergence table is the whole record**, and every
  row must be self-contained: the defect number, the upstream file and its line
  numbers at `v0.7.0`, what upstream says, what this port says instead, and the
  local file that says it. A row that cannot be acted on without opening another
  document is not finished.
- **Class B keeps its one summary row** in the same table, and loses the list it
  was going to have in the hand-off's second section. The summary row says what
  it always said: the local files are not byte copies, and the differences that
  are only wording, formatting, an example or a cross-reference are not tracked
  one by one. ADR 0011's table is where they are written down, and it stays in
  `docs/decisions/`, which is this crew's record rather than the plugin's.
- **The six-step procedure loses its second document.** Step 2 now reads: before
  you read the diff, open `porting.md`'s deliberate divergence table. Steps 3 to
  6 are unchanged, except that the last one no longer has a hand-off header to
  update.

**CRD 0005 adds a seventh Class A row**, and it is the largest of them: this port
says the crew never edits the project's test command, and that a unit test and a
QA test are two different things run by two different commands. Upstream's own
CRD 0009 exists to do the opposite — to wire QA's cases into `npm test` and run
them in CI on every push. So the table has **seven** rows, and row seven is the
one a future pass is most likely to argue with.

**Four files now carry a Class A divergence**, not three:

| local file | upstream twin, pinned in `upstream.sums` | what differs |
| --- | --- | --- |
| `skills/team-lane/SKILL.md` | `roles/pm.md` | defects 1 to 7 |
| `agents/crew-qa.md` | `roles/qa.md` | defect 6, and defect 7's vocabulary and the config line that is no longer written |
| `agents/crew-code-reviewer.md` | `roles/code-reviewer.md` | defect 7: QA's `run.sh` and case files are in its file list |
| `principles.md` | `principles.md` | principle 13 and principle 20's flow table state defects 6 and 7 |

Each of those four lines in `upstream.sums` carries the pointer, and the pointer
now names `porting.md`, not a file outside the repository.

**One thing this revision does not change.** CRD 0004 is **not** a divergence and
gets no row. Restoring PM-to-role messaging moves this port **closer** to
upstream: it corrects a mis-port. What it changes in `porting.md` is the "did not
port" row for `send_message`, `interrupt_agent` and `list_agents`, whose stated
reason was false.
