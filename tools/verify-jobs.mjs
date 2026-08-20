#!/usr/bin/env node
// Checks the unfinished-job notice against throwaway job folders.
//
// Never reads the real `~/.claude/crew/jobs`: every case below builds its own
// folder under the system temp directory and removes it at the end.

import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { jobsNotice } from "../lib/jobs.mjs";

let failures = 0;

function check(condition, message) {
  if (condition) return;
  failures += 1;
  console.error(`FAIL ${message}`);
}

const root = mkdtempSync(join(tmpdir(), "claude-crew-jobs-"));

/** Write one job folder with the given state, and return the jobs root. */
function writeJob(name, state) {
  const dir = join(root, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "state.json"), typeof state === "string" ? state : JSON.stringify(state));
  return root;
}

try {
  // Nothing at all.
  check(jobsNotice(join(root, "missing")) === "", "a jobs folder that does not exist must produce no text");
  check(jobsNotice(root) === "", "an empty jobs folder must produce no text");

  // A folder with no state file is not a job.
  mkdirSync(join(root, "not-a-job"), { recursive: true });
  check(jobsNotice(root) === "", "a folder with no state.json must be ignored");

  // A finished job says nothing.
  writeJob("done-job", {
    job: "done-job", repo: "/tmp/p", branch: "crew/done-job",
    tasks: [{ id: "T-01", state: "done" }, { id: "T-02", state: "done" }],
  });
  check(jobsNotice(root) === "", "a job with every task done must produce no text");

  // An unfinished job is named, with its numbers.
  writeJob("open-job", {
    job: "open-job", repo: "/tmp/project", branch: "crew/open-job",
    tasks: [{ id: "T-01", state: "done" }, { id: "T-02", state: "running" }, { id: "T-03", state: "blocked" }],
  });
  let notice = jobsNotice(root);
  check(notice.includes("open-job"), "an unfinished job must be named");
  check(!notice.includes("done-job"), "a finished job must not be named");
  check(notice.includes("/tmp/project"), "the notice must say which repository the job belongs to");
  check(notice.includes("crew/open-job"), "the notice must say the branch");
  check(notice.includes("1 of 3 tasks done"), `the notice must count the tasks, got: ${notice}`);
  check(notice.includes("1 blocked"), "the notice must say how many tasks are blocked");
  check(notice.includes("carry on, or start clean"), "the notice must tell the PM to ask one question");

  // A job interrupted before it had a task list is unfinished too.
  rmSync(join(root, "open-job"), { recursive: true, force: true });
  writeJob("no-tasks", { job: "no-tasks", repo: "/tmp/project", tasks: [] });
  notice = jobsNotice(root);
  check(notice.includes("no task list yet"), `a job with no tasks must say so, got: ${notice}`);

  // Milestones, and a milestone waiting for the user.
  rmSync(join(root, "no-tasks"), { recursive: true, force: true });
  writeJob("milestone-job", {
    job: "milestone-job", repo: "/tmp/project",
    milestones: [{ id: "M1", state: "done" }, { id: "M2", state: "review" }, { id: "M3", state: "todo" }],
    tasks: [{ id: "T-01", state: "done" }, { id: "T-02", state: "todo" }],
  });
  notice = jobsNotice(root);
  check(notice.includes("milestone M2 of 3"), `the notice must name the milestone in progress, got: ${notice}`);
  check(notice.includes("waiting for the user's review"), "a milestone in review must say it is waiting for the user");

  // A broken state file is reported, never treated as finished.
  writeJob("broken-job", "{ this is not json");
  notice = jobsNotice(root);
  check(notice.includes("Could not read the state file"), `an unreadable job must be reported, got: ${notice}`);
  check(notice.includes("broken-job"), "the unreadable job must be named");

  // Never a silent cap: six unfinished jobs, five listed, one counted.
  rmSync(join(root, "broken-job"), { recursive: true, force: true });
  for (let index = 1; index <= 6; index += 1) {
    writeJob(`job-${index}`, { job: `job-${index}`, repo: "/tmp/p", tasks: [{ id: "T-01", state: "todo" }] });
  }
  notice = jobsNotice(root);
  check(notice.includes("…and 2 more, not listed here"), `the notice must say what it left out, got: ${notice}`);

  // It must never throw, whatever the state file holds.
  for (const odd of ['{"tasks": "not an array"}', '{"milestones": 7}', "null", "[]", '{"job": 5}']) {
    rmSync(join(root, "odd-job"), { recursive: true, force: true });
    writeJob("odd-job", odd);
    try {
      jobsNotice(root);
    } catch (error) {
      failures += 1;
      console.error(`FAIL a state file of ${odd} made the notice throw: ${error.message}`);
    }
  }
} finally {
  rmSync(root, { recursive: true, force: true });
}

if (failures > 0) {
  console.error(`\nverify-jobs: ${failures} check(s) failed`);
  process.exit(1);
}
console.log("verify-jobs: ok");
