# Step 17 — Merge and clean up

**Merge and clean up — only when the user asks for it.**

    Skip this whole step when the user did not ask for a merge, or when the work
    was done on `main` and there is no `crew/<job-slug>` branch at all. A work
    branch that just stays is a normal ending: say so and go to step 18.

    You do the merge yourself. Do not hand it back to the user to do by hand.
    The commands below write the remote as `origin` or as `<remote>`: the name
    `git remote -v` shows. When it is not called `origin`, use its real name every
    time, in the remote-tracking names too — read `origin/main` and
    `origin/crew/<job-slug>` as `<remote>/main` and `<remote>/crew/<job-slug>`.

    Check all five things before you ask anything, and say what you found:
    - CI is green on the work branch from step 16. If the repository has no
      remote and no workflow, say that in one line — there is no CI to be green,
      and the local test result from step 18 is what you rely on. Where CI
      exists, no green run means no merge.
    - `git status --short` is empty and every task is committed. Not empty means
      no merge: stop and show the user the files.
    - `git fetch <remote> --prune`, then look at whether `main` moved:
      `git log --oneline main..origin/main`. With no remote both commands fail —
      say that in one line and go on, there is nothing to be behind. If `main`
      moved, say so — you bring your local `main` up to date inside the merge
      below, after the user's yes.
    - Read `.github/workflows/` and decide whether a push of `main` would
      publish. Say which files you read: a workflow counts only when a BRANCH
      push can start it (`on: push:` with `branches:` under it, or `on: push`
      with nothing under it) AND it publishes or releases. A `tags:`-only
      trigger cannot be started by a branch push, so it does not count — say
      that in one line instead of warning. Look for the publish step in the run
      commands too, not only the words `npm publish`: a `run:` line calling a
      release script counts. If the shape is unclear, treat it as "it publishes".
      Other CI files count too — check `.gitlab-ci.yml`,
      `.circleci/config.yml`, `Jenkinsfile` and `azure-pipelines.yml` when they
      exist. A `tags:`-only conclusion is about this push of `main` only — in the
      same repository a TAG push is what publishes, so a tag push gets its own
      loud warning and its own yes.
    - `git log --oneline <startCommit>..HEAD` — read every commit on the branch
      and compare it against the `"commits"` list in `state.json`: the fifth check
      and the last one before you ask anything. A commit that is not in that list
      is one you did not write, and it means no merge: show the user the commit,
      say which role must have made it, and stop. Why: principle 1 in
      principles.md.

    Three separate yeses, and one yes never covers the next thing: one for the
    merge, one for the push of `main`, one for deleting the branch.

    **The merge.** Ask, and on a clear yes: `git switch main`, then
    `git merge --ff-only origin/main` when `main` moved. If that is not a
    fast-forward (that means `main` has commits your branch does not), run
    `git switch crew/<job-slug>`, tell the user and stop — do not merge, and do
    not force push `main` to get past it. The force-push rule of step 16 applies
    here: a force push needs its own yes, on every branch, on `main` and on a tag alike. Otherwise
    `git merge --no-ff crew/<job-slug>`. Never `--squash`. A conflict is not
    yours to guess at: run `git merge --abort`, then `git switch crew/<job-slug>`,
    name the clashing files, and stop. Anything that is not a clear yes ends this
    step: you are still on `crew/<job-slug>`, so say the branch stays unmerged and
    go to step 18.

    **The push of `main`.** With no remote there is nothing to push: say that in
    one line, skip this yes, and leave `pushed` out of `merge`. Ask again, on
    its own, and wait for a clear yes — anything less leaves `main` unpushed, and
    you say so. Put the answer from the publish check into that same question:
    name the workflow file and say loudly and plainly that it publishes, or say
    in one line that none of the CI files you read can publish on a `main` push.
    When you could not read the shape clearly, say that in those words: name the
    file, say you could not tell whether a `main` push starts it, and say you are
    treating it as publishing. Do not refuse — the user may still say yes, and
    then you push. If the push is refused because `main` moved, never force.
    `git fetch <remote> --prune`, then `git merge origin/main` on `main`. If that
    merge conflicts, run `git merge --abort` first, then `git switch
    crew/<job-slug>`, name the clashing files and stop. Otherwise tell the user
    what came in, and ask for the push again. This step force pushes nothing by
    default: `git push --force` and `--force-with-lease` are not part of it on any
    branch, `main` included, unless the user has approved that one command for
    that one push, and that approval covers that push and nothing after it. Why:
    principle 1 in principles.md. After the push, watch the CI run on `main` the
    same way as in step 16. A red run on `main` is not finished work.

    **The delete.** Prove it, never believe it. All three of these must hold, and
    a proof counts only when the command itself ran without an error:
    - `git branch --merged main` runs without an error and lists
      `crew/<job-slug>`.
    - `git log --oneline origin/main..main` runs without an error and prints
      nothing, so the work really is on the remote. An empty output from a
      command that failed is not a proof: if `origin/main` does not exist, if
      there is no remote, or if the default branch is not called `main`, this
      check has failed. Say so and stop.
    - `git fetch <remote> --prune`, then `git log --oneline
      main..origin/crew/<job-slug>` runs without an error and prints nothing, so
      the REMOTE branch holds nothing that `main` does not.

    If any of these three checks fails, do not even ask. Say which one failed and
    leave both branches alone. In a repository with no remote, or when the work
    branch was never pushed, proofs 2 and 3 cannot pass: say in one line that the
    local branch stays where it is, and do not ask.

    With all three proofs in hand, ask the third time. On a clear yes, run the
    third proof once more in the same turn — `git fetch <remote> --prune`, then
    `git log --oneline main..origin/crew/<job-slug>` — and only when it again
    runs without an error and prints nothing: `git branch -d crew/<job-slug>`
    (never `-D`) and then `git push origin --delete crew/<job-slug>`. If
    something appeared on the remote branch while you waited, do not delete: say
    what came in and stop. Anything that is not a clear yes leaves the branch
    where it is, and you say that.

    If the local branch is already deleted, stay on `main` and say so — do not
    recreate it; that is the one exception to the `git switch crew/<job-slug>`
    rule at the end of this step.

    If the push of `main` or the remote delete is refused, read the real error and
    repeat it. The error is the remote's own answer: branch protection, no
    permission, or the branch already gone. Say in one line which of these it was,
    give the user the exact command to run themselves (`git push origin main`, or
    `git push origin --delete crew/<job-slug>`), and move on. Do not retry, do
    not put the command in a script, and do not change a remote.

    Whenever you stop anywhere in this step after you have switched to `main` — a
    fast-forward that failed, a `no` from the user, a conflict, a refused push, or
    a refused delete — run `git switch crew/<job-slug>` before you say anything
    else.

    Write the result into `state.json` under `merge` (shape below) after each yes,
    and write `merge.publishCheck` there before you ask about the push of `main` —
    the merge key itself appears only once the merge has really happened.
