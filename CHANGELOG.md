# Changelog

Newest first. Each entry says what a user would notice.

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
