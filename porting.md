# Porting from dsh-crew

claude-crew is a port of [dsh-crew](https://github.com/stuarthu/dsh-crew). The
rules are meant to be the same. Only the machinery differs, because Claude Code
is not dsh.

This file says how to keep the two in step. It sits at the repository root beside
`CLAUDE.md` and `principles.md`, because `docs/` in this repository now means
**crew job output** and this file is not job output — it is a standing
instruction for whoever runs the next port pass.

Five things live here, and a port pass needs all five:

1. **The rule at the top** — a port carries the mechanism and never the fix.
2. **The port's own five principles**, `P1` to `P5`, and the rule that keeps
   `principles.md` byte-identical to upstream apart from a listed set of substitutions.
3. **The map** — every upstream file this port reads, and what changes on the way.
4. **The "did not port" table** — every upstream thing that was left behind, with
   its reason, so the next pass does not re-open a settled question.
5. **The deliberate divergence table** — every place this port says something
   different from upstream **on purpose**. **It has no rows today.** Each row, if
   one is ever added, is self-contained. The only other file a pass writes is the
   **hand-off file, outside this repository**, and that one holds upstream's bugs
   rather than this port's rules.

This port was made from dsh-crew **v0.9.0**, commit `7bc7181`. `upstream.sums`
holds one checksum line per file below. The pass before it carried **v0.7.0**
(`87a4332`).

## What a port pass may change, and what it may not

**A port carries upstream's rules across. It changes only what the mechanism forces, and it
never fixes upstream's bugs.**

- **The port's work** is the mechanism: tool names, a role's tool filter, no hooks, no approval
  file, `~/.claude/crew/` instead of `~/.dsh/crew/`, a report that is a last message instead of
  a `report` tool. Those differences are unavoidable and they are the whole job.
- **An upstream bug is not the port's work.** A rule that contradicts itself, a check that
  cannot pass, a step that names a commit nobody makes — when a pass finds one, it goes in a
  **separate file, outside this repository**, written as an issue the user can file against
  dsh-crew. **Do not fix it here.** Wait for upstream to fix it, then carry the fix across like
  any other change.

**Why:** this repository's only value is that the two projects say the same thing. A local fix,
however good, is a paragraph somebody must reconcile by hand forever — and they will be reading
a diff, under time pressure, with `sha256sum -c` reporting fifteen moved files. A port that
improves upstream turns `upstream.sums` from a tool into a liability: `FAILED` stops meaning
"upstream moved" and starts meaning "look it up".

**The 0.7.0 pass is the evidence for the rule, and the 0.9.0 pass is the evidence that the rule
was right.** 0.7.0 fixed eight upstream defects and added two rules upstream had no version of.
Everything that then had to be built to keep those straight — a ten-row divergence table, a
divergence warning on nine of the fifteen pinned lines, a second table saying which pinned file
carried which row, and the reviewer time spent catching three documents that disagreed about how
many rows there were — existed only because of that.

Then 0.9.0 arrived and upstream had reached the same answer on **all ten**, eight of them in
almost this port's own words. So the fixes were never the thing that needed carrying; the
machinery around them was pure cost, and it is all deleted now. Two of the ten had to be undone
by a user decision because they were questions upstream's to settle, not this port's. Under this
rule none of it would have been written.

### When the port finds a conflict or a duplicate: follow upstream

**Always.** If two rules disagree, if the same rule is stated twice in different words, if a
path is written one way here and another way there — and the disagreement exists **upstream** —
**this port takes upstream's version.** It does not pick the better one, it does not merge them,
and it does not invent a third that resolves them.

The finding goes in the hand-off file, as an issue upstream can act on. Then this port waits.

**Why:** whoever runs the next pass compares two trees. Every place this port resolved something
upstream left open is a place where the diff is not the whole story, and the only way to know is
to have read a table first. A port that resolves conflicts is a port that has to be read
alongside a second document forever.

There is one exception and it is the port's whole reason for existing: **a conflict the mechanism
creates.** Upstream says a role cannot be messaged; here it can. Upstream names a tool this
deployment does not have. Upstream points at a file that only exists in its own repository. Those
are not upstream's conflicts — they are the seam between the two projects, and resolving them is
the job. Everything else is upstream's to settle.

### This repository has no change requests and no decision records, and should not

A CRD asks "should we change what the product does?" An ADR asks "how should we build this?"
**Neither question belongs here.** This repository always ports and never changes by itself:
what it does is decided upstream, and how it does it is decided by the mechanism. There is
nothing left for either document to settle.

So there is exactly one place for each kind of thing a pass produces:

| What a pass produces | Where it goes |
| --- | --- |
| a mechanism adaptation — a tool name, a filter, a path, a report that is a last message | **this file**: the map, and the "did not port" table |
| an upstream bug — a rule that contradicts itself, a check that cannot pass | **the hand-off file**, outside this repository, written as an issue the user can file |
| the port's own policy, like the three rules above | **this file**, at the top |
| the *reason* behind a rule the crew shares with dsh-crew | `principles.md` — **which this port does not edit**. The reason is upstream's, in upstream's words |
| the *reason* behind a rule that is this port's own | **this file**: principles `P1` to `P5` |
| what a reader or an editor needs to know | `README.md`, `README-zh.md`, `CLAUDE.md` — each pointing here, never restating |

**A rule written in two places is the next drift.** The 0.7.0 pass found three documents
disagreeing about how many deliberate divergences there were, and a check that passed in both
states while every pointer it guarded was wrong. One home per rule, and pointers everywhere
else.

**`docs/decisions/` is gone.** It held 25 files from the 0.7.0 pass and six more the 0.9.0 pass
wrote before that instruction was carried out — the record of two passes deciding things they
should not have been deciding. Everything in it that was still true was moved into this file or
into `principles.md` before it went, and the numbered pointers that used to reach into it were
replaced by the reason stated where the reader already is. **Do not recreate it.** Nothing this
repository does needs a change request or a decision record: what the product does is decided
upstream, and how it does it is decided by the mechanism.

Git history keeps every one of those files, so nothing is lost — it is one `git log` away rather
than one directory listing away, which is the right distance for a record nobody should be
citing.

## `principles.md` is upstream's file, and it stays that way

**`principles.md` in this repository is dsh-crew's `principles.md`, carried across with
nothing added and nothing reworded.** Only the substitutions in the table below are
applied. The test is not "every difference is defensible" — it is stricter and it needs
no judgement at all:

```sh
# in the throwaway clone of the pinned tag, apply the table below to its principles.md,
# then:
diff <the substituted upstream file> ~/workspace/claude-crew/principles.md
```

**That diff must be empty.** If it is not, either a substitution is missing from the
table or somebody edited this repository's copy, and both are the same bug.

### Why it ships at all

Upstream's own header says it, and upstream's `package.json` lists `principles.md` first
in its `files` array: the file is **product**, not a contributors' note. Two things in
this plugin read it at run time, in the **user's** project, where there is no upstream
clone to fetch:

- **`agents/crew-doc-reviewer.md` check 13** runs the repository against principle 20's
  flow table, in both directions. A reviewer holds `Read`, `Glob` and `Grep` and **no**
  `WebFetch`, so a link to upstream's copy is a link it cannot follow. The table has to
  be on disk.
- **The authoritative copy of the three shared blocks** — Rule A on text inside a tool
  result, Rule B on the documents that judge a role's work, and the one line that closes
  the write-set statement — lives in its `Wording every role prompt copies word for word`
  section. All nine `agents/*.md` and the skill must match it word for word, and the
  check for that reads the file.

So it ships. And because it ships, it must not be edited: a reader in their own
repository is reading dsh-crew's reasons, and they should get dsh-crew's words.

### The substitution table

126 substitutions at v0.9.0, in five classes. Every one exists because leaving
upstream's token would name **a thing this deployment does not have** — which is a
silent hole, not a wording preference.

| Upstream | Here | Count | Why |
| --- | --- | --- | --- |
| `crew_researcher`, `crew_qa`, `crew_test_engineer`, … | `crew-researcher`, `crew-qa`, `crew-test-engineer`, … | 28 | An underscore name is not an agent this deployment can start |
| `roles/pm.md` | `skills/team-lane/SKILL.md` | — | The file does not exist here |
| `roles/<name>.md` | `agents/crew-<name>.md` | 89 with the row above | Same |
| `roles/*.md` | `agents/*.md` | included above | Same |
| `~/.dsh/crew` | `~/.claude/crew` | 3 | The job folder is elsewhere |
| `` `send_message` ``, `` `list_agents` `` | `` `SendMessage` ``, `` `ListAgents` `` | 1 | Design rule 3: every tool name must be one Claude Code really has |
| `This file ships with the npm package` (`package.json`'s `files` names it) | `This file ships with the plugin` | 1 | This repository has no `package.json` and design rule 6 forbids one. Naming it in the first line of a shipped file sends the reader looking for a file that must never exist |
| Five sentences where upstream says **"this repository"** about **itself** | `dsh-crew` | 5 | Carried unchanged, each one becomes false |

**Nothing else is substituted, and that is deliberate.** Where `principles.md` names
`host/roles.js`, `npm test`, `package.json`, `scripts.test`, `tools/verify-*.mjs`,
`.github/workflows/` or `docs/qa/lib/`, it is **describing dsh-crew's own machinery**,
and the sentence is true as written. This plugin has none of it; the map below says what
stands in its place. Rewriting those sentences would be editing, and editing is what
this rule exists to stop.

**Where the port's own words go instead: here.** Everything this port has measured,
adapted or has to say about itself lives in this file — the five principles below, the
map, the "did not port" table. Not one sentence of it goes into `principles.md`.

**Why this rule exists, measured.** The v0.9.0 pass first carried `principles.md` the
other way: nine local paragraphs added inside principles 1 to 22, and principles 6, 13
and 18 reworded. Two document reviews then found the drift, independently, and all of it
was in the parts that had been edited — fourteen stale paths, a fourth different number
for one count, three stale principle counts, and a claim about the file's own house style
that the file itself contradicted. **The burden was never the 1,955 lines. It was the
editing.** A file carried verbatim plus a substitution table is a cheap, checkable
operation; a file rewritten is a judgement call on every paragraph, every pass, forever.

## The port's own principles

`principles.md` holds dsh-crew's reasons, numbered 1 to 22, and none of them are this
port's. These five are, and they have no upstream equivalent: every one is about this
being **a port**, and **markdown only**. They carry a `P` so dsh-crew can add numbered
principles without ever colliding with them.

They live here rather than in `principles.md` for the reason the section above gives, and
because this file is already outside `agents/crew-doc-reviewer.md` check 13's matching
rule — a port pass writes it, not a crew step.


## P1. Brief a role as if it were a fresh one, because sometimes it is

**Rule.** The PM starts a role with the Agent tool. The role reads the documents
its briefing names, does the work, writes its files and reports. The PM may reach
it again afterwards — but a briefing and a message may never be the only place a
fact lives, so every briefing is written so that a **fresh** role could act on it
with nothing else. A later round may reach a role as a message, or as a fresh
role. Either way, everything it needs is in the documents the briefing names.

**Why.** Not because a role is unreachable — it usually is not. Because a message
reaches exactly one role and dies there. Two engineers building two sides of one
boundary cannot compare notes, so a fact told to one of them leaves the other
building against a different truth, and nobody finds out until the halves are
joined. That is `principles.md`'s principle 14's reason, and it is the one that survives whatever
the mechanism turns out to be.

**What is measured, in this deployment.** The Agent tool returns at once, so a
role runs in the background while the PM carries on. `ListAgents` lists the live
ones with their agent ids. `SendMessage` reaches a role by its id — including one
that has already reported — and the role still has what it read: it quoted its
own earlier reasoning and corrected it, which is a resume and not a fresh reader
of a transcript. A resumed role still had only the tools its frontmatter names
(`principles.md`'s principle 12).

**What is not measured, and may not be claimed either way.** Whether a role from
an **earlier session** can be reached. One thing was observed and only one: after
the session was re-keyed mid-job, three resumes failed with
`No transcript found for agent ID`, loudly and not silently, while an agent that
had been resumed before the change came across. A deliberate restart may or may
not behave the same way. So no document here says a role "is gone" or "was
resumed" as a fact about a restart. The honest instruction is the one the skill
carries: after a restart, run `ListAgents` and try the agent id in `state.json`;
a role you **cannot reach** is treated as gone, and its task starts again with a
fresh role and the current document version.

**Which way to choose.** Message a role when you need it to look again at work it
already did: another round of review, a question about its own report, the output
of a command it asked for. Start a fresh role when the work itself starts again:
a task built from the beginning, a document version the role never read, or a
role you cannot reach. The test is not whether it has finished. It is whether the
task's own history should show a new start — a role asked to build its task again
inside its old context produces a second report that quietly replaces the first,
and the milestone review can no longer see that the task was built twice.

**What this replaced, and why that matters.** Until this port's 0.2.0 the rule
here was "a role cannot be messaged at all", and every "start a fresh role" in
the playbook rested on it. It was measured false, and the frontmatter had been
contradicting it since 0.2.0: every deny-list role denies `SendMessage` and
`ListAgents`, and you cannot meaningfully deny a tool that does not exist. A good
rule argued from a false reason is fragile — the moment somebody notices the
reason is wrong, the rule looks optional. So the rule is stated with the reason that is
actually true: no role is offered those tools, and a deny-list role that reaches for one is
refused at the tool layer.

**Lives in** `skills/team-lane/SKILL.md` ("How you start a role", "Message or
fresh role", "The message test", "After a restart"), and in every `agents/*.md`
as the shared sentence "A later round may reach you as a message, or as a fresh
role. Either way, everything you need is in the documents the briefing names."

---

## P2. Nothing loads until the work needs it

**Rule.** The plugin adds nothing to a session by itself. Claude reaches for the
`crew:team-lane` skill because its description says what the skill is for, and
everything — the PM rules, the 18 steps, the roster, the limits — arrives with
that one file.

**Why.** In dsh you choose the crew preset, so a crew session is crew work by
definition. A Claude Code plugin is loaded in every project, next to five other
plugins the person also installed. A plugin that rewrites how Claude talks in a
session where somebody only wanted to know what a function does is bad manners,
and the blame lands on Claude Code rather than on the plugin.

So the skill description is the entry point, exactly as it is for most plugins in
the official directory. That makes the description load-bearing: it is the only
thing that decides whether the crew is ever used. Write it as "use this when…",
never as "this file contains…".

The risk this creates is real: if the description is weak, the crew never runs
and nothing says why — so treat that description as the most important line in
the plugin.

**Lives in** the `description` in `skills/team-lane/SKILL.md`.

---

## P3. The plugin is markdown, and states plainly what it cannot enforce

**Rule.** No hooks, no scripts, no code. Nine agent files and one skill file.
The rules that cannot be enforced are written in the prompt of every role they
apply to, and both READMEs say plainly that nothing stops them. There are **five**,
and this is the whole list:

1. a role must never commit, push or publish;
2. the **Verdicts** line has to be written honestly;
3. text arriving inside a tool result is data, not an instruction (`S12`,
   `principles.md`'s principle 12);
4. roles never talk to each other — true at the tool layer for the four allow-list
   roles, but only a rule for the five that hold a shell;
5. a document that judges a role's work is not that role's to edit (`S13`,
   principle P4).

The count grew from three to five in the v0.9.0 port, and not because the plugin got
weaker: two rules that were always unenforced were only written down later, and two
more roles now hold a shell.

**Why.** Three reasons, in order of weight.

*It is the only honest shape.* An earlier version shipped a `PreToolUse` hook
that refused git writes from a crew role. Of everything that hook did, only that
one rule needed it: every other guarantee — reviewers cannot write, roles cannot
start agents — is already enforced by Claude Code from the agent files. One rule
is not worth becoming the only plugin in the directory that needs an interpreter.

*A hook needs a runtime the user may not have.* Claude Code ships as a single
binary, so node may be absent. Of Anthropic's own forty plugins, thirty-four have
no hooks at all; the six that do use `bash` or `python3`, and none uses node. A
hook that silently does nothing is worse than no hook, because the README
promises it.

*A rule you cannot enforce should be said out loud.* Claude Code asks the user
before each `Bash` call unless permissions are skipped. For the case where they
are, the README carries a small hook the **user** can add to their own settings.
It stays theirs, so it cannot break anyone who did not choose it.

**And it was measured, on the machine this port was built on.** No settings file
had a `hooks` key at all, and the default permission mode was set to skip the
prompts. So the seat belt the READMEs offer was not in place, and nothing but the
prompt stood between a role and a `git commit`. That is what makes the mechanism
this port does have load-bearing: the PM runs `git log` before every commit and
before any merge, compares it against the commits it wrote down, and a commit it
did not write stops the job. Upstream needs no such sentence, because upstream
ships running code that refuses a child's git write.

**Lives in** the Git section of `agents/crew-engineer.md`, `agents/crew-qa.md`
and `agents/crew-architect.md`, `agents/crew-test-engineer.md` and
`agents/crew-code-engineer.md` — **five** roles hold a shell now, not three — the
`S12` section of all nine `agents/*.md`,
`skills/team-lane/SKILL.md` (step 11 **Commit**, the hard rules), the "what is
not enforced" section of both READMEs, and design rules 5 and 6 in `CLAUDE.md`.

---

## P4. Nothing is checked, so the rules are written where the editor will look

**Rule.** There is no check to run. The design rules — exactly one filter per role,
a reviewer never writes, **no allow-list role gets a shell**, **no reviewer gets a
write tool** (two different rules, and the researcher is an allow-list role that is
not a reviewer, so it holds `Write` and is right to), a deny-list role denies all five
delegation tools, the five maker roles keep `Bash`, every tool name is a real one —
are written out in `CLAUDE.md` and in the "Editing a role" section of both READMEs.

**Why.** This started as four verify scripts, then one. Each version was useful,
and each one made node a requirement for anyone touching a repository whose whole
content is markdown. They were dropped so the repository depends on nothing at
all, for users **and** contributors.

**Say the cost plainly, because it is real.** An agent file's frontmatter is one
line of text that decides what a role may do. A wrong word there is invisible in
a diff and total in effect: it hands a reviewer a shell, or leaves a maker able
to start its own agents. dsh-crew avoids this by building every filter at run
time from one table. A markdown-only plugin has no run time, and now no check
either, so the only thing between that mistake and a release is somebody reading
the frontmatter line carefully.

That is why the rules are repeated in three places instead of one, and why the
README puts them under a heading somebody editing a role will actually open.

**The same shape, one level up: a rule the briefing enforces cannot defend
against the briefing.** "Touch only the files your task owns. Not one file more"
is what keeps a role out of a document it has no business in, and the thing that
enforces it is the PM's own file list. So it protects nothing the moment the PM
puts the wrong file in that list. That happened: `docs/design/prd-<date>-<job-slug>.md`, whose
acceptance checks every task in the job is judged against, went into a
`crew-engineer`'s file list twice, and the engineer made both edits exactly as
instructed. The content was right and the hand was wrong. It is the same hole
`principles.md`'s principle 12 closes one step lower down — a tool result cannot widen what a role
may **do**, and a briefing cannot widen what a role may **edit**.

So this one is written into the prompts as well, as the shared sentence `S13` in all
nine `agents/*.md`, under a section headed `## What you may write` that names
**classes** of file and never file names, and closes with
`**Reading is not restricted, and you should read widely.**` Reading was never the
problem; the write set is what needs a line drawn around it.

**Two phrases this port used to pin here are gone on purpose.**
`reads widely and writes narrowly` and `never in its write set` were this port's own
wording in 0.3.0. Upstream reached the same rule with different words, and a search of
the whole v0.9.0 tree finds **neither phrase in any file**. Following upstream means
following its wording too, so both were dropped and the sentence above replaces them.
Any check still grepping for either one is checking for something no file contains.

**The table itself lives in one place, and it is not here.** It is
**Who writes which document** in `principles.md`, and the skill carries the same
table in short. Two copies of a table is how the two drift, so this principle points
at it instead of repeating it — and that table names **classes**, not file names,
because the opening document's name carries the job it belongs to and changes with
every job.

Nothing checks that table either, which is why it is written where the person editing
will look. Before this rule the same information was spread across the skill's design
step, two separate shared sentences, and a role's own prompt — and the one document
that mattered most, the opening document, was in none of them.

**Lives in** `CLAUDE.md` ("Design rules a change must not break" and "Adding or
changing a role"), the "Editing a role" section of `README.md` and `README-zh.md`,
sentence `S13` and the `## What you may write` section of all nine `agents/*.md`, and
the PM's own `## What you may write` in `skills/team-lane/SKILL.md`.

---

## P5. A port needs a way to notice the original moved, and a way to read what it finds

**Rule.** `upstream.sums` records the SHA-256 of every dsh-crew file this port
was made from, in the format `sha256sum` reads, with a comment above each line
saying which file here it feeds. Running `sha256sum -c upstream.sums` inside a
dsh-crew checkout of the pinned tag reports what moved. Beside it, `porting.md`
holds the file-by-file map, the "did not port" table, and the **Deliberate
divergence** table — one row per place this port states a rule differently, each row
self-contained because there is no other document to send the reader to. **At 0.4.0
that table has no rows**, and the section says so and says where the ten it used to
hold went.

**Why the checksums.** A port without them becomes a fork within a few months,
and nobody can say which improvements were skipped on purpose and which were
simply missed. Using `sha256sum` instead of a script is the point: it needs
nothing installed, it is one line to run, and the file still makes sense when
nobody remembers how the tracking was meant to work.

**Why the ledger beside them, and this is the part that was learned twice.** At
0.3.0 a `FAILED` line meant two things, not one. It could mean "upstream moved,
catch up" — or it could mean "we decided otherwise, on the record", because that
version stated a rule differently from upstream in ten places. Every one of those
ten was a place where the diff was not the whole story, and the only way to know
was to have read a table first.

**At 0.4.0 the table is empty, and that is the goal rather than an accident.**
Upstream v0.9.0 adopted eight of the ten — several of them in this port's own
words — and on the last two the user chose upstream's shape, once upstream had
answered the argument behind them rather than only their conclusion. So **a `FAILED` line means
exactly one thing again: upstream moved, go and read the diff.** That is worth more
than any single fix the table held, and keeping it that way is now the point of the
rule in `porting.md` that a pass carries the mechanism and never the fix.

The differences are still sorted into three classes, because the classes are what
keep the table empty: **A**, a rule stated differently — it needs the user's yes and
a row in the table, and **there are none**; **B**, wording, formatting, an example or
a cross-reference — re-applied after each copy, never argued about; **C**, a
mechanism difference, such as tool names, the absence of hooks, `~/.claude/crew/`
instead of `~/.dsh/crew/`, or a report that is a last message — expected, and not a
divergence at all. Class C is where nearly everything lands, and the map and the "did
not port" table in `porting.md` are where it is written down.

The procedure for a `FAILED` line is written into `porting.md` in order: open the
table before you read the diff — even now, because a later pass may add a row; carry
across everything the diff touches; re-apply Class B; replace the sum line only when
the pass is finished. **A pass may not add a row on its own.** It reports what it
found and stops there, because a row is a promise that somebody must keep reconciling
by hand forever.

**What none of it can do** is notice a file dsh-crew has **added**, because a
checksum file only knows the names already in it. `porting.md` carries the git
command for that, run against two tags in a throwaway clone.

**Lives in** `upstream.sums`, `porting.md`, and the "Keeping up with dsh-crew"
section of both READMEs.

---

## The map

Upstream paths are as they are at tag `v0.9.0`.

| dsh-crew file | claude-crew file(s) | What changes on the way |
| --- | --- | --- |
| `roles/pm.md` | `skills/team-lane/SKILL.md` | All of it goes in the skill: step 0 (unfinished work), the PM rules, the roster and limits, then the 18 steps. Nothing is stated differently on purpose any more: the divergence table is empty. The 18 steps keep their numbers; step 2 is now the interview, step 10 has two gates, and step 9 carries the paired flow. |
| `roles/researcher.md` | `agents/crew-researcher.md` | Add frontmatter. Rename tools (`web_search` → `WebSearch`, and this deployment does have a page fetcher, so that paragraph is rewritten rather than copied). Add the shared sentence `S12`. |
| `roles/architect.md` | `agents/crew-architect.md` | Add frontmatter, rename tools, add `S12` and `S13`. The architect holds a shell here — this port's own call, because it reads the code and the git history before it designs anything — so it also carries the git clause. |
| `roles/engineer.md` | `agents/crew-engineer.md` | Add frontmatter, rename tools, add `S12` and `S13`. Says at the top that it is the **solo** shape, now that a paired one exists. |
| `roles/test-engineer.md` | `agents/crew-test-engineer.md` | **New at v0.9.0.** Add frontmatter (`disallowedTools`, all five delegation names), rename tools, add `S12` and `S13`. Holds a shell, so it carries the git clause. Writes only a task's unit tests, before the code exists. |
| `roles/code-engineer.md` | `agents/crew-code-engineer.md` | **New at v0.9.0.** Same frontmatter shape. Holds a shell, so it carries the git clause. Writes only the product code, and never a unit test for the behaviour it is building. |
| `roles/qa.md` | `agents/crew-qa.md` | Add frontmatter, rename tools, add `S12` and `S13`. Rebuilt into upstream's Job 1 / Job 2 shape: QA runs once per milestone, not once per task. Nothing is stated differently any more — upstream adopted both of the rules this port used to diverge on. |
| `roles/code-reviewer.md` | `agents/crew-code-reviewer.md` | Add frontmatter (an **allow** list, never a deny list), rename tools, add `S12` and `S13`. QA's `run.sh` and its case files are added to the file list it reads — divergence entry 7. |
| `roles/security-reviewer.md` | `agents/crew-security-reviewer.md` | Add frontmatter (allow list), rename tools, add `S12` and `S13`. |
| `roles/doc-reviewer.md` | `agents/crew-doc-reviewer.md` | Add frontmatter (allow list), rename tools, add `S12` and `S13`. Upstream's first instruction points at a file inside dsh-crew's own repository; a port cannot carry a pointer into the source project's private files, so the rule is stated inline instead. |
| `host/roles.js` | every `agents/*.md` frontmatter | dsh builds the tool filters at run time; Claude Code reads them from the agent file. Nothing checks them here — the design rules are written out in `CLAUDE.md` and in both READMEs instead. |
| `host/jobs.js` | `skills/team-lane/SKILL.md`, step 0 | Not code here. The PM looks in `~/.claude/crew/jobs/` itself when the skill loads. |
| `host/git-guard.js` | the `## Git` section of all **five** shell-holding roles — `agents/crew-architect.md`, `agents/crew-engineer.md`, `agents/crew-qa.md`, `agents/crew-test-engineer.md`, `agents/crew-code-engineer.md` — and the "What is not enforced" section of both READMEs | **Not ported as code.** The plugin ships no hooks. The rule is stated in every role that owns a shell, and the README offers a hook the user can add to their own settings. See principle `P3`. |
| `host/crew.js` | `skills/team-lane/SKILL.md` | Nothing loads at session start. The skill's description is what makes Claude reach for the crew, so that description is load-bearing. |
| `host/roles-preset.js` | `agents/*.md` frontmatter | Claude Code has no presets. |
| `principles.md` (upstream root) | `principles.md` (this root) | **Carried across with nothing added and nothing reworded** — only the substitutions the rule near the top of this file lists, and the test is that the diff against the substituted upstream file is **empty**. Upstream moved this file out of its own `docs/` folder at v0.7.0 and made it a shipped file at v0.9.0; it ships here too, because `agents/crew-doc-reviewer.md` check 13 and the three shared wording blocks both read it at run time, in the user's project, where there is no upstream clone. Principles 1 to 22 keep upstream's numbers so one can be quoted across both projects. **Nothing in it is this port's**: the port's own five principles, `P1` to `P5`, are in **this** file. |
| `README.md` | `README.md` + `README-zh.md` | Rewritten, not translated — the install and the mechanics differ. Both READMEs must be updated together. |

Nothing else upstream is read by this port. `upstream.sums` pins exactly these
**seventeen** files — fifteen at 0.3.0, plus the two role files v0.9.0 added.

**Why not more.** A pass compares against a **tag** in a throwaway clone, never against
`~/workspace/dsh-crew`, and it pins only the files whose rules this port carries. Pinning
upstream's own project record — its `docs/decisions/*`, its `docs/design/*`, its `docs/qa/*`,
around a hundred files — would report dozens of `FAILED` lines per pass that say nothing about
this port. Read those by hand from the clone when a question needs them.

## Which folders this repository keeps

**This repository has no `docs/` folder at all, and that is the settled shape.** Upstream
v0.9.0 carries 335 files under its own `docs/` — its decisions, its designs, its QA cases,
its research. Every one of them is dsh-crew's record of dsh-crew's own jobs.

This port keeps none of the equivalent. A port pass produces exactly four kinds of thing,
and the table near the top of this file says where each one goes: a mechanism adaptation
and the port's own policy come **here**; the reason behind a shared rule is upstream's,
in `principles.md`, unedited; an upstream bug goes to the **hand-off file, outside this
repository**; and what a reader or an editor needs is in the two READMEs and `CLAUDE.md`.
**A pass's own opening document, design and task table are not on that list**, so they
are not kept: they describe how one pass was organised, they are stale the day it ends,
and the next pass writes its own. What survives a pass is the ported files, this file,
`principles.md`, `upstream.sums` and the `CHANGELOG.md` entry — plus the commit messages,
which carry each change's reasons, its real numbers and its **Verdicts** line.

The v0.9.0 pass is the evidence for that last sentence as well: two document reviews found
eight blocking findings in its own PRD, design and task table, and almost every one was a
document describing a state that had already moved. A job document is worth exactly as
much as the day it was written.

**What the crew still writes under `docs/` in a user's project** is a different question,
and the answer is unchanged — `principles.md`'s principle 19 and its principle 20 flow
table say what goes where. Those paths are destinations in **your** repository, not
folders this one keeps:

**A note for whoever runs `agents/crew-doc-reviewer.md` check 13 on this repository.**
That check runs principle 20's flow table against the repository in both directions, and
it defines a crew document as a file under `docs/`, plus `principles.md`, `CLAUDE.md`,
`CHANGELOG.md` and both READMEs. **Here there is no `docs/`, and that is not a finding.**

Read the two directions as the check words them. The **document side** asks whether every
crew document in the repository has a row that produces it: the five root files all do —
`principles.md` through step 18, and `CLAUDE.md`, `CHANGELOG.md` and both READMEs through
step 14, whose row names `README-<lang>.md` and so covers `README-zh.md`. `porting.md` is
outside the matching rule and the check says so itself. The **step side** asks whether
every step that produces a document has a row in the table — that is the table against
the playbook, not the table against this filesystem. An empty `docs/` changes neither
answer.

What it does mean is that most of those rows describe work this repository never does.
That is the normal state of a plugin: the rows are for the **user's** project, which is
the only place the crew runs. A reviewer that reports the absent job documents as a
surplus has read the step side as a question about files on disk. It is not, and this
paragraph exists because a role read it that way once.

- **None.** `docs/` was deleted at 0.4.0 and is not recreated. The 0.7.0 and 0.9.0
  passes had both written a `docs/design/` and a `docs/decisions/` of their own; both
  are gone, and git history keeps them.
- **Never created here, and not missing:** `docs/qa/`, `docs/release/`,
  `docs/research/`, `docs/design/` and `docs/design/api/`. Those are paths the rules
  tell a crew role to create in the **user's** project. This plugin is markdown with no
  boundary between modules, no release plan of its own written by a crew, and no
  QA folder — the user skipped `crew-qa` for the port job and no check here
  depends on a test runner.

If a later job in this repository does have a boundary or does ship, it creates
the folder then. Absence is the normal state, not a defect to fix.

## Things that deliberately did NOT port

Do not "fix" these by adding them back. Each one is a decision, and
`principles.md` says why. The last two rows are **corrections**: they name
something a reader might expect to find in this table and say plainly what
really happened, because both were once written here with a reason that turned
out to be false.

| dsh-crew | Why it is absent here |
| --- | --- |
| The preset installer and the `.bak` rescue (`host/roles-preset.js`), and its temp-folder fix (upstream CRD 0005, upstream ADR 0003) | Claude Code plugins install themselves. There is no folder to overwrite, so there is nothing to rescue and no temporary folder to leak. |
| `maxDepth: 1` | No equivalent setting, and none needed: Claude Code applies each agent's tool list itself, so a role has no delegation tool to use. |
| The git guard, as running code (`host/git-guard.js`) | The plugin is markdown only. The rule is stated in every role that owns a shell, and both READMEs say plainly that nothing enforces it. See principle `P3`. |
| The one-shot push approval file | A crew role may never push, so there is nothing to approve. The guard that consumed the file is not here either. |
| The per-turn job notice (`host/crew.js`, `host/jobs.js`, `tools/lib/boot-log.mjs`) | Claude Code adds hook text to context instead of replacing it, so a notice would be printed once at session start rather than each turn. Step 0 of the skill does the job instead: the PM looks for an unfinished job itself. |
| `host/crew.js` as a loader | Nothing loads at session start here. The skill's description is the entry point, and the limits this file held are written into the skill as text. |
| `tools/verify-guard.mjs`, `tools/verify-jobs.mjs`, `tools/verify-mount.mjs`, `tools/verify-preset-install.mjs`, `tools/verify-tasks.mjs` | They check dsh machinery this port does not have, and every one of them is a script. Design rule 6 forbids `tools/`, `scripts/`, `lib/` and `package.json` in this repository; principle `P3` says why they were removed twice. |
| `tools/lib/boot-log.mjs` | Same reason, and it is what produced the session-start notice above. This is why the skill may not promise a note headed "Unfinished crew work": nothing here writes one. |
| `.github/workflows/test.yml`, `.github/workflows/publish.yml` | There is nothing to build, nothing to test with a runner and nothing to publish to a package registry. The plugin is installed from the repository. |
| `package.json` | No dependencies, no scripts, no build step. Design rule 6. |
| Upstream **CRD 0009** (QA's cases inside `npm test`, and CI on every push) **as machinery** | The wiring is dsh-specific and this repository has no `npm test` to wire into. The rule underneath — QA's cases are real files that run again — **is** carried, in principle 13, because the crew applies it to the *user's* project. How the two projects differ about the test command is divergence entry 7. |
| Upstream **CRD 0011** (a Verdicts gate inside `npm test`, `tools/verify-tasks.mjs`) **as machinery** | Same: no `npm test`, no script. The Verdicts **rule** is carried in full — four values, a reason on every `not run` and `skipped` — with nothing pretending to enforce it. This plugin ships no code, so the line is written honestly and nothing checks it — which is exactly what the rule says about itself. |
| The dsh preset's configuration comments: `roleAllow`, `roleDeny`, `roleModels`, `rolesDir`, and `cordis.patch.yml` | Claude Code has no presets and no bundle patch. A role's tool filter is its own frontmatter, and there is no configuration file to read — every setting here is a file. |
| Upstream's own project record: its `docs/decisions/*`, its `docs/design/*` and its `docs/qa/*` (335 files at v0.9.0) | That is dsh-crew's history of dsh-crew's own jobs, not a rule this port carries, skips or restates. Pinning it would report dozens of `FAILED` lines a pass that say nothing about this port. Read them from the clone by hand when a divergence row is in question — some of them hold upstream's reasoning for the rules entry 7 argues with. |
| `send_message`, `interrupt_agent`, `list_agents` | **Not absent, and the old reason here was measured false.** The **idea is ported**: the PM may reach a role that is already working, and `SendMessage` and `ListAgents` are this deployment's names for two of the three. `interrupt_agent` has no ported twin, and the honest reason is not that there is no such thing: an interrupt can land between two `Edit` calls, so carrying it needs a rule this port has not written yet — after an interrupt the PM must run `git status --short` and say what was left half-written. No role holds `SendMessage` or `ListAgents`, and that is design rule 1, not a gap. This is not a divergence and never had a row: it moves the port **closer** to upstream. |
| The researcher's "this preset has no `web_fetch`" note (`roles/researcher.md` 18 and 67) | **Not skipped — carried with a change.** Our researcher holds `WebFetch`, so the paragraph is rewritten to say what is true here: `WebSearch` returns snippets and cannot open a page, `WebFetch` opens one. The upstream rule the paragraph exists for — make the query narrow, and do not guess past what the snippet says — is kept word for word in meaning. |

## Deliberate divergence

**There are no rows in this table, and that is the point.** As of the v0.9.0 port,
this repository says nothing different from dsh-crew on purpose. A `FAILED` line from
`sha256sum -c` therefore means exactly one thing again — **upstream moved, go and read
the diff** — which is the property the rule at the top of this file exists to protect.

| # | Upstream | What upstream says | What this port says instead | Why | Class | Where it says it here |
| --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — | — |

### Where the ten rows went

0.3.0 carried ten. Every one is gone, and none of them was deleted quietly. Count them
the way the table below sorts them, because two different numbers both say "eight" and
only one of them is about contradictions:

- **Six** were places where upstream contradicted itself — rows 1 to 6 — and upstream has
  since said the same thing this port said, in several cases in this port's own words.
- **Two** were gaps neither project had a rule for — rows 9 and 10 — and upstream has
  adopted both, generalising row 10's on the way.
- So **eight of the ten were adopted**: six contradictions plus two gaps.
- The remaining **two** — rows 7 and 8 — are the ones where **the user chose upstream's
  shape** on 2026-08-22. On row 7 upstream refused the conclusion but answered the
  argument behind it. On row 8 upstream removed its own contradiction and kept the
  permission this port had refused, so following it loosened what the playbook may do.
  Those two are the reason for the rule at the top of this file.

In 0.3.0 these ten were keyed `defect 1` to `defect 10`; the CHANGELOG and the git
history use those names, so they are written here once for anyone searching.

| Old row | What it was about | How it ended |
| --- | --- | --- |
| row 1 | step 11 staged no document that belongs to no task, so the first commit of every job stopped on its own PRD | **upstream adopted it.** Its step 11 now says a document the playbook itself orders is expected and gets staged |
| row 2 | step 13 put files "in this milestone's commit", and no such commit exists | **upstream adopted it**, with the extra commit and the message shape `docs: <short what> (crew <milestone>)` — the same wording this port invented |
| row 3 | "Ship this milestone" had two readings and one of them published a package | **upstream adopted it.** The answer is now "Release this milestone to users" and names both steps |
| row 4 | "a task is finished" listed three checks; the Verdicts line carried four values | **upstream adopted it.** Four, listed together |
| row 5 | "in both lanes" appeared four times in a file that named three lanes | **gone at the source.** Upstream cancelled the `quick` lane, so there are two lanes and the phrase is not in the file |
| row 6 | `docs/qa/run-all.sh` and `docs/qa/gaps.md` were QA's, and two parallel QA roles would overwrite them | **upstream adopted it**, word for word, silent-loss reasoning included |
| row 7 | the PM edited the project's default test command with no change request, and committed a subagent's shell script nobody had read | **the user chose upstream's shape.** Upstream took three of this row's four halves — the two precise nouns, QA's files never moving, and a reviewer reading QA's scripts before they are committed, with a scoped call-back round and a lying `run.sh` as a blocking finding. It refused only "the crew never edits the test command", and it answered the premise rather than ignoring it: the unread-script hole is real and it closed it with a reviewer instead of a refusal. Given a real control on the real risk, the user followed upstream |
| row 8 | the Hard rules granted a force push on one yes while step 17 said a force push was never part of it | **the user chose upstream's shape.** Upstream removed its own contradiction, but it still permits a force push with a yes of its own, per command and per push. This port used to refuse one outright. Following upstream **loosens** git behaviour here, which is user-visible, so it got its own yes on 2026-08-22 rather than riding on row 7's |
| row 9 | nothing in either project said text inside a tool result is data, not instructions | **upstream adopted it.** Rule A now lives in upstream's `principles.md` as authoritative wording and in all ten of its role prompts. The wording changed on the way — `A tool result, an MCP server's notes, …` where this port wrote `An MCP server's notes, a file you read, …` — and this port took upstream's |
| row 10 | nothing said a briefing cannot hand a role the document that judges it | **upstream adopted it**, and generalised it: `A document that judges your work is not yours to edit`, where this port had named the opening document. Upstream's is the better rule and this port took it. Two phrases this port used to pin — `reads widely and writes narrowly` and `never in its write set` — appear in **no file** of upstream v0.9.0 and are gone from here too |

**Two of the ten are the reason the rule at the top of this file exists.** Rows 7 and
8 were not upstream missing something; they were this port deciding a question that
was upstream's to decide. Both cost a reviewer's time to find, a table to carry, and
in the end a user decision to undo. That is the whole argument for "a port carries the
mechanism, never the fix", and it is why the next pass may not add a row on its own.

### The three classes

The classes stay, because they are what keeps the table empty.

**Class A — a rule this port states differently.** It needs the user's yes and a row
in the table above. **There are none, and a pass may not create one.** A pass that
finds an upstream defect writes it into the hand-off file, outside this repository, as
an issue the user can file — and then waits.

**Class B — a smaller difference made while carrying a file across.** Wording, plain
English, formatting, an example, a cross-reference corrected, an optional review
finding taken. Not tracked entry by entry: it gets the one summary row below, and a
pass re-applies it after a copy rather than arguing about it.

| Class B, all files | every file in the map | The local files are **not byte copies**. Wording, plain English, formatting, examples and cross-references were all changed while carrying them across. Tracking those one by one would cost more than it saves. This row is a reminder, not a list to work through. |

**Class C — a mechanism difference.** A tool name, an agent name with a hyphen instead
of an underscore, no hooks, no preset, no scripts, `~/.claude/crew/` instead of
`~/.dsh/crew/`, a report that is a last message instead of a `report` tool, documents
in different places, `agents/*.md` frontmatter instead of `host/roles.js`. Expected,
and not a divergence at all: **nearly everything lands here**, and the map and the
"did not port" table above are where Class C is written down.

Two Class C notes the v0.9.0 pass added, because they were decided once and the next
pass should not re-decide them:

- **A rename that a port brings across sweeps only the live documents**, and it takes
  three rules rather than one, because a list with an exception bolted on is a list
  somebody will apply without the exception:

  1. **Swept to zero**: `agents/`, `skills/`, both READMEs, `CLAUDE.md` and this file.
  2. **`principles.md` has its own rule**, and it is not "zero". A ban has to be able to
     quote the word it bans, so the banned phrase stays there **exactly once**, inside
     the sentence that forbids it, in the `Words we use` section. Upstream's own copy is
     the same: exactly one, same section, same sentence. **A check that sweeps
     `principles.md` to zero can only pass by deleting the ban** — which is a check that
     is red until somebody breaks the rule it was written to protect.
  3. **Not swept, not edited**: the published sections of `CHANGELOG.md`, and everything
     under `docs/`. A version that has shipped keeps the words it shipped with, and
     `docs/` is one job's snapshot at one moment. Upstream made the same call for the
     same problem.

  This paragraph was itself the second bad check of the v0.9.0 pass, and both had the
  same shape: a check whose green was reachable only by breaking something. The first
  was a hash comparison whose range matched nothing, so seven files with the rule
  missing all produced the same "passing" hash. **When you write a check, the question
  is not only "is it red today" but "is every path to green a correct one".**
- **`docs/design/prd.md` and `docs/design/hld.md` were deleted, not renamed.** The rule
  moved to `prd-<date>-<job-slug>.md`, and for a while the answer was to leave the 0.7.0
  job's two files alone so its record stayed readable. At 0.4.0 the answer changed: no
  job document is kept at all, so there is nothing to rename and nothing to leave. Both
  are in git history.
- **The two `node_modules/@deepseek-ai` symlink commands in upstream's paired-worktree
  step are not ported.** They serve a check that lives only in dsh-crew's own
  repository and point at a path this machine does not have. **The rule around them is
  carried whole**: a fresh worktree holds only what git tracks, so whatever else the
  project's own checks need has to be put into **both** trees at the moment they are
  opened — miss it and nothing fails, the checks just quietly get weaker. In
  claude-crew that list is empty; in a user's project it almost never will be.


## A port pass, step by step

1. **Clone the newest tag into a throwaway folder.** Never the user's own working
   copy: **never read, write or run anything in `~/workspace/dsh-crew`.** That
   copy is usually half-finished, and `sha256sum -c` compares the working tree of
   whatever checkout you stand in, so a sum taken from it is worthless. A tag is
   a decision somebody made; `main` is whatever state a person left behind. This
   port's 0.2.0 pass compared against a mid-flight commit, which is how the gap
   grew to 11,000 lines before anyone measured it. A tag is a decision somebody made and
   published; `main` is whatever state a person left behind, and a working copy is
   usually mid-edit.

   ```sh
   TMP=$(mktemp -d)
   git clone --quiet https://github.com/stuarthu/dsh-crew "$TMP/dsh-crew"
   git -C "$TMP/dsh-crew" checkout --quiet <the newest tag>
   git -C "$TMP/dsh-crew" status          # read the answer before you trust the clone
   ```

2. **Compare.**

   ```sh
   cd "$TMP/dsh-crew" && sha256sum -c ~/workspace/claude-crew/upstream.sums
   cd "$TMP/dsh-crew" && shasum -a 256 -c ~/workspace/claude-crew/upstream.sums   # macOS
   ```

   Every `FAILED` line is an upstream file that changed. The comment above that
   line in `upstream.sums` says which local file it feeds.

3. **For a `FAILED` line, follow these four steps in order.**

   1. **Open the divergence table above before you read the diff.** It is empty
      today, and checking takes ten seconds. Do it anyway: a later pass may have
      added a row with the user's yes, and the whole reason that table exists is
      that a pass which skips this step deletes one of this port's own decisions
      believing it to be a missed port. If the table has a row naming this file,
      read upstream's text at the new tag first — if upstream now carries the same
      rule, take upstream's wording and **delete the row**; if not, keep the local
      text and the row, and update its line numbers.
   2. **Read the diff and carry it across.** Decide, per change, which of three it
      is: **carry it across** (the rule changed and it applies here too); **carry
      it with a change** (the rule applies but the mechanism differs — tool names,
      an agent name with a hyphen, no hooks, no preset, no scripts, a report that
      is a last message); **skip it** (it is about dsh machinery this port does not
      have, and then the reason goes in the "did not port" table above and in the
      comment above that line in `upstream.sums`).

      **You may not skip it because you disagree with it.** An upstream rule you
      think is wrong is carried across anyway, and the objection goes in the
      hand-off file. That is the rule at the top of this file, and rows 7 and 8 of
      the old divergence table are what it cost to learn.
   3. **Re-apply Class B after the copy** — the plain English, the formatting, the
      examples and the corrected cross-references. The summary row is a reminder
      that the local file is not a byte copy, not a list to work through.
   4. **Replace that file's line in `upstream.sums` only when the pass is
      finished**, and take the sum from the throwaway clone, never from a local
      file:

      ```sh
      cd "$TMP/dsh-crew" && sha256sum roles/pm.md
      ```

   **A word about the shared wording.** **Three** blocks are carried **word for word**
   into all nine `agents/*.md` and the skill: Rule A on text inside a tool result,
   Rule B on the documents that judge a role's work, and the one line that closes the
   write-set statement, `**Reading is not restricted, and you should read widely.**`
   A pass told "two" checks two of the three. `principles.md` holds the
   authoritative copy, under **Wording every role prompt copies word for word**. A
   pass that changes either block changes all ten files in the same commit, and
   checks it with the recipe written beside that block — **including its `test -s`
   line**, because the range matching nothing gives a stable hash of the empty
   string, and seven files with the rule missing then produce seven identical
   "passing" hashes. That was measured here, not imagined.

4. **If a role's tool filter changed**, edit that agent file's frontmatter — then
   re-read the design rules in `CLAUDE.md` against it, line by line. Nothing else
   will. Exactly one of `tools` or `disallowedTools`, reviewers on an allow list
   always, and every tool name must be one Claude Code really has.

5. **If a rule changed**, update the matching principle in `principles.md`. When
   you reject an idea, add it to that file's table so the next person does not
   re-run the same search.

6. **Update the header of `upstream.sums`** — its Source, Tag and Commit lines —
   when the whole pass is done, and add a line to `CHANGELOG.md` saying which
   dsh-crew version was carried across.

7. **Anything you had to decide** that is more than wording is **not yours to settle.**
   Write it into the hand-off file, outside this repository, as an issue the user can
   file against dsh-crew, and stop there. A pass writes no change request — there is
   nowhere in this repository for one to go, and the rule at the top says why — and it
   adds no row to the divergence table on its own. It reports what it found.

   **This step used to say the opposite**, and it survived two rewrites of this file
   because the sentence wraps: `needs a change request` sat on one line and
   `in docs/decisions/crd/` on the next, so every `grep` for the phrase came back
   clean. That is the third time in one pass that a line break hid something from a
   check. When a check has to find a phrase, keep the phrase on one line.

## A new file upstream

`sha256sum -c` cannot report a file it has never heard of, so a new upstream role,
or a rule moved into a new file, is invisible to it. Look by hand, once per pass,
across the whole tree and not only `roles/`:

```sh
git -C "$TMP/dsh-crew" diff --name-status <the ported tag>..<the new tag>
```

Read every `A` line, plus every `R` line — a rule that moved to a new path looks
like a rename, and the pinned line for the old path will report `FAILED` with no
explanation. Pay attention to three places: `roles/`, `host/`, and the repository
root, where upstream now keeps `principles.md`.

To add a new role:

1. Write `agents/crew-<name>.md` with exactly **one** of `tools` or
   `disallowedTools` in its frontmatter, a description that starts with
   `Crew role.`, and a body that says the role talks only to the PM, that it does
   one job and then stops, and — if it holds a shell — that the PM does all the
   git work. Add the shared sentences `S12` and `S13`.
2. Name it in `skills/team-lane/SKILL.md`, in its roster table and in the steps
   that use it — the PM only uses what its playbook describes.
3. Add it to the role table in `README.md` and `README-zh.md`, together.
4. Re-read the design rules in `CLAUDE.md` against the new frontmatter.
5. Add a line for it in `upstream.sums`, with its map comment above it, and add
   its row to the map in this file.
