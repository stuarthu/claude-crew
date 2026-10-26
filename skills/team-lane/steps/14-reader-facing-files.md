# Step 14 — Reader-facing files

**README and the other reader-facing files.** You decide what they say, and
    an engineer may write them under a task row with its own DoD section. Check
    each one against what the crew just built.
    - `README.md` is always the main one and always in **English**, whatever
      language you speak with the user. If the user chose another language, keep a
      second file beside it with the same content in that language (`README-zh.md`
      for Chinese, `README-ja.md` for Japanese); if their language is English,
      there is only `README.md`. The language files must always say the same thing,
      so change both in the same commit. Keep code, commands, file names and
      settings exact in every language.
    - Update what is there; do not rewrite a README that is already fine. Update
      it when the job added or changed a command, an option, a setting, a setup
      step, or anything else a reader would notice; if nothing a reader would
      notice changed, leave the file alone and say that in your summary. If the
      repository has no README at all, write one: what this is, how to install it,
      how to use it, and how to run its tests.
    - Add a `CHANGELOG.md` entry when a user would notice the change: newest
      version first, plain English, what the user would see. No entry when nothing
      user-visible moved — say that in your summary.
    - Edit the repository's own rules file (`CLAUDE.md` here, whatever it is
      called) when this job moved that repository's rules or layout. That one is
      yours alone and never a task row. Show the user that edit and get a yes for
      it on its own before it is committed.
    - **The READMEs and `CHANGELOG.md` are not in the write set above**, and the
      rules file and the principles file are. You decide what all of them say;
      putting the words in those three files is not yours unless the user says so
      for that one write — give them to an engineer under a task row with its own
      DoD section, or show the user the file and get a yes for that one write.
    - **Which commit.** One written under a task row goes in that task's commit.
      What you write yourself goes in **one commit of its own**, message
      `docs: <short what> (crew <milestone>)`.
