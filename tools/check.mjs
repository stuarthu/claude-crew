#!/usr/bin/env node
// Runs every check in this repository.
//
// This is the whole test command: `node tools/check.mjs`. There is no npm here
// on purpose — the plugin is delivered as a git repository through a Claude Code
// marketplace, never as a package, and this repository has no dependencies. A
// `package.json` would only be a task runner wearing the clothes of a registry
// that is not involved.
//
// `check-upstream.mjs` is NOT in this list. dsh-crew moving is news, not a defect
// here, and it needs a checkout this machine may not have. Run it on its own:
//   node tools/check-upstream.mjs ../dsh-crew

import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TOOLS = resolve(dirname(fileURLToPath(import.meta.url)));

/** In order: the rules, the notice, the shape, then the wiring. */
const CHECKS = [
  ["verify-guard.mjs", "guard rules, replayed against fake hook payloads"],
  ["verify-jobs.mjs", "the unfinished-job notice, using throwaway folders"],
  ["verify-plugin.mjs", "manifests, agent files, design rules, table drift"],
  ["verify-hooks.mjs", "the hook command lines, run the way Claude Code runs them"],
];

const failed = [];
for (const [file, what] of CHECKS) {
  const result = spawnSync(process.execPath, [join(TOOLS, file)], { stdio: "inherit" });
  if (result.status !== 0) failed.push(`${file} (${what})`);
}

if (failed.length > 0) {
  console.error(`\ncheck: ${failed.length} of ${CHECKS.length} failed — ${failed.join(", ")}`);
  process.exit(1);
}
console.log(`\ncheck: all ${CHECKS.length} checks passed`);
