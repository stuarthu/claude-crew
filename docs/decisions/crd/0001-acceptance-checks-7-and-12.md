# CRD 0001 — correct acceptance checks 7 and 12

## Who asked

`crew-architect`, in its report on the design of this job (2026-08-21).

## What they want

Three corrections to the PRD's acceptance checks. None of them changes what is
built; each one makes a check say what it can actually verify.

1. **Acceptance check 7 is filed one milestone too early.** Its first half — the
   skill holds only new-layout paths — is `M1` work and is `T-01`'s own check 13.
   Its second half — the string `docs/crew/` appears nowhere in the repository —
   cannot pass until `T-02`..`T-06`, `T-09` and `T-10` have all landed. Move that
   second half to `M4`, as `T-11`'s check 10.
2. **Checks 7 and 12 need an exclusion that the PRD does not state.** This job's
   own documents under `docs/design/` and `docs/decisions/` quote the old paths as
   history, and so does the published `0.2.0` section of `CHANGELOG.md`, which the
   PRD's "Not in scope" list says must not be rewritten. Both sweeps must exclude
   those, or they can never reach zero. Today the sweep finds 75 lines in 10 files;
   the target is 0 outside the exclusions.
3. **Check 7's list of new-layout paths is short by two.** It names `docs/design/`,
   `docs/decisions/adr/`, `docs/decisions/crd/`, `docs/qa/` and `docs/research/`.
   Upstream v0.7.0 also uses `docs/design/api/` for boundary contracts and
   `docs/release/` for the release and upgrade plans of a milestone that ships.
   Both must be named, or the skill could pass check 7 while missing them.

## Why

The reason given: a check that cannot pass in the milestone it is filed under
either blocks a milestone that is really finished, or gets waved through — and a
waved-through check is worse than no check. The two missing paths matter because
`docs/release/` is a whole new upstream folder that arrived with the new step 13.

## What it touches

- `docs/design/prd.md` — acceptance checks 7 and 12, and the milestone table's
  "how the user tries it" column for `M1` and `M4`.
- No task changes. `docs/design/tasks.md` already carries all three corrections:
  `T-01` check 13 (skill only), `T-11` check 10 (the repository-wide sweep with
  its exclusions), and `T-01`'s "keep as rules for the user's project" list.

## Cost

Nothing is rebuilt. No task is re-run. This is an edit to one document, made
before any code task starts.

## Decision

**Accepted.** The user said yes on 2026-08-21, to all three corrections. Their
reason for the whole CRD: a check that cannot pass where it is filed either blocks
a finished milestone or gets waved through.

## Applied

`docs/design/prd.md` version 2 → **version 3**:

- check 7 now lists the full v0.7.0 path set, including `docs/design/api/` and
  `docs/release/`, and is scoped to the skill file only;
- check 12 now names the `CHANGELOG.md` `0.2.0` exclusion;
- a new **check 18** in `M4` carries the repository-wide `docs/crew/` sweep, with
  its two exclusions and the before-count of 75 lines in 10 files;
- the `M4` row of the milestone table now reads "Acceptance checks 15 to 18".

No task changed and no task was re-run. `docs/design/tasks.md` stays at version 1.
