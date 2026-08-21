# ADR 0013: what the documents may say about a role after a session restart

Version: 1

## The choice

CRD 0004 restores PM-to-role messaging on measured evidence. One thing next to it
is **not** measured, and the evidence file says so in section 10:

> **Does a role from a previous session appear in `ListAgents` and resume?** Not
> testable without restarting this session. Until it is measured, no document may
> promise it either way.

Today `skills/team-lane/SKILL.md` says the opposite of nothing: "Every role from
the old session is gone" (step 0's restart path, and "After a restart"). That
sentence is now **unverified** — not known-false, not known-true. And the port
dropped upstream's `"agent": "<agent id>"` field from `state.json`, so even if a
resume works after a restart, nothing here holds the id it would need.

Getting this wrong in either direction has a cost. Claim they are gone and the PM
throws away work that was reachable. Claim they can be resumed and the PM waits
for a role that is not there.

## Every option

### Option A — say what is measured, say what is unknown, and give a procedure **(recommended)**

Three parts:

1. `state.json` carries the agent id per task again — `"agent": "<agent id>"`,
   the field upstream has and this port dropped.
2. After a restart the PM **finds out** instead of assuming: run `ListAgents`,
   and try the id for any task left `running`.
3. If the role answers, carry on with it. If it does not answer, or `ListAgents`
   does not show it, treat it as unreachable, start a fresh role with the current
   document version, and say so to the user.

Nothing in that promises the mechanism works or fails.

- **Cost.** One field in `state.json`, one extra step on the restart path, and
  two sentences of hedging where a flat claim used to be.
- **Where it hurts later.** "Unknown" reads as vague, and a rule that starts with
  a hedge is easier to skip. The procedure is what stops that: the PM is told
  what to run, not what to believe.
- **Why it wins.** It is the only option that is true today, and it becomes
  better without being rewritten — the day somebody restarts a session mid-job
  and writes down what happened, the procedure already covers both answers.

### Option B — keep "every role from the old session is gone"

- **Cost.** Free. The text is already there.
- **Where it hurts later.** It is exactly the mistake CRD 0004 exists to correct:
  a rule argued from a claim about the mechanism that nobody measured. It also
  makes the agent id pointless, so the field would not come back, so the fact
  could never be tested cheaply later.
- **Why it lost.** The evidence file forbids it in one line, and the job has just
  paid for the last claim of this shape.

### Option C — say a role from an earlier session can be resumed

- **Cost.** Free.
- **Where it hurts later.** If it is false, the PM's restart path stalls on a
  role that will never answer, and the job's own recovery step is the thing that
  breaks.
- **Why it lost.** Same reason as B, mirrored.

### Option D — measure it inside this job, then write the answer

Restart the session on purpose mid-job and look.

- **Cost.** The PM cannot restart itself; the user would have to, and the job
  pauses while it happens. It also has to happen at a moment when a role is
  genuinely live, which is not a moment anybody wants to interrupt.
- **Where it hurts later.** Nothing — it would close the question for good.
- **Why it lost.** It is not free, and this job's purpose is the port. Option A
  makes the answer cheap to add later: the id is recorded, the procedure already
  branches both ways, and whoever sees a restart writes one line.

## The recommendation

**Option A.** The wording that goes into `skills/team-lane/SKILL.md`, and that
`T-09` and `T-10` must not contradict:

> A role you started in this session can be messaged. Whether a role from an
> earlier session can be reached is not known. After a restart, run `ListAgents`
> and try the agent id in `state.json`; a role you cannot reach is treated as
> gone, and its task starts again with a fresh role and the current document
> version.

Two words are banned in this area, because both are claims: **"gone"** as a
statement of fact about a restart, and **"resumed"** as a promise. "Cannot
reach" and "treated as gone" are procedures, and procedures are what this
document is for.
