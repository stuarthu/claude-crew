# CRD 0002 — move `docs/porting.md` to the repository root

## Who asked

`crew-architect`, as open question 1 in its design report (2026-08-21). It did not
make the move itself, because acceptance check 13 of the confirmed PRD names the
path `docs/porting.md`, and making a confirmed check false is not an architect's
call.

## What they want

`git mv docs/porting.md porting.md`, so the port map sits beside `CLAUDE.md` and
the newly moved `principles.md` at the repository root.

## Why

Upstream CRD 0007 moved `principles.md` out of `docs/` for one reason: after
v0.7.0, `docs/` means **crew job output** — `docs/design/`, `docs/decisions/`,
`docs/qa/`, `docs/research/`, `docs/release/` are all folders a crew job writes
while it runs. A permanent product document does not belong in that space.

That reasoning applies to `docs/porting.md` word for word. It is not job output.
It is a permanent instruction for whoever runs the next port pass, a sibling of
`CLAUDE.md` and `principles.md`. Leaving it in `docs/` means `docs/` holds six
crew-output folders and one product document, and the next reader has to be told
why.

## What it touches

- `docs/porting.md` → `porting.md` (task `T-07`, which already owns the file).
- `docs/design/prd.md` — acceptance check 13 names the old path.
- References to the old path: `CLAUDE.md` (task `T-09`), `README.md` and
  `README-zh.md` (task `T-10`), `upstream.sums` (task `T-08`), and this job's own
  `docs/design/hld.md` and `docs/decisions/adr/0002` as history.
- Root markdown files go from 5 to 6: `CLAUDE.md`, `README.md`, `README-zh.md`,
  `CHANGELOG.md`, `principles.md`, `porting.md`.

## Cost

Small, and nothing is rebuilt. `T-07` has not started — it is in `M3`. One
`git mv` plus four reference fixes, all inside tasks that were going to edit those
files anyway. `docs/` is then left holding only crew job output, which is what the
new rules say it is.

If it is rejected: also free. `docs/decisions/adr/0002` already carries the
explanation for why the file stays, so nothing is left unexplained either way.

## Decision

**Accepted.** The user said yes on 2026-08-21: move it to the root beside
`principles.md`.

## Applied

`docs/design/prd.md` version 3 → **version 4**: acceptance check 13 now names
`porting.md` at the repository root, and requires that `docs/porting.md` no longer
exists and that every reference to the old path points at the new one.

`docs/design/tasks.md` stays at version 1; `T-07` already owns the file and is
briefed with the new path. Nothing was rebuilt — `T-07` had not started.
