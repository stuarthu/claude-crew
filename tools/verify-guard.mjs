#!/usr/bin/env node
// Replays fake PreToolUse payloads against the guard rules.
//
// No Claude Code session, no shell, no git: every case below is a plain object
// shaped like the real hook input, which was captured from a live session
// (`agent_id` and `agent_type` are absent for your own session and set for a
// subagent). Touches nothing outside this repository.

import { refusalFor } from "../lib/guard.mjs";

let failures = 0;

/**
 * @param name - what the case is about, printed when it fails
 * @param input - the fake hook payload
 * @param shouldRefuse - true when the guard must block it
 */
function expect(name, input, shouldRefuse) {
  const reason = refusalFor(input);
  const refused = reason !== undefined;
  if (refused === shouldRefuse) return;
  failures += 1;
  console.error(`FAIL ${name}: expected ${shouldRefuse ? "refuse" : "allow"}, got ${refused ? `refuse (${reason})` : "allow"}`);
}

/** Your own session: no agent_type at all. */
const root = command => ({ tool_name: "Bash", tool_input: { command } });
/** A crew role: agent_type is the agent's name, agent_id is set. */
const role = (command, agentType = "crew-engineer") => ({
  tool_name: "Bash", agent_id: "a0510d50a34cb21fe", agent_type: agentType, tool_input: { command },
});

// ── your own session passes straight through ────────────────────────────────

expect("root pushes main", root("git push origin main"), false);
expect("root force pushes", root("git push --force origin work"), false);
expect("root pushes a tag", root("git push origin v1.2.3"), false);
expect("root publishes", root("npm publish"), false);
expect("root commits", root("git commit -m 'fix: something'"), false);

// ── a crew role never writes git ────────────────────────────────────────────

expect("role pushes a work branch", role("git push origin crew/my-job"), true);
expect("role pushes main", role("git push origin main"), true);
expect("role commits", role("git commit -m x"), true);
expect("role stages", role("git add src/a.ts"), true);
expect("role stashes", role("git stash"), true);
expect("role switches branch", role("git switch -c other"), true);
expect("role tags", role("git tag v1.0.0"), true);
expect("role changes the remote", role("git remote set-url origin git@example.com:x/y"), true);
expect("role commits after cd", role("cd /repo && git commit -m x"), true);
expect("role uses git -C to commit", role("git -C /repo commit -m x"), true);
expect("role uses git -c to commit", role("git -c user.name=bot commit -m x"), true);
expect("role runs git by full path", role("/usr/bin/git push origin work"), true);

// ── a crew role may read git ────────────────────────────────────────────────

expect("role reads status", role("git status"), false);
expect("role reads the diff", role("git diff HEAD~1"), false);
expect("role reads the log", role("git --no-pager log --oneline -5"), false);
expect("role reads a file at a revision", role("git show HEAD:src/a.ts"), false);
expect("role runs the tests", role("npm test"), false);

// ── publishing and releasing ────────────────────────────────────────────────

expect("role publishes with npm", role("npm publish"), true);
expect("role publishes with pnpm", role("pnpm publish --access public"), true);
expect("role moves a dist-tag", role("npm dist-tag add pkg@1.0.0 latest"), true);
expect("role creates a release", role("gh release create v1.0.0"), true);

// ── the crew stays flat ─────────────────────────────────────────────────────

for (const tool of ["Agent", "Task", "Workflow", "SendMessage", "ListAgents"]) {
  expect(`role calls ${tool}`, { tool_name: tool, agent_type: "crew-engineer", tool_input: {} }, true);
  expect(`root calls ${tool}`, { tool_name: tool, tool_input: {} }, false);
}

// Every role, not only the engineer.
for (const agentType of ["crew-architect", "crew-qa", "crew-code-reviewer", "crew-doc-reviewer", "crew-researcher", "crew-security-reviewer"]) {
  expect(`${agentType} pushes`, role("git push origin work", agentType), true);
  expect(`${agentType} starts an agent`, { tool_name: "Agent", agent_type: agentType, tool_input: {} }, true);
}

// ── scope: only crew roles are guarded ──────────────────────────────────────
//
// A subagent from another plugin is left alone on purpose. This plugin is always
// on, and it must not quietly change work that is not its own.

expect("another plugin's subagent pushes", {
  tool_name: "Bash", agent_id: "b1", agent_type: "general-purpose", tool_input: { command: "git push origin main" },
}, false);

// ── odd input must never crash the guard ────────────────────────────────────

expect("no tool_input at all", { tool_name: "Bash", agent_type: "crew-engineer" }, false);
expect("empty command", role(""), false);
expect("command is not a string", { tool_name: "Bash", agent_type: "crew-engineer", tool_input: { command: 42 } }, false);
expect("a tool the guard does not read", { tool_name: "Read", agent_type: "crew-engineer", tool_input: { file_path: "/x" } }, false);
expect("nothing at all", {}, false);

// ── a known false positive, kept on purpose ─────────────────────────────────
//
// The guard reads command text, so a command that only MENTIONS a git write is
// refused too. That is the safe direction to be wrong in: the role loses one
// echo, instead of the repository losing its history.

expect("role echoes the words git commit", role("echo 'run git commit later'"), true);

if (failures > 0) {
  console.error(`\nverify-guard: ${failures} check(s) failed`);
  process.exit(1);
}
console.log("verify-guard: ok");
