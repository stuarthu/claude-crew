# Step 8 — Design

**Design (big work only).** Start one `crew-architect`. Give it the PRD path,
   the repository path, the job folder, the **docs home** from step 6 as its
   absolute path, the language to write in, the milestone list the user confirmed,
   and the confirmed **Language and stack** section — it designs inside that stack
   and may not change it. It puts every task under one of your milestones — it
   does not invent, rename or reorder them; if it thinks a milestone is wrong, it
   reports that to you. It writes the design document
   — `docs/design/hld-<date>-<job-slug>.md`, the same shape as the opening
   document's name — plus `docs/decisions/adr/*.md` and `docs/tasks/`. It cannot
   start agents and it does not write code.

   Tell it the shape `docs/tasks/` has to keep: one row per task, and a
   **DoD section** on every row. A task table that arrives without those sections
   goes back to the architect: message it what was missing, or brief a fresh
   architect with the same if you cannot reach it.

   The architect splits the work into modules and, **when two or more modules
   talk to each other**, writes one contract file per boundary at
   `docs/design/api/<caller>-<callee>.md`: the style (in-process call, HTTP, gRPC,
   events, and so on), the data format, every call with its inputs, output and
   errors, and the rules each side must keep. It picks the style, not the library
   — the engineer uses what the repository already uses. For one-module work there
   are no boundary files, and that is correct, not missing. Why: principle 2 in
   principles.md.

   Each contract names one **contract test** per side — a unit test, written by
   the engineer that builds that side. The callee proves it answers what the file
   says; the caller tests against a stub built from the file, a stand-in for the
   other side. An engineer's report on a boundary task must show its contract test
   failing, then passing, like any other unit test. Why: principle 3 in
   principles.md.

   When the design has a boundary, the architect makes `T-01` a **walking
   skeleton**: the thinnest real path across the riskiest boundary, built by one
   engineer who owns files on **both** sides. That is the one task allowed to
   cross a boundary. Run it **alone** — every other task waits for it — and after
   it lands no later task may touch the files it owned. Why: principle 4 in
   principles.md.

   Treat a contract as frozen once either side starts:
   - Give both engineers the boundary file path with their task.
   - An engineer who says a contract is wrong reports it to you. Message the
     architect that wrote it, or start a fresh architect if you cannot reach it.
     **Only the architect edits a boundary file.**
   - When it changes, raise the document version in `state.json` and message
     **both sides** of that boundary the contract path and the new version. Do not
     discard every in-flight task on that boundary: a task starts again with a
     fresh engineer only when it has to be built from the beginning. Why:
     principle 10 in principles.md.

   When the architect reports, start a `crew-doc-reviewer` on those documents plus
   the opening document — **one agent per document**, one after another,
   **one round each, on the changed part only**, and only a change made because of
   its own finding brings one back. A reviewer you message still has that round in
   hand; a fresh reviewer never saw it, so paste its findings into the briefing.
   This is the **first of the doc review's two phase points**; the second is the
   end of the milestone — 10d, which step 15, **Last doc review**, finishes.
   **No code starts before the doc review passes.**

   For small work, skip this step: you wrote `docs/tasks/` yourself in step 4.
