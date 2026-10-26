# Changelog

Newest first. Each entry says what a user would notice.

## 0.7.0

The crew costs less and says one thing. Nothing about what the crew does moved:
same work, same rules, fewer roles and far fewer words. Two things were measured
in the last job here — a skill file of 26,607 words paid at the start of every
job, and up to 53 QA agents in one milestone because QA started one agent per
case.

**Two things change what you pay for a job.** Every task is done by **one**
engineer, and a reviewer is handed **one task's diff** instead of the whole
milestone's. Read those two before you read anything else.

### Changed

- **Every task is done by one engineer, who writes the unit tests first and then
  the code.** A task used to be split across two roles that ran at the same time,
  each in its own copy of the repository, on its own branch, passing notes between
  them. One role now holds the whole task. What you notice is that a job starts
  about half the agents it used to.
- **QA writes one task's whole case list, not one agent per case.** One `crew-qa`
  role takes a task and writes every case for it in `qa/<task-id>/`, with the
  `run.sh` beside them. A case is still a real, runnable file with an exit code,
  and `qa/run-all.sh` still finds them by pattern. What you notice is that a
  task's cases arrive in one report instead of one report per case.
- **A reviewer is handed one task's diff, not the whole milestone's.** A review
  that used to read every file a milestone touched now reads the files one task
  owns. Every review is still **one** round, and only a change made because of
  that review's own finding brings it back.
- **The PM's rules file is short at the start of a job.** The 18 steps live one
  file each under `skills/team-lane/steps/`, and this file keeps the rules and a
  step index. A step is read when the PM reaches that step, one at a time. The
  steps keep their rules and lose the paragraphs that restate why a rule holds;
  where a reason was cut, the step keeps one line in the form
  `Why: principle 6 in principles.md`.
- **The role prompts are shorter, and the reasons for the rules live in
  `principles.md`.** Each prompt keeps what the role does and drops the
  reasoning it used to repeat. Nothing was lost: every reason is still in
  `principles.md`, and the PM carries the shared wording in the skill file.
- **The PM runs one role at a time.** It starts one, waits for its report, then
  starts the next, and the role changes as the step needs one. There is still no
  cap on the roles one job may use over its whole life.

### Removed

- **Two roles are gone**, and `agents/` holds seven role prompts now, not nine.
  Every task is one shape: one role, one set of files.

- **`porting.md` and `upstream.sums` are gone.** Nothing measures drift against
  dsh-crew any more, so a person who wants to compare the two projects reads both
  repositories. `principles.md` is dsh-crew's file, carried across, and this port
  edits it where its own rules differ.

### Documentation

- Both READMEs, `CLAUDE.md`, `principles.md`, the skill file, the 18 step files,
  the seven role prompts and both manifests were brought in step with all of the
  above, in the same release. The version line in each README and the two version
  fields in the manifests all read `0.7.0`.
- The `0.6.0` and older sections below still name the roles and the shapes that
  shipped with them. They **stay exactly as they are**: those were real when those
  versions shipped, and a published section is a record of what was true at the
  time.

## 0.6.0

