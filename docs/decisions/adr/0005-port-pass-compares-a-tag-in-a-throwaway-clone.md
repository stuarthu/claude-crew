# ADR 0005: a port pass compares against a tag in a throwaway clone, and what `upstream.sums` pins

Version: 1

## The choice

Two things that the current `docs/porting.md` and `upstream.sums` get wrong, and
that this job has to settle together, because both are about the same mechanism:
**how the next port pass finds out that upstream moved.**

1. **What to compare against.** Both files say `cd ../dsh-crew` — the user's own
   working copy at `~/workspace/dsh-crew`. This job could not use it: that copy
   is usually half-finished, so the job used a clean clone of tag `v0.7.0` in a
   temporary folder instead. `upstream.sums` even warns about this in a comment
   ("this compares the WORKING TREE") while still telling you to use it.
2. **Which upstream files get a pinned line.** Upstream grew a lot of new
   machinery between `649ee52` and `v0.7.0` — `.github/workflows/*`,
   `tools/verify-*.mjs`, `tools/lib/boot-log.mjs`, `docs/qa/lib/qa.mjs`,
   `package.json`, `preset/*`, `cordis.patch.yml` — none of which is ported.

## Every option, question 1: what a port pass compares against

### Option A — a clean clone of the newest **tag**, in a throwaway folder **(recommended)**

```sh
git clone --quiet https://github.com/stuarthu/dsh-crew "$TMP/dsh-crew"
git -C "$TMP/dsh-crew" checkout --quiet <newest tag>
cd "$TMP/dsh-crew" && sha256sum -c ~/workspace/claude-crew/upstream.sums
```

- **Cost.** A clone each pass, and one more command in the instructions.
- **Where it hurts later.** Nothing, as long as the instruction says which tag.
- **Why it wins.** A tag is a decision somebody made; `main` and a working copy
  are whatever state a person left behind. This port was made from `649ee52`, a
  mid-flight commit, and that is exactly why the gap grew to 11,000 lines before
  anyone measured it. It also makes the rule explicit: **never read
  `~/workspace/dsh-crew`.** That is the user's working copy.

### Option B — keep `cd ../dsh-crew`, and add "check `git status` first"

- **Cost.** Free. It is what the file says today.
- **Where it hurts later.** A clean `git status` does not tell you which commit
  you are on. A working copy sitting on a feature branch passes that check and
  gives a false comparison.
- **Why it lost.** It is the rule that already failed once, with the warning
  already written next to it.

### Option C — add a git remote for dsh-crew inside this repository and fetch it

- **Cost.** One `git remote add`, then `git fetch`.
- **Where it hurts later.** It puts another project's whole history into this
  repository's object store, and `sha256sum -c` needs real files on disk, so a
  worktree or a checkout is needed anyway.
- **Why it lost.** More moving parts for the same result.

## Every option, question 2: what `upstream.sums` pins

### Option A — pin the files whose **rules** this port carries, skips or restates: the 8 roles, the 5 `host/*.js`, `principles.md`, `README.md` **(recommended)**

15 lines, the same shape the file has today, with two path corrections
(`docs/principles.md` → `principles.md`) and the stale `tools/check.mjs` mention
removed. The skipped machinery is named in `docs/porting.md`'s "did not port"
table instead, with its reason.

- **Cost.** A change in an unpinned upstream file — a new CI workflow, a new
  `tools/verify-*.mjs` — is not reported by `sha256sum -c`.
- **Where it hurts later.** If dsh-crew ever moves a **rule** into one of those
  files, this port would not notice. `host/*.js` is pinned precisely because that
  has happened: the limits live in `host/crew.js`, not in `roles/pm.md`.
- **Why it wins.** It is what the confirmed PRD asks for — acceptance check 14
  says "one line per ported file". And `sha256sum -c` is a signal a person has to
  read: a file that fails every pass for reasons this port does not care about
  trains the reader to skim past `FAILED`.

### Option B — pin every file in the upstream repository

- **Cost.** About 120 lines, most of them QA cases and workflow files.
- **Where it hurts later.** Nearly every pass would report dozens of `FAILED`
  lines that mean nothing here. The one line that matters gets lost in them.
- **Why it lost.** A check nobody reads is worse than no check, because it looks
  like one.

### Option C — pin option A's 15 files plus `package.json` and `.github/workflows/*`

- **Cost.** 4 more lines.
- **Where it hurts later.** Those files change on every upstream release, so they
  fail constantly and say nothing about this port.
- **Why it lost.** Same reason as option B, in smaller print.

### Option D — drop `sha256sum` and record upstream's commit only

- **Cost.** The file shrinks to two lines.
- **Where it hurts later.** Nothing tells you **which** file moved, only that
  something did. Principle P5 exists because a port needs a way to notice the
  original moved, per file.
- **Why it lost.** It removes the only real check this repository has.

## The recommendation

Question 1: **Option A** — compare against the newest **tag**, in a throwaway
clone, and write into `docs/porting.md` and into `upstream.sums`'s header that the
user's `~/workspace/dsh-crew` is never read.

Question 2: **Option A** — 15 pinned lines, and every skipped item named in
`docs/porting.md`'s "did not port" table with its reason.

## One more thing the next pass needs

`sha256sum -c` cannot report a file it has never heard of, so a **new** upstream
role, or a rule moved into a new file, is invisible to it.
`docs/porting.md` already carries a by-hand check for a new role. `T-07` widens
it to "a new role **or** a new file under `roles/`, `host/` or the repository
root", and points it at the tag range:

```sh
git -C "$TMP/dsh-crew" diff --name-status <ported tag>..<new tag>
```
