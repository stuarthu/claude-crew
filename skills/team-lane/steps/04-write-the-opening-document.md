# Step 4 — Write the opening document

**Write the opening document — a PRD, on small work and on big work alike.**
   Judge the size from what the user asked for and what the repository shows: how
   many parts it touches, whether it is a product or a fix, whether any real
   design choice is open. Say in one line how big you judged it, and that a
   single word changes it.

   **One job, one opening document, and its name carries the job:
   `docs/design/prd-<date>-<job-slug>.md`** (a PRD, a product requirements
   document). The date is the day you open it, the slug is this job's own name.
   `docs/tasks/` keeps its plain name — it is one table for the whole **job**. Why:
   principle 19 in principles.md.

   **Small work — a short PRD.** Three parts and nothing else: the goal, what is
   not in scope, and the **Language and stack** section from step 3. No section
   listing milestones: small work has **one** milestone, this job itself.

   **Big work — the same file with more in it, in four blocks**:

   1. **Product purpose** — the problem and who has it, written as the problem
      and **never as the solution**; who it is for; the big picture; and
      **scenarios**: who reads which part at which moment.
   2. **What it must do** — each item written as the **need, not the solution**,
      and traceable to one of the goals above. What is **out of scope**, the risks
      and the open questions live here.
   3. **Release criteria** — the non-functional bars this release must clear. The
      source names six: `Performance`, `Scalability`, `Reliability`, `Usability`,
      `Supportability`, `Localizability`. Give each one you keep a number or a
      command that decides it, and say which ones this job does not need.
   4. **Schedule** — a **target window** and why, never a date picked at random.

   Two more, both required:

   - **Prioritize.** Give every item one of `must-have`, `high-want`,
     `nice-to-have` **and** a rank inside its class, from 1 to n. Nothing ships
     while one `must-have` is unfinished.
   - **Test whether it is finished.** Two questions, both yes before step 5: can
     an engineer get enough understanding of the target from this document to
     build it, and can QA write a test plan and begin writing cases from it?

   **What a PRD does not hold**: file ownership, task ids, verification commands,
   and which module a change lands in — those belong to `docs/tasks/`.

   **A question the user left undecided is written nowhere in the opening
   document.** A question the user answered goes into the table of what the
   interview settled, and a "no" is an answer. **"Still undecided" holds only the
   decisions you already know must be made at a known later point** — never a
   question you asked and they skipped.

   **"Not in scope" may only hold an item with a real cost**: crossing it means
   work already finished has to be built again, it cannot be undone (a package
   published, a tag pushed, data deleted), or it would weaken a safety guard or a
   permission rule. Something you simply did not do does not go in the list.

   **Version history does not go in the PRD.** The PRD keeps **one line** — its
   current version and its date — and its corrections go under one fixed heading
   in that same document, `Corrections`, in the document's own language.

   **`DoD` (definition of done) is the name of a section, never the name of a
   file.** Do not create a file for it, anywhere.

   **Milestones.** A big job is cut into stops. Each milestone is something the
   user can look at and judge, written in their words, not in code words: "one
   real login works end to end", not "the auth module is finished". Give each one
   an id (`M1`, `M2`, …), a one-line goal, and how the user will try it. Why:
   principle 5 in principles.md.

   - **`M1` is the PoC** (proof of concept), and it is the walking skeleton: the
     thinnest real path across the riskiest boundary, running for real. One
     engineer builds it, it is the only task in `M1`, and the user reviews it
     before anything else runs. For work with no boundary, `M1` is the smallest
     thing the user can really try. Why: principle 4 in principles.md.
   - Three to six milestones is usually right.
   - Every milestone ends with a review by the user (step 12).
   - The last milestone must leave every DoD item met.

   **Every milestone carries a DoD section** (big work), and **every task row
   carries a DoD section** (small work and big work alike). One check has **two
   halves**, and both of them stay in the repository: the milestone's section says
   what "done" means, in words the user can read and judge and with no command in
   it, and the task row's section says **how somebody else checks it** — which QA
   case under `qa/<task-id>/`, and the exact command. Write every item so a person
   who did not write the code can carry it out and get a yes or a no.

   **There is no numbered list of checks any more, anywhere.** A check is an item
   inside the DoD section of the task or the milestone it belongs to, and you name
   it that way: "item 2 of T-05's DoD", never "acceptance check 19".

   **The task table is `docs/tasks/`, on small work and on big work alike.** One
   file, one place, one shape. Only the typist changes: on big work the architect
   writes it (step 8), on small work you write it yourself. Each row holds an id
   (`T-01`), one sentence of work, the exact files it owns, the **unit test file**
   it must write — one of the files it owns, so the unit test is a real file in
   the project's own suite that lives on after the job — and its **DoD section**.
   Two tasks must never own the same file.

   Engineers work **test first**: they write a failing unit test before the code.
   Before you write a task row, name the unit test
   you would expect for it. If you cannot name one, the task is not ready — split
   it or make it sharper. If a code task truly cannot be checked by an automated
   unit test, say so in its DoD section and give the reason there. Why: principle
   6 in principles.md.

   **Every task is one engineer, test first, and there is no shape line.** One
   `crew-engineer` writes the failing unit test and then the code that passes it.
   A task row carries no `**Shape**` bullet, and the file list is one list.
