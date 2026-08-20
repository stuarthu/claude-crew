# Changelog

Newest first. Each entry says what a user would notice.

## 0.1.0

First release. A port of [dsh-crew](https://github.com/stuarthu/dsh-crew) 0.6.0
(commit `690e291`) to Claude Code.

- By default the plugin only says, at the start of a session, that the crew is
  available and that real work should load the `crew:team-lane` skill. It does
  not change how Claude answers you.
- That skill makes the session the crew **product manager (PM)**. The PM picks a
  lane every time: `ask`, `quick` or `team`. Only `team` runs the crew.
- `CLAUDE_CREW_ALWAYS=1` loads the PM rules in every session, which is how
  dsh-crew behaves. The rules have one home — inside the skill — so the two ways
  of getting them cannot drift apart.
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
- `node tools/check.mjs` runs four checks; `node tools/check-upstream.mjs
  ../dsh-crew` says what changed in dsh-crew since this port was last brought up
  to date. There is no `package.json` — nothing here is an npm package.

Ported with changes, each one written up in `docs/principles.md`:

- The full PM prompt does not load in every session unless you ask for it
  (principle 14).
- Roles do not stay alive; there is no `send_message` or `interrupt_agent`
  (principle 13).
- Roles can never push, so dsh-crew's one-shot push approval file is gone.
- The unfinished-job notice is printed once per session, not per turn.
