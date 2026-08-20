# Changelog

Newest first. Each entry says what a user would notice.

## 0.1.0

First release. A port of [dsh-crew](https://github.com/stuarthu/dsh-crew) 0.6.0
(commit `690e291`) to Claude Code.

- Your session becomes the crew **product manager (PM)** in every project. The
  rules load at session start and are short on purpose — about fifty lines.
- The PM picks a lane every time: `ask`, `quick` or `team`. Only `team` loads the
  full playbook, the `crew:team-lane` skill.
- Seven role agents: `crew-researcher`, `crew-architect`, `crew-engineer`,
  `crew-qa`, `crew-code-reviewer`, `crew-security-reviewer`, `crew-doc-reviewer`.
  Reviewers can only read. The engineer and QA keep the shell.
- A role runs once and reports back. A second review round is a fresh role,
  briefed with the earlier round's blocking findings.
- A `PreToolUse` hook refuses crew roles the tools that start an agent, and every
  git command that writes, plus publishing and releasing. Your own session and
  other plugins' subagents are untouched.
- Unfinished jobs are reported at the start of the next session, and the PM asks
  you whether to carry on or start clean.
- `npm test` runs four checks; `npm run upstream ../dsh-crew` says what changed
  in dsh-crew since this port was last brought up to date.

Ported with changes, each one written up in `docs/principles.md`:

- The full PM prompt does not load in every session (principle 14).
- Roles do not stay alive; there is no `send_message` or `interrupt_agent`
  (principle 13).
- Roles can never push, so dsh-crew's one-shot push approval file is gone.
- The unfinished-job notice is printed once per session, not per turn.
