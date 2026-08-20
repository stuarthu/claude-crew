#!/usr/bin/env node
// SessionStart hook: make your session the crew PM.
//
// Prints three things as session context:
//   1. the thin PM core (lib/pm-core.md) — always on, deliberately short;
//   2. the role list and the limits, BUILT FROM `lib/roles.mjs`, so the PM can
//      never promise a role that does not exist;
//   3. the unfinished-job notice, when there is one.
//
// The full team playbook is NOT here. It lives in the `crew:team-lane` skill and
// is loaded when the PM picks the team lane. That is the whole point of the
// split: an `ask` or `quick` session pays about fifty lines, not four hundred.
//
// This hook must never fail loudly. A hook that errors would print noise at the
// top of every session in every project, so every failure path exits 0 quietly.

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { DEFAULT_JOBS_DIR, jobsNotice } from "../lib/jobs.mjs";
import { PLUGIN_ROOT, ROLES } from "../lib/roles.mjs";

/** Defaults the PM must respect. Each one can be raised with an environment variable. */
const DEFAULT_LIMITS = { liveAgents: 4, agentsPerJob: 20, reviewRounds: 3 };

/** Read a positive whole number from the environment, falling back to the default. */
function limitOf(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= 1 ? value : fallback;
}

/**
 * The facts the PM must know that live in code, not in prose: the exact agent
 * names, what each is for, and the limits. Kept out of `pm-core.md` so the list
 * cannot drift from the agent files that really ship.
 */
function crewSection(limits) {
  const roleLines = ROLES.map(role => `- \`${role.agentName}\` — ${role.summary}.`
    + (role.allow ? ` It can ONLY call ${role.allow.map(tool => `\`${tool}\``).join(", ")}, so run any command it needs yourself and give it the output.` : ""));

  return [
    "## Your crew and its limits (facts from the plugin, not suggestions)",
    "",
    "Start a role with the Agent tool, passing its name as `subagent_type`. A role",
    "runs once and reports back. There is no way to message a role again — to give",
    "it more work, start a fresh one with a full briefing. Roles share nothing but",
    "the files on disk, so anything two of them must agree on has to be written",
    "down first.",
    "",
    ...roleLines,
    "",
    "Limits you must respect. Stop and ask the user before going over any of them:",
    `- crew roles running at the same time: ${limits.liveAgents}`,
    `- crew roles for one job in total: ${limits.agentsPerJob}`,
    `- review rounds before you bring the disagreement to the user: ${limits.reviewRounds}`,
    "",
    `The crew is: a PM (you) plus ${ROLES.map(role => role.key.replace(/_/g, " ")).join(", ")}. Nothing else exists. Do not report work by a role that never ran.`,
    "Pushing the work branch and watching CI are your own steps, not a role's. Run them yourself, and ask the user before every push.",
  ].join("\n");
}

function main() {
  if (process.env.CLAUDE_CREW_DISABLED === "1") return;

  const limits = {
    liveAgents: limitOf("CLAUDE_CREW_LIVE_AGENTS", DEFAULT_LIMITS.liveAgents),
    agentsPerJob: limitOf("CLAUDE_CREW_AGENTS_PER_JOB", DEFAULT_LIMITS.agentsPerJob),
    reviewRounds: limitOf("CLAUDE_CREW_REVIEW_ROUNDS", DEFAULT_LIMITS.reviewRounds),
  };

  const parts = [
    readFileSync(join(PLUGIN_ROOT, "lib", "pm-core.md"), "utf8").trim(),
    crewSection(limits),
  ];

  if (process.env.CLAUDE_CREW_RESUME_NOTICE !== "0") {
    const notice = jobsNotice(process.env.CLAUDE_CREW_JOBS_DIR ?? DEFAULT_JOBS_DIR);
    if (notice.length > 0) parts.push(notice);
  }

  process.stdout.write(`${JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: parts.join("\n\n"),
    },
  })}\n`);
}

try {
  main();
} catch {
  // Silence on purpose: see the note at the top of this file.
}
