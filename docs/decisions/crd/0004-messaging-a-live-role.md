# CRD 0004 — the PM can message a live role, and the port said it cannot

## Who asked

The PM, on 2026-08-21, after the user said: "it is normal that claude and dsh has
different mechanism, we only port the idea, not the mechanism, you can modify it with
your own understanding" — and then: "and let me review and approve it."

## What this is

Not a divergence from upstream. **A mis-port, discovered and now measured.**

dsh-crew has `send_message`, `interrupt_agent` and `list_agents`, and upstream
`roles/pm.md` v0.7.0 uses all three. The 0.2.0 port of this plugin removed every one
of them, and `docs/porting.md` records the reason as: "A role runs once. A second
round is a fresh role."

That reason is false. This deployment has `SendMessage` and `ListAgents`, the `Agent`
tool returns immediately so roles run in the background, and a **finished** role can
be resumed with its context intact. All of it is measured in
`~/.claude/crew/jobs/port-dsh-crew-0-7-0/reviews/mechanism-evidence.md`, sections 1
to 3.

So the port dropped a real upstream idea on the grounds that the mechanism did not
exist. It does. Porting the idea — which is the user's instruction for this whole job —
means putting it back, in this deployment's own terms.

**The repository has also been contradicting itself since 0.2.0.** Every deny-list
role's frontmatter already denies `SendMessage` and `ListAgents`. You cannot
meaningfully deny a tool that does not exist. The frontmatter has assumed these tools
are real the whole time, while the prose assumed they are not.

## What it changes

`skills/team-lane/SKILL.md` states in eight places that a role cannot be messaged.
The resumed code reviewer — the only agent that has read all 1,351 lines against
upstream — produced the full list. Two kinds:

**Simply false about the mechanism** (lines 131-134, 164-165, 181-184, 245-247,
630-632, 1201-1204, 1336-1337, 1193, 326-327, 62, 653-654). Line 131-134 is the
load-bearing sentence, and it sits inside a "keep, do not replace" section, so `T-01`'s
own task text is now wrong too. Lines 630-632 are a paragraph **this port invented**;
upstream has no such text.

**True but now needlessly expensive** (lines 147, 380, 547, 573-576, 581, 606,
656-658, 682-686, 700, 763-765, 770-771, 859-860, 998-999, 1206-1208). Each throws
away a role that already holds the documents, the diff and the reasoning, and pays for
a full re-brief. The worst is 573-576 with 245-247: today a boundary contract change
costs **every in-flight task on that boundary**. Upstream costs one message to each
side.

Four upstream ideas the port lost with the tool names, all load-bearing:

1. `roles/pm.md` 59, 1072 — after a document change, message **every live role, not
   only the one that asked**: which document, which version, what to re-read. Today a
   live role keeps building on a stale document and the only remedy is to discard the
   work.
2. `roles/pm.md` 127-128, 1074 — interrupt **first** when a role is building the very
   thing that changed. Stops waste at the moment it becomes waste.
3. `host/crew.js` 234 — if the user says stop, stop every live role and say what each
   left unfinished. **The skill has no such rule at all**, because nothing could be
   running.
4. `roles/doc-reviewer.md` 242-244 — "A later round may reach you as a message, **or as
   a fresh reviewer**. Either way..." This is the wording that makes a role safe in
   both directions, and it is why this change does not need any role to hold
   `SendMessage`.

## The rule that must survive, and how

The rule is **not** "you cannot message". It is "**a message may not be the only place
a fact lives**". Upstream proves the two coexist: dsh-crew has `send_message` *and*
principle 14. The port was arguing a good rule from a false reason, which is fragile —
the moment somebody notices the reason is wrong, the rule looks optional.

The reason that survives the mechanism is upstream `principles.md` 400-405: a message
reaches exactly one role and dies there, so two engineers building two sides of one
boundary cannot compare notes, and a fact told to only one of them leaves the other
building against a different truth.

The proposed test is mechanical on purpose, so a tired PM can apply it in one second:

> **A message carries a document path and a version number, and nothing else.** If the
> message you are about to send has no file path and no version in it, it is a
> decision — and a decision in a message is lost. Write it into the document, raise the
> version, then send the pointer.

Plus: "Never decide anything in a briefing" widens to "in a briefing **or a message**",
and "If you cannot point at the document a message's content came from, you have just
invented policy in a chat window. Stop and write it down."

**No agent frontmatter changes.** Every deny-list role keeps denying `Agent`, `Task`,
`Workflow`, `SendMessage`, `ListAgents`; the three reviewers keep `tools: Read, Glob,
Grep`. PM-to-role messaging needs no role to hold `SendMessage`. Roles staying unable
to message each other is principle 1, and it is what keeps the document rule
enforceable: the PM is the only one who *can* open a back channel, so there is exactly
one person to hold to the rule.

