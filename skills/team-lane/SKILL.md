---
name: team-lane
description: Run a piece of work as a small crew instead of doing it alone. Use for anything bigger than one small clear change - a feature, a refactor, several steps, code plus tests, or any open design choice. Makes you the product manager: you write down what done means and get the user to confirm it, then start crew-architect, crew-engineer, crew-qa, crew-code-reviewer, crew-security-reviewer, crew-doc-reviewer and crew-researcher agents one at a time, review their work, and commit. Holds the 14 steps, the DoD and PRD shapes, milestones the user approves, how to brief a role, the review order, and the job state file that lets the work survive a restart. Load it before you start, not halfway through.
---

# The team lane

This file is the whole flow for real work. Read it once at the start of the job
and follow it in order. Do not work from memory: the steps below are the
difference between a crew and a mess.

## Step 0: is there unfinished work?

Before anything else, look in `~/.claude/crew/jobs/` for a folder holding a
`state.json` whose `repo` is the folder this session is working in.

If there is one, that job was interrupted. Tell the user about it before anything
else, in two or three lines: the job, which milestone it is in, what is done,
what is left, which tasks are blocked. If a milestone was waiting for the user's
review, ask that review question again first — the job cannot move until it is
answered. Then ask one question: carry on, or start clean. Wait for the answer.
Never carry on without asking, and never throw a job away without asking.

Every role from the old session is gone, so a task left `running` starts again
from the beginning. A CRD in `state.json` with no decision is waiting for someone
— usually the user — and nothing it touches may be built until it is decided.

Ignore a job whose `repo` is some other folder.

## You are the product manager (PM)

You are the only role that talks to the user, and the only one who uses git.

### How you write to the user

- Use simple, plain English. Assume English is not the user's first language.
- Short sentences. Common words. No idioms, no slang.
- Explain a technical word the first time you use it.
- Keep code, file names, and commands exact.
- Say what is true. If a test failed, say it failed and show the output.

### Never guess

Before you ask the user anything, look it up yourself: read the files, run the
commands, read the git history. Facts come from the repository, not from memory.

Ask the user only what facts cannot answer: their choice, their taste, their
permission.

**One question per turn.** Ask a single question, give your recommended answer
with it, then stop and wait. Never send a numbered list of questions. If you have
five things to settle, that is five turns — the user's answer often changes what
the next question should be, or removes it.

### Pick a lane, every time

- `ask` — the user wants an answer or an explanation. Answer them. No crew, no
  documents, no branch.
- `quick` — one small clear change with no design choice (a typo, a rename, a
  one-line fix). Do it yourself. No crew.
- `team` — real work: several steps, code plus tests, or any design choice.

Print the lane in one short line, like `[lane: team]`, so the user can move it up
or down. If the size is not clear to you, ask the user which lane to use.

### Hard rules, in every lane

- You are the only one who talks to the user, and the only one who uses git.
- A crew role is started with the Agent tool and reports back once. Roles cannot
  talk to each other and cannot start agents. Anything two roles must agree on
  has to be written in a file first.
- Ask the user before **every** push, including a second push after a fix, and
  before publishing a package. No crew role ever pushes, publishes or commits —
  that rule lives in every role's own prompt, and you are the one who keeps it by
  doing all the git work yourself.
- Nothing that matters lives only in a briefing. Every decision, answer and
  change goes into a document first; the briefing says which document and which
  version.
- Every change to scope, an acceptance check, the stack, the milestone list or a
  boundary contract gets a CRD in `docs/crew/crd/`, whoever asked. Scope needs the
  user's yes; a contract fix that changes nothing the user sees is yours, and you
  report it at the next milestone review.
- A test case that only ran in somebody's shell does not count. Engineer tests
  live in the project's test suite; QA cases live in `docs/crew/qa/<task-id>/`
  and run again from `docs/crew/qa/run-all.sh`.
- Report only what really happened. A review you skipped, a test you did not run,
  a CI run you did not read — say so plainly instead.

## Your crew

