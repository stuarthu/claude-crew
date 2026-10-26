# Step 13 — Release and upgrade plans

**Release and upgrade plans — for a milestone that really ships.**

    **Which commit these files go in.** There is no "milestone commit": whatever
    this step writes gets **a commit of its own**, message
    `docs: <short what> (crew <milestone>)`, with `git add` naming exactly those
    files and nothing else. Step 14's files do the same.

    **The milestone is not shipping.** Write no plan. Write a **shipping gap
    list** instead — `docs/release/<milestone>-gaps.md`, in the user's language,
    in a commit of its own: one honest paragraph saying it is not shipping, then
    what is still missing before it could — the version scheme, the release notes,
    an untested rollback, a missing token or account, a migration nobody has
    written. The next milestone **edits that same file** and shortens it; never
    write the list again from memory, and never leave it in a report only.

    **The milestone is shipping.** Projects are not alike, so do not write a plan
    from memory. Why: principle 13 in principles.md.

    - Start a `crew-researcher`. Give it the project type from the **Language and
      stack** section and ask what a release plan and an upgrade plan normally
      contain for it, with a source per claim, and what usually goes wrong.
    - Read what this repository already does first: `.github/workflows/`, a
      `CHANGELOG.md`, existing tags (`git tag`), the manifest's version field, any
      release script. What this project already does beats what is normal.
    - Ask the researcher to run nothing — it has no shell. You run the checks:
      `git tag`, `gh auth status`, whether a registry account or token exists.
      Record only **whether** a token exists — never its value, and never paste
      the output of an auth or token command into a file or a commit message.

    Then write two files, in the user's language, in the commit above.

    **`docs/release/<milestone>-release.md`** — how this reaches users: what is
    released and the version number, with the rule used to pick it; the release
    notes a user will read; the exact steps in order, with the real commands, and
    who has to approve each one; what must be true before you start (the unit
    tests green, QA's cases green, CI green, a clean branch, a token that exists —
    write down that it exists and where it lives, never its value); how you check
    afterwards that it worked; how to undo it and how long that takes, or say in
    those words that it cannot be undone; what you could not check, and who has to.

    **`docs/release/<milestone>-upgrade.md`** — how someone on the old version
    moves up: who is upgrading and from which versions; every breaking change and
    the exact thing the user must do; a data, schema or config migration, in order,
    and whether it can be run twice safely; what happens to someone who skips a
    version; how to go back after upgrading and what data would be lost; how long
    it takes and whether anything is offline while it runs. If nothing breaks and
    nothing must be migrated, say exactly that in one line.

    Show both to the user and get a clear yes before anything is pushed or
    published. The plan gives no permission: every push and every publish still
    needs its own yes in step 16, every time — the publish command has its own
    bullet there, and no push yes ever covers it. Small work has a milestone too,
    and it almost never ships, so it lands on the gap list above. If the change
    alters what a user installs or runs, say so in your final summary and ask
    whether they want a release plan before you push anything.
