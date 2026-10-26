# Step 18 — Finish

**Finish.** Re-read every DoD section this job touched — each task row's, and
    each milestone's — and confirm every item in them against the real result. Run
    the project's test command once more, for the unit tests, and `bash qa/run-all.sh`
    once more, for QA's cases, and give the real numbers of both. If this job wrote
    no cases, say that in one line instead, with the reason.

    Then give the user a short summary. It has these slots, every time, in this
    order. A slot with nothing in it says so in one line — never leave it out:

    - **What was built** — in plain words.
    - **Files changed.**
    - **Test result** — the real numbers from the project's test command, which
      runs the unit tests, and from `bash qa/run-all.sh`, which runs QA's cases.
    - **Verdicts** — one line per task: code review, security review (or the
      stated reason it was skipped), QA, doc review. A verdict you do not have is
      written as `not run`.
    - **Choices** — one line per ADR of this job: what was being chosen, which
      ways there were, which one was taken, and why. The user may overturn any of
      them, and that is a change request.
    - **Reader-facing files** — the README updated or left alone and why; the
      `CHANGELOG.md` entry, or that none was needed; the rules-file edit
      (`CLAUDE.md` here), or that none was needed.
    - **Branch** — its name.
    - **Git** — what really happened: what was merged, what was pushed and what
      was deleted; or the plain statement that nothing was pushed, when nothing
      was.
    - **Left out** — what this job did not do.

    **Move what is durable out before you drop anything.** Some of this job's
    documents are single-use: QA's test plans, the output of a test run, and the
    `Q-` files in `<job folder>/inbox/`. A DoD is not among them any more — it is
    a section of a document that stays in the docs home until the job ends. The
    single-use ones live in the job folder and go with it. What is written inside
    them often is not single-use, so it moves to its own home first. There are
    **seven** homes, and the last two are the ones this crew lost twice. **Three
    of the seven are durable** — `principles.md`, the commit message and
    `qa/gaps.md`. The other four land in the docs home, which is read while the job
    runs and is not kept after it:

    - a rule the crew must keep next time → the repository's own rules file
      (`CLAUDE.md` here, or a `principles.md` where the repository keeps one);
    - a decision about **how** → an ADR in `docs/decisions/adr/`;
    - a decision about **what**, the scope or a contract → the document it moves,
      written there with a **Corrections** line and its date;
    - this change's reasons and its real test numbers → the commit message;
    - QA's "what I could not test here, and why" → `qa/gaps.md`: QA reports the
      lines and **you write them**, in the same turn you commit that task, and
      before the plan is dropped. That file stays in the repository and gets
      shorter as later jobs close those gaps;
    - **a DoD item's own wording** → the task row or the milestone it belongs to,
      in `docs/tasks/` or the opening document. Why: principle 20 in
      principles.md;
    - **which files a task owns** → that task's row in `docs/tasks/`.

    **Drop the single-use documents only after you have given the user this
    summary.** Why: principle 20 in principles.md.
