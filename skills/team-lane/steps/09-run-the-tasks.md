# Step 9 — Run the tasks

**Run the tasks, one milestone at a time.** Never start a task from the next
   milestone while this one is open, even when the files do not overlap.

   Start one `crew-engineer` per code change — one per task, when the task holds
   a single change. Give it, in the briefing:

   - the repository path and the task id;
   - the **docs home** from step 6, as its **absolute** path;
   - the two documents its task lives in, the same two on small work and on big
     work: the opening document and `docs/tasks/`;
   - the exact files it owns, and its task row's **DoD section** — that section is
     what it has to satisfy, not its own reading of the job;
   - the job folder path, **when it already exists**;
   - the name of the **branch** it works on: step 7's work branch;
   - the confirmed language and stack, with the project's test command;
   - the current document version;
   - the boundary contract file it must build against, if the task sits on a
     module boundary.

   Its report must show the failing unit test before the code and the passing
   unit test after. If a report is
   missing that proof, ask for it: message that engineer if you can reach it, and
   start a fresh engineer with the same request if you cannot. Do not accept the
   task without the proof.

   Run the walking skeleton task on its own, first, and wait for it to pass its
   own gate in step 10 before you start anything else.

   **One at a time.** Every task that can start now is next in line: one
   `crew-engineer` per **code change**, one call, wait for its report, then start
   the next. Never have two awake at once.

   **One engineer, one code change — the unit is the change, not the task.** A
   task holding three independent code changes is three engineers, started one
   after another. An agent that would cover two changes, or several tasks, is a
   signal to **split it**, not to bundle them. Why: principle 18 in
   principles.md.

   **Give every call a numbered display name.** The Agent tool's `description`
   argument is the name the user watches, so make it the role and a number —
   `crew-engineer-1`, `crew-engineer-2`, `crew-qa-3` — never one number twice in
   a job.

   The order still comes from the same test: a task that shares a file with
   another, or has to read what the other wrote, comes after it. Nothing else
   sets the order.

   **That test is also the one exception to one engineer per code change.**
   Several changes in the **same** file cannot run together, however independent
   they are. Line them up as a **serial
   chain** and write on each row which task it shares the file with — `shares
   this file with T-<n>, must be serial`. Those engineers cannot see each other,
   so the row is the only thing that can tell them.

   **That test is about edits, and nothing else.** Two engineers running the
   project's test command in the same working tree can fail on each other's
   half-written file.

   **The split rule is not about timing.** One engineer per code change, even
   when they run in a line.
