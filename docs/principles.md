# Crew principles

This file says **why** the crew works the way it does.

Every rule in `agents/*.md` and in the team-lane skill is short and bossy on
purpose — a role prompt is read by a model that has to act, not argue. The
reasons live here instead. Read this before you change a role, so you do not
remove a rule without seeing the cost it was paying for.

Who "the user" means in this file: whoever installed the plugin and is running
the session. Not the person who wrote the plugin.

**Numbered principles are shared with [dsh-crew](https://github.com/stuarthu/dsh-crew),
and the numbers match on purpose**, so a principle can be quoted across both
repositories. They are kept short here: the rule, a short why, the files that
carry it here, and the outside source. The long version, with the live tests
behind each one, is in that project's `docs/principles.md` under the same number.

**Principles P1 to P5 belong to this port alone.** They carry a `P` so dsh-crew
can keep adding numbered principles without ever colliding with them, and they are
written in full, because nothing else records them.

---

## 1. The crew is flat, so the documents have to carry everything

**Rule.** Only the PM starts agents. A role talks to the PM and to nobody else.
Two roles can never talk to each other.

**Why.** A system ends up shaped like the communication of the people who build
it. Our builders cannot communicate at all. So anything two of them must agree on
has to be written down first, or it will not be agreed at all. This is why the
architect writes so much, and why "ask the other engineer" is never an option.

**Lives in** every `agents/*.md` frontmatter (Claude Code applies the lists
itself, so a role does not have the tool at all), `skills/team-lane/SKILL.md`,
`agents/crew-architect.md`, and the design rules in `CLAUDE.md`.

**Source.** [Conway's Law](https://lawsofsoftwareengineering.com/laws/conways-law/) ·
[Team Topologies and Conway's Law alignment](https://archman.dev/docs/domain-driven-design/strategic-design/team-topologies-and-conways-law-alignment)

---

## 2. Between two modules there is a written contract, and nothing else

**Rule.** When two or more modules talk, the architect writes one file per
boundary at `docs/crew/api/<caller>-<callee>.md`: the style, the format, every
call with its inputs, output and named errors, the rules each side keeps, who
owns the data, and what the caller may believe about it.

**Why.** A documented contract removes the need to talk. In industry that is a
saving; here it is the only mode we have. The test of a good contract file: could
two people build the two sides from this file alone, having never met?

**Lives in** `agents/crew-architect.md`, `agents/crew-engineer.md`,
`agents/crew-doc-reviewer.md`, `skills/team-lane/SKILL.md`.

**Source.** [Team Topologies](https://umbrex.com/resources/frameworks/organization-frameworks/team-topologies/) ·
[API-first development and contract testing](https://dasroot.net/posts/2026/02/api-first-development-contract-testing/)

---

## 3. Every boundary has a test on each side

**Rule.** Each contract file names one test per side. The callee's test proves it
answers exactly what the file says, errors included. The caller's test runs
against a stub built from the file, never against the real other side.

**Why.** A contract in prose is a promise. Two engineers who cannot talk will
each read it their own way, and nothing catches the difference until both halves
are finished. The two tests catch it while it is still cheap.

**Lives in** `agents/crew-architect.md`, `agents/crew-engineer.md`,
`agents/crew-code-reviewer.md`, `agents/crew-doc-reviewer.md`.

**Source.** [Contract testing for microservices](https://totalshiftleft.ai/blog/contract-testing-for-microservices) ·
[Consumer-driven contract tests: lessons learned](https://medium.com/pcg-dach/consumer-driven-contract-tests-lessons-learned-b4e1ac471d0c)

---

## 4. The first task is a walking skeleton

**Rule.** When the design has any boundary, `T-01` is the thinnest real path
across the riskiest boundary, built by one engineer who owns files on both sides.
It runs alone; every other task waits for it.

**Why.** An agreement written on paper is not proof. If the two sides do not fit,
you want to find out in the first task, while one engineer holds both ends and
the contract is still cheap to change.

**Lives in** `agents/crew-architect.md`, `agents/crew-engineer.md`,
`skills/team-lane/SKILL.md`, `agents/crew-doc-reviewer.md`.

**Source.** [Walking Skeleton](https://distilledpatterns.org/patterns/walking-skeleton/) ·
[What is a vertical slice?](https://monday.com/blog/rnd/vertical-slice/)

---

## 5. Big work stops at milestones, and the user judges each one

**Rule.** A PRD is cut into three to six milestones. Each is something the user
can look at and judge, written in their words. `M1` is the walking skeleton. The
PM stops at the end of every milestone and asks one question: go on, change
something, or stop.

**Why.** The user sees the direction early, while changing it is still cheap. A
milestone written in code words ("the auth module is finished") gives them
nothing to judge.

**Lives in** `skills/team-lane/SKILL.md`, `agents/crew-architect.md`,
`agents/crew-doc-reviewer.md`.

**Source.** [The 2020 Scrum Guide](https://scrumguides.org/scrum-guide.html)

---

## 6. Tests come before code, and the report has to prove it

**Rule.** An engineer writes a failing unit test, then the smallest code that
passes it. Its report must show the failing output before the code and the
passing output after.

**Why.** Without the proof, "I wrote tests" is unfalsifiable, and a test written
after the code tends to test what the code does rather than what was asked for.

**Lives in** `agents/crew-engineer.md`, `agents/crew-code-reviewer.md`,
`skills/team-lane/SKILL.md`. Where that test file lives, and how it is run again
later, is principle 13.

**Source.** [The 2020 Scrum Guide](https://scrumguides.org/scrum-guide.html)

---

## 7. Reuse before you invent, and judge a module by how easy it is to use

**Rule.** Before adding a module, look for one that already does the job. Judge
every module by how easy it is to call correctly and how hard it is to call
wrongly.

**Why.** "We already have this, use it" is a better design than a clean new box.
A module that is tidy inside but easy to misuse costs more than it saves.

**Lives in** `agents/crew-architect.md`, `agents/crew-code-reviewer.md`.

**Source.** [Software architect role blueprint](https://www.devopsschool.com/blog/software-architect-role-blueprint-responsibilities-skills-kpis-and-career-path/)

---

## 8. The stack is settled once and confirmed, then shape and library split

**Rule.** Before anything is designed, the **PM** settles the language and stack
and the **user confirms it**, as a *Language and stack* section in the PRD or DoD:
language and version, package manager, framework, database, and the test framework
with its exact test command. If the repository already has a stack, that is the
stack — no options, no research, just state it and confirm. Only when the choice is
real does the PM start a `crew-researcher` for the options and their costs, then
decide and recommend one.

After that, the old line holds: the architect says "HTTP/REST, JSON", never
"FastAPI" or "grpc-go". Which of the libraries the project already has an engineer
uses is the engineer's call. Adding a package the project does not depend on yet
is the PM's call, and gets written into the stack section. Changing the stack
itself needs a CRD, like scope.

**Why the up-front part.** The old rule said the engineer uses "what the
repository already uses", which quietly assumed a repository that already exists.
On an empty one there is nothing to use, and roles cannot talk to each other, so
several engineers would each pick a language and a test framework and none of them
would find out. The choice reaches further than code: QA writes its cases in the
same framework, so a disagreement splits the tests too.

**Why the PM and not the architect.** Small DoD work has no architect at all, and
the design itself depends on the stack, so it must be settled before the architect
starts. Facts still come from a researcher — it lists candidates with costs and
sources and is forbidden to recommend one — so "the PM decides" does not mean the
PM guesses.

**Lives in** `skills/team-lane/SKILL.md` (step 3), `agents/crew-researcher.md`,
`agents/crew-architect.md`, `agents/crew-engineer.md`, `agents/crew-qa.md`,
`agents/crew-doc-reviewer.md` (a named library in a contract is a finding).

**Source.** [Software architect job description](https://interviewkickstart.com/job-description/software-architect)

---

## 9. Data ownership and consistency belong in the contract

**Rule.** Every contract file says which module owns the data behind the
boundary, and what the caller may believe about it — is the answer true the
moment it returns, or can it lag? If two modules write the same data, that is not
a boundary, it is a bug.

**Why.** Two engineers who cannot talk will each assume a different answer, and
both will be reasonable.

**Lives in** `agents/crew-architect.md`, `agents/crew-doc-reviewer.md`.

**Source.** [Software architect role blueprint](https://www.devopsschool.com/blog/software-architect-role-blueprint-responsibilities-skills-kpis-and-career-path/)

---

## 10. A contract change mid-flight should be additive

**Rule.** Prefer a new call, or a new field that is not required. Renaming,
removing, or making an optional field required breaks the other side, and the
architect must say so plainly when it does it.

**Why.** Work already built keeps working, and only one side has to move.

**Lives in** `agents/crew-architect.md`, `skills/team-lane/SKILL.md`.

**Source.** [API versioning and backward compatibility best practices](https://zuplo.com/learning-center/api-versioning-backward-compatibility-best-practices)

---

## 11. The spec and the code must not drift apart quietly

**Rule.** A document change raises its version in `state.json`. Any task already
built against the old version is re-run. The last doc review checks every
document the job touched, including the README.

**Why.** A specification nobody re-reads becomes decoration, and the next role
builds from a document that stopped being true.

**Lives in** `skills/team-lane/SKILL.md`, `agents/crew-doc-reviewer.md`.

**Source.** [The Spec Growth Engine, arXiv 2606.27045](https://arxiv.org/abs/2606.27045)

---

## 12. A reviewer that can write files is not a reviewer

**Rule.** Every reviewer role uses an **allow list** naming `Read`, `Glob` and
`Grep`, and nothing else. No writing, no shell.

**Why.** Two live tests in dsh-crew. With `Write` and `Edit` denied, a reviewer
created a file anyway with `echo hello > file` — a shell is a file-writing tool.
With the shell denied too, its tool list still held workflow tools and
desktop-control MCP tools. A deny list cannot name what a deployment has not
installed yet; an allow list does not have to.

**Lives in** the reviewer files in `agents/`, the design rules in `CLAUDE.md`,
and the "Editing a role" section of both READMEs.

**Source.** (ours)

---

## 13. Every test lands on disk and runs again

**Rule.** An engineer's unit test is a file in the project's own test suite, named
in its task row and committed with the code. QA's cases are files too, in the
project's test framework, under `docs/crew/qa/<task-id>/`, with a `run.sh` per
task and one `docs/crew/qa/run-all.sh` that finds and runs them all. QA runs all
of them — including cases written for tasks that finished long ago — on every task
it checks, and an old case that now fails is a blocking regression.

**Why.** A crew job ends; the project does not. A case that only ever ran inside
an agent's shell proves something for ten minutes and then protects nothing, so
the next change breaks a promise nobody is watching. Written down, the same cases
become the project's regression suite, and each job leaves the next one better
guarded.

**How the split is drawn.** QA writes only inside `docs/crew/qa/`, never into the
product's own test folder. That keeps the file-ownership rule intact — one task
owns its files — and keeps "who wrote this test?" answerable by the path alone.
The cost is real and known: a runner that only looks inside configured folders
will not see `docs/crew/qa/`, so QA reports that to the PM and the PM either adds
the one config line or records the cases as not runnable. QA never edits project
config, and never moves its files to dodge the problem.

**Lives in** `agents/crew-qa.md`, `agents/crew-engineer.md` ("Your test is a file
that stays"), `skills/team-lane/SKILL.md` (steps 4, 10c, 11, 12, 16).

**Source.** [The 2020 Scrum Guide](https://scrumguides.org/scrum-guide.html)

---

## 14. Documents are the only channel, and a change gets a CRD

**Rule.** Nothing that matters lives only in a message. A role's report points at
the file it wrote; the PM's answer is a change to a document and that document's
new version. And any request that would change **what the user gets** (scope, an
acceptance check, the milestone list, the stack) or **how two modules talk** (a
boundary contract) becomes a change request document —
`docs/crew/crd/NNNN-<short-name>.md` — written by the PM before anything moves,
whoever asked: the user, a role, or the PM itself. A CRD is never deleted, and a
rejected one stays.

Who decides: a contract fix that changes nothing the user sees is the PM's call,
reported at the next milestone review. Anything touching scope, an acceptance
check, the stack or the milestone list needs the user's yes first.

**Why.** The crew is flat, so anything said to one role dies there (principle 1).
Two engineers building two sides of a boundary cannot compare notes; if one of
them was told something in a briefing, the other is building against a different
truth and nobody finds out until the halves are joined. A document is the only
thing every role, and every role started tomorrow, reads the same way. The CRD
adds the missing half: the record of *why* a confirmed document changed, and who
agreed to it.

**Here it is not a habit but the only option.** A role in this port runs once and
cannot be messaged at all (principle P1), so there is no private channel to be
disciplined about — only files.

**Why the scope is narrow.** A CRD for every question or review finding would bury
the ones that matter and put the PM in a writing job instead of a deciding one. So
an internal change that keeps the same behaviour and the same contract — an ADR,
an HLD detail, splitting one task in two — is only a version bump on the document
that owns it. A question the files can answer stays an inbox `Q-` file.

**Lives in** `skills/team-lane/SKILL.md` ("Documents are the only channel",
"Change requests"), `agents/crew-architect.md` ("When the PM sends you a CRD"),
`agents/crew-engineer.md`, `agents/crew-qa.md`.

**Source.** [The 2020 Scrum Guide](https://scrumguides.org/scrum-guide.html) ·
[Change control](https://en.wikipedia.org/wiki/Change_control)

---

## P1. A role runs once, so the briefing is the design

**Rule.** The PM starts a role with the Agent tool. The role works, writes its
files, reports in its last message, and is gone. There is no second message.
Round two of a review is a fresh reviewer, briefed with round one's blocking
findings.

**Why.** Two reasons, one practical and one about the design.

The practical one: a long-lived agent dies with the session. dsh-crew's rule
"after a document change, message every live child" would then do nothing at all
after a restart, silently.

The design one: it pushes principle 1 one step further. In dsh-crew the roles
shared work through files but the PM still held live conversations. Here the PM
shares that way too. A fresh role always reads the current document, so "the
document changed, tell everyone" stops being a rule anyone can forget.

What it costs, honestly: the PM cannot interrupt an engineer that is running when
a document changes. It has to let the work finish and then re-run it. That is
written into the team-lane skill rather than hidden.

**Lives in** `skills/team-lane/SKILL.md` ("How you start a role"), and every
`agents/*.md` ("You run once").

**Source.** (ours)

---

## P2. Nothing loads until the work needs it

**Rule.** The plugin adds nothing to a session by itself. Claude reaches for the
`crew:team-lane` skill because its description says what the skill is for, and
everything — the PM rules, the 14 steps, the roster, the limits — arrives with
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

**Source.** (ours)

---

## P3. The plugin is markdown, and states plainly what it cannot enforce

**Rule.** No hooks, no scripts, no code. Seven agent files and one skill file.
The one rule that cannot be enforced — a role must never commit, push or publish
— is written in the prompt of every role that owns a shell, and the README says
plainly that nothing stops it.

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

*A rule you cannot enforce should be said out loud.* Claude Code already asks the
user before each `Bash` call unless permissions are skipped. For the case where
they are, the README carries a small hook the **user** can add to their own
settings. It stays theirs, so it cannot break anyone who did not choose it.

**Lives in** `agents/crew-engineer.md` and `agents/crew-qa.md` ("Git"),
`skills/team-lane/SKILL.md` (step 10), the "What is not enforced" section of both
READMEs, and design rule 6 in `CLAUDE.md`.

**Source.** (ours)

---

## P4. Nothing is checked, so the rules are written where the editor will look

**Rule.** There is no check to run. The design rules — exactly one filter per
role, a reviewer never writes, an allow-list role never gets a shell, a deny-list
role denies all five delegation tools, the engineer and QA keep `Bash` — are
written out in `CLAUDE.md` and in the "Editing a role" section of both READMEs.

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

**Lives in** `CLAUDE.md` ("Design rules a change must not break"), and the
"Editing a role" section of `README.md` and `README-zh.md`.

**Source.** (ours)

---

## P5. A port needs a way to notice the original moved

**Rule.** `upstream.sums` records the SHA-256 of every dsh-crew file this port
was made from, in the format `sha256sum` reads, with a comment above each line
saying which claude-crew file it feeds. Running `sha256sum -c upstream.sums`
inside a dsh-crew checkout reports what moved.

**Why.** A port without this becomes a fork within a few months, and nobody can
say which improvements were skipped on purpose and which were simply missed. The
comment above each line is the important half: it holds the reason a change was
**not** carried across, so the next pass does not re-open a settled question.

Using `sha256sum` instead of a script is the point. It needs nothing installed,
it is one line to run, and the file still makes sense when nobody remembers how
the tracking was meant to work.

What it cannot do is notice a file dsh-crew has **added**, because a checksum
file only knows the names already in it. `docs/porting.md` carries the git
command for that.

**Lives in** `upstream.sums`, `docs/porting.md`, and the "Keeping up with
dsh-crew" section of both READMEs.

**Source.** (ours)

---

## What we looked at and did not take

| Idea | Why not |
| --- | --- |
| Long-lived role agents, messaged with `SendMessage` | Claude Code can do it, and dsh-crew works that way. Rejected: a live child dies with the session, so every rule built on "message every live child" would fail silently after a restart. See principle P1. |
| A `PreToolUse` hook that refuses git writes from a crew role | Shipped, then removed. It enforced exactly one rule that the agent files cannot express, and cost a runtime dependency the user may not have. The rule is now stated in the prompts, and the README offers the same hook for the user's own settings. See principle P3. |
| Writing the hooks in node | Removed with the hooks. Claude Code ships as a binary, so node can be absent, and no plugin in the official directory uses it. |
| Writing the hooks in Python 3, with a shim that finds a working interpreter | What `hookify` and `security-guidance` do, and it would have worked. Rejected together with the hook itself: one rule did not justify any interpreter. |
| Anything that loads into every session, by default | Faithful to dsh-crew, and it is still available as `CLAUDE_CREW_ALWAYS=1`. Rejected as the default: it changes how Claude behaves in every project, including sessions that only ask a question. See principle P2. |
| A second copy of the PM rules outside the skill | Was the first shape of this port, kept in step by a check. Replaced: the rules live only inside the skill now. A check that two files match still lets them be edited apart between runs; one file cannot. |
| A role table in code, generating or checking the agent files | dsh-crew builds every tool filter from one table at run time. A markdown-only plugin has no run time, so the table would exist only for a check — and the checks are gone too. See principle P4. |
| Verify scripts that check the design rules | Shipped in four forms, then one, then none. Every version made node a requirement for anyone touching a repository whose whole content is markdown. Dropped so it depends on nothing at all; principle P4 states what that costs. |
| A GitHub Actions workflow | There is nothing left for it to run. With no code and no checks, CI would only prove that markdown is still markdown. |
| A one-shot push approval file for roles | Ported from dsh-crew and then dropped. The PM is the only one who uses git in every step of the playbook, so the child-push path was close to dead code, and it was one more thing to explain and to get wrong. |
| Blocking `git push` with `permissions.deny` in settings | Simpler, but it cannot tell a subagent from your own session, so it would block your pushes too. |
| Re-printing the unfinished-job notice on every turn | Claude Code adds hook text to the context instead of replacing it, so this would repeat the same paragraph on every turn. It is printed once at session start. |
| Using Claude Code's built-in `/code-review` and `security-review` skills | They run as the main agent with the full tool set. A reviewer that can change the code it judges is not a reviewer — principle 12. |
| Generating `agents/*.md` from the role table at build time | Would keep "derive, do not retype", but it puts a build step between an edit and the file that ships, and a stale generated file would look hand-written. A check does the same job. See principle P4. |
| QA writing its cases straight into the project's test folder | One test command for everything, and CI would run the QA cases too. Rejected: QA would then own files inside the product, which breaks the rule that one task owns its files, and makes an engineer's and a reviewer's job harder to tell apart. `docs/crew/qa/` plus `run-all.sh` buys the same protection without moving that line. |
| QA cases as plain shell scripts, one exit code each | Portable and needs no framework. Rejected: a shell can only test what a shell can reach, so a library's return value or a browser app has to be squeezed through a command, and the assertions end up weaker than the ones the project already has. |
| A CRD for every request, question and review finding | A complete audit trail. Rejected: most of those are answered from the files in one turn, and the PM would spend the job writing records instead of deciding. |
| The PM deciding scope changes on its own, and telling the user later | Faster, and the CRD folder would still hold the history. Rejected: it defeats the milestone stop (principle 5), whose whole point is that the user judges direction while changing it is cheap. |
| The architect chooses the stack | It is the most technical decision in the job. Rejected: small DoD work has no architect, the design already depends on the stack, and the user has to approve it — and only the PM talks to the user. |
| Each engineer picks its own libraries in a new repository | What the old principle 8 implied. Rejected once the crew met an empty repository: roles cannot talk, so two engineers pick two languages and two test frameworks and nobody notices until the halves are joined. |
| The researcher recommends a stack | It has the sources in front of it. Rejected: a researcher that recommends is deciding, and its findings are then read as a verdict nobody approved. |
| Standups, sprint planning, retrospectives | Every ceremony is peers talking to peers. Crew roles cannot talk to each other at all, so these become the PM talking to itself. |
| A throwaway proof of concept, deleted after review | Considered for `M1`. Rejected: it makes the crew build the same thing twice. `M1` is the walking skeleton instead, and its code is kept and grown. |
| Consumer-driven contracts, where the calling side owns the contract | Assumes two teams that negotiate. One architect writes both sides here, so the caller/callee split is only about who builds what. |

---

## Keeping this file honest

When you change a rule in `agents/*.md` or in `skills/team-lane/SKILL.md`, update
the principle that carries it. When you reject an idea, add it to the table above
so the next person does not re-run the same search.

When a numbered principle changes upstream, `sha256sum -c upstream.sums` reports
`docs/principles.md` as FAILED. Keep the numbers in step; if a shared principle
stops being true here, say so in its entry rather than renumbering. Port-specific
principles keep the `P` prefix, so dsh-crew can add 15, 16 and beyond without ever
colliding.
