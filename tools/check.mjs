#!/usr/bin/env node
// Checks this plugin's shape. Run it with `node tools/check.mjs`.
//
// This is a CONTRIBUTOR tool. It never runs on a user's machine: the plugin
// itself is markdown and nothing else — no hooks, no scripts, no interpreter.
// Node is used here only because the checks compare lists across files, which is
// unpleasant in shell.
//
// What it protects is the part a reader cannot see: an agent file's frontmatter
// decides what that role may do, and a single wrong word there quietly hands a
// reviewer a shell or lets a role start its own agents.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

let failures = 0;
function check(condition, message) {
  if (condition) return;
  failures += 1;
  console.error(`FAIL ${message}`);
}

// ── what the roles are ──────────────────────────────────────────────────────

/** The seven roles, and which shape of tool filter each one must use. */
const ROLES = [
  { file: "crew-researcher.md", filter: "tools" },
  { file: "crew-architect.md", filter: "disallowedTools" },
  { file: "crew-engineer.md", filter: "disallowedTools" },
  { file: "crew-qa.md", filter: "disallowedTools" },
  { file: "crew-code-reviewer.md", filter: "tools" },
  { file: "crew-security-reviewer.md", filter: "tools" },
  { file: "crew-doc-reviewer.md", filter: "tools" },
];

/** Every way a Claude Code agent can start another agent. */
const DELEGATION = ["Agent", "Task", "Workflow", "SendMessage", "ListAgents"];

/** Anything that can run a command. An allow-list role may name none of these. */
const SHELLS = ["Bash", "BashOutput", "KillShell"];

/** Anything that changes a file. A reviewer may name none of these. */
const WRITERS = ["Write", "Edit", "NotebookEdit"];

// Every tool name a role may use. A name that does not exist is a silent hole:
// the deny list stops covering the tool it meant to stop. Add one here only
// after checking Claude Code really calls it that.
const KNOWN_TOOLS = new Set([
  ...DELEGATION, ...SHELLS, ...WRITERS,
  "Glob", "Grep", "Read", "Skill", "TodoWrite", "WebFetch", "WebSearch",
]);

// ── reading markdown with frontmatter ───────────────────────────────────────

/**
 * Split a markdown file into its frontmatter and its body.
 *
 * Deliberately tiny: it reads `key: value` lines, which is all these files use.
 *
 * @param text - the whole file
 * @returns `{ frontmatter, body }`, or undefined when there is no frontmatter
 */
function split(text) {
  if (!text.startsWith("---\n")) return undefined;
  const end = text.indexOf("\n---\n", 3);
  if (end === -1) return undefined;
  const frontmatter = {};
  for (const line of text.slice(4, end + 1).split("\n")) {
    const match = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(line);
    if (match !== null) frontmatter[match[1]] = match[2].trim();
  }
  return { frontmatter, body: text.slice(end + 5) };
}

/** A frontmatter tool list, written `A, B` or `[A, B]`. */
function toolList(value) {
  if (value === undefined) return undefined;
  const inner = value.startsWith("[") && value.endsWith("]") ? value.slice(1, -1) : value;
  return inner.split(",").map(one => one.trim()).filter(one => one.length > 0);
}

// ── the plugin is markdown, and stays that way ──────────────────────────────

// Every one of these came back at some point in this plugin's short history, and
// each removal was a decision with a reason in docs/principles.md.
for (const gone of ["hooks", "scripts", "lib", "package.json"]) {
  check(!existsSync(join(ROOT, gone)), `"${gone}" is back. This plugin is markdown only — see docs/principles.md 15.`);
}

// ── the manifests ───────────────────────────────────────────────────────────

const plugin = JSON.parse(readFileSync(join(ROOT, ".claude-plugin", "plugin.json"), "utf8"));
const market = JSON.parse(readFileSync(join(ROOT, ".claude-plugin", "marketplace.json"), "utf8"));

check(plugin.name === "crew", `plugin.json name should be "crew", got ${JSON.stringify(plugin.name)}`);
check(/^\d+\.\d+\.\d+$/.test(plugin.version ?? ""), `plugin.json version should look like 1.2.3, got ${JSON.stringify(plugin.version)}`);
check((plugin.description ?? "").length > 40, "plugin.json needs a real description");
check(market.name === "claude-crew", `marketplace.json name should be "claude-crew", got ${JSON.stringify(market.name)}`);
check(market.plugins?.[0]?.name === plugin.name, "marketplace.json must list the plugin by the name plugin.json uses");
check(market.metadata?.version === plugin.version, `marketplace.json metadata.version (${market.metadata?.version}) must match plugin.json version (${plugin.version})`);
check((market.plugins?.[0]?.category ?? "") !== "", "the marketplace entry needs a category, the way the official directory writes them");

// Leave the component paths unset. `"agents": "./agents/"` is rejected at install,
// and an explicit array of file paths installs cleanly and then loads ZERO
// agents — a silent, total outage. Default discovery works.
for (const key of ["agents", "skills", "hooks", "mcpServers"]) {
  check(!(key in plugin), `plugin.json sets "${key}". Remove it: default discovery works, and an explicit value silently loads nothing.`);
}

// ── the agent files ─────────────────────────────────────────────────────────

