#!/usr/bin/env node
// SessionStart hook: tell the session that the crew exists.
//
// Two modes, and the default is the quiet one:
//
//   default            — print `lib/invitation.md`: the crew is here, and real
//                        work should load the `crew:team-lane` skill. It changes
//                        nothing about how Claude behaves in this session.
//
//   CLAUDE_CREW_ALWAYS=1 — print the PM rules themselves, so every session in
//                        every project behaves like the crew product manager.
//
// The PM rules are NOT stored here. They live inside the team-lane skill, between
// the `crew:pm` markers, and this file reads them out of that one copy. That way
// a session that loads the skill and a session running in always mode are reading
// the same words, and neither can drift from the other.
//
// The unfinished-job notice is printed in BOTH modes: a job someone left half
// done is news whatever mode this is.
//
// This hook must never fail loudly. It runs at the start of every session in
// every project, so every failure path exits 0 quietly.

import { readFileSync } from "node:fs";
import { DEFAULT_JOBS_DIR, jobsNotice } from "../lib/jobs.mjs";
import { INVITATION_PATH, SKILL_PATH, pmRulesFrom } from "../lib/pm.mjs";
import { ROLES } from "../lib/roles.mjs";

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
 * names, what each is for, and the limits. Built from the role table so the list
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
    "",
    "**Before any `team` lane work, load the `crew:team-lane` skill.** These rules are",
    "the short version; the skill holds the fourteen steps, the document shapes and",
    "the milestone rules. Do not run team work from memory.",
  ].join("\n");
}

function main() {
  if (process.env.CLAUDE_CREW_DISABLED === "1") return;

  const parts = [];

  if (process.env.CLAUDE_CREW_ALWAYS === "1") {
    const limits = {
      liveAgents: limitOf("CLAUDE_CREW_LIVE_AGENTS", DEFAULT_LIMITS.liveAgents),
      agentsPerJob: limitOf("CLAUDE_CREW_AGENTS_PER_JOB", DEFAULT_LIMITS.agentsPerJob),
      reviewRounds: limitOf("CLAUDE_CREW_REVIEW_ROUNDS", DEFAULT_LIMITS.reviewRounds),
    };
    parts.push(pmRulesFrom(readFileSync(SKILL_PATH, "utf8")), crewSection(limits));
  } else {
    parts.push(readFileSync(INVITATION_PATH, "utf8").trim());
  }

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
