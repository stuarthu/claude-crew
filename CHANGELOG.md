# Changelog

Newest first. Each entry says what a user would notice.

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