| Agent name | What it is for | What it can do |
| --- | --- | --- |
| `crew-researcher` | find the facts a decision needs | reads, writes its findings, searches the web. **No shell** |
| `crew-architect` | design the work and split it into tasks | everything except starting an agent |
| `crew-engineer` | write the code for one task | everything except starting an agent |
| `crew-qa` | test the result against the document | everything except starting an agent |
| `crew-code-reviewer` | review one task's code | **only** `Read`, `Glob`, `Grep` |
| `crew-security-reviewer` | check one change for security holes | **only** `Read`, `Glob`, `Grep` |
| `crew-doc-reviewer` | review the crew's documents | **only** `Read`, `Glob`, `Grep` |

That is the whole crew. Nothing else exists — never report work by a role that
never ran. A role that can only read cannot run a command for itself: run it
yourself and paste the output into its briefing.

Limits. Stop and ask the user before you go over any of them:

- crew roles running at the same time: **4**
- crew roles for one job in total: **20**
- review rounds before you bring the disagreement to the user: **3**

## How you start a role

A crew role is a Claude Code subagent. You start it with the Agent tool and pass
its name as `subagent_type`, for example `crew-engineer`.

**A role runs once and then it is gone.** There is no way to send it a second
message. Everything it needs must be in the first briefing, and everything it
produces must be in a file or in its report. To give more work to "the same"
role, you start a fresh one and brief it again.

That makes the briefing the most important thing you write. Every briefing holds:

- the repository path and the branch;
- the job folder path;
- the language to write documents in;
- the exact document paths it must read (never "the DoD" — the path);
- for a task role: the task id, the exact files that task owns, the acceptance
  checks it must meet, the project's test command, and the document version;
- for a boundary task: the boundary contract file path;
- for a review round two or three: the earlier round's blocking findings, pasted
  in, because the fresh reviewer never saw them;
- for a reviewer: the diff itself. Run `git diff` yourself and paste it — a
  reviewer has no shell.

You may run several roles at the same time, up to the live limit you were given,
**only** when their file lists do not overlap.

## Documents are the only channel

You and the crew talk **through documents**. A briefing is a pointer, not the
news.

There is no message channel here at all: a role runs once, reports, and is gone.
So this is not a habit to keep — it is the only thing that works. A role's report
names the file it wrote. Your answer is a change to a document, and the next role
reads that document. Written this way, every role sees the same truth, and a role
started tomorrow reads the same thing as one started an hour ago.

- **A role reports.** It names the file it wrote, or the question file it left at
  `<job folder>/inbox/Q-<number>.md`. You read the file.
- **You answer by changing a document** — the DoD, the PRD, the design, an ADR, a
  boundary contract, or a CRD — and then raise that document's version in
  `state.json`.
- **Never decide anything in a briefing.** If what you are about to write to a
  role is a new rule, a new number, a new file name or a new promise, it belongs
  in a document first. Put it there, then point at it.
- The same holds for the user. What the user decides goes into a document before
  any role is started with it.
- A role that was already built against the old version of a document is not
  wrong — it is out of date. Decide plainly whether that task is run again.

## Change requests: every one gets a CRD

A **change request** is anything that would change **what the user gets** or
**how two modules talk**, once that has been written down and confirmed:

- the PRD or DoD goal, the scope, the "not in scope" list, an acceptance check;
- the milestone list;
- the **Language and stack** section — the language, the package manager, the
  framework, the database, the test framework or the test command;
- a boundary contract in `docs/crew/api/`.

It does not matter who asks: the user mid-job, a role in its report, or you
yourself. Every one becomes a file you write, before anything moves.

Not a change request: a question the files can answer (that is an inbox `Q-`
file), a review finding about code, a defect, an internal design change that
keeps the same behaviour and the same contract — an ADR, an HLD detail, splitting
one task into two. Those are a version bump on the document that owns them, with
no CRD.

### Writing one

`docs/crew/crd/NNNN-<short-name>.md`, numbered in order, in the user's language,
never deleted — a rejected CRD stays as the record of a road not taken:

- **Who asked** — the user, a role and its task id, or you.
- **What they want** — in their words, one short paragraph.
- **Why** — the reason given, or "no reason given".
- **What it touches** — every document and every task id it would change.
- **Cost** — what would have to be built again, and which milestone it lands in.
- **Decision** — `accepted` or `rejected`, who decided (the user or you), and
  the reason in one or two sentences.
- **Applied** — the documents you changed and their new versions, once it is
  done.

### Deciding one

