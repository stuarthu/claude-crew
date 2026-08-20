#!/usr/bin/env node
// Checks the shape of the plugin: the two manifests, the seven agent files, the
// skill, the hooks file, and the design rules that must never be broken.
//
// The important one is the drift check. `lib/roles.mjs` is the single source of
// truth, but Claude Code needs static agent files, so the table cannot build
// them at run time. This file is what keeps the two in step: an agent file whose
// frontmatter no longer matches the table fails the test run.
//
// Reads only files inside this repository. Touches nothing in your home folder.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { INVITATION_PATH, pmRulesFrom } from "../lib/pm.mjs";
import {
  AGENTS_DIR, DELEGATION_TOOLS, PLUGIN_ROOT, ROLES, ROLE_AGENT_NAMES,
  listAgentFiles, readAgentFile, splitFrontmatter,
} from "../lib/roles.mjs";

let failures = 0;

function check(condition, message) {
  if (condition) return;
  failures += 1;
  console.error(`FAIL ${message}`);
}

/** Frontmatter tool lists may be written `a, b` or `[a, b]`; read both. */
function toolList(value) {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  return value.split(",").map(one => one.trim()).filter(one => one.length > 0);
}

// Every tool name a role may name. dsh-crew keeps the same map and for the same
// reason: a name that does not exist is a silent hole, because the deny list
// stops covering the tool it meant to stop. Add a name here when you allow a new
// tool, and only after checking Claude Code really calls it that.
const KNOWN_TOOLS = new Set([
  "Agent", "Bash", "BashOutput", "Edit", "Glob", "Grep", "KillShell",
  "ListAgents", "NotebookEdit", "Read", "SendMessage", "Skill", "Task",
  "TodoWrite", "WebFetch", "WebSearch", "Workflow", "Write",
]);

// ── the manifests ───────────────────────────────────────────────────────────

const pluginPath = join(PLUGIN_ROOT, ".claude-plugin", "plugin.json");
const marketPath = join(PLUGIN_ROOT, ".claude-plugin", "marketplace.json");
check(existsSync(pluginPath), `${pluginPath} is missing`);
check(existsSync(marketPath), `${marketPath} is missing`);

const plugin = JSON.parse(readFileSync(pluginPath, "utf8"));
const market = JSON.parse(readFileSync(marketPath, "utf8"));

check(plugin.name === "crew", `plugin.json name should be "crew", got ${JSON.stringify(plugin.name)}`);
check(/^\d+\.\d+\.\d+$/.test(plugin.version ?? ""), `plugin.json version should look like 1.2.3, got ${JSON.stringify(plugin.version)}`);
check(typeof plugin.description === "string" && plugin.description.length > 40, "plugin.json needs a real description");
check(market.name === "claude-crew", `marketplace.json name should be "claude-crew", got ${JSON.stringify(market.name)}`);
check(Array.isArray(market.plugins) && market.plugins.length === 1, "marketplace.json should list exactly one plugin");
check(market.plugins?.[0]?.name === plugin.name, "marketplace.json must list the plugin by the name plugin.json uses");
// Leave component paths unset. `"agents": "./agents/"` is rejected outright, and
// `"agents": ["./agents/crew-engineer.md", ...]` installs cleanly and then loads
// ZERO agents — a silent, total outage. Default discovery of ./agents/,
// ./skills/ and ./hooks/hooks.json works, and was confirmed with
// `claude plugin details`.
for (const key of ["agents", "skills", "hooks"]) {
  check(!(key in plugin), `plugin.json sets "${key}". Remove it: default discovery works, and an explicit value silently loads nothing.`);
}

check(market.metadata?.version === plugin.version, `marketplace.json metadata.version (${market.metadata?.version}) must match plugin.json version (${plugin.version})`);

// ── the agent files ─────────────────────────────────────────────────────────

const onDisk = listAgentFiles();
const expected = ROLE_AGENT_NAMES.map(name => `${name}.md`).sort();
check(
  JSON.stringify(onDisk) === JSON.stringify(expected),
  `agents/ holds ${onDisk.join(", ")} but the role table expects ${expected.join(", ")}`,
);

