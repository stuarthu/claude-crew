// Where the PM rules live, and how to read them out.
//
// There is exactly ONE copy of the PM rules, and it is inside the team-lane
// skill, between the markers below. A session that loads the skill and a session
// running with CLAUDE_CREW_ALWAYS=1 therefore read the same words. A second copy
// in a second file would drift, and nobody would notice which one was stale.

import { join } from "node:path";

import { PLUGIN_ROOT } from "./roles.mjs";

/** The skill that holds both the PM rules and the 14-step playbook. */
export const SKILL_PATH = join(PLUGIN_ROOT, "skills", "team-lane", "SKILL.md");

/** The quiet default text: the crew exists, load the skill for real work. */
export const INVITATION_PATH = join(PLUGIN_ROOT, "lib", "invitation.md");

export const PM_START = "<!-- crew:pm:start -->";
export const PM_END = "<!-- crew:pm:end -->";

/**
 * The PM rules, taken from the team-lane skill.
 *
 * @param text - the whole skill file
 * @returns the text between the markers, trimmed
 */
export function pmRulesFrom(text) {
  const from = text.indexOf(PM_START);
  const to = text.indexOf(PM_END);
  if (from === -1 || to === -1 || to < from) {
    throw new Error(`claude-crew: the ${PM_START} / ${PM_END} block is missing from the team-lane skill`);
  }
  return text.slice(from + PM_START.length, to).trim();
}
