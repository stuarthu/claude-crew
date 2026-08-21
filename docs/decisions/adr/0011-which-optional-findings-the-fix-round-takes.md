# ADR 0011: how much of the optional review list `T-01`'s fix round takes

Version: 1

## The choice

Three read-only reviews of `skills/team-lane/SKILL.md` returned, besides the
blocking findings, **19 optional findings**: 2 from the code review, 6 from the
security review, 13 from the doc review (one of which the PM rejected). A fix
round has to decide how many of them it carries, because every extra edit to a
1,351-line file is another chance to break one of the 18 checks that already pass.

Two of them are not simply "take it or leave it" and are decided here as well:

- **doc review 11** — `doc: skipped — the user asked for it` rests on a permission
  the file never grants. Either add the permission or drop the value.
- **doc review 13** — the reviewer said Claude Code's subagent tool is named
  `Task`. The PM rejected it.

## Every option

### Option A — take every optional finding except one a reviewer withdrew and one the PM rejected **(recommended)**

17 of the 19.

- **Cost.** About 20 small edits, most of them one clause, in a file one engineer
  is already reading end to end. Two of them (security 7 and security 9) are
  additions the PM's own proposal left out.
- **Where it hurts later.** More edits means more chance of moving a line one of
  the 18 checks greps for. The fix list therefore ends with an item that re-runs
  all 18, and it carries the substring trap in writing.
- **Why it wins.** All 19 were found by reading one file once. Nobody reads that
  file that carefully again for a long time, and there is no test that would find
  any of them later. A finding left for "a later job" in a repository with no test
  framework is a finding lost. The two the round drops are dropped because they
  are not real, not because they are small.

### Option B — take only the PM's proposed subset

The PM proposed code 2, security 4, 5, 6, 8 and doc 8, 9, 10, 11, 12, 14, 15, 16,
17, 18, 19, 20 — 16 items, leaving security 7 and security 9.

- **Cost.** Two edits fewer.
- **Where it hurts later.** Security 7 is the one about a job editing the
  repository's own rules file with no yes. In **this** repository, `CLAUDE.md` is
  the whole enforcement story: it is the file that keeps reviewers on an allow
  list and keeps the plugin markdown-only. A job that finds one of those rules
  inconvenient can soften it, commit it, and every later job inherits the weaker
  rule. Security 9 is the false-red loop: two engineers running the project's test
  command in one working tree, one reporting a failure that is not real, and the
  PM starting an engineer to fix a bug that does not exist. Both are one clause.
- **Why it lost.** Both left-out items are cheap and both protect something the
  crew cannot recover on its own.

### Option C — take none; optional means optional

- **Cost.** Free now.
- **Where it hurts later.** The file ships with an undefined "phase point", an
  undefined "risky", a Verdicts value that rests on a permission nobody granted,
  a fifth Verdicts value that is never listed, a step 18 command that a job with
  no QA cases cannot run, and a briefing rule that contradicts step 3. Each of
  those is a PM guessing in the middle of a job.
- **Why it lost.** The plugin's only product is a document a PM follows literally.
  Ambiguity in it is the defect class.

### Option D — take only the pure wording items (doc 8, 10, 20) and defer every rule clarification

- **Cost.** Free.
- **Where it hurts later.** It keeps exactly the half that costs a real job time
  and gives up the half that is free.
- **Why it lost.** Backwards.

## The recommendation

**Option A.** Taken and dropped, item by item. `docs/design/tasks.md` carries the
same list as numbered fix items with a check each.

### Taken (17)

| Finding | What it changes | Class (ADR 0009) |
| --- | --- | --- |
| code 2 | the frontmatter `description` gains the second reason to serialize: one needs what the other wrote | B — this port's own file, no upstream twin |
| security 4 | step 16 gains one bullet: a publish command needs its own yes, and a tag yes never covers it | B |
| security 5 | the push of `main` gains "wait for a clear yes" like the other two yeses | B |
| security 6 | step 17's dirty-tree check gains its consequence: not empty means no merge | B |
| security 7 | an edit to the repository's own rules file is shown to the user for a yes before the commit | B |
| security 8 | never write a token's value into a file; record only whether one exists | B |
| security 9 | the file-list test covers edits only; two test runs in one working tree need serializing or a second working tree | B |
| doc 8 | steps 10 and 11 re-indented to four spaces so their sub-bullets stay inside the numbered item | B — formatting |
| doc 9 | "the two phase points" becomes "after the design (step 8) and at the last review (step 15)" | B |
| doc 10 | `Limits.` becomes a `### Limits` heading | B — formatting |
| doc 11 | `doc: skipped — the user asked for it` is dropped; see below | B |
| doc 12 | `changes needed` is listed as a value the four may take, where the four are listed | B |
| doc 14 | the `state.json` example shows every document it tells the PM to version | B |
| doc 15 | "the job folder path" gains "when it exists — a researcher started at step 3 runs before step 6 creates it" | B |
| doc 16 | the engineer briefing gains the branch, which the briefing rule already requires | B |
| doc 17 | `bash docs/qa/run-all.sh` gains its exit: a job with no QA cases says so in one line, with the reason | B |
| doc 18 | "a risky change" points at step 10b's closed list instead of leaving the word open | B |
| doc 19 | "Stand by. Do not start unrelated work." gains "roles you started together are already running" | B |
| doc 20 | the plain-language list: four over-long sentences rewritten, and **PoC**, **stub**, **fast-forward** and **ship** explained where they first appear | B |

That is 19 rows for 17 findings because doc 20 is a list and code 2 counts once.

### Dropped (2)

| Finding | Why it is dropped |
| --- | --- |
| code 3 | The reviewer withdrew it in the same breath: the local file merges upstream's two review-on-landing files into "the repository's own rules file" and splits by size instead, and the reviewer judged the intent survives and is arguably better for a user project that has no `principles.md`. "No change needed unless `T-06` makes the local name worth spelling out" — and `T-06` gives this repository `principles.md` at the root, which is a **local** name a user's project will not have. Spelling it out would make the rule less portable, not more. |
| doc 13 | Rejected by the PM, and recorded here so nobody re-opens it. The reviewer claimed Claude Code's subagent tool is named `Task`. In this session it is `Agent`: the PM starts every role with the `Agent` tool and `subagent_type: crew-<name>`. Every role's `disallowedTools` names **both** `Agent` and `Task` on purpose, because deployments differ and design rule 3 asks for a name that is real. No text changes because of this finding. |

### doc review 11, decided: drop the value

`doc: skipped — the user asked for it` is removed. Nowhere in the file may the
user switch off a doc review, and adding that permission would be a new rule
nobody asked for — the doc-review list at step 10 is deliberately closed so
nobody has to judge it under time pressure.

The honest replacement is already required by the fix for CRD 0003 defect 4,
which makes the fourth check "the doc review of this landing passes **or there
was no document to review**". So the values become:

- `doc: pass`, or `doc: skipped — no document in this landing`.

Any other skip still needs its own reason on its own value, which is the general
rule and does not change.
