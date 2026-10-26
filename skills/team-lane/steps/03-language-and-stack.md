# Step 3 — Language and stack

**Language and stack — settle it before anything is designed.** No task starts
   until it is written down and the user has said yes. Why: principle 8 in
   principles.md.

   **First look, do not ask.** Read the repository: the manifest
   (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`, and so
   on), the lock file, the test folder, the CI workflow, the README. If this
   repository already has a stack, that **is** the stack: do not re-open it, do not offer
   options, and confirm it with the user in one line.

   **Only when there is a real choice** — an empty repository, a new service, a
   part with nothing like it here yet — start a `crew-researcher` before you write
   the document. Ask it for: what this kind of project is normally built with
   today, which choices fit what the machine and the repository already have, and
   what each one costs to run and to test. It answers with a source per claim and
   writes no file — you put what is durable into your own documents. It has **no
   shell**, so run the version checks
   yourself — `node --version`, `python3 --version`, whatever applies — and send
   it the real output. A stack the machine cannot run is not a candidate.

   Then **you decide** and recommend one. Put a **Language and stack** section in
   the document you write in the next step, naming:

   - the language and the version, and the package manager;
   - the main framework, if the job needs one, and the database or storage;
   - the **test framework and the exact test command**;
   - the lint and format tools, if any;
   - how to run the thing by hand;
   - the runner-up you did not pick, and the one reason why not;
   - for anything you could not check on this machine, say so — never write a
     version you did not see with your own eyes.

   Ask the user to confirm it together with the document in step 5. If they want
   something else, say plainly what it costs and then use their choice. Once confirmed, the stack is fixed.

   **A new dependency is not a stack change, and it is not the engineer's call
   either.** Which of the libraries this project already has an engineer uses is
   its own decision. Adding a package the project does not depend on yet comes to
   you: say yes or no, and if yes, add it to the **Language and stack** section
   and raise the document version. A new dependency also turns on the security
   review in step 10b.
