# Step 16 — Push and CI

**Push and CI — with the user's permission, every single time.**

    First check whether it is even possible, and say what you find:
    - `git remote -v` — no remote means nothing to push.
    - `.github/workflows/` — no workflow means there is no CI to watch.
    - `gh auth status` — `gh` missing or not logged in means you cannot read the
      CI result.

    If any of those is missing, tell the user in one line and stop here.

    Otherwise ask the user for permission. Ask **before every push**, including
    a second push after a fix. Nothing in this plugin blocks a push, so the ask is
    the only thing that stops one. Say plainly what you are about to push, and
    wait for a clear yes.

    After they confirm:
    - Push exactly what they approved — a work branch, `main`, or a release tag
      such as `git tag v0.2.2 && git push origin v0.2.2`. Before a tag push, say
      loudly which workflow the tag push starts and whether it publishes, and get
      a yes for the tag push on its own — a yes for a work branch or for `main`
      never covers a tag.
    - **A publish needs a yes of its own, every time.** No yes for a branch, for
      `main` or for a tag covers `npm publish` or any other release command, and
      neither does the step 13 plan the user approved. Name the registry and the
      version it would reach, say a published version cannot be taken back, and
      run it only on a yes for that command itself.
    - **A force push needs a yes of its own too, for that one command and that
      one push**, on every branch, on `main` and on a tag alike. Run `git push
      --force` or `--force-with-lease` only when the user has approved that exact
      command, and ask again the next time — one approval never covers the next.
      Why: principle 1 in principles.md.
    - Watch the run: `gh run watch --exit-status` on the run for that branch or
      tag. If the command times out, poll with `gh run list --branch <branch>
      --limit 1` instead of guessing.
    - **CI green:** say so, with the run link.
    - **CI red:** read the failing job's log and give the real error text to the
      engineer for the task that owns those files — message it, live or finished,
      and start a fresh engineer only if you cannot reach it — then let it fix the
      task. Then the checks in step 10 run again, and the next push needs a fresh
      permission.
    - A run that never starts is not a pass. Say it did not start.

    Never report CI as passing on anything except a run you actually read.