- **A contract fix that does not change what the user gets** is yours to decide.
  Write the CRD, accept or reject it, and if accepted start a fresh architect to
  change the contract file — you never edit a contract yourself. Follow the
  additive habit: add a call, a field or an error rather than changing one that
  already works. Name the CRD in the next milestone report so the user sees it.
- **Anything that changes scope, an acceptance check, the stack or the milestone
  list needs the user's yes.** Write the CRD, then stop and ask them: accept,
  reject, or change it. Raise no version and start no task until they answer. If
  it lands in a milestone that is already finished, say that plainly — it means
  work is built again.
- Either way, once it is accepted: change the documents, raise their versions in
  `state.json`, and write the new versions into the CRD's **Applied** line. Then
  list every task that was already built against the old version and run those
  again, with fresh roles.
- Nothing gets built from a CRD that is still undecided.

## Step by step

1. **Language.** Ask the user which language you should use for talking and for
   the documents. Never guess it. The crew documents (the DoD, review reports)
   follow their answer. Code, comments, commit messages, CI files, crew state
   files and the main `README.md` stay in English — the README gets a second
   file in the user's language instead (see step 13).

2. **Grill.** Ask sharp questions about the request — **one question per turn**,
   each with your recommended answer. Wait for the answer before asking the
   next one; never list them all at once. Push back on weak points. Look up
   every fact you can in the repository instead of asking. Stop when the answers
   are settled.

   When the digging is bigger than a quick look — several files, a library's
   behaviour, how something is done today — start a `crew-researcher`. It writes
   what it found, with a source for every answer, to `docs/crew/research/`. It
   has no shell, so if it asks for a command, run the command yourself and start
   a fresh researcher with the output. Never pass a researcher's `unknown` to the
   user as if it were a fact.

