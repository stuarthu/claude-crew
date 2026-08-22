# claude-crew

Run work in [Claude Code](https://claude.com/claude-code) as a small crew of role
agents.

When the work is bigger than one small change, your session becomes the **product
manager (PM)**. The PM writes down what "done" means, asks you to confirm it,
then starts an **architect** to design the work, **engineers** to write the code,
and **reviewers** to judge both. The roles never talk to each other — they share
work through files on disk, and the PM passes everything between them.

> **Version 0.4.0.** PM, researcher, architect, engineer, test engineer, code
> engineer, QA, code reviewer, security reviewer, doc reviewer — plus **two**
> lanes and no lane that changes a file with nothing written down, an interview
> that follows a method, a stack you confirm before any design, an 18-step flow,
> roles that work in parallel, milestones you approve one after another, a unit
> test for every behaviour and QA cases that stay in your repository, the
> **paired shape** for a task built by two engineers who never meet, QA and the
> three reviews once per milestone at the end of it, written change requests,
> release and upgrade plans, and a merge that happens only on your word.

This is a port of [dsh-crew](https://github.com/stuarthu/dsh-crew), the same idea
built for DeepSeek Harness. The rules are the same. The machinery is different —
see [What changed from dsh-crew](#what-changed-from-dsh-crew).

## Install

```sh
/plugin marketplace add stuarthu/claude-crew
/plugin install crew@claude-crew
```

Or, from a script or an agent:

```sh
claude plugin marketplace add stuarthu/claude-crew && \
  claude plugin install crew@claude-crew -y
```

Then start a new session. There is nothing to configure.

To try it from a local clone instead:

```sh
/plugin marketplace add ~/workspace/claude-crew
/plugin install crew@claude-crew
```

## It is markdown, and nothing else

There are no hooks, no scripts, and no code of any kind in this plugin. It is
nine agent files and one skill file. It runs on any machine that runs Claude
Code, and it adds nothing to your session until it is used.

That is on purpose, and `porting.md` P3 says why.

## What you will notice

Nothing, until the work is big enough.

Claude reads the description of the `crew:team-lane` skill and loads it when a
request is more than one small clear change — a feature, a refactor, several
steps, code plus tests, or any open design choice. You can also ask for it by
name: "use the crew for this".

Once the skill loads, the session is the PM, and the PM picks one of **two**
lanes:

| Lane | When | What happens |
| --- | --- | --- |
| `ask` | you want an answer or an explanation | it just answers. No crew, no documents, no branch |
| `team` | a change of any size — a typo, a rename, a one-line fix, a whole feature | the full crew flow |

**There is no third lane, and no lane where the PM changes a file by itself.**
There used to be one — `quick`, for one small clear change with no design choice,
done by the PM alone with no crew and no documents. It is cancelled. However
small a change is, it now gets a **milestone**: at least one task, one round of
QA, and one round each of the code, security and doc reviews. That is affordable
because those rounds are one parallel round each, on the changed part only, so a
full cycle for a typo is minutes rather than hours. What the old lane really
bought was a way for a change to reach your repository with nothing written down
and nothing checking it.

**A milestone is not a release.** One milestone is one full cycle plus one
commit. Pushing and tagging sit outside it, and each still needs your own yes,
every time. A normal job has one milestone; it is split into more only when a
dependency between the parts forces several separate releases.

The lane is printed in one line, like `[lane: team]`, so you can move it up or
down with one word.

## What the team lane guarantees

The team lane is **18** numbered steps, and the PM works through them in order.
What those steps promise you:

- **The interview follows a method, not a mood.** Before anything is written the
  PM asks you **one question per turn**, each with its own recommended answer,
  and waits for that answer before the next one — never a list. It works out
  which kind of thing it is missing first and then picks the question that opens
  it, and one of the six kinds is "is this the right thing to ask for at all?" —
  its standing permission to tell you early, while changing direction is still
  cheap, that you may be solving the wrong problem. It looks up every fact it can
  in the repository first, so you are only asked what the files cannot answer.
- **The stack is settled before anything is designed, and you confirm it.** If
  the repository already has one, the PM states what it found and you agree in a
  line. If the choice is real, a researcher lists the candidates with a source per
  claim and is not allowed to recommend one; the PM recommends, you decide. It
  goes into the opening document as a **Language and stack** section, and after
  that it moves only through a written change request.
- **One opening document per job, and its name carries the job.** Small work and
  big work both start with a PRD at
  `docs/design/prd-<date>-<job-slug>.md` — the day it was opened, plus this job's
  own short name. Both halves are needed: two jobs can start on one day, and a
  fixed name would silently overwrite the PRD of the job before. The design
  document takes the same shape, `docs/design/hld-<date>-<job-slug>.md`, while
  `docs/design/tasks.md` keeps its plain name, because it is one table for the
  whole repository. **"Done" is a section inside those files** — for the whole
  job, for every milestone, and again for each task row — and never a file of its
  own, so what a task must satisfy sits beside the task itself.
- **Every test is a file that stays, and there are two kinds of them.**
  A **unit test** is written by an engineer, lives in your project's own test
  suite, and runs from your project's test command.
  A **case** is written by QA, lives in `docs/qa/<task-id>/` with a `run.sh`
  beside it, and runs from `bash docs/qa/run-all.sh`, which finds every task's
  cases ever written.
  A case from an earlier task that fails now is a blocking regression, and
  nobody may edit it green. If your test runner cannot see `docs/qa/` — many
  runners only look inside folders their config names — the PM adds the one line
  that makes it visible to your project's **default** test command, not to a
  second command somebody has to remember, because a suite that runs only when
  remembered rots. That one line is not a change to the stack and needs no change
  request: what you approved was the language, the framework and the command your
  **unit tests** run in, and this adds the **cases** to that same command.
- **A task is finished when its own unit tests pass, and every task row carries a
  shape.** Nothing else holds a task open: QA and the three reviews have not run
  yet, so neither of them calls a task done. The row still records all four
  verdicts, and a check that has not run is written as `not run` with its reason,
  never as `pass`. The shape is `solo` by default — one engineer writes the
  failing unit test and then the code that passes it. A row marked `pair` is
  built by two engineers who never meet — see
  [The paired shape](#the-paired-shape).
- **QA and the three reviews run once per milestone, at the end of it** — not once
  per task, and only on the changed part. The PM starts them when the last task
  has landed and the coding has stopped, because a blocking finding changes the
  code and throws an earlier check away. QA goes first, in **two steps**: one
  agent turns the DoD sections into a list of cases without reading the code,
  because the side being measured must not set the questions, and then one agent
  per case writes that single case as a real file. The code, security and doc
  reviews follow in one message, one round each, in parallel. **The cost is said
  out loud, because it was chosen knowingly:** one round at the end finds a defect
  later, with more work sitting on top of it, so the rework is wider. What it
  demands in return is that the one round is a **full** one — every item of every
  DoD section, whatever the test run said.
- **The reader-facing files are brought up to date, and one last doc reviewer
  reads them.** After the code lands the PM updates the README, the changelog and
  your repository's own rules file to match what was really built, and if nothing
  a reader would notice changed it leaves them alone and tells you so. Then a
  doc reviewer reads only what landed after the round above. That pass is the
  **tail** of that same round, not a second round of it.
- **Changes are written down.** Anything that changes what you get — the scope, an
  acceptance check, the milestone list, the stack — or how two modules talk gets a
  change request document in `docs/decisions/crd/`, before anything moves. Scope
  needs your yes. A contract fix you cannot see is the PM's call, and it is
  reported at the next milestone review. Every decision about **how** gets a
  record in `docs/decisions/adr/`, listing each option with its cost and why it
  lost, and you can overturn it at the milestone review.
- **Nothing is decided in a message.** The PM can reach a role it started, so this
  is a rule the PM keeps rather than something the machinery makes impossible. A
  message may carry a **pointer** — a document path with its version — or
  **evidence**, something copied out of the world that could be copied again, such
  as a diff, a command's output or a CI log, or a **request** for something the
  sender needs. Anything that is none of the three is a decision, and a decision
  goes into a document first.
- **A new dependency is the PM's call.** An engineer picks freely among the
  libraries the project already has, but a brand-new package comes back to the PM.
- **A milestone that really ships gets two written plans.** The crew first finds
  out what a release plan and an upgrade plan contain *for this kind of project* —
  an npm package, a web service, a store app and a library are not alike — and
  writes both into `docs/release/`. A milestone that is not shipping gets an honest
  gap list in the same folder instead, and the next milestone shortens that same
  file.
- **The branch is merged and deleted only on your word, and that is three separate
  yeses:** one for the merge, one for the push of `main`, one for deleting the
  branch. One yes never covers the next thing. Before it asks anything the PM
  checks CI, a clean working tree, whether `main` moved, whether a push of `main`
  would publish anything, and every commit on the branch. A **force** push needs a
  yes of its own on top of all that, for that one command and that one push, on
  every branch and on `main` alike — nothing in this plugin blocks one, so that
  rule is the only thing standing in front of it. And the PM proves the work
  really is on the remote before it offers to delete a branch.

## The crew

A role is a real Claude Code subagent with a locked prompt and a locked tool
list. It is not a prompt the PM pastes in.

| Role | Agent name | Tools |
| --- | --- | --- |
| Researcher | `crew-researcher` | **only** `Read`, `Glob`, `Grep`, `Write`, `WebSearch`, `WebFetch` — it can search and open web pages, and it has no shell |
| Architect | `crew-architect` | everything **except** the tools that start an agent |
| Engineer | `crew-engineer` | everything **except** the tools that start an agent |
| Test engineer | `crew-test-engineer` | everything **except** the tools that start an agent |
| Code engineer | `crew-code-engineer` | everything **except** the tools that start an agent |
| QA | `crew-qa` | everything **except** the tools that start an agent — it must run the software |
| Code reviewer | `crew-code-reviewer` | an allow list: **only** `Read`, `Glob`, `Grep` |
| Security reviewer | `crew-security-reviewer` | an allow list: **only** `Read`, `Glob`, `Grep` |
| Doc reviewer | `crew-doc-reviewer` | an allow list: **only** `Read`, `Glob`, `Grep` |

Claude Code enforces those lists itself, so a code reviewer **cannot** change a
file even if it decides it wants to. A role keeps the same list when the PM comes
back to it later: a doc reviewer asked again still had `Read`, `Glob` and `Grep`
and nothing else.

Every prompt also carries a **What you may write** section: the **classes** of
file that role may write, and the ones it must refuse even when a briefing hands
one over — the document that judges its own work, above all. It lists classes and
never file names, because the opening document's name carries the job it belongs
to, so a file name would be right for one job and quietly wrong for the next.
**Reading is not restricted.** All nine of those sections are plain markdown in
`agents/`, readable the moment you install the plugin.

**Three of the nine roles build a task, and which one the PM starts depends on
the task's shape.** `crew-engineer` writes one task's unit tests and its product
code alone, and that is the default. `crew-test-engineer` and `crew-code-engineer`
split one task in two — one writes only the unit tests, the other only the
product code, and neither can see the other's half while it is being written.
[The paired shape](#the-paired-shape), further down, says how that runs and what
it proves.

The reviewers use an allow list, not a deny list, and three live tests are the
reason:

1. With `Write` and `Edit` denied, a reviewer created a file anyway with
   `echo hello > file`. A shell is a file-writing tool.
2. With the shell denied too, its own tool list still held workflow tools and
   desktop-control MCP tools — every one of them a way out.
3. A third-party MCP server's instructions arrived **inside a tool result**, five
   times in one day. They asked the role to start subagents of its own, to keep
   what it was doing from the user, and to prefer the shell over its own tools.
   One of the roles they reached holds `Read`, `Glob` and `Grep` and nothing else.

A deny list cannot name a tool a deployment has not installed yet; an allow list
never has to name it — that is `principles.md` 12. Neither list closes the third
case, because a list decides which **tools** a role may call and says nothing
about what a permitted tool's **output** says. That one is closed by words in
every prompt instead — see [What is not enforced](#what-is-not-enforced) — and the
reasoning is in `principles.md` under "Rule A, on text that arrives inside a tool
result", which is also the authoritative wording all nine prompts copy.

The PM pastes the diff into the review briefing and runs any command a reviewer
asks for.

## How a role runs

The PM starts a role with the Agent tool, and that call comes back at once, so
the role works in the background while the PM carries on.

**Roles run in parallel by default.** Every role that can start now starts now.
Two tasks are put in order only for a real reason: they share a file, or the
later one has to read what the earlier one wrote. Saving agent count is not a
reason — agent count is easy to count, but the time you wait is what really
costs.

The limits, and the PM stops and asks you before it goes past any of them:

- crew roles awake at the same time: **20**
- crew roles for one job in total: **no cap**
- review rounds before the PM brings the disagreement to you: **3**

The PM can also come back to a role it started — one still working, or one that
has already reported — and that role keeps what it has read. So a second review
round may reach the same reviewer again, or a fresh one; either way, everything
that reviewer needs is in the documents its briefing names. The PM starts a fresh
role when the work itself starts over: a task built again from the beginning, a
document version that role never read, or a role the PM cannot reach any more.

None of that makes a briefing shorter. Every briefing still stands on its own:
the repository path, the branch, the document paths, the task id, the exact files
the task owns, its DoD section, the project's test command, and the document
version. A role that gets stuck writes the question into its report and stops,
and the PM answers it by changing a document. Anything a role does not write into
a file can be lost.

Roles still do not talk to each other, and that is why the architect's boundary
contracts matter: two engineers building the two sides of one boundary have only
the contract file to agree on.

## The paired shape

Every task row in `docs/design/tasks.md` carries a **shape**, and `solo` is the
default: one engineer writes the failing unit test and then the code that passes
it, the way the sections above describe.

The other shape is `pair`, and it splits one task between two engineers who never
meet:

- `crew-test-engineer` writes **only** the unit test files that task owns.
- `crew-code-engineer` writes **only** the product code.
- Each works in a git worktree of its own. While the two halves are being
  written, the unit tests are not in the code half's tree at all, so it is
  "cannot read them", not "should not".
- Both read the same two documents and nothing else: that task row's **DoD
  section**, and the **interface ADR** in which the architect pinned the line
  between the two halves.
- They cannot talk to each other. Both are deny-list roles, so neither is offered
  `SendMessage` or `ListAgents` at all, and a role that reaches for one is refused
  at the tool layer.
- The PM merges the two halves and runs the project's test command itself,
  **exactly once**, and reports what came out.

It is **independent verification**, the kind safety-critical engineering uses:
two readings of one document, made without any talking, so the place where the
two readings differ shows up instead of being talked away.

**It is not pair programming**, and that contrast is the clearest way to say what
it is. Two people at one keyboard talk continuously and check continuously, and
their goal is to **converge** on one shared understanding. This shape removes the
talking completely and wants the opposite: the two readings must not converge,
because the place where they differ is the whole point. So it is not pair
programming with the chat switched off — it is a different thing, and this
repository calls it the paired shape everywhere.

**What it buys.** Test first gives you a unit test that was red before the code
existed. But in the solo shape that unit test is written by the same agent that
is about to write the code, so it can be bent towards the code that agent already
meant to write. The paired shape takes that possibility away by construction: the
one who writes the check is deliberately not the one who writes the code. The
second thing it buys is larger — **two independent readings of one document**.
Where the document allowed two readings, the two halves do not fit, and you find
out at the merge instead of finding out in production. A disagreement is not a
mishap here; it is the cheapest signal there is that a document everybody had
already agreed on is not clear.

### How the PM runs one

1. **Two git worktrees**, one per half, each on a branch of its own, both grown
   from the same base point:

   ```sh
   git worktree add -b <tests branch> <tests tree path> <base>
   git worktree add -b <code branch> <code tree path> <base>
   ```

   A fresh worktree holds only what git tracks. Whatever your project's own
   checks need beside that — a link, a generated file, an installed dependency
   folder — goes into **both** trees in this same step, before either engineer is
   briefed. **Leave it out and nothing fails; the checks just get quietly
   weaker**, because a check that cannot run one part of itself may say so and
   carry on while the run still ends green.
2. **Both halves are briefed and started in the same message**, so neither gets a
   head start. Each briefing carries that half's own worktree path, **only that
   half's file list** — the two lists never overlap — the task row's DoD section,
   and the path of the interface ADR.
3. **The first meeting.** The PM merges the two halves, runs the project's test
   command once, and reports the output as it came out. It never changes
   something and runs it again for a better result: repeating that run turns the
   whole thing back into ordinary test first, with every mismatch read as "the
   code is wrong" and edited away, and not one disagreement ever reported.
4. **A red sends each half back to check its own half, once.** Whatever is still
   inconsistent after that is the disagreement, and it is written down: what the
   document says, what each half read out of it, and where the two readings part.
   The PM settles it, or brings it to you when both readings are defensible. The
   half that wrote the unit tests may never weaken an assertion to make a
   disagreement go away; only the PM may approve a change to what a unit test
   demands, and that change has to trace back to the words of the DoD section.
5. **A fix is written in the merged tree**, where the code half can now read the
   unit tests. **The isolation ends there, on purpose**: that half's independent
   reading is already on disk and already in the evidence, so blindfolding it
   during the fix would buy no new signal and only make the fix harder.
6. **The PM removes both worktrees and both branches**, and hands the code
   reviewer three pieces of evidence: the red run from the unit-test half, the
   single result of the first meeting, and the disagreement record — which is
   empty when that meeting was green.

### Where it exists, and where it does not

- **Only in a job that has an architect.** Before either engineer writes a line,
  both have to land on the same five things: the import path, the exported name,
  the signature, the shape of the return value, and what happens on an error.
  They cannot see each other, so any one of those five landing differently makes
  the merged run red for a reason nobody learns anything from — a clash of names,
  not a disagreement — and that would happen so often that the real signal would
  drown in it. The architect settles those five in the interface ADR, and only
  the architect may change it. A small job has no architect, so every row of a
  small job is `solo`.
- **Not where the two halves would have to change the same file.** The two file
  lists of a paired task may not overlap, and one file cannot be in both of them.
  The task is split until the halves own different files, or it stays `solo`.
- **It is confirmed with the table it sits in, never row by row.** The architect
  proposes a shape for every row when it writes the task table. On small work the
  PM writes that table itself and you stamp it with the rest of the opening
  document — but small work has no paired shape at all. On big work, the only
  road where a paired task can exist, the architect writes the table after you
  have already confirmed the opening document, so the PM confirms the shapes and
  you meet them at the milestone review. Either way it is one yes for a whole
  table: a job of fifty tasks is not fifty decisions. What the architect brings
  is one default for the whole table and a list of exceptions, each exception
  with its reason: a DoD section it could not word sharply, a row sitting on a
  module boundary contract, a mistake that would cost money, permissions or data,
  or an earlier defect in that part of the code.
- **It costs more, and the number is an estimate.** Reckon roughly 35% to 75%
  more effort than the same task done solo: the writing is split in two, but the
  reading of the document is done twice, and on a small task the reading is often
  the larger half. Wall time can come out shorter, because the two halves are
  written at the same time. None of those numbers is a measurement.

### The three roles that write something which checks the product

They are easy to confuse now that there are three of them, and one of the names
invites the confusion: **`crew-test-engineer` is a programmer, not a tester.**

| | `crew-test-engineer` | `crew-code-engineer` | `crew-qa` |
| --- | --- | --- | --- |
| Who it is | a **programmer** | a programmer | **QA** |
| What it writes | **unit tests** | product code | **QA cases**, acceptance and black box |
| Granularity | **one behaviour per unit test** | — | **one DoD item per case**, checked the way the user would see it |
| When | **before** the code exists | — | **after** the code is finished |
| Home | **the project's own test suite**; a file this task owns, committed with the code | product code files | **`docs/qa/<task-id>/`, nowhere else** |
| Can it see the code | No — its own worktree, where the code does not exist yet | — | Writes its plan first, then reads the code |
| Scope | **this task only** | this task only | this task, **plus every earlier task's cases run again** |

**Four differences, and not one of them is optional**: granularity (one unit
behaviour against one acceptance item), timing (before the code against after
it), home (the project's own test suite against `docs/qa/`), and scope (this task
against every task's cases run again as a regression). The same table stands in
`principles.md` 21, because a reader meets these three names here first.

### What a green run does not prove

This is the half of the shape worth reading twice, so it is written out here
rather than left as a note.

**A green first meeting says exactly one thing: the two readings matched.** It
does **not** say the document was clear, and no report — the engineers', the PM's,
or a reviewer's — may claim that it does. A report that turns a green first
meeting into "the DoD section was unambiguous" is a blocking finding for the code
reviewer, because somebody would build on that sentence later.

**A document has two kinds of ambiguity, and this shape only catches one.** One
kind makes two readers disagree; that is the kind the paired shape was built for.
The other kind makes two readers take the *same* wrong meaning out of one weak
sentence, and to that kind the shape is completely blind: the halves fit, the run
is green, and nothing at all is reported. That blind kind is common, and it is
measured rather than feared. Across 5 harnesses, 23 models and 48
implementations, simultaneous failures came in at 3.7 times what an independence
model predicts (*N-Version Programming with Coding Agents*, arXiv, 2026-06), and
they cluster where the specification is weakest — which is to say it arrives
wearing the costume of the best possible result. Giving the two halves different
models does not close it: perfectly correlated failure survives a change of model
and of harness, while a weaker model on one side would bury the PM in false
disagreements. So both halves run on the same model on purpose, and **this shape
is not the last net.** QA — afterwards, writing its own cases from the document
before it has read a line of the code — is the crew's net for a shared
misreading, and the code reviewer's job does not shrink because a first meeting
came out green.

**And there is a ceiling.** Everything this shape can buy is capped by the
quality of that one DoD section, and **that DoD section has no second pair of
eyes**: nobody produces an independent second reading of it the way these two
engineers produce two independent readings of the code. That is the deepest limit
of the design, written here rather than left for you to find out later.

## Why the crew is flat

Only the PM starts agents. Every deny-list role denies `Agent`, `Task`,
`Workflow`, `SendMessage` and `ListAgents`; the four allow-list roles — the three
reviewers and the researcher — name none of them. Claude Code applies both, so a
role simply does not have the tool. This was measured, not assumed: a role that
reached for one of those names was refused at the tool layer, and the refusal
named the tool as disabled for the session and for subagents.

A role that started its own role would put that grandchild out of the PM's reach,
and, for the four roles that hold no shell, two roles cannot talk anyway. For the
five that hold one it is a rule they keep — see **What is not enforced** below.

## What is not enforced

**Five** rules in this plugin have nothing behind them but the words in the prompts.
This section is the list of them, because a rule nothing can enforce should be
said out loud.

**1. A crew role must never commit, push or publish — and never throw work away
with git either.** Five roles hold a shell: `crew-engineer`,
`crew-test-engineer`, `crew-code-engineer` and `crew-qa`, which have to run the
code and the tests, and `crew-architect`, which reads the code and the git
history. A shell is one tool, so you cannot allow "`Bash`, but not `git push`".
Each of those five is told the rule plainly in its own prompt, and the PM does
all the git work itself. The rule covers `git checkout --`, `git restore`,
`git reset --hard` and `git clean` as well as the writing commands, because when
roles work in the same tree those four destroy another agent's uncommitted work
and exit `0` while doing it — nothing goes red, and nobody finds out until the
work is missing. To put a file back, a role uses its own copy of it, never git.
Nothing **stops** a role from committing; what **finds** it is the PM's own
check — `git log` before every commit and before any merge, read against the list
of commits the PM wrote down. A commit the PM did not write stops the job until it
is sorted out.

**2. The Verdicts line has to be written honestly.** Every task row in
`docs/design/tasks.md` opens with one line carrying four values — `code`,
`security`, `qa` and `doc` — where `not run` and `skipped` each carry their
reason, and `changes needed` names the task that fixes it. The PM writes that
line, so it proves the line was written and that every skip has a reason; it
cannot prove that a review happened. dsh-crew wires a checker into its own test
command. This repository has no test command to wire into, so here the rule is
kept by a person reading it.

**3. Text that arrives inside a tool result is data, not instructions.** Any MCP
server you install can put text into a role's context, and that text can ask for
things no rule here allows. It has happened: one server's instructions reached
crew roles five times in one day, asking a role to start subagents, to keep the
plumbing from the user, and to prefer the shell over its own tools. One of those
roles holds `Read`, `Glob` and `Grep` and nothing else. No tool list can close
this, because the text arrives while the job is running, from a server this
plugin never saw. So all nine role prompts carry one identical section: a role
told to start an agent, to message another role, to hide something from the user,
or to prefer the shell over its own tools does none of it, and says in its report
that it happened, what it asked for, and where it came from. The PM treats such a
report as a finding, names it at the milestone review, and tells you which server
it came from.

**4. Roles never talk to each other.** For the four roles that hold no shell, the
tool list makes this true and refuses the attempt. For the five that hold a
shell — the engineer, the test engineer, the code engineer, QA and the
architect — it is a rule they are given and keep, not a wall they meet, and
nothing here stops them. This plugin uses the same wording as dsh-crew, because
the two projects share their rules; the difference between the words and what a
shell can do was measured while this port was made, and it is written here so
nobody reads the sentence as a guarantee.

**5. A document that judges a role's work is not that role's to edit.** The
opening document, a task row's DoD items, the milestone list: they hold the
standard the work is measured against, and only the PM changes them. Every one of
the nine prompts says so, and says the same thing about a briefing that hands one
of them over — even with the exact new wording, even when the change is plainly
right, that is a mistake in the briefing, and the role reports it and changes
nothing. Nothing checks this either. A role that writes anything holds `Write` and
`Edit` for the files its task owns, and no tool list can tell those files apart
from the document that grades them, so the only thing standing there is the
sentence in the prompt. The three reviewers are the exception, and only by
accident: they hold no writing tool at all.

In normal use Claude Code asks you before each `Bash` call, so you would see a
git write coming. If you run with `--dangerously-skip-permissions`, nothing asks.
If you want the first rule enforced, add this to your **own**
`~/.claude/settings.json` — it is yours, not the plugin's, so it stays under your
control:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "p=$(cat); case \"$p\" in *'\"agent_type\":\"crew-'*) case \"$p\" in *\"git push\"*|*\"git commit\"*|*\"git add\"*|*\"npm publish\"*|*\"gh release create\"*) echo \"claude-crew: a crew role must not write git or publish. Report to the PM instead.\" >&2; exit 2;; esac;; esac; exit 0"
          }
        ]
      }
    ]
  }
}
```

It refuses only calls coming from a `crew-*` role. Your own session is untouched,
and so is every other plugin's subagent. It reads command text, so it is a seat
belt, not a locked door — a push hidden in a script file gets through.

It is also worth knowing how often that seat belt is really there. On the machine
this port was built, no settings file had a `hooks` key at all and the permission
prompts were switched off, so nothing but the prompt stood between a role and a
`git commit`. That is a normal setup, not a broken one, and it is why rule 1
above names the check that **finds** a commit instead of promising a guard that
prevents one.

## Where things live

| What | Where | Why |
| --- | --- | --- |
| The opening document, `docs/design/prd-<date>-<job-slug>.md`, with the definition of done as a section inside it | `docs/design/` **inside your repository** | it is what you confirmed, and every task is judged against it |
| The design, the task list and one boundary contract per pair of modules that talk: `docs/design/hld-<date>-<job-slug>.md`, `docs/design/tasks.md`, `docs/design/api/` | `docs/design/` | they are part of the work, and they get committed with the task |
| Decision records for **how**, and change requests for **what**: `docs/decisions/adr/`, `docs/decisions/crd/` | `docs/decisions/` | a decision you can read later is the only kind that survives |
| QA's cases. QA writes only inside `docs/qa/<task-id>/`: its case files and a `run.sh` beside them. `docs/qa/run-all.sh` and `docs/qa/gaps.md` are the PM's files, and QA never writes either one — it reports the lines to add and the PM writes them | `docs/qa/` | one task owns its files, and the two shared files stay with the one role that sees the whole job |
| What a researcher found, with a source for every claim | `docs/research/` | so the next job does not pay for the same search |
| The release plan and the upgrade plan of a milestone that ships, or the gap list of one that does not | `docs/release/` | the first release should not be the first time anyone thinks about it |
| Job state (`state.json`) | `~/.claude/crew/jobs/<job>/` **outside your repository** | so your `git status` stays clean |

If a job is left unfinished, the PM finds it at step 0 of the playbook and asks
you one question: carry on, or start clean. A role the PM started in the same
session can be reached again. Whether a role from an earlier session can be
reached is not known, so the PM tries and reads the answer: a role it cannot
reach is treated as gone, and that task starts again with a fresh role and the
current version of the documents.

## Changing it

There are no settings, because there is no code to read them. Everything is a
file you can edit:

- **What a role may do** — the `tools` or `disallowedTools` line in
  `agents/crew-<name>.md`.
- **How a role works** — the markdown under that line.
- **The limits** — **20** roles awake at the same time, **no cap** on the roles
  one job may use, **3** review rounds — and every step of the flow, all in
  `skills/team-lane/SKILL.md`.

To turn it off: `/plugin uninstall crew@claude-crew`.

## Editing a role

There is nothing to build and nothing to run — but there is also **no check**, so
these rules are on you. Each one exists because the weaker version failed a live
test:

1. A role uses **exactly one** of `tools` (an allow list) or `disallowedTools`
   (a deny list). Never both, never neither.
2. A **reviewer** always uses an allow list, and never names `Write`, `Edit` or
   `NotebookEdit`. A reviewer that can change what it judges is not a reviewer.
   No list of tools closes what a tool's own output says, so do not try to fix
   that with a list — that hole is closed by the section every prompt carries.
3. An **allow-list role never gets a shell** — no `Bash`, no `BashOutput`, no
   `KillShell`. A shell writes files, runs code, and reaches past anything a deny
   list closed.
4. A **deny-list role denies all five**: `Agent`, `Task`, `Workflow`,
   `SendMessage`, `ListAgents`. That is what keeps the crew flat.
5. The **engineer, the test engineer, the code engineer, QA and the architect keep
   `Bash`** — the first four run the code and the tests, and the architect reads
   the code and the git history. Those five are also the five that carry the git
   rules in their own prompts.
6. The frontmatter `name` matches the file name, and the description starts with
   `Crew role.` so the role is never picked for ordinary work.
7. Every tool name must be one Claude Code really has. A name that does not exist
   is a silent hole: the deny list stops covering the tool it meant to stop.

A new role also needs the two short sections every other prompt carries — the one
about text inside a tool result, and the one about the documents that judge its
work — plus its own `## What you may write` section, listing classes of file and
never file names. It must say that a later round may reach it as a message or as a
fresh role, and that everything it needs is in the documents its briefing names.

After adding a role, name it in `skills/team-lane/SKILL.md` as well — the PM only
uses what its playbook describes. `CLAUDE.md` repeats these rules for whoever
edits next.

## What changed from dsh-crew

The rules are the same. Five things had to change.

| | dsh-crew | claude-crew |
| --- | --- | --- |
| PM rules | a prompt section, always loaded | inside the skill, loaded when the work needs it |
| Roles | stay alive; the PM messages and interrupts them | work in the background; the PM can come back to a live one or start a fresh one. The tool names differ; the idea does not |
| Unfinished jobs | pushed at the PM every turn | step 0 of the playbook, which asks you before anything moves |
| Git guard | middleware that refused every child | prompt rules, the PM's own check — `git log` before every commit and before any merge — plus an optional hook **you** own |
| Delivery | an npm package | a git repository, through a marketplace |

This port is level with dsh-crew v0.9.0, and **the deliberate divergence table in
`porting.md` is now empty.** It used to hold ten rows — ten places where this port
said something different from dsh-crew on purpose. **Six** were places where
dsh-crew contradicted itself, and **two** were gaps neither project had; upstream
v0.9.0 adopted all eight, in several cases in this port's own words. On the
remaining **two** — your project's default test command, and force push — upstream
answered the argument and kept its own shape, and you chose to follow it, each
with a yes of its own. So every row is gone, and none of them was dropped quietly
— `porting.md` still says what each one was about and how it ended, and it keeps
the empty table because the next port pass needs somewhere to put a row it is
forced to add.

That is not only tidiness. While the table had rows, a `FAILED` line from the
upstream check meant two different things — "upstream moved" or "we decided
otherwise, on the record" — and a pass had to tell them apart before reading a
single diff. With the table empty it means **one** thing again: upstream moved,
go and read the diff.

The reasoning is split between the two files, and the split is worth knowing.
`principles.md` is **upstream's file**, kept as upstream's: it says why each
shared rule exists and lists the ideas that were looked at and rejected.
Everything that belongs to this port alone lives in `porting.md` — the map to
dsh-crew, what deliberately did not port, the divergence table, and this port's
own numbered principles `P1` to `P5`.

### Keeping up with dsh-crew

dsh-crew keeps moving, and nothing in Claude Code notices. So `upstream.sums`
holds the SHA-256 of every dsh-crew file this port was made from, in the format
`sha256sum` reads, with a comment above each line saying which claude-crew file
it feeds.

Compare against a **tag**, in a throwaway clone. Never against a working copy you
keep for your own edits: `sha256sum -c` compares whatever checkout you are
standing in, so a sum taken from a half-finished tree is worthless, and a tag is
a decision somebody made where `main` is whatever state a person left behind.

```sh
TMP=$(mktemp -d)
git clone --quiet https://github.com/stuarthu/dsh-crew "$TMP/dsh-crew"
git -C "$TMP/dsh-crew" checkout --quiet <the newest tag>
cd "$TMP/dsh-crew" && sha256sum -c ~/workspace/claude-crew/upstream.sums
cd "$TMP/dsh-crew" && shasum -a 256 -c ~/workspace/claude-crew/upstream.sums   # macOS
```

There are **17** pinned lines. Every `FAILED` line is a dsh-crew file that changed
since this port was made, and — now that the divergence table is empty — that is
**all** it can mean: upstream moved, go and read the diff, decide what the change
means here, and replace that line with the new sum. Open the divergence table in
`porting.md` anyway before you read a diff. It takes a moment, it tells you the
table is still empty, and the pass that skipped that step is the pass that either
copies an upstream defect back in or deletes one of this port's own fixes as
though it were a missed port.

`porting.md` holds the file-by-file map and the steps of a port pass.

## License

MIT
