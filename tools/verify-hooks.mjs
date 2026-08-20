#!/usr/bin/env node
// Runs the hook command lines exactly as Claude Code runs them.
//
// `verify-plugin.mjs` checks that hooks.json says the right things;
// this file checks that the shell command inside it really works. The two are
// different failures: a quoting mistake in hooks.json passes every JSON check
// and still leaves the guard dead in a live session.
//
// Uses a throwaway HOME-free environment: the only variable it sets is
// CLAUDE_PLUGIN_ROOT, which is what Claude Code sets. Touches nothing else.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { PLUGIN_ROOT } from "../lib/roles.mjs";

let failures = 0;

function check(condition, message) {
  if (condition) return;
  failures += 1;
  console.error(`FAIL ${message}`);
}

const hooks = JSON.parse(readFileSync(join(PLUGIN_ROOT, "hooks", "hooks.json"), "utf8"));

/**
 * Run one hook's command line the way Claude Code does: through `sh -c`, with
 * the payload on standard input.
 *
 * @param command - the command line from hooks.json
 * @param input - what to write to standard input
 * @param env - extra environment variables
 * @returns what the command printed
 */
function runHook(command, input = "", env = {}) {
  return execFileSync("sh", ["-c", command], {
    input,
    encoding: "utf8",
    env: { ...process.env, ...env },
    stdio: ["pipe", "pipe", "pipe"],
  });
}

const sessionStart = hooks.hooks.SessionStart[0].hooks[0].command;
const preToolUse = hooks.hooks.PreToolUse[0].hooks[0].command;

// ── SessionStart ────────────────────────────────────────────────────────────

const started = runHook(sessionStart, "", { CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT, CLAUDE_CREW_JOBS_DIR: join(PLUGIN_ROOT, "no-such-jobs-folder") });
let context = "";
try {
  context = JSON.parse(started).hookSpecificOutput.additionalContext;
} catch {
  failures += 1;
  console.error(`FAIL the SessionStart hook did not print valid hook JSON, got: ${started.slice(0, 200)}`);
}
check(context.includes("product manager"), "the SessionStart hook must tell the session it is the PM");
check(context.includes("crew-engineer"), "the SessionStart hook must list the crew roles");

// With no plugin root, the hook must do nothing and still succeed.
check(runHook(sessionStart, "", { CLAUDE_PLUGIN_ROOT: "" }) === "", "the SessionStart hook must print nothing when CLAUDE_PLUGIN_ROOT is unset");

// ── PreToolUse ──────────────────────────────────────────────────────────────

const rolePush = JSON.stringify({
  hook_event_name: "PreToolUse",
  tool_name: "Bash",
  agent_id: "a1",
  agent_type: "crew-engineer",
  tool_input: { command: "git push origin main" },
});
const denied = runHook(preToolUse, rolePush, { CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT });
let decision;
try {
  decision = JSON.parse(denied).hookSpecificOutput;
} catch {
  failures += 1;
  console.error(`FAIL the PreToolUse hook did not print valid hook JSON, got: ${denied.slice(0, 200)}`);
}
check(decision?.hookEventName === "PreToolUse", "the deny must name the PreToolUse event");
check(decision?.permissionDecision === "deny", `a crew role's push must be denied, got ${JSON.stringify(decision?.permissionDecision)}`);
check(/claude-crew guard/.test(decision?.permissionDecisionReason ?? ""), "the reason must say which plugin refused, so the user knows where to look");

const rootPush = JSON.stringify({
  hook_event_name: "PreToolUse",
  tool_name: "Bash",
  tool_input: { command: "git push origin main" },
});
check(runHook(preToolUse, rootPush, { CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT }) === "", "your own session's push must print nothing, which means allow");

check(runHook(preToolUse, rolePush, { CLAUDE_PLUGIN_ROOT: "" }) === "", "the PreToolUse hook must print nothing when CLAUDE_PLUGIN_ROOT is unset");
check(runHook(preToolUse, "not json at all", { CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT }) === "", "a payload the hook cannot read must never break the tool call");

if (failures > 0) {
  console.error(`\nverify-hooks: ${failures} check(s) failed`);
  process.exit(1);
}
console.log("verify-hooks: ok");