for (const role of ROLES) {
  const where = `agents/${role.agentName}.md`;
  check(
    (role.allow === undefined) !== (role.deny === undefined),
    `${role.key} must have exactly one of allow or deny in the role table`,
  );
  if (!existsSync(join(AGENTS_DIR, `${role.agentName}.md`))) continue;

  const { frontmatter, body } = readAgentFile(role.agentName);

  check(frontmatter.name === role.agentName, `${where}: frontmatter name is ${JSON.stringify(frontmatter.name)}, should be ${role.agentName}`);
  check(typeof frontmatter.description === "string" && frontmatter.description.length > 60, `${where}: needs a description long enough to tell the PM when to use it`);
  check(/^Crew role\./.test(frontmatter.description ?? ""), `${where}: description must start with "Crew role." so it is never picked for ordinary work`);

  const allow = toolList(frontmatter.tools);
  const deny = toolList(frontmatter.disallowedTools);
  check((allow === undefined) !== (deny === undefined), `${where}: use exactly one of tools or disallowedTools`);

  if (role.allow) {
    check(JSON.stringify(allow) === JSON.stringify(role.allow), `${where}: tools is ${allow?.join(", ")} but the role table says ${role.allow.join(", ")}`);
  }
  if (role.deny) {
    check(JSON.stringify(deny) === JSON.stringify(role.deny), `${where}: disallowedTools is ${deny?.join(", ")} but the role table says ${role.deny.join(", ")}`);
  }

  for (const tool of [...(allow ?? []), ...(deny ?? [])]) {
    check(KNOWN_TOOLS.has(tool), `${where}: "${tool}" is not a Claude Code tool name known to this check. Add it to KNOWN_TOOLS only if it is real.`);
  }

  // Role files are real instructions, not stubs.
  check(body.trim().length >= 500, `${where}: the body is too short to be a real role prompt`);
  check(/product manager|\bPM\b/.test(body), `${where}: the body must say the role talks only to the PM`);
  check(/run(s)? once/i.test(body), `${where}: the body must say the role runs once, because it can never be messaged again`);
}

// ── design rules ────────────────────────────────────────────────────────────

for (const role of ROLES) {
  // 1. The crew is flat: no role may start an agent.
  if (role.deny) {
    for (const tool of DELEGATION_TOOLS) {
      check(role.deny.includes(tool), `${role.key} uses a deny list, so it must deny "${tool}"`);
    }
  }
  if (role.allow) {
    for (const tool of DELEGATION_TOOLS) {
      check(!role.allow.includes(tool), `${role.key} allows "${tool}", which would let a role start an agent`);
    }
    // 2. An allow-list role must never get a shell. A shell writes files, runs
    //    code, and can reach anything the deny lists tried to close.
    for (const tool of ["Bash", "BashOutput", "KillShell"]) {
      check(!role.allow.includes(tool), `${role.key} allows "${tool}"; an allow-list role may never have a shell`);
    }
  }
  // 3. A reviewer that can edit the thing it judges is not a reviewer.
  if (role.key.includes("review")) {
    check(role.allow !== undefined, `${role.key} is a reviewer, so it must use an allow list, never a deny list`);
    for (const tool of ["Write", "Edit", "NotebookEdit"]) {
      check(!(role.allow ?? []).includes(tool), `${role.key} is a reviewer and may not have "${tool}"`);
    }
  }
}

// The engineer and QA must keep the shell: they have to run the code and tests.
for (const key of ["engineer", "qa"]) {
  const role = ROLES.find(one => one.key === key);
  check(role !== undefined, `the role table lost "${key}"`);
  check(role?.deny !== undefined && !role.deny.includes("Bash"), `${key} must keep Bash — it has to run the code and the tests`);
}

// ── the hooks file ──────────────────────────────────────────────────────────

const hooksPath = join(PLUGIN_ROOT, "hooks", "hooks.json");
check(existsSync(hooksPath), `${hooksPath} is missing`);
const hooks = JSON.parse(readFileSync(hooksPath, "utf8"));
check(Array.isArray(hooks.hooks?.SessionStart), "hooks.json needs a SessionStart hook — that is what makes your session the PM");
check(Array.isArray(hooks.hooks?.PreToolUse), "hooks.json needs a PreToolUse hook — that is the guard");

