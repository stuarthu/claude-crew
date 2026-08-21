# CRD 0007 — "roles cannot talk to each other" is a rule they keep, not a wall they meet

## Who asked

`crew-doc-reviewer`, blocking finding 2 of the `M2` landing review (2026-08-21). It did
not fix it: `docs/design/tasks.md` fact 10 says a task that finds a new divergence
"reports it to the PM and stops there".

## What upstream says, checked line by line

dsh-crew v0.7.0 states it as a **fact about capability**, in five places:

| File | Line | Text |
| --- | --- | --- |
| `roles/engineer.md` | 5 | "you **cannot** talk to other crew members" |
| `roles/engineer.md` | 33 | "You two **cannot** talk." |
| `roles/architect.md` | 6-7 | "You **cannot** talk to the engineers, and you **cannot** start any agent." |
| `roles/architect.md` | 52 | "agents that **cannot** talk to each other" |
| `principles.md` | 35 | "Two roles can **never** talk to each other." |

## What is measured here

`~/.claude/crew/jobs/port-dsh-crew-0-7-0/reviews/mechanism-evidence.md`, sections 6 and 7:

- The **tool layer really holds**. A deny-list role that reaches for `SendMessage`,
  `ListAgents`, `Agent` or `Task` is refused, with the verbatim error recorded.
- **Three roles hold a shell** — `crew-architect`, `crew-engineer`, `crew-qa` — and a
  shell reaches around the tool layer two ways: `claude -p "..."` starts a separate
  Claude process that holds all those tools and obeys no frontmatter, and the job folder
  is plain files, so an `echo` into `<job folder>/inbox/` puts one role's words in front
  of the PM and the next role.

So for four roles upstream's sentence is true. For the three that hold a shell it is
false, and one of them is told to write into `inbox/` in the same file that tells it it
cannot talk.

## The accounting gap this exposes

**This divergence already exists, and it was never recorded.** Fix round 3's `F-47`
rewrote the skill's own copy of the claim — `skills/team-lane/SKILL.md` lines 158-165 now
carry the honest version, and it is committed in `aa064d3` and reviewed by the user at the
`M1` milestone review.

`F-47` was raised as "the fix round **added** an overclaim". Half of that was true: the
sentence "you are the only one who can open a back channel" was this port's invention. But
the other half — "roles cannot talk to each other" — is upstream's, so correcting it made
this port diverge, and nothing wrote that down. `docs/design/tasks.md` fact 10 counts nine
divergences; this is the tenth, and it has been live since `M1`.

**Where it still has to reach**, if it is accepted:

- `agents/crew-engineer.md` line 11 and line 33's equivalent, and `agents/crew-architect.md`
  lines 12-14 and line 64 — the two prompts that state the wall (`M2`, landed; this is a
  new fix round).
- `principles.md` — upstream's line 35 is the strongest statement of all, and `T-06` copies
  that file in `M3`. **Not started.**
- `porting.md`'s divergence table and `upstream.sums`' comment (`T-07`, `T-08`).
- `~/dsh-crew-0.7.0-defects.md` (`T-12`) — this belongs in part two, the "gap" section, not
  the defect list: upstream is not contradicting itself here, it is stating something that
  is true of dsh and false of this deployment.
- `agents/crew-qa.md` holds a shell too. Its prompt does not state the wall, so it needs
  nothing — worth saying so, because "three roles" appears in the skill and only two
  prompts change.

## Why it is not just a wording fix

Two of the seven prompts currently tell a role something false **about itself**, and the
skill tells the PM the opposite. Whichever a reader believes, the other is wrong. And the
skill's honest version claims "what keeps two roles from talking is **the rule those three
are given**" — a rule that, in two of the three prompts, does not exist. The skill promises
a rule the prompts do not contain.

## The options

### Option A — carry the honest version into the two prompts and into `principles.md` **(recommended)**

