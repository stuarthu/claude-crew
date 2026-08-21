# ADR 0001: the team-lane skill stays one file

Version: 1

## The choice

Upstream `roles/pm.md` at v0.7.0 is 1,216 lines. Claude Code loads the whole
`SKILL.md` into the session the moment the skill fires. Do we keep the playbook
in one file, or split it?

## Every option

### Option A — one file: `skills/team-lane/SKILL.md`, about 1,250 lines **(recommended)**

What it is: the frontmatter, the PM rules, the roster, the limits and all 18
steps in one file, the way the file is built today.

- **Cost.** The whole playbook enters the session on every crew job, big or
  small. That is roughly 1,250 lines of markdown the model carries for the rest
  of the job.
- **Where it hurts later.** The file gets harder for a person to edit without
  losing their place, and a single careless edit can move a rule far from the
  step that needs it.
- **Why it wins.** The skill only loads when the work is already big enough to
  need a crew, so nothing is paid on a small session (principle P2). And a rule
  the PM did not read is a rule that does not exist — this repository's whole
  risk is a rule that quietly stops being followed, and splitting adds a second
  chance for that to happen for free.

### Option B — a short `SKILL.md` that points at extra files in the skill folder

What it is: `SKILL.md` keeps the rules and the step list in one line each, and
each phase's detail moves to `skills/team-lane/steps-9-to-12.md` and so on. The
PM reads the extra file when it reaches that phase.

- **Cost.** Every pointer is a rule that may not be followed. Nothing makes the
  PM open the second file, and nothing reports it when it does not.
- **Where it hurts later.** A rule split across two files drifts. `CLAUDE.md`'s
  own table says the playbook is "One file", and both READMEs describe it that
  way, so this option also spends `M4` budget rewriting three descriptions of
  the layout.
- **Why it lost.** It trades a cost we can measure (context size, once per big
  job) for a cost we cannot see at all (a step read from memory instead of from
  the file). Every failure this repository has recorded is of the second kind.

### Option C — several skills, one per phase

What it is: `team-lane-plan`, `team-lane-build`, `team-lane-ship`, each its own
skill with its own `description`.

- **Cost.** The `description` is the only thing that makes Claude reach for the
  crew (`CLAUDE.md` design rule 8). Three descriptions compete, and the model
  may pick the wrong phase, or none.
- **Where it hurts later.** The crew's flow is one ordered thing; three entry
  points invite entering in the middle, which is exactly what step 0 and the
  milestone stops exist to prevent.
- **Why it lost.** It puts the one load-bearing, unchecked thing in the
  repository — the entry description — at risk to save context.

### Option D — port only part of upstream `roles/pm.md`

What it is: keep the local skill near its current 664 lines and carry only the
rules the PRD's acceptance checks name.

- **Cost.** The port's only value is that the two projects say the same thing.
- **Where it hurts later.** The next port pass cannot tell a deliberate omission
  from a missed one, because `upstream.sums` records the whole file either way.
- **Why it lost.** It defeats the purpose of the job as the PRD states it.

## The recommendation

**Option A.** One file. If context size later becomes a real, measured problem,
the honest fix is a shorter playbook, not a hidden one.

## What it costs, stated plainly

`skills/team-lane/SKILL.md` becomes the longest file in the repository by a wide
margin, and `T-01` is a large task for one engineer. The PRD already accepts
that: `M1` is one task, alone, reviewed by the user.
