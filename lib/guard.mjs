// The crew guard: the rules, with no input or output around them.
//
// `scripts/guard.mjs` is the thin wrapper that reads the hook's JSON from
// standard input and writes the decision back. Everything that decides anything
// lives here, so `tools/verify-guard.mjs` can replay fake tool calls against it
// without a Claude Code session.
//
// Two rules, and both apply ONLY to a crew role:
//
//   1. Flat crew — a role may not call any tool that starts another agent.
//      A role that started its own role would put that grandchild out of the
//      PM's reach, and two roles can never talk to each other anyway.
//
//   2. Only the PM uses git — a role may not push, publish, release, commit, or
//      change the repository's git state in any other way. Reading git
//      (`status`, `diff`, `log`, `show`) stays open, because a role needs it.
//
// Your own session is not a crew role, so nothing here touches it. Another
// plugin's subagent is not a crew role either, and is left alone on purpose:
// this plugin is always on, and it must not quietly change work that is not
// its own.
//
// Honest limit: this reads command text. A push hidden inside a script file, or
// a shell alias, gets through. It is a strong seat belt, not a locked door.

import { DELEGATION_TOOLS, ROLE_AGENT_NAMES } from "./roles.mjs";

/** Shell tools whose command text this guard reads. */
const SHELL_TOOLS = new Set(["Bash", "BashOutput"]);

/**
 * Git subcommands that change something. A crew role may run none of them.
 * Anything not listed here — `status`, `diff`, `log`, `show`, `blame` — is a
 * read and passes.
 */
const GIT_WRITE_SUBCOMMANDS = new Set([
  "push", "commit", "add", "rm", "mv", "tag", "branch", "switch", "checkout",
  "restore", "reset", "revert", "merge", "rebase", "stash", "clean",
  "cherry-pick", "am", "apply", "remote", "worktree", "init", "clone",
]);

/** Publishing and releasing, whatever the tool. */
const PUBLISH_PATTERN = /\b(npm|pnpm|yarn|bun)\s+publish\b|\bnpm\s+dist-tag\b|\bgh\s+release\s+create\b/;

/** Whitespace-separated tokens, so a flag is matched as a flag and not inside a word. */
function tokensOf(command) {
  return command.split(/\s+/).filter(token => token.length > 0);
}

/**
 * The git subcommand of a command line, or undefined when this is not git.
 *
 * Skips the global options that may sit between `git` and the subcommand, such
 * as `git -C /path push` or `git --no-pager log`.
 *
 * @param tokens - the command split on whitespace
 * @returns e.g. `push`, or undefined
 */
export function gitSubcommand(tokens) {
  const at = tokens.findIndex(token => token === "git" || token.endsWith("/git"));
  if (at === -1) return undefined;
  for (let index = at + 1; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith("-")) return token;
    // `-C <path>` and `-c <name>=<value>` take a value; skip it too.
    if (token === "-C" || token === "-c") index += 1;
  }
  return undefined;
}

/** Is this tool call coming from a crew role? */
export function isCrewRole(input) {
  return typeof input?.agent_type === "string" && ROLE_AGENT_NAMES.includes(input.agent_type);
}

/**
 * Decide one tool call.
 *
 * @param input - the `PreToolUse` hook payload
 * @returns the reason to refuse, or undefined to let the call through
 */
export function refusalFor(input) {
  if (!isCrewRole(input)) return undefined;
  const role = input.agent_type;

  // Rule 1: the crew is flat.
  if (DELEGATION_TOOLS.includes(input.tool_name)) {
    return `a crew role may not start another agent. Only the product manager does that, `
      + `because a role's child would be out of the PM's reach and two roles can never talk. `
      + `Report what you need to the PM instead.`;
  }

  if (!SHELL_TOOLS.has(input.tool_name)) return undefined;
  const command = input.tool_input?.command;
  if (typeof command !== "string" || command.length === 0) return undefined;

  // Rule 2: only the PM uses git.
  if (PUBLISH_PATTERN.test(command)) {
    return `publishing a package or creating a release is the user's decision, never an agent's. `
      + `Tell the PM what you think should be published.`;
  }

  const subcommand = gitSubcommand(tokensOf(command));
  if (subcommand !== undefined && GIT_WRITE_SUBCOMMANDS.has(subcommand)) {
    return `\`git ${subcommand}\` changes the repository, and the product manager is the only one `
      + `who uses git that way. Reading git is fine — \`status\`, \`diff\`, \`log\`, \`show\`. `
      + `Finish your files and report; the PM commits and pushes. (role: ${role})`;
  }

  return undefined;
}

/** Build the hook's JSON answer for a refusal. */
export function denyPayload(reason) {
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: `claude-crew guard: ${reason}`,
    },
  };
}