const matcher = hooks.hooks?.PreToolUse?.[0]?.matcher ?? "";
for (const tool of [...DELEGATION_TOOLS, "Bash"]) {
  check(new RegExp(`(^|\\|)${tool}($|\\|)`).test(matcher), `the PreToolUse matcher does not cover "${tool}", so the guard never sees it`);
}
for (const event of ["SessionStart", "PreToolUse"]) {
  const command = hooks.hooks[event]?.[0]?.hooks?.[0]?.command ?? "";
  check(command.includes("CLAUDE_PLUGIN_ROOT"), `the ${event} hook command must find its script through CLAUDE_PLUGIN_ROOT`);
  check(command.includes("exit 0"), `the ${event} hook command must exit 0 when it cannot run, so it never breaks a session`);
}

// ── the skill and the always-on core ────────────────────────────────────────

const skillPath = join(PLUGIN_ROOT, "skills", "team-lane", "SKILL.md");
check(existsSync(skillPath), `${skillPath} is missing`);
if (existsSync(skillPath)) {
  const skill = splitFrontmatter(readFileSync(skillPath, "utf8"));
  check(skill !== undefined, "the team-lane skill has no frontmatter block");
  check(skill?.frontmatter.name === "team-lane", `the skill name should be "team-lane", got ${JSON.stringify(skill?.frontmatter.name)}`);
  check((skill?.body.length ?? 0) > 5000, "the team-lane skill body is too short to hold the whole playbook");
  for (const role of ROLES) {
    check(skill?.body.includes(role.agentName), `the team-lane skill never names ${role.agentName}, so the PM will not use it`);
  }
}

// The PM rules live in ONE place — inside the skill, between the markers — and
// the session-start hook reads them from there. Two copies would drift.
if (existsSync(skillPath)) {
  const skillText = readFileSync(skillPath, "utf8");
  check(skillText.includes("<!-- crew:pm:start -->"), "the team-lane skill must hold the PM rules between crew:pm markers");
  check(skillText.includes("<!-- crew:pm:end -->"), "the team-lane skill is missing the crew:pm:end marker");
  const rules = pmRulesFrom(skillText);
  check(rules.length > 800, "the PM rules block in the skill is too short to be the real rules");
  for (const phrase of ["One question per turn", "only one who uses git", "[lane: team]"]) {
    check(rules.includes(phrase), `the PM rules block must still say "${phrase}"`);
  }
}

const invitation = readFileSync(INVITATION_PATH, "utf8");
check(invitation.includes("crew:team-lane"), "invitation.md must name the skill to load, or nobody ever loads it");
check(invitation.split("\n").length < 30, "invitation.md is growing; it loads in every session, so keep it short");
// The quiet default must not tell Claude how to behave — that is the whole point
// of principle 14. It says the crew exists; the skill changes the manner.
for (const phrase of ["You are the product manager", "One question per turn"]) {
  check(!invitation.includes(phrase), `invitation.md must not say "${phrase}": the default mode announces the crew, it does not take the session over`);
}

// ── what the session-start hook really prints, in both modes ────────────────

const { execFileSync } = await import("node:child_process");

/** Run the hook and return the context it would add. */
function contextFrom(env) {
  const printed = execFileSync(process.execPath, [join(PLUGIN_ROOT, "scripts", "session-start.mjs")], {
    encoding: "utf8",
    env: { ...process.env, CLAUDE_CREW_JOBS_DIR: join(PLUGIN_ROOT, "no-such-jobs-folder"), ...env },
  });
  return printed.length === 0 ? "" : JSON.parse(printed).hookSpecificOutput.additionalContext;
}

const quiet = contextFrom({});
check(quiet.includes("crew:team-lane"), "the default session-start output must point at the team-lane skill");
check(!quiet.includes("One question per turn"), "the default session-start output must not change how Claude behaves");
check(quiet.length < 1200, "the default session-start output is growing; it is paid in every session");

const always = contextFrom({ CLAUDE_CREW_ALWAYS: "1" });
for (const role of ROLES) {
  check(always.includes(role.agentName), `always mode never names ${role.agentName}`);
}
check(always.includes("One question per turn"), "always mode must carry the PM rules");
check(always.includes("crew:team-lane"), "always mode must still send the PM to the skill for team work");

check(contextFrom({ CLAUDE_CREW_DISABLED: "1" }) === "", "CLAUDE_CREW_DISABLED=1 must print nothing at all");

if (failures > 0) {
  console.error(`\nverify-plugin: ${failures} check(s) failed`);
  process.exit(1);
}
console.log("verify-plugin: ok");
