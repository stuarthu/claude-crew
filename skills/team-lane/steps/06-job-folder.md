# Step 6 — Job folder

**Job folder.** Settle the job slug, then create
   `<repo>/.claude-crew/jobs/<job-slug>/state.json` (shape below), where `<repo>`
   is the repository this session works in. The job folder sits **inside** the
   repository, and every later step writes the same one by that **absolute** path
   — never a path derived from a child's own folder. Keep it up to date after
   every step. Why: principle 20 in principles.md.

   Before you write anything in it, put the folder out of git's sight **once**,
   in the repository's own local ignore file:

   ```sh
   gitdir=$(git rev-parse --git-common-dir)
   mkdir -p "$gitdir/info"
   grep -qx '^\.claude-crew/$' "$gitdir/info/exclude" 2>/dev/null || printf '%s\n' '.claude-crew/' >> "$gitdir/info/exclude"
   ```

   `--git-common-dir`, not `.git`: when git keeps more than one checkout of one
   repository, `.git` is a file that points at the shared base folder, and the
   ignore file git actually reads is the one inside that shared folder. The
   command is idempotent, so re-running it costs nothing.

   **The job folder is never staged and never committed.**

   The slug's shape is fixed: lowercase letters, digits and `-`, nothing else,
   and it may not start or end with `-`. As a pattern:
   `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`. At most 40 characters. It may never contain
   `..`. Why: principle 20 in principles.md.

   The user names the job in their own words; the slug is yours to derive. Never
   use their words as the slug as they stand, and never ask the user to invent a
   slug. Convert it yourself: lower-case it, replace every run of characters the
   pattern does not allow with a single `-`, trim `-` off both ends, then cut it
   to 40 characters and trim a trailing `-` again. If the result is empty, use
   `job-<YYYY-MM-DD>` with today's date. If a folder with that slug already
   exists and is not this job, add `-2`, then `-3`, until the name is free. Then
   tell the user in one line which slug you will use, before you create anything
   with it.

   Then record the commit the branch will be made from, as `startCommit` in
   `state.json`: run `git rev-parse HEAD` before step 7 creates the branch. Step
   11 and step 17 both read `startCommit`.

   **The documents of this job live outside the repository.** Their home is
   `<TMP>/claude-crew/<repo>/<job-slug>/`, where `<TMP>` is the system temp folder
   (`/tmp` when nothing sets it) and `<repo>` is the absolute path of the
   repository this session works in, with the leading `/` dropped and every other
   `/` written as `-`. A job at `/home/you/work/app` with the slug `add-sso` has
   the home `/tmp/claude-crew/home-you-work-app/add-sso/`. Inside that home:
   `docs/design/`, `docs/tasks/`, `docs/decisions/adr/` and `docs/release/`.
   Give every child the home's **absolute** path in its briefing. Why: principle
   19 in principles.md.

   The four files that are not job documents — `README.md`, `CHANGELOG.md`,
   `CLAUDE.md` and `principles.md` — stay in the repository.
