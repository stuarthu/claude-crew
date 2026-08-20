#!/usr/bin/env node
// Tells you what changed in dsh-crew since this port was last brought up to date.
//
// claude-crew is a port. Its role prompts, its guard rules and its job notice all
// started as files in dsh-crew, and dsh-crew keeps moving. Nothing in Claude Code
// notices that, so this check does:
//
//   `upstream.json` records, for every upstream file this port was made from,
//   the SHA-256 it had at port time and which claude-crew files it feeds. This
//   script re-hashes those files in a dsh-crew checkout and prints the ones that
//   moved, with the claude-crew files to revisit.
//
// Usage:
//   node tools/check-upstream.mjs [path-to-dsh-crew]   # report drift, exit 1 if any
//   node tools/check-upstream.mjs --update [path]      # re-stamp after a port pass
//
// The path may also come from CLAUDE_CREW_UPSTREAM. It defaults to `../dsh-crew`.
// With no checkout there, this skips OUT LOUD and exits 0 — it must never fail a
// test run on a machine that only has this repository.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { PLUGIN_ROOT } from "../lib/roles.mjs";

const MANIFEST = join(PLUGIN_ROOT, "upstream.json");

const args = process.argv.slice(2);
const update = args.includes("--update");
const pathArg = args.find(one => !one.startsWith("--"));
const upstreamRoot = resolve(pathArg ?? process.env.CLAUDE_CREW_UPSTREAM ?? join(PLUGIN_ROOT, "..", "dsh-crew"));

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));

if (!existsSync(upstreamRoot)) {
  console.log(`check-upstream: SKIPPED — no ${manifest.source.name} checkout at ${upstreamRoot}.`);
  console.log(`check-upstream: clone ${manifest.source.repository} beside this repository, or pass the path, to run this check.`);
  process.exit(0);
}

/** SHA-256 of one upstream file, or undefined when it is gone. */
function hashOf(relative) {
  const full = join(upstreamRoot, relative);
  if (!existsSync(full)) return undefined;
  return createHash("sha256").update(readFileSync(full)).digest("hex");
}

/** Files matching one `folder/*.ext` pattern from `watch`. Deliberately tiny. */
function expand(pattern) {
  const at = pattern.lastIndexOf("/");
  const folder = pattern.slice(0, at);
  const rest = pattern.slice(at + 1);
  if (!rest.startsWith("*")) return existsSync(join(upstreamRoot, pattern)) ? [pattern] : [];
  const extension = rest.slice(1);
  const dir = join(upstreamRoot, folder);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(name => name.endsWith(extension)).map(name => `${folder}/${name}`);
}

const changed = [];
const gone = [];
for (const [relative, entry] of Object.entries(manifest.files)) {
  const now = hashOf(relative);
  if (now === undefined) {
    gone.push(relative);
    continue;
  }
  if (now !== entry.sha256) changed.push([relative, entry, now]);
}

// A file dsh-crew added that this port has never seen: a new role, a new guard.
const watched = new Set(manifest.watch.flatMap(expand));
const added = [...watched].filter(relative => !(relative in manifest.files)).sort();

// What version is the checkout on now?
let nowVersion = "unknown";
try {
  nowVersion = JSON.parse(readFileSync(join(upstreamRoot, "package.json"), "utf8")).version;
} catch { /* not fatal: the report works without it */ }

// Work someone is still doing upstream looks exactly like a released change from
// here. Saying which it is stops a port pass carrying across a half-finished edit.
let dirty = [];
try {
  const status = execFileSync("git", ["-C", upstreamRoot, "status", "--porcelain"], { encoding: "utf8" });
  dirty = status.split("\n").map(line => line.slice(3).trim()).filter(line => line.length > 0);
} catch { /* not a git checkout, or no git: the report works without it */ }

if (update) {
  for (const [relative, entry, now] of changed) manifest.files[relative].sha256 = now;
  for (const relative of added) {
    manifest.files[relative] = { sha256: hashOf(relative), portedTo: [], note: "NEW upstream file — decide what it means here" };
  }
  manifest.source.version = nowVersion;
  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`check-upstream: re-stamped ${changed.length} changed and ${added.length} new file(s) at ${manifest.source.name} ${nowVersion}.`);
  if (added.length > 0) console.log(`check-upstream: fill in "portedTo" for: ${added.join(", ")}`);
  process.exit(0);
}

console.log(`check-upstream: ported from ${manifest.source.name} ${manifest.source.version} (commit ${manifest.source.commit.slice(0, 7)}); the checkout at ${upstreamRoot} is ${nowVersion}.`);
if (dirty.length > 0) {
  console.log(`check-upstream: WARNING — that checkout has ${dirty.length} uncommitted file(s): ${dirty.join(", ")}.`);
  console.log("check-upstream: some of the changes below may be work in progress. Check before you carry them across.");
}

if (changed.length === 0 && gone.length === 0 && added.length === 0) {
  console.log("check-upstream: ok — nothing upstream moved since the last port pass.");
  process.exit(0);
}

if (changed.length > 0) {
  console.log(`\n${changed.length} upstream file(s) changed since the last port pass:\n`);
  for (const [relative, entry] of changed) {
    console.log(`  ${relative}`);
    console.log(`      look at: ${entry.portedTo.length > 0 ? entry.portedTo.join(", ") : "(nothing recorded — decide what it means here)"}`);
    if (entry.note) console.log(`      note:    ${entry.note}`);
    // Uncommitted upstream work is not in any commit, so `log -p` would show
    // nothing at all and read as "no change".
    console.log(dirty.includes(relative)
      ? `      diff:    git -C ${upstreamRoot} diff -- ${relative}   (uncommitted)`
      : `      diff:    git -C ${upstreamRoot} log -p ${manifest.source.commit.slice(0, 7)}..HEAD -- ${relative}`);
  }
}
if (added.length > 0) {
  console.log(`\n${added.length} file(s) are new upstream and this port has never seen them:\n`);
  for (const relative of added) console.log(`  ${relative}`);
}
if (gone.length > 0) {
  console.log(`\n${gone.length} file(s) this port was made from no longer exist upstream:\n`);
  for (const relative of gone) console.log(`  ${relative}`);
}

console.log("\nWhen you have carried the changes across, re-stamp with:");
console.log(`  node tools/check-upstream.mjs --update ${upstreamRoot}`);
console.log("See docs/porting.md for the file-by-file map.");
process.exit(1);