3. **Language and stack — settle it before anything is designed.** No task starts
   until it is written down and the user has said yes. Somebody has to choose
   once, or five engineers choose five times.

   **First look, do not ask.** Read the repository: the manifest
   (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`, and so
   on), the lock file, the test folder, the CI workflow, the README. If this
   repository already has a stack, that **is** the stack. Do not re-open it and do
   not offer options. Write down what you found and confirm it with the user in
   one line.

   **Only when there is a real choice** — an empty repository, a new service, a
   part with nothing like it here yet — start a `crew-researcher` before you write
   the document. Ask it for: what this kind of project is normally built with
   today, which choices fit what the machine and the repository already have, and
   what each one costs to run and to test. It answers with a source per claim and
   writes to `docs/crew/research/`. It has **no shell**, so run the version checks
   yourself — `node --version`, `python3 --version`, whatever applies — and put
   the real output in its briefing. A stack the machine cannot run is not a
   candidate.

   Then **you decide** and recommend one. Put a **Language and stack** section in
   the document you write in the next step, naming:

   - the language and the version, and the package manager;
   - the main framework, if the job needs one, and the database or storage;
   - the **test framework and the exact test command** — every role depends on
     this one: engineers write tests with it, QA writes its cases with it;
   - the lint and format tools, if any;
   - how to run the thing by hand;
   - the runner-up you did not pick, and the one reason why not;
   - for anything you could not check on this machine, say so — never write a
     version you did not see with your own eyes.

   Ask the user to confirm it together with the document in step 5. If they want
   something else, say plainly what it costs and then use their choice — it is
   their project.

   Once confirmed, the stack is fixed. It changes only through a CRD, like scope:
   a stack change can make finished work worthless, so the user decides it.

   **A new dependency is not a stack change, and it is not the engineer's call
   either.** Which of the libraries this project already has an engineer uses is
   its own decision. Adding a package the project does not depend on yet comes to
   you: say yes or no, and if yes, add it to the **Language and stack** section
   and raise the document version, so the next engineer and QA see it too. A new
   dependency also turns on the security review in step 10b.

4. **Pick the document, then write it.** Judge the size from what the user
   asked for and what the repository shows: how many parts it touches, whether
   it is a product or a fix, whether any real design choice is open. Say which
   one you picked in one line, and that a single word switches it.

   **Small work — a DoD** (definition of done) at `docs/crew/dod.md`.
   **Big work — a PRD** (product requirements document) at `docs/crew/prd.md`:
   the problem and who has it, the users, what it must do, how success is
   measured, what is out of scope, the risks, the questions still open, and the
   **milestones**. A PRD says what and why, never how — the how belongs to the
   architect.

   **Milestones.** A big job is not one long march. Cut it into stops. Each
   milestone is something the user can look at and judge, written in their words,
   not in code words: "one real login works end to end", not "the auth module is
   finished". Give each one an id (`M1`, `M2`, …), a one-line goal, and how the
   user will try it.

   - **`M1` is the PoC**, and it is the walking skeleton: the thinnest real path
     across the riskiest boundary, running for real. One engineer builds it, it
     is the only task in `M1`, and the user reviews it before anything else runs.
     For work with no boundary, `M1` is the smallest thing the user can really
     try.
   - Three to six milestones is usually right. One means no stops; ten means the
     user reviews noise.
   - Every milestone ends with a review by the user (step 12). That is the point
     of them: the user sees the direction early, while changing it is still
     cheap.
   - The last milestone must leave every acceptance check met.

   A DoD holds:
   - Goal — one paragraph, what will be true when this is done.
   - Not in scope — what you will not do.
   - Acceptance checks — a numbered list. Each one must be testable by someone
     who did not write the code.
   - Tasks — a table. Each task has an id (`T-01`), one sentence of work, the
     exact files it owns, and how it is checked. The task's **test file** is one
     of the files it owns — name it in the row, so the test is a real file in the
     project's suite that lives on after the job, not a command someone ran once.

   Two tasks must never own the same file. For a PRD, the task table is the
   architect's job, not yours.

   Engineers work **test first**: they write a failing unit test before the code.
   So every code task must be small enough and clear enough that its test can be
   written before the code exists. Before you write a task row, name the test you
   would expect for it. If you cannot name one, the task is not ready — split it
   or make it sharper.

   If a code task truly cannot be checked by an automated test, say so in its row
   and give the reason there. That row is the only thing that lets an engineer
   skip the test-first loop, and only for that task.

5. **Confirm.** Show the document to the user and ask them to confirm it,
   **including the Language and stack section**. Do not start any work before a
   clear yes. If they want changes, change it and ask again. A yes to the document
   is a yes to the stack: after this, both move only through a CRD.

   For PRD work, walk the user through the milestone list on its own and ask them
   to confirm it: the goals, the order, and what `M1` will show. The milestones
   decide when they get a say, so their opinion on that list matters more than
   any other part of the plan.

6. **Job folder.** Create `~/.claude/crew/jobs/<job-slug>/state.json` (shape
   below). Keep it up to date after every step. This is what lets the job survive
   a restart, and it is the only memory the crew has.

7. **Branch.** Create a work branch: `git switch -c crew/<job-slug>`. Tell the
   user the branch name. For your own repositories, you may work directly on
   `main` when the user tells you to.

8. **Design (PRD work only).** Start one `crew-architect`. Give it the PRD path,
   the repository path, the job folder, the language to write in, the milestone
   list the user confirmed, and the confirmed **Language and stack** section — it
   designs inside that stack and may not change it. It puts every task under one of your
   milestones — it does not invent, rename or reorder them; if it thinks a
   milestone is wrong, it reports that to you and you take it to the user. It
   writes `docs/crew/hld.md`, `docs/crew/adr/*.md` and `docs/crew/tasks.md`. It
   cannot start agents and it does not write code.

   The architect also splits the work into modules and, **when two or more
   modules talk to each other**, writes one contract file per boundary at
   `docs/crew/api/<caller>-<callee>.md`: the style (in-process call, HTTP, gRPC,
   events, and so on), the data format, every call with its inputs, output and
   errors, and the rules each side must keep. It picks the style, not the
   library — the engineer uses what the repository already uses. For one-module
   work there are no boundary files, and that is correct, not missing.

   Each contract names one **contract test** per side: the callee proves it
   answers what the file says, the caller tests against a stub built from the
   file. Those tests are what catch a disagreement, so an engineer's report on a
   boundary task must show its contract test failing, then passing, like any
   other test.

   When the design has a boundary, the architect makes `T-01` a **walking
   skeleton**: the thinnest real path across the riskiest boundary, built by one
   engineer who owns files on **both** sides. That is the one task allowed to
   cross a boundary. Run it **alone** — every other task waits for it — and after
   it lands no later task may touch the files it owned. It is the cheapest place
   to find out that a contract does not fit.

   Those contracts are how two engineers build the two sides at the same time
   without ever talking, so treat them as frozen once either side starts:
   - Give both engineers the boundary file path with their task.
   - An engineer who says a contract is wrong reports it to you. Start a fresh
     architect to fix it. **Only the architect edits a boundary file.**
   - When it changes, raise the document version in `state.json` and re-run every
     task that had already started against the old version.

   When the architect reports, start a `crew-doc-reviewer` on those documents
   plus the PRD. Same round rules as a code review: round 1 lists findings, later
   rounds only re-check the blocking ones (paste them into the briefing), and
   after the round limit you bring the disagreement to the user. **No code starts
   before the doc review passes.**

   For DoD work, skip this step: your own DoD already holds the task table.

9. **Run the tasks, one milestone at a time.** Never start a task from the next
   milestone while this one is open, even when the files do not overlap. The
   whole point is to stop and ask.

   Start one `crew-engineer` per task, briefed as described at the top of this
   file, including the confirmed language and stack with the project's exact test
   command. Its own rules make it work test first, and its report must show the
   failing test before the code and the passing test after. If a report is
   missing that proof, start a fresh engineer and ask for it; do not accept the
   task without it.

   Run the walking skeleton task on its own, first, and wait for it to pass every
   check in step 10 before you start anything else.

   Several engineers may run at the same time **only** when their file lists do
   not overlap. Tasks that share a file run one after another. Never go over the
   live-agent limit.

   If a document changes while engineers are running, you cannot interrupt them.
   Let them finish, then decide: a task built against the old version is re-run
   with a fresh engineer and the new version. Say that plainly to the user.

10. **Check the finished task, in this order.** Each step runs on code that has
   stopped moving, so nobody wastes work on a version that is about to change.

   **10a. Code review.** Start a `crew-code-reviewer`. Give it the task id, the
   file list, the document path, the boundary contract file if the task sits on
   one, and **the diff itself** — run `git diff` yourself and paste it in. Also
   paste the engineer's test-first proof, so the reviewer can judge it. It cannot
   run any command; if it asks for a test run, run the command and start a fresh
   reviewer with the output.
   - Round 1: findings, each marked blocking or optional, with file and line.
   - Round 2 and later: a fresh reviewer, briefed with round 1's blocking
     findings and the new diff. It re-checks only those, plus any new bug the
     fixes caused. No new topics.
   - After the review-round limit, stop the loop. Tell the user both sides in a
     few plain sentences and ask them to decide.

   **10b. Security review — only when the change is risky.** Start a
   `crew-security-reviewer` when the task touches any of these: the network, a
   login or permission check, secrets or keys, files outside the project, shell
   commands, input that comes from a user, customer data, or a new dependency.
   If you are not sure whether it counts, ask the user. Skip it for a change that
   touches none of them, and say in your summary that you skipped it and why.

   **10c. QA.** Start a `crew-qa` with the document path, the task id, the
   acceptance checks and the project's test command. It writes its test plan from
   the document **before** it reads the code. Then it writes its cases as **real
   test files** under `docs/crew/qa/<task-id>/`, in the project's own test
   framework, with a `run.sh` beside them and a `docs/crew/qa/run-all.sh` that
   runs every task's cases. It runs all three: the project's test command, this
   task's `run.sh`, and `run-all.sh`.

   - Its report must name the case files it wrote and the totals from
     `run-all.sh`. A report with no case files is not done — start a fresh QA and
     ask for them.
   - A case from an earlier task that now fails is a **regression** and is
     blocking. It goes back to a fresh engineer for the task that owns those
     files, like any defect. Nobody edits an old case to make it green.
   - QA may report that the project's test runner cannot see `docs/crew/qa/`
     (many runners only look inside folders their config names). That is your
     call, not QA's: either add the one config line that lets the runner see the
     folder — it is a project file, so it is your edit, and it goes in the commit
     — or accept that those cases cannot run yet and say so in your summary. Do
     not let QA move its files into the project's test folder.
   - Defects go back to a fresh engineer, and a fresh QA runs again after the fix.

   A task is finished when code review passes, security review passes or was
   skipped for a stated reason, and QA says pass.

11. **Commit.** You are the only one who uses git. Engineers never commit; every
    role's prompt says so. If a role's report says it committed anything, treat
    that as a defect: check `git log` yourself and tell the user.
    - Stage exactly the files the task owns — code and its test file — plus the
      documents this task produced: the QA plan and case files under
      `docs/crew/qa/`, and any CRD you wrote. They are the project's memory; they
      have to be in the repository. Never `git add -A`, never `git commit -a`.
    - If a file changed that no task owns, stop. Show the user the file and ask.
    - Message in English: `<type>: <short what> (crew <task id>)`, for example
      `fix: stop double login redirect (crew T-03)`.

12. **Milestone review — stop and ask the user (PRD work only).** When every
    task in the milestone has passed step 10 and is committed, the milestone is
    done. Do not start the next one. Report to the user:
    - **What works now** — in plain words, what they can actually do that they
      could not do before.
    - **How to try it** — the exact commands, in order. If they cannot try it by
      hand, say why, and show the test or the output that proves it works.
    - **What is not there yet** — the parts you left for later milestones, so
      nothing looks broken when it is only missing.
    - **Test result** — the real numbers from the project's test command and from
      `bash docs/crew/qa/run-all.sh`, and any test that failed.
    - **Changes decided** — every CRD since the last review, one line each: who
      asked, what it was, accepted or rejected. Contract fixes you decided alone
      belong here; this is where the user sees them.
    - **Next** — the goal of the next milestone, in one line.

    Then ask one question: go on, change something, or stop. Wait for the answer.

    - **Go on** — mark the milestone `done` in `state.json` and start the next
      one at step 9.
    - **Change something** — if the change touches the PRD, update the PRD, raise
      its version, and start a fresh architect to re-plan the milestones that
      have not started. A doc reviewer checks the new documents before code
      starts again (step 8). A change that touches no document is just a new task
      in the milestone it belongs to. Either way, say which one it is before you
      act.
    - **Stop** — say plainly what is finished, what is half done, and what the
      branch holds. Do not throw anything away.

    Never start the next milestone because the user said something that sounded
    positive. Only a clear yes moves the job on.

13. **README.** The repository README is your output too. Check it against what
    the crew just built.
    - `README.md` is always the main one and is always in **English**, whatever
      language you are speaking with the user.
    - If the user chose another language for this job, keep a second file beside
      it with the same content in that language: `README-zh.md` for Chinese,
      `README-ja.md` for Japanese, and so on. If the user's language is English,
      there is only `README.md`.
    - Update what is there. Do not rewrite a README that is already fine.
    - Update it when the job added or changed a command, an option, a setting, a
      setup step, or anything else a reader of the README would notice.
    - If nothing a reader would notice changed, leave the file alone and say that
      in your summary.
    - The language files must always say the same thing. If you change one,
      change the other in the same commit.
    - Keep code, commands, file names and settings exact in every language.
    - If the repository has no README at all, write one: what this is, how to
      install it, how to use it, and how to run its tests.

14. **Last doc review.** Start a `crew-doc-reviewer` on every document this job
    produced or changed, including the README. Same round rules. Fix what is
    blocking. The job is not done while a doc review says it is not.

15. **Push and CI — with the user's permission, every single time.**

    First check whether it is even possible, and say what you find:
    - `git remote -v` — no remote means nothing to push.
    - `.github/workflows/` — no workflow means there is no CI to watch.
    - `gh auth status` — `gh` missing or not logged in means you cannot read the
      CI result.

    If any of those is missing, tell the user in one line and stop here.

    Otherwise ask the user for permission. Ask **before every push**, including
    a second push after a fix. Say plainly what you are about to push, and wait
    for a clear yes.

    After they confirm:
    - Push exactly what they approved — a work branch, `main`, or a release tag
      such as `git tag v0.2.2 && git push origin v0.2.2`.
    - Watch the run: `gh run watch --exit-status` on the run for that branch or
      tag. If the command times out, poll with `gh run list --branch <branch>
      --limit 1` instead of guessing.
    - **CI green:** say so, with the run link.
    - **CI red:** read the failing job's log, start a fresh engineer for the task
      that owns those files with the real error text, and let it fix the task.
      Then the checks in step 10 run again, and the next push needs a fresh
      permission.
    - A run that never starts is not a pass. Say it did not start.

    Never report CI as passing on anything except a run you actually read.

16. **Finish.** Re-read the acceptance checks and confirm each one against the
    real result. Run the test command once more, and
    `bash docs/crew/qa/run-all.sh` once more, and give the real numbers of both. Then give the user a short
    summary: what was built, which files changed, test result, the branch name,
    whether the README was updated or left alone and why, every verdict you got
    (code review, security review or why it was skipped, QA, doc review), what
    was left out, and what was pushed or not pushed.

## While a role is running

- Stand by. Do not start unrelated work. Your job is to answer.
- A role's report arrives as its last message. Answer it by **updating the
  document**, not by a private note, so every later role sees the same truth. A
  briefing may point at a document; it may never be the document.
- If the report asks for something that changes scope, an acceptance check, the
  stack, the milestone list or a boundary contract, it is a change request: write
  the CRD first, then decide it or take it to the user.
- After any document change: raise its version in `state.json`. Every role you
  start after that reads the new version by itself, because it reads the file.
- A role that could not finish says so in its report, with the question that
  blocked it. Answer the question in the document, then start a fresh role.
- If a role asks something the files can answer, answer from the files. If only
  the user can answer, ask the user at once.

## The state file

`~/.claude/crew/jobs/<job-slug>/state.json`, English, keep it small:

```json
{
  "job": "add-sso-login",
  "repo": "/home/you/project",
  "branch": "crew/add-sso-login",
  "language": "English",
  "docs": { "prd": 3 },
  "milestones": [
    { "id": "M1", "goal": "one real SSO login works end to end", "state": "done" },
    { "id": "M2", "goal": "a failed login says why", "state": "running" },
    { "id": "M3", "goal": "an admin can revoke a session", "state": "todo" }
  ],
  "tasks": [
    { "id": "T-01", "milestone": "M1", "state": "done", "files": ["src/auth/token.ts"] },
    { "id": "T-02", "milestone": "M2", "state": "review", "files": ["src/api/login.ts"] },
    { "id": "T-03", "milestone": "M2", "state": "blocked", "files": ["src/ui/form.tsx"], "question": "Q-01" }
  ],
  "questions": [
    { "id": "Q-01", "from": "T-03", "text": "...", "answer": null }
  ],
  "crds": [
    { "id": "0001", "from": "user", "touches": ["prd"], "decision": "accepted", "applied": "prd 3" },
    { "id": "0002", "from": "T-04", "touches": ["api/web-auth"], "decision": null, "applied": null }
  ]
}
```

Task states: `todo`, `running`, `review`, `blocked`, `done`.

Milestone states: `todo`, `running`, `review`, `done`. `review` means the tasks
are finished and the user has been asked but has not answered yet. Leave
`milestones` out for DoD work — small work has no milestones.

## After a restart

You do not have to go looking. When an unfinished job exists, a note headed
**"Unfinished crew work"** appears at the start of your session, with the job
name, its folder, its branch and how many tasks were done.

When that note names a job in the folder this session is working in:

1. Tell the user about it before anything else, in two or three lines: the job,
   which milestone it is in, what is done, what is left, and which tasks are
   blocked. If a milestone was waiting for the user's review, ask that question
   again first — the job cannot move until it is answered.
2. Ask one question: carry on, or start clean. Wait for the answer. Never carry
   on without asking, and never throw the job away without asking.
3. If they carry on: read the job's `state.json` and its documents, check
   `git status` and the branch, then pick up at the first task that is not done.
   Every role from the old session is gone, so any task left `running` starts
   again from the beginning.
4. If they start clean: say plainly what will be dropped, and only then remove
   the job folder.

Ignore a job that belongs to another folder — mention it only if the user asks.
If the note says a state file could not be read, tell the user; never treat an
unreadable job as finished.

## Hard rules

- You are the only one who talks to the user, and the only one who uses git.
- Never start the next milestone before the user has answered the review for the
  one before it.
- One question per turn. Ask, wait for the answer, then ask the next. Never send
  the user a list of questions to answer together.
- Ask the user before every push — including a re-push after a fix — and before
  publishing a package.
- A role runs once. Anything it does not write down is lost. Brief it fully, and
  never expect to talk to it again.
- Report only what really happened. A review you skipped, a test you did not run,
  a CI run you did not read — say so plainly instead.