The tool layer holds for the four roles that have no shell; for the three that do, it is a
rule they keep. Say exactly that, in each place, in the words the skill already uses.

- **Cost.** Two prompts in a short fix round (`M2` is otherwise finished), one principle in
  `T-06`, a row in the divergence table, a section in the hand-off issue. No task is
  rebuilt.
- **Why it wins.** It is the only option where the eight files agree. It also makes the
  skill's own promise true. And a role that knows it is keeping a rule can keep it; a role
  that believes it is behind a wall has no reason to think about it at all — which is the
  same argument principle `P3` makes about the git rule, in a repository whose seat-belt
  hook is measured as **not installed** on this machine.

### Option B — keep upstream's wording everywhere, and revert the skill to match

- **Cost.** Free in edits. The skill loses a correction the user has already reviewed and
  accepted, and the plugin goes back to telling three roles something false about
  themselves.
- **Why it lost.** It would be this job's first *removal* of a measured truth, and the
  measurement is in the repository.

### Option C — keep both: upstream's wording in the prompts, the honest version in the skill

That is today's state.

- **Cost.** Free.
- **Why it lost.** Eight files that describe one flow disagree, and the disagreement is
  about what a role may do. The `M2` review called it blocking for that reason.

### Option D — accept it and record it, but do not touch `principles.md`

- **Cost.** `T-06` would copy upstream's "Two roles can never talk to each other" into the
  reasons file while the prompts say the opposite.
- **Why it lost.** `principles.md` is where the reasons live; a reason that contradicts the
  rule is worse than no reason.

## Decision

**Option B — keep upstream's wording, and change the skill back to match.** The user
decided on 2026-08-21. Divergences stay at **nine**; this does not become the tenth.

### The argument for B that the PM failed to make

Upstream decided this deliberately, and there is a commit that says so:
`78639ac fix(guard): say what the guard really covers, and stop handing a child the
recipe`. Naming `claude -p` and the `inbox/` channel in a role's own prompt is handing a
child the recipe. Option A would have put that recipe in front of all three roles that
hold a shell. The PM presented A as the honest choice without weighing that, which was an
incomplete case.

### What B costs, recorded so nobody has to rediscover it

**Security review round 2's blocking finding 2 comes back.** Its words were: the PM
"reading line 147 believes the back channel is closed and that it alone has to keep the
document rule — so it never looks for the one that is open." Reverting the skill's wording
makes that true again. The measurements do not go away: they stay in
`~/.claude/crew/jobs/port-dsh-crew-0-7-0/reviews/mechanism-evidence.md` sections 7.1 and
7.2, and this CRD keeps the table of upstream's five statements.

So the position after B is: **the plugin says what upstream says, the repository records
what is true, and the two are not the same.** That is a knowing choice by the user, not an
oversight, and the closing summary must say so.

## Applied

Not yet. What has to change:

- `skills/team-lane/SKILL.md` — the paragraph `F-47` wrote (three roles hold a shell,
  `claude -p`, the job folder) goes back to upstream's plain statement. **The
  port-invented sentence `F-47` removed must not come back**: "you are the only one who
  can open a back channel" was never upstream's and was a real overclaim. Upstream's
  wording, and nothing added.
- `agents/crew-engineer.md`, `agents/crew-architect.md` — **no change**. They already carry
  upstream's wording, which is why the `M2` review found them inconsistent with the skill.
- `principles.md` (`T-06`) — carry upstream's principle as upstream writes it.
- `porting.md` (`T-07`), `upstream.sums` (`T-08`) — no new divergence row.
- `~/dsh-crew-0.7.0-defects.md` (`T-12`) — this belongs in the hand-off after all, but as
  an **observation with the measurements attached**, not as a defect and not as a change
  this port made: upstream's sentence is true of dsh and false of a deployment where a
  role holds a shell and a `claude` CLI is on the `PATH`. Whether upstream wants to say
  anything about it is upstream's call, which is exactly what an issue is for.
