# Changelog

Newest first. Each entry says what a user would notice.

## 0.1.0

First release. A port of [dsh-crew](https://github.com/stuarthu/dsh-crew) 0.6.0
(commit `690e291`) to Claude Code.

**It is markdown and nothing else.** No hooks, no scripts, no code — seven agent
files and one skill file. It runs wherever Claude Code runs, and adds nothing to
a session until it is used.

- Ask for work that is bigger than one small change and Claude loads the
  `crew:team-lane` skill. That makes the session the crew **product manager**:
  it picks a lane (`ask`, `quick`, `team`), writes down what "done" means, gets
  you to confirm it, and runs the work.
- Seven role agents: `crew-researcher`, `crew-architect`, `crew-engineer`,
  `crew-qa`, `crew-code-reviewer`, `crew-security-reviewer`, `crew-doc-reviewer`.
  Reviewers can only read. The engineer and QA keep the shell.
- A role runs once and reports back. A second review round is a fresh role,
  briefed with the earlier round's blocking findings.
- Big work is cut into milestones you approve one at a time. Nothing moves to the
  next milestone until you say so.
- Job state lives in `~/.claude/crew/jobs/`, outside your repository, so an
  interrupted job can be picked up later and your `git status` stays clean.
- `node tools/check.mjs` checks the design rules; `node tools/check-upstream.mjs
  ../dsh-crew` says what changed in dsh-crew since this port was last brought up
  to date. Both are contributor tools and never run on a user's machine.

Ported with changes, each one written up in `docs/principles.md`:

- Nothing loads into a session by itself; the skill's description is the entry
  point (principle 14).
- Roles do not stay alive; there is no `send_message` or `interrupt_agent`
  (principle 13).
- The git guard is not shipped as code. A role must never commit, push or
  publish, that rule is in every role prompt that owns a shell, and the README
  says plainly that nothing stops it — plus offers a hook you can add to your own
  settings (principle 15).
- The unfinished-job notice became step 0 of the playbook.