Caught up with [dsh-crew](https://github.com/stuarthu/dsh-crew) **v0.13.0**, the
tagged release, commit `5dd7b50`. 0.5.0 matched **v0.10.0**, and three upstream
tags moved since then: v0.11.0, v0.12.0 and v0.13.0.

**Two things change what happens to your repository.** A job's documents no
longer land in your project folder, and the PM's write limit is gone. Read those
two before you read anything else.

### Changed

- **A job's documents moved out of your project folder.** The opening document,
  the design, the task table, every ADR and CRD, the boundary contracts and the
  release plans now go in a temp docs home:
  `<TMP>/claude-crew/<repo>/<job-slug>/`. `<TMP>` is your system temp folder —
  `/tmp` when nothing sets it — and `<repo>` is your project's full path with the
  slashes written as `-`. Your project folder keeps its code, `qa/`, and the five
  files that ship: the two READMEs, `CHANGELOG.md`, `CLAUDE.md` and
  `principles.md`. A job's documents are read while the job runs and are kept
  after it by nothing.
- **The task table is one per job, not one per repository.** The docs home
  carries the job name, so each job starts its own `docs/tasks/` and never reads
  an earlier job's table. What you notice is that a new job no longer inherits a
  list of tasks from the job before it.
- **Nothing checks the Verdicts line any more.** The PM still writes one per task
  row — four values, each with its own reason on every `not run` and every
  `skipped` — and still prints one line per task to you at the end of a job. What
  is gone is the red: a task with a missing value, or a `not run` with no reason
  after the dash, reddens nothing. The line proves only that it was written. It
  never proved that a review happened, and it still does not.
- **The job folder moved inside the repository.** It used to sit at
  `~/.claude/crew/jobs/<job-slug>/`, far from the project. It is now at
  `.claude-crew/jobs/<job-slug>/`, at the root of the repository this session
  works in, so one `ls` shows the job you are in and a job's progress can no
  longer be mistaken for another repository's. **Nothing about the job changed
  shape:** the folder is still single-use, the PM keeps it out of git's sight with
  one line in the repository's own `.git/info/exclude`, so `git status` stays clean,
  the folder is never staged and never committed, and it is dropped whole when the
  job ends. That line goes in `info/exclude` and not in the project's `.gitignore`,
  because it says where **this crew** puts progress rather than what the project
  builds, and a committed line would add it to a file the user owns. **The job folders
  that are still under `~/.claude/crew/jobs/` stay where they are** — nothing here
  moves or deletes them, and a job left in one of them is no longer found by the
  unfinished-job notice.

### Removed

- **The PM's write limit is gone here, the way it is gone upstream.** There is no
  path whitelist section in the skill and no "The PM write guard" section in
  `CLAUDE.md`. Upstream deleted running code — `host/pm-write-guard.js`, its row in
  `cordis.patch.yml`, and its check `tools/verify-pm-write-guard.mjs`. This port
  never had that code, so what it carried was the words, and the words are gone
  too. **This removes the enforcement, not the habit**: the PM still writes the
  job's own documents, and a role still writes only the files its task owns. What
  you notice is that a write the PM used to stop and ask you about now goes
  through with no ask. **The git rule is untouched** and is still the one rule
  standing between a crew role and a push, a tag push, a force push, a remote
  delete or a publish — here, as before, that rule is words in the prompts plus
  the hook snippet you can add to your own settings, not code.

### Documentation

- **Two upstream rules are not carried, and that is a choice.** The Crew preset
  for dsh 0.2.x: this plugin has no preset and no settings, and design rule 6
  forbids adding any. The fix to upstream's git guard: this port ships no guard
  code, so there was no wrong branch to fix, and the hook snippet in `CLAUDE.md`
  already tells a crew role from the root session by `agent_type`.
- Both READMEs, `CLAUDE.md` and `porting.md` were brought in step with all of the
  above, in the same release.
- The `0.5.0` and older sections below still name the PM's write limit, and the
  `0.1.0` section still names `~/.claude/crew/jobs/`. They **stay exactly as they
  are**: those were real when those versions shipped, and a published section is a
  record of what was true at the time.

## 0.5.0

Caught up with [dsh-crew](https://github.com/stuarthu/dsh-crew) **v0.10.0**, the
tagged release, commit `09c6e03`. 0.4.0 matched **v0.9.0**.

**Three folders moved or went away.** `docs/research/` is gone, `docs/qa/` is now
`qa/` at the root of your repository, and the single file `docs/design/tasks.md`
is now a folder, `docs/tasks/`. If you have crew documents from an older release,
nothing moves them for you. Read the first three items even if you read nothing
else.

### Changed

- **The researcher no longer writes files, and `docs/research/` is gone.** Its
  tool list is now `Read`, `Glob`, `Grep`, `WebSearch` and `WebFetch` — `Write`
  was taken away. An answer comes back inside the researcher's report, and the PM
  puts the part that has to last into a document it already owns: the opening
  document, a decision record, or a change request. What you notice is that a
  finished job leaves fewer files behind, and that a fact you can still read
  somewhere is a fact somebody decided to keep.
- **QA's cases live in `qa/` at the root of your repository, not in `docs/`.**
  The command is now `bash qa/run-all.sh`, and the standing list of what no case
  can check is `qa/gaps.md`. One task's cases still sit together in their own
  folder, now `qa/<task-id>/`, with a `run.sh` beside them. The reason for the
  move is plain: these are scripts you run, not documents you read, and `docs/`
  should hold the things you read. Nothing else about QA changed — QA still
  writes only inside its own task folder, and `qa/run-all.sh` and `qa/gaps.md`
  are still the PM's files, never QA's.
- **The task table became a folder.** Instead of one long `docs/design/tasks.md`,
  there is `docs/tasks/` with one `T-<n>.md` file per task. Each file carries its
  own Verdicts line and its own DoD section, exactly as a row did. Two roles
  reading two tasks now open two files, and a task that changes touches one file
  instead of one shared one.
- **A question in the opening interview can be left undecided.** Before, every
  question the PM asked wanted an answer. Now a question that would change
  neither what gets built nor what gets released arrives with a second option
  beside the PM's recommended one: leave it undecided. What that buys you is
  written into the rules in as many words — **the thing you set aside is written
  down nowhere.** It does not go into the table of what the interview settled,
  it does not go into "not in scope", and it does not go into a "still
  undecided" list. So asking for it later reopens nothing and costs you no
  argument. **The change-request rule is not loosened by this.** If a later yes
  would move the scope, a DoD item or the milestone list, that is still a change
  of scope, and the PM still stops and asks you.
- **The "not in scope" list has a much harder bar.** A line belongs there only
  when crossing it would force finished work to be built a second time, or do
  something nobody can take back — a package published, a tag pushed, data
  deleted — or leave a safety guard or a permission rule weaker than it was.
  Work the PM simply did not get to does **not** go on that list any more. It
  used to, and the cost was real: a cheap request you made later read like you
  reversing a decision, when in truth nobody had ever decided anything.

### Added

- **The PM now has a written list of what it may write.** Upstream added running
  code for this: a wrapper that refuses a write or an edit on any path that is
  not on the list, and asks the user for that one write. This plugin ships no
  code at all, so the same limit is carried here as words in the skill — the
  paths the PM may write itself (the opening document, change requests, decision
  records, `docs/tasks/`, `qa/run-all.sh`, `qa/gaps.md`, the project's own rules
  file, the principles file, the skill itself and the job state file), and
  everything else refused, with the PM asking you instead. Product code, the
  other roles' files under `agents/`, the interface contracts, QA's cases, the
  READMEs and the project manifest are all outside it: each belongs to a task and
  to a role, so the answer is to write the task and start the role. The list is
  fixed in the skill and is never read out of `docs/tasks/`, so no task and no
  briefing can widen it.
  **Nothing here enforces it.** There is no wrapper, no hook and no check in this
  repository — the words are the whole of it, exactly like the git rule beside
  them. And even where upstream's wrapper does run, it only ever reads the path
  of a write or an edit: a file written through a shell command, `echo x > file`,
  never passes through such a guard at all.

### Documentation

- **Both READMEs are much shorter.** They now hold the title, one short
  paragraph, the version, how to install the plugin, the role table and the
  licence — what you need to decide whether to install it and how to start.
  Everything else moved into `CLAUDE.md`, which is now the **only** copy: the
  design rules, how to edit a role, the list of rules nothing enforces, the
  `PreToolUse` hook snippet you can add to your own settings as a seat belt,
  and where the crew's documents live. Two copies of the same rule drift apart,
  and this release found several places where they already had. If you used to
  read a README for any of that, read `CLAUDE.md` now.
- **The list of rules nothing enforces still has five entries**, and they are the
  rules the **roles** carry in their own prompts. The PM's write limit above is
  counted apart from those five, because upstream keeps that one with code rather
  than with words.
- The `0.4.0` and older sections below still name `docs/qa/`, `docs/research/`
  and `docs/design/tasks.md`. They **stay exactly as they are**: those paths were
  real when those versions shipped, and a published section is a record of what
  was true at the time, not a page to keep up to date.

## 0.4.0

Caught up with [dsh-crew](https://github.com/stuarthu/dsh-crew) **v0.9.0**, the
tagged release, commit `7bc7181`. 0.3.0 matched **v0.7.0**.

**Two changes here loosen what the crew may do to your repository.** They are the
first two items under **Changed**, not buried at the end. Read those two even if
you read nothing else.

### Added

- **The opening interview has a method now, and a point where it stops.** The
  second step used to say "grill the user", and it never said when that was
  finished. It is now a Socratic interview: **one question per turn**, each
  carrying the PM's own recommended answer, and **six kinds of question** to pick
  from — clarify what a word points at, probe an assumption, ask for the reason
  and the evidence, put another view on the table, follow a consequence, and
  question the question itself. Wide questions come before narrow ones, because
  starting narrow only confirms the picture already in the PM's head. The sixth
  kind is the PM's permission to tell you **"I think you may be solving the wrong
  problem"** early, while changing direction is still cheap. **It stops at one
  point you can check**: the moment the PM could write down every section of the
  opening document with no guess left in it. Five questions can be enough and
  twenty can be right; there is no correct number.
- **Two new roles, and a second shape a task can be built in.**
  `crew-test-engineer` writes only the unit tests. `crew-code-engineer` writes
  only the product code. On a task in the **paired shape** the two run at the same
  time, each inside a **git worktree of its own**, on its own branch, and neither
  can see the other's half while it is being written. They never talk to each
  other: no crew role has a tool for messaging another one. What that buys is
  **two independent readings of one document** — where the two halves do not fit,
  the document allowed two readings, and you find that out at the merge instead of
  in production. **This is not pair programming.** Two people at one keyboard are
  meant to converge; these two are meant not to. It is independent verification,
  the kind safety-critical engineering uses. **And it is honest about what a green
  merge means**: the two halves fitting with every test passing proves the two
  readings agreed. It does **not** prove the document was clear, and it never
  proves the document was right. `solo` stays the default, the PM has to say which
  of four reasons a paired task rests on, and two halves that would edit the same
  file cannot be paired at all. This port's own release used `solo` for all
  fourteen of its tasks.
- **The opening document's file name now carries the date and the job**:
  `docs/design/prd-<date>-<job-slug>.md`. Two jobs started on the same day no
  longer write over each other's opening document.

### Changed

- **The crew will now put QA's cases into your project's default test command.
  0.3.0 said it never would.** When QA reports that your test runner cannot see
  `docs/qa/`, the PM adds the one line that fixes it — in a Node project,
  `bash docs/qa/run-all.sh` inside `scripts.test` — to the **default** command,
  not to a second command somebody has to remember, because a suite that runs only
  when remembered rots. 0.3.0 refused this and said so in the section below. The
  refusal was answered rather than repeated: the real risk was a shell script that
  everybody runs and nobody has read, so QA's `run.sh` and its case files are now
  in the **code reviewer's** file list, with a call-back round scoped to those
  files alone, and a `run.sh` that reports success when the case inside it never
  ran is a **blocking** finding — a green that checked nothing is worse than a red.
  Given a real check on the real risk, this is now upstream's shape.
- **A force push can now happen. In 0.3.0 it could not.** It needs **a yes of its
  own, for that one command and that one push**, on every branch and on `main`
  alike, and it is asked again the next time. 0.3.0 refused every force form
  outright and handed you the command to run yourself. Nothing in this plugin
  blocks a force push — it is a sentence in a prompt — so that per-push yes is the
  only thing standing between a suggestion and a rewritten history.
- **Two lanes, not three. The `quick` lane is cancelled.** What is left is `ask`
  (you want an answer, so no crew and no branch) and `team` (a change of any size).
  There is no longer a lane where the PM changes a file by itself with nothing
  written down. **However small the change is, it gets a milestone**: at least one
  task, one round of QA, and one round each of the code, security and document
  reviews. That is affordable because of the next item — a full cycle for a typo
  is minutes. **A milestone is still not a release**: one milestone is one full
  cycle plus one commit, and pushing and tagging each need your own yes every
  single time.
- **QA and the three reviews now run once per milestone, at the end of it.** They
  used to run on every landing. **A task is finished when its own unit tests
  pass** — the failing test shown before the code, the passing test after, the
  project's test command green on a still tree. No reviewer and no QA round holds
  a task open any more, because neither has run yet, and the task's Verdicts line
  says `not run` with a reason instead of pretending. At the end of the milestone
  QA runs first, in two steps: one `crew-qa` turns the DoD sections into a list of
  cases **without reading the code**, so the side being measured does not set the
  questions, and then **one agent writes one case**. The code, security and
  document reviews follow in one parallel round each. **Only the changed part is
  in scope** in any of them. **The cost, said plainly, because you chose it
  knowingly**: one round at the end finds a defect later, with more work sitting
  on top of it, so the rework is wider. QA on every task really did catch things
  earlier. Nothing downstream is allowed to make up for that by widening its one
  round; what it demands instead is that the one round is a **full** one.
- **One word changed, on purpose.** 0.3.0 introduced the distinction between two
  kinds of test, and named the second kind by putting "QA" in front of "test".
  That two-word name is now a **banned** wording: it puts "test" back into a thing
  that is not a test in the project's own suite. The precise word is **case**. Four
  names now do all of the work — a **unit test**, a **case**, **the project's test
  command**, and a **contract test**. The `0.3.0` section below still uses the old
  name twice and **stays exactly as it is**: a published section is a record of
  what was believed at the time, and a rename here touches living documents only.
- **Nine role files, not seven**, and **five** of them hold a shell — the
  engineer, QA, the architect, and the two new paired roles. The four that hold no
  shell are the three reviewers and the researcher.

### Documentation

- **`porting.md`'s deliberate divergence table is now empty.** It held **ten**
  rows going into this release — nine when the `0.3.0` section below was written,
  and a tenth added after it shipped — and each row was a place where this port
  said something different from dsh-crew on purpose. **Eight are gone because
  upstream now says what this port said**, in several cases in this port's own
  words: six were places where upstream contradicted itself, and two were gaps
  neither project had. **The other two are the two loosenings at the top of
  Changed** — the test command and the force push. On those, upstream kept its own
  shape, answered the argument instead of ignoring it, and you chose to follow it,
  each with a yes of its own. So the two projects now say the same thing about
  every rule, and the next port pass cannot read one of these decisions as a
  missed port. `upstream.sums` grew from 15 pinned files to 17, for the two new
  role files, and all 17 verify against the v0.9.0 tag.
- **The whole `docs/` folder is gone from this repository — not only
  `docs/decisions/`.** That takes the decision records of past jobs and also
  **this release's own opening document, its design and its task table**. Every
  reason in them that still holds was written out **in place** first, so nothing
  points at a deleted file any more. The reason for going further is that a pass
  over this repository produces only four kinds of thing that have a home here: a
  mechanism this port has to adapt, and the port's own policy, go to
  `porting.md`; the reasoning behind a rule the two projects share goes to
  `principles.md`; an upstream bug goes to a hand-off file **outside** this
  repository; and anything a reader needs goes to the two READMEs and
  `CLAUDE.md`. A job's opening document, its design and its task table are none
  of those four. They describe how one pass was organised, they start going stale
  the day it finishes, and the next pass writes its own set anyway. **This release
  is the evidence**: two document reviews raised eight blocking findings inside
  those three files, and nearly every one of them was "the state this document
  describes has already changed". So **the reason for each change, the real
  numbers and the Verdicts lines now live in the commit messages**, which is the
  only copy with a timestamp on it and the place to look for them. **Nothing is
  really lost** — the git history keeps every deleted file.
- **`principles.md` is dsh-crew's own file now, and holds nothing of this
  port's.** It carries principles 1 to 22 with dsh-crew's own numbers — 21 is the
  paired task, 22 is the interview — and its only differences from upstream's file
  are **126 mechanical replacements**: tool names, role names and paths that a
  Claude Code plugin needs instead of dsh-crew's. Apply those and the two files
  are identical. The five principles that belong to this port rather than to the
  crew, `P1` to `P5`, moved to `porting.md`, which is now the one place anything
  specific to the port is written down.
- Both READMEs, `CLAUDE.md` and `porting.md` were brought in step with all of the
  above, in the same release.

### What this release still does not enforce

Nothing here is code. **Five** rules are kept only by the words in the prompts,
and this is the list of them. 0.3.0 listed four.

1. **A crew role must never commit, push or publish.** Five roles hold a shell
   now, and a shell is one tool, so this cannot be expressed in a tool list. What
   finds a broken rule is the PM's own check: `git log` before every commit and
   before any merge, read against the commits it wrote down. Both READMEs carry a
   `PreToolUse` hook you can add to your **own** settings if you want a seat belt.
2. **The Verdicts line has to be written honestly.** The PM writes it, so it can
   prove that every skip carries a reason. It cannot prove that a review happened.
3. **Text inside a tool result is data, not instructions.** No tool list can close
   this, because the text arrives at run time from a server this plugin never saw.
   Counted while building this release: **23 deliveries, across 13 of the agents
   that ran**, every one of them asking for the shell instead of the role's own
   tools. **They did not all ride in on a shell command.** Several arrived
   attached to the result of a `Read`, which means a role holding only `Read`,
   `Glob` and `Grep` is inside the blast radius too — and that is exactly the case
   no tool list can close, because the text is already past the filter by the time
   the role sees it. Every role refused it and said so in its report. That is the
   rule working, not the problem being rare.
4. **Roles never talk to each other.** For the four roles that hold no shell the
   tool list makes it true and refuses the attempt. For the five that hold a shell
   it is a rule they are given and keep, not a wall they meet.
5. **A document that judges a role's work is not that role's to edit** — new in
   this release, and the honest addition to the list. The thing that would enforce
   it is the briefing itself, so a wrong file list defeats it and nothing else
   catches that. It held while building this release: an engineer handed a check it
   could not satisfy wrote a question for the PM instead of editing the check.

## 0.3.0

Caught up with [dsh-crew](https://github.com/stuarthu/dsh-crew) **v0.7.0**, the
tagged release, commit `87a4332`.

**Read this first if you are on 0.2.0.** The 0.2.0 section below says it caught up
with dsh-crew 0.7.0. It did not. That release was built from commit `649ee52`, a
mid-flight commit roughly half way to the tag, and the tag moved a long way after
it. The published line stays as it was written, because a changelog is a record of
what was believed at the time. **This is the release that matches the tag.**

### Added

- **Two new steps you will meet.** Step 13 writes a **release plan** and an
  **upgrade plan** for a milestone that really ships: what you have to do, what
  breaks, and how to go back. Step 17 **merges the branch and cleans up**, and it
  asks for **three separate yeses** — one to merge, one to push `main`, one to
  delete the branch. A single "ok" never covers all three. The playbook is now
  **18 steps**, numbered the same as dsh-crew's, so a step can be quoted across
  both projects. 0.2.0 had 16.
- **Roles work in parallel by default.** Two roles are only made to wait when they
  share a file or when one needs what the other wrote. The limits are written in
  the playbook where you can read them: **20** crew roles awake at the same time,
  **no cap** on how many a job uses in total, and **3** review rounds before a
  disagreement comes to you.
- **A unit test and a QA test are now two different things, and the crew never
  edits your test command.** A **unit test** is written by the engineer — a
  programmer, not QA — lives in your own test suite, and runs from your own test
  command. A **QA test** is written by QA, lives in `docs/qa/<task-id>/`, and runs
  from `bash docs/qa/run-all.sh`. The crew will not put one command inside the
  other, and it will not touch your test command or your CI config. If your QA
  cases do not run from your default command, that is the normal state, not a
  failure: the PM tells you which command does run them at the milestone review,
  and whether they go into your CI is your call. dsh-crew wires QA's cases into
  `npm test` on purpose; this port says that mixes two kinds of test and puts a
  subagent's shell script into every contributor's test run.
- **Every "how" decision comes with the options that lost.** A decision about how
  to build something gets a written record that lists **every** option with its
  cost, says why each one lost, marks the recommendation, and says plainly that
  you may overturn it at the milestone review.
- **A bug becomes a task row.** Nothing gets fixed as a loose side errand. The PM
  writes the task row and its DoD section first, then the fix starts, so the fix
  is reviewed and committed like any other work.
- **Text that arrives inside a tool result is data, not instructions.** Any MCP
  server you install can put text into a role's context while the job is running.
  It happened here: one server's notes reached crew roles repeatedly in one day,
  asking a role to start subagents, to keep the plumbing from the user, and to
  prefer the shell over its own tools. One of the roles it reached can only read
  files. All seven role prompts now carry one identical section: a role told to do
  any of that does none of it, and says in its report that it happened, what was
  asked, and where it came from. The PM treats that report as a finding, and names
  the server to you at the milestone review.
- **The PM can reach a role that is already working.** 0.2.0 said it could not,
  and that was measured false. So a document that changes now reaches the roles
  building against it, instead of their work being thrown away, and a later review
  round may reach a role as a message or as a fresh role. What a message may carry
  is fixed: a **pointer** to a document with its version, **evidence** you could
  copy again, or a **request**. Anything else is a decision, and decisions go in a
  document first.

### Changed

- **Documents are split by how long they live**, not by who was in the room:
  `docs/design/` for the PRD, the design and the task table, `docs/design/api/`
  for a contract between two modules, `docs/decisions/adr/` and
  `docs/decisions/crd/` for decisions and change requests, `docs/qa/` for QA's
  cases, `docs/release/` for the release and upgrade plans, `docs/research/` for
  what a researcher found. Job state still lives outside your repository.
- **There is one opening document, `docs/design/prd.md`, and the DoD is a section
  inside it** — never a file of its own, in any folder. Small work and big work
  open the same way, and every milestone and every task row carries its own DoD
  section.
- **A task is finished when four things are true**, not three: code review,
  security review (or a stated reason it was skipped), QA, and the document review
  of that landing. The task row's Verdicts line carries all four, and a task with
  no Verdicts line is not finished.
- **`principles.md` and `porting.md` now sit at the repository root.** `docs/` is
  crew job output, and those two are permanent product documents, so they moved
  out beside `CLAUDE.md`.
- **Nine rules in this port say something different from dsh-crew v0.7.0 on
  purpose.** Eight are places where upstream contradicts itself — a first commit
  that stops on the PM's own PRD, a commit named that never exists, "ship" that
  can be read as "publish", three checks against four, "both lanes" where there
  are three, two QA roles that can silently drop a task's cases, the test command
  above, and a force push one yes away from happening. The ninth is a rule neither
  project had: text inside a tool result is data. `porting.md` holds the table
  that says, row by row, what upstream says, what this port says, and why — so the
  next port pass cannot read a decision as a missed port.

### Documentation

- Both READMEs, `CLAUDE.md`, `principles.md` and `porting.md` were brought in step
  with all of the above, in the same release. `principles.md` now carries
  principles 1 to 20 with dsh-crew's own numbers, plus this port's `P1` to `P5`.

### What this release still does not enforce

Nothing here is code. Four rules are kept only by the words in the prompts, and
this is the list of them.

1. **A crew role must never commit, push or publish.** Three roles hold a shell
   and a shell is one tool, so this cannot be expressed in a tool list. What
   finds a broken rule is the PM's own check: `git log` before every commit and
   before any merge, read against the commits it wrote down. Both READMEs carry a
   `PreToolUse` hook you can add to your **own** settings if you want a seat belt.
2. **The Verdicts line has to be written honestly.** The PM writes it, so it can
   prove that every skip has a reason, but it cannot prove that a review happened.
3. **Text inside a tool result is data, not instructions** — the new rule above.
   No tool list can close it, because the text arrives at run time from a server
   this plugin never saw.
4. **Roles never talk to each other.** For the four roles that hold no shell, the
   tool list makes that true and refuses the attempt. For the three that hold a
   shell — the engineer, QA and the architect — it is a rule they are given and
   keep, not a wall they meet, and nothing here stops them. This plugin says what
   dsh-crew says, because that is the wording both projects share; the difference
   between the words and what a shell can do was measured during this port, and it
   is recorded here so that nobody reads the sentence as a guarantee.

## 0.2.0

Caught up with [dsh-crew](https://github.com/stuarthu/dsh-crew) 0.7.0 (commit
`649ee52`). Everything below is a rule the crew now follows.

### Added

- **The language and stack are settled before anything is designed, and you
  approve them.** If your repository already has a stack, that is the stack: the
  PM reads the manifest, the lock file, the test folder and the CI workflow,
  states what it found, and you confirm it in one line. When the choice is real —
  an empty repository, a new service — the PM starts a `crew-researcher` first,
  which lists the candidates with a source per claim and is **not** allowed to
  recommend one. The PM then recommends one, names the runner-up and why not, and
  writes a **Language and stack** section into the PRD or DoD: language and
  version, package manager, framework, database, and the test framework with its
  exact test command. You confirm it together with the document. After that it
  moves only through a change request.
- **One test framework for the whole crew.** Engineers write their tests with the
  framework that section names, and QA writes its cases with the same one, so the
  tests cannot split in two on an empty repository.
- **Adding a dependency is the PM's call.** An engineer still picks freely among
  the libraries the project already has, but a brand-new package comes back to the
  PM. Engineers may not edit the manifest or the lock file to slip one in.
- **QA's test cases are files you keep.** QA still writes its plan from the
  document before it reads the code, but now every case becomes a real test file
  in your project's own test framework, under `docs/crew/qa/<task-id>/`, with a
  `run.sh` beside it. They are committed with the task, so they outlive the job.
- **One command runs every QA case ever written.** `docs/crew/qa/run-all.sh` finds
  each task's `run.sh` by itself and runs them all. QA runs it on every task it
  checks, so a case from an earlier task guards the new work. A case that used to
  pass and now fails is a blocking regression, and nobody may edit it green.
- **Change request documents (CRDs).** When anyone — you, a crew role, or the PM
  itself — asks for something that changes what you get (the scope, an acceptance
  check, the milestone list, the stack) or how two modules talk, the PM writes
  `docs/crew/crd/NNNN-<short-name>.md` first: who asked, what they want, why,
  which documents and tasks it touches, the cost, and the decision with its
  reason. Nothing is built from an undecided CRD, and a rejected one is kept.
  Small questions and code review findings deliberately do **not** get a CRD.
- **Who decides a CRD.** A contract fix that changes nothing you can see is the
  PM's call. Anything that changes scope, an acceptance check, the stack or the
  milestone list needs your yes.
- **The state file tracks CRDs**, so a session that picks the job up after a
  restart knows which change requests are still undecided.

### Changed

- **An engineer's test must be a file that stays.** It goes in your project's test
  suite, in the naming that project already uses, is named in the task row, and is
  committed with the code. No proving a behaviour with a throwaway command, no
  deleting or weakening a test once it passes, and every test has to pass twice in
  a row.
- **Documents are the only channel.** A role's report points at the file it wrote;
  the PM's answer is a change to a document. In this port that is not a discipline
  but the only option — a role runs once and cannot be messaged. The engineer and
  QA are told to ask for a rule in writing before they build or test it.
- The milestone report now lists every CRD since the last review, and both the
  final report and the milestone report give the numbers from the project's test
  command **and** from `docs/crew/qa/run-all.sh`.
- If your test runner cannot see `docs/crew/qa/`, QA reports it with the exact
  command, the message, and the one config line that would fix it. The PM either
  adds that line or says plainly that those cases cannot run yet. QA never edits
  your project's config and never moves its files into your test folder.
- The team-lane playbook is now sixteen steps, numbered the same as dsh-crew's,
  so a step can be quoted across both projects.

### Documentation

- `docs/principles.md` gains the two principles dsh-crew added — 13 (every test
  lands on disk) and 14 (documents are the only channel, and a change gets a CRD)
  — and its principle 8 is rewritten around the stack decision.
- **The port's own principles are renumbered `P1` to `P5`.** dsh-crew has started
  using 13 and 14, so a plain number would collide. The `P` keeps the shared
  numbers matching for good.

## 0.1.0

First release. A port of [dsh-crew](https://github.com/stuarthu/dsh-crew) 0.6.0
(commit `690e291`) to Claude Code.

**It is markdown and nothing else.** No hooks, no scripts, no code — seven agent
files and one skill file. It runs wherever Claude Code runs, and adds nothing to
a session until it is used.

- Ask for work that is bigger than one small change and Claude loads the
  `crew:team-lane` skill. That makes the session the crew **product manager**:
  it picks a lane (`ask`, `quick`, `team`), writes down what "done" means, gets
  you to confirm it, and runs the work.
- Seven role agents: `crew-researcher`, `crew-architect`, `crew-engineer`,
  `crew-qa`, `crew-code-reviewer`, `crew-security-reviewer`, `crew-doc-reviewer`.
  Reviewers can only read. The engineer and QA keep the shell.
- A role runs once and reports back. A second review round is a fresh role,
  briefed with the earlier round's blocking findings.
- Big work is cut into milestones you approve one at a time. Nothing moves to the
  next milestone until you say so.
- Job state lives in `~/.claude/crew/jobs/`, outside your repository, so an
  interrupted job can be picked up later and your `git status` stays clean.
- There is nothing to build, install or run. `upstream.sums` holds the SHA-256
  of every dsh-crew file this port was made from, so
  `sha256sum -c upstream.sums` in a dsh-crew checkout says what has moved since.

Ported with changes, each one written up in `docs/principles.md`:

- Nothing loads into a session by itself; the skill's description is the entry
  point (principle 14).
- Roles do not stay alive; there is no `send_message` or `interrupt_agent`
  (principle 13).
- The git guard is not shipped as code. A role must never commit, push or
  publish, that rule is in every role prompt that owns a shell, and the README
  says plainly that nothing stops it — plus offers a hook you can add to your own
  settings (principle 15).
- The unfinished-job notice became step 0 of the playbook.
- Nothing checks the design rules. They are written out in `CLAUDE.md` and in the
  "Editing a role" section of both READMEs, where whoever edits a role will see
  them.
