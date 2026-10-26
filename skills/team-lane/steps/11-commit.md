# Step 11 — Commit

**Commit.** You are the only one who uses git; engineers never commit, and
    every role's prompt says so. If a role's report says it committed anything,
    treat that as a defect: run `git log` yourself and tell the user.

    **Run `git log` before every commit and before any merge.** Run
    `git log --oneline <startCommit>..HEAD`, with the `startCommit` from step 6,
    and compare every commit in it against the `"commits"` list in `state.json`.
    That list, not your memory, is what says which commits are yours. A commit
    not in the list is one you did not write: stage nothing, show it to the user,
    say which role made it, and a commit you did not write stops the job until it
    is sorted out. Why: principle 1 in principles.md.

    - On the job's first commit, also stage the documents you and the architect
      wrote: the opening document, `docs/tasks/`, and on big work the design
      document and every file under `docs/design/api/`. Stage them again
      whenever their version changed.
    - Stage exactly the files the task owns — the code and its unit test file —
      plus what this task produced: QA's case files and `run.sh` under
      `qa/<task-id>/`, `qa/run-all.sh` when you changed it, and the entries QA
      reported in `qa/gaps.md`, which you wrote. Never `git add -A`, never
      `git commit -a`.
    - **Never stage the job folder, and never un-ignore it.** A job folder file
      in `git status` means step 6's ignore line is missing: re-run its command
      before you stage anything.
    - If a file changed that no task owns, stop and show the user the file. The
      documents this playbook tells you to write belong to no task and live
      outside the repository — nothing to stage. The reader-facing files of step
      14 do go in the repository: stage them with the task whose work produced
      them, or in the commit of their own that steps 13 and 14 name.
    - Message in English: `<type>: <short what> (crew <task id>)`, for example
      `fix: stop double login redirect (crew T-03)`.
    - Write every commit down in the same turn you make it: its short sha and the
      task id, appended to the `"commits"` list in `state.json`. The extra
      commits of steps 13 and 14 go in the same list, with the milestone id in
      place of a task id.

    **Verdicts (this line is yours).** Every task in `docs/tasks/` opens its
    section with one bullet that starts `- **Verdicts**`. You write that line.
    Four values, in this order, in these words:

    - `code: pass`, or `code: pass (round 2)`;
    - `security: pass`, or `security: skipped — <the reason>`;
    - `qa: pass`;
    - `doc: pass`;
    - and `changes needed` or `not run — <the reason>` on any of the four, when
      that is the honest value for it.

    **`doc` has no `skipped` value: nobody switches the doc review off, and the
    user least of all.** A document nobody read is `doc: not run — <the reason>`:
    the review is missing, not waived.

    A `changes needed` value names the `T-<number>` that carries the fix, or the
    finding has no owner. A task with no **Verdicts** line is not finished: do not
    commit it. A review that did not happen is `not run — <the reason>` — never
    left out, never `pass` for a report you did not read, never a bare `not run`.
    Every `not run` and every `skipped` carries its own reason on that value; a
    reason in brackets at the end of the line does not count. A skip is allowed; a
    silent skip is not. The commit message carries the same four values, in the
    same words.

    **No check reads this line any more.** The line is still required: it is the
    job's record of which reviews ran. **What the line can and cannot prove:** it
    proves the line was written and that every skip carries a reason; it cannot
    prove a review happened. Why: principle 12 in principles.md.
