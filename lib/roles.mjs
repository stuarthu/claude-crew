// claude-crew role table.
//
// A "role" here is one Claude Code subagent file in `agents/` bound to:
//   - a locked persona  -> the agent file's body, so the child cannot argue
//                          itself into a different job;
//   - a tool filter     -> `tools` (an allow list) or `disallowedTools` (a deny
//                          list) in that file's frontmatter.
//
// This table is the SINGLE SOURCE OF TRUTH. Claude Code needs static agent
// files, so the table cannot generate them at run time. Instead:
//   - `scripts/session-start.mjs` builds the PM's role list from this table, so
//     the PM can never promise a role that does not exist;
//   - `tools/verify-plugin.mjs` fails the test run when an `agents/*.md`
//     frontmatter drifts from this table.
//
// The PM is deliberately NOT in this table: the PM is your own session, and its
// rules are printed by the session-start hook. Nothing spawns a PM.

import { readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Repository root, so every path below is absolute wherever node is started. */
export const PLUGIN_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Folder holding the shipped agent files. */
export const AGENTS_DIR = join(PLUGIN_ROOT, "agents");

/** Tools a read-only role may call: enough to read a repository, nothing more. */
const READ_ONLY = ["Read", "Glob", "Grep"];

// Every way a Claude Code agent can start another agent. Naming these in a
// maker role's deny list is the FIRST of three guards that keep the crew flat.
// The other two: reviewers use an allow list that names none of them, and
// `scripts/guard.mjs` refuses these tools to any crew role whatever its
// frontmatter says.
const NO_DELEGATION = ["Agent", "Task", "Workflow", "SendMessage", "ListAgents"];

// Why the reviewers use an allow list instead of a deny list: two live tests in
// dsh-crew, the project this is ported from. With only `Write` and `Edit`
// denied, a reviewer created a file with `echo hello > file` — a shell is a
// file-writing tool. With the shell denied too, its tool list still held
// workflow tools and desktop-control MCP tools. A deny list cannot name what a
// deployment has not installed yet; an allow list does not have to.

/**
 * The crew roles that exist as agent files.
 *
 * `key`       - short name used in prose and in the PM's list
 * `agentName` - the agent file's `name:` and its file name, and the value the
 *               PM passes as `subagent_type`
 * `summary`   - one short line, shown to the PM
 * exactly ONE of:
 * `allow`     - the complete tool list (`tools:` frontmatter)
 * `deny`      - tools removed from the full set (`disallowedTools:`)
 */
export const ROLES = [
  {
    key: "researcher",
    agentName: "crew-researcher",
    summary: "Find the facts a decision needs",
    // Reads anything, writes its findings, reads the web — and has no shell, so
    // it cannot run or change the project while it is looking around. The PM
    // runs any command it asks for.
    allow: [...READ_ONLY, "Write", "WebSearch", "WebFetch"],
  },
  {
    key: "architect",
    agentName: "crew-architect",
    summary: "Design the work and split it into tasks",
    // The architect writes design documents, so it needs the writing tools; it
    // must not start agents, and it must not touch code.
    deny: [...NO_DELEGATION],
  },
  {
    key: "engineer",
    agentName: "crew-engineer",
    summary: "Write code for one crew task",
    // Deny list: an engineer needs most of the tool set, so naming what it may
    // NOT have is the only workable shape here. It keeps Bash — it has to run
    // the code and the tests.
    deny: [...NO_DELEGATION],
  },
  {
    key: "qa",
    agentName: "crew-qa",
    summary: "Test the result against the document",
    // QA must actually run the software, so it keeps the shell. It writes only
    // its own test plan and defect notes; the PM's commit step catches any file
    // it touched that no task owns.
    deny: [...NO_DELEGATION],
  },
  {
    key: "code_reviewer",
    agentName: "crew-code-reviewer",
    summary: "Review one crew task's code",
    // ALLOW list, not a deny list. See the note above the table.
    allow: [...READ_ONLY],
  },
  {
    key: "security_reviewer",
    agentName: "crew-security-reviewer",
    summary: "Check one change for security holes",
    // Read-only for the same reason as any reviewer — and pointedly so here: a
    // role that hunts for dangerous code should not be able to run it.
    allow: [...READ_ONLY],
  },
  {
    key: "doc_reviewer",
    agentName: "crew-doc-reviewer",
    summary: "Review the crew's documents",
    // Same read-only shape as the code reviewer, and for the same reason: a
    // reviewer that can edit the thing it judges is not a reviewer.
    allow: [...READ_ONLY],
  },
];

/** Every crew agent name, for the guard and the checks. */
export const ROLE_AGENT_NAMES = ROLES.map(role => role.agentName);

/** Tools no crew role may ever call, whatever its frontmatter says. */
export const DELEGATION_TOOLS = [...NO_DELEGATION];

/** Expand a leading `~` so config paths can be written the way people type them. */
export function expandHome(path) {
  if (path === "~") return homedir();
  if (path.startsWith("~/")) return join(homedir(), path.slice(2));
  return path;
}

/**
 * Split a markdown file into its YAML frontmatter block and its body.
 *
 * Deliberately tiny: this reads `key: value` and `key: [a, b]` lines, which is
 * all an agent file's frontmatter uses. It is used by the checks, not at run
 * time, so a strict parser would only add a dependency.
 *
 * @param text - the whole file
 * @returns `{ frontmatter, body }`, or undefined when there is no frontmatter
 */
export function splitFrontmatter(text) {
  if (!text.startsWith("---\n")) return undefined;
  const end = text.indexOf("\n---\n", 3);
  if (end === -1) return undefined;
  const block = text.slice(4, end + 1);
  const body = text.slice(end + 5);

  const frontmatter = {};
  for (const line of block.split("\n")) {
    const match = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(line);
    if (match === null) continue;
    const [, key, raw] = match;
    const value = raw.trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      frontmatter[key] = value.slice(1, -1).split(",").map(one => one.trim()).filter(one => one.length > 0);
    } else {
      frontmatter[key] = value;
    }
  }
  return { frontmatter, body };
}

/**
 * Read one shipped agent file.
 *
 * @param agentName - e.g. `crew-engineer`
 * @returns `{ frontmatter, body, path }`
 */
export function readAgentFile(agentName) {
  const path = join(AGENTS_DIR, `${agentName}.md`);
  const text = readFileSync(path, "utf8");
  const parts = splitFrontmatter(text);
  if (parts === undefined) throw new Error(`claude-crew: ${path} has no frontmatter block`);
  return { ...parts, path };
}

/** Every `*.md` file name in `agents/`, so a stray file is caught by the checks. */
export function listAgentFiles() {
  return readdirSync(AGENTS_DIR).filter(name => name.endsWith(".md")).sort();
}
