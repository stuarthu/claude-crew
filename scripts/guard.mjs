#!/usr/bin/env node
// PreToolUse hook: the crew guard.
//
// Reads the hook payload from standard input, asks `lib/guard.mjs` for a
// decision, and prints a deny when there is one. Printing nothing means allow.
//
// Every failure path exits 0 without output. This hook runs before EVERY tool
// call in EVERY project, so a crash here would be worse than the hole it leaves.
// The rules it enforces are also written in the role prompts.

import { denyPayload, refusalFor } from "../lib/guard.mjs";

/** Read all of standard input. */
async function readInput() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

try {
  const raw = await readInput();
  const input = JSON.parse(raw);
  const reason = refusalFor(input);
  if (reason !== undefined) process.stdout.write(`${JSON.stringify(denyPayload(reason))}\n`);
} catch {
  // Silence on purpose: see the note at the top of this file.
}