const onDisk = readdirSync(join(ROOT, "agents")).filter(name => name.endsWith(".md")).sort();
check(
  JSON.stringify(onDisk) === JSON.stringify(ROLES.map(role => role.file).sort()),
  `agents/ holds ${onDisk.join(", ")} but this check expects ${ROLES.map(role => role.file).sort().join(", ")}`,
);

for (const role of ROLES) {
  const path = join(ROOT, "agents", role.file);
  if (!existsSync(path)) continue;
  const where = `agents/${role.file}`;
  const parts = split(readFileSync(path, "utf8"));
  check(parts !== undefined, `${where} has no frontmatter block`);
  if (parts === undefined) continue;
  const { frontmatter, body } = parts;

  const name = role.file.replace(/\.md$/, "");
  check(frontmatter.name === name, `${where}: frontmatter name is ${JSON.stringify(frontmatter.name)}, should be ${name}`);
  check((frontmatter.description ?? "").length > 60, `${where}: the description must be long enough to tell the PM when to use this role`);
  check(/^Crew role\./.test(frontmatter.description ?? ""), `${where}: the description must start with "Crew role." so it is never picked for ordinary work`);

  const allow = toolList(frontmatter.tools);
  const deny = toolList(frontmatter.disallowedTools);
  check((allow === undefined) !== (deny === undefined), `${where}: use exactly one of tools or disallowedTools`);
  check(frontmatter[role.filter] !== undefined, `${where}: this role must use ${role.filter}`);

  for (const tool of [...(allow ?? []), ...(deny ?? [])]) {
    check(KNOWN_TOOLS.has(tool), `${where}: "${tool}" is not a tool name this check knows. Add it to KNOWN_TOOLS only if it is real.`);
  }

  // 1. The crew is flat. Nothing here may start another agent.
  for (const tool of DELEGATION) {
    if (deny) check(deny.includes(tool), `${where}: a deny-list role must deny "${tool}"`);
    if (allow) check(!allow.includes(tool), `${where}: allows "${tool}", which would let a role start an agent`);
  }

  // 2. An allow-list role never gets a shell: a shell writes files and runs code,
  //    and reaches everything a deny list tried to close.
  if (allow) for (const tool of SHELLS) check(!allow.includes(tool), `${where}: allows "${tool}"; an allow-list role may never have a shell`);

  // 3. A reviewer that can change what it judges is not a reviewer.
  if (role.file.includes("review")) {
    check(allow !== undefined, `${where}: a reviewer must use an allow list, never a deny list`);
    for (const tool of WRITERS) check(!(allow ?? []).includes(tool), `${where}: a reviewer may not have "${tool}"`);
  }

  // 4. The engineer and QA keep the shell: they have to run the code and tests.
  if (["crew-engineer.md", "crew-qa.md"].includes(role.file)) {
    check(deny !== undefined && !deny.includes("Bash"), `${where}: must keep Bash — it has to run the code and the tests`);
  }

  check(body.trim().length >= 500, `${where}: the body is too short to be a real role prompt`);
  check(/product manager|\bPM\b/.test(body), `${where}: the body must say the role talks only to the PM`);
  check(/runs? once/i.test(body), `${where}: the body must say the role runs once, because it can never be messaged again`);
  // With no hook to stop it, the rule that a role never writes git has to be in
  // the prompt of every role that owns a shell.
  if (deny) check(/git/i.test(body), `${where}: a role with a shell must be told, in its own prompt, that the PM is the only one who writes git`);
}

// ── the skill ───────────────────────────────────────────────────────────────

const skillPath = join(ROOT, "skills", "team-lane", "SKILL.md");
check(existsSync(skillPath), `${skillPath} is missing`);
if (existsSync(skillPath)) {
  const parts = split(readFileSync(skillPath, "utf8"));
  check(parts !== undefined, "the team-lane skill has no frontmatter block");
  if (parts !== undefined) {
    check(parts.frontmatter.name === "team-lane", `the skill name should be "team-lane", got ${JSON.stringify(parts.frontmatter.name)}`);
    // Nothing announces this plugin at session start any more, so the
    // description is the ONLY thing that makes Claude reach for the crew.
    check((parts.frontmatter.description ?? "").length > 200, "the skill description is the only way the crew gets found; it must say plainly when to use it");
    check((parts.body ?? "").length > 8000, "the skill body is too short to hold the PM rules and the whole playbook");
    for (const phrase of ["One question per turn", "only one who uses git", "[lane: team]", "~/.claude/crew/jobs"]) {
      check(parts.body.includes(phrase), `the skill must still say "${phrase}"`);
    }
    for (const role of ROLES) {
      const name = role.file.replace(/\.md$/, "");
      check(parts.body.includes(name), `the skill never names ${name}, so the PM will not use it`);
    }
  }
}

// ── the documents ───────────────────────────────────────────────────────────

for (const file of ["README.md", "README-zh.md", "CHANGELOG.md", "CLAUDE.md", "LICENSE", "docs/principles.md", "docs/porting.md", "upstream.json"]) {
  check(existsSync(join(ROOT, file)), `${file} is missing`);
}

if (failures > 0) {
  console.error(`\ncheck: ${failures} check(s) failed`);
  process.exit(1);
}
console.log("check: ok");