## Two things measured that also have to be written down

- **An allow-list role keeps its allow list when resumed.** Confirmed against a
  resumed `crew-doc-reviewer`: its visible tools were `Read`, `Glob`, `Grep` and
  nothing else. Design rule 2 survives the resume. Nothing in the repository records
  this; principle `P2`/design rule 2 argues only from the `echo hello > file` incident.
- **Whether a role from a *previous session* can be resumed is unknown** — not testable
  without restarting. So the skill must promise nothing either way, and
  `state.json` needs the agent id back (the port dropped upstream's
  `"agent": "<agent id>"` field, without which nothing can be resumed after a restart).

## What it touches

- `skills/team-lane/SKILL.md` — `T-01`'s fix round, ~25 line ranges.
- `docs/design/prd.md` — "What it must do" item 2 names "a role that runs once" as this
  port's mechanism. **This is why it is a CRD.**
- `docs/design/tasks.md` — `T-01`'s task text (the "keep, do not replace" list) and the
  "change on the way" note of `T-02`, `T-03`, `T-04`, `T-05`, each of which currently
  says "a **fresh** architect/reviewer — a role here runs once".
- `principles.md` — `P1` ("A role runs once, so the briefing is the design") is built on
  the false premise. Task `T-06`.
- `porting.md` — the "did not port" row for `send_message`, `interrupt_agent`,
  `list_agents` is wrong. Task `T-07`.
- `CLAUDE.md` — "Adding or changing a role" requires a role body to "say it runs once".
  Task `T-09`.
- All seven `agents/*.md` bodies say "you run once". Tasks `T-02` to `T-05`.
- `README.md` and `README-zh.md`. Task `T-10`.

## Cost

`T-01` is the only task that has landed, and it is already in a fix round, so the skill
edits ride along. `T-02` to `T-05` have **not started**: land this now and the seven
role prompts are written once, with upstream's "as a message, or as a fresh reviewer —
either way" wording. Land it after `M2` and seven files are rewritten twice.

Nothing already built is thrown away. No milestone changes.

## The options

### Option A — restore PM-to-role messaging, keep the document rule with the new test **(recommended)**

- **Cost.** The edits listed above, mostly one clause each, plus the new "stop
  everything" rule and the `state.json` field. `T-01` gets a longer fix round.
- **Why it wins.** It is what the user asked for — port the idea, not the mechanism. It
  ends a contradiction between the frontmatter and the prose that has stood since
  0.2.0. It removes the largest waste in the flow (a contract change no longer
  discards every in-flight task). And the rule it must protect comes out **stronger**,
  because it is finally argued from the reason that is actually true.

### Option B — leave the prose alone, fix only the sentences that are outright false

Say nothing about messaging; just delete the false claims.

- **Cost.** The skill stops lying but keeps every "start a fresh role" instruction, so
  the waste stays and `state.json` still cannot resume anything.
- **Why it lost.** It leaves the flow paying for a limitation that does not exist, and
  it leaves the document rule resting on no stated reason at all — worse than the
  false one, because now nothing argues it.

### Option C — restore messaging everywhere upstream uses it, verbatim

Carry `interrupt_agent` and the "message every live child" text as upstream writes it.

- **Cost.** Upstream's "a blocked child marks its own task blocked and moves to another
  task it owns" is **not portable**: a Claude Code subagent's report ends its turn, so
  it cannot report and keep working. Copying upstream verbatim would put a false claim
  back in, in the other direction. Interrupts also need a rule this port must invent:
  an interrupt can land between two `Edit` calls, so after any interrupt the PM must
  run `git status --short` and say what was left half-written.
- **Why it lost.** Same mistake as 0.2.0 made, mirrored — copying words instead of
  checking the mechanism. Option A takes the ideas and states the local mechanism
  honestly.

## Decision

**Accepted — Option A.** The user approved it on 2026-08-21.

So: PM-to-role messaging comes back; the document rule stays and is guarded by the
mechanical test ("a message carries a document path and a version number, and nothing
else"); the "user said stop" rule is added; `state.json` gets the agent id back; and no
agent frontmatter changes.

## Applied

Not yet — the edits land in `T-01`'s fix round and in `T-02` to `T-07`, `T-09` and
`T-10`. `docs/design/tasks.md` must gain them before the fix engineer starts, and
`docs/design/prd.md` "What it must do" item 2 must stop naming "a role that runs once"
as this port's mechanism.
