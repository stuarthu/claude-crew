# PRD: port claude-crew up to dsh-crew v0.7.0

Version: 8
Language: documents and briefings in English; the PM talks to the user in Chinese.

## The problem, and who has it

claude-crew is a port of [dsh-crew](https://github.com/stuarthu/dsh-crew). Its only
value is that the two projects say the same thing. Drift between them is the single
risk this repository has, and it is now large.

Our port was made from dsh-crew commit `649ee52`, a mid-flight commit. dsh-crew has
since tagged **v0.7.0** (commit `87a4332`). Between the two:

- `principles.md` moved to the repository root and grew from 14 principles to 20.
- The `docs/crew/` folder is gone. Crew documents are now split by how long they
  live: `docs/design/`, `docs/decisions/adr/`, `docs/decisions/crd/`, `docs/qa/`,
  `docs/research/` (upstream CRD 0006 and CRD 0008).
- The DoD is no longer a file. There is one opening document, `docs/design/prd.md`,
  in both lanes, and the DoD is a section inside it (upstream CRD 0010).
- The PM playbook went from 14 steps to 18: a new step 13 (release and upgrade
  plans for a milestone that ships) and a new step 17 (merge the work branch and
  clean up, on three separate yeses).
- Step 10's three checks — code review, security review, QA — now run in parallel,
  and crew agents run in parallel by default (upstream principle 18).
- New PM sections: every "how" decision gets an ADR that lists every option with
  its cost, why it lost and a marked recommendation; a bug becomes a task row with
  its own DoD section.
- Limits changed: no cap on crew agents per job, 20 awake at the same time.
- All seven other role prompts changed.

The person who has this problem is the user of the plugin: today the plugin tells
them one set of rules while dsh-crew tells them another.

## Who this is for

- The user of the `crew` plugin in Claude Code, who gets whatever rules ship here.
- The next person to run a port pass, who needs `upstream.sums` and
  `docs/porting.md` to be true.

## What it must do

1. Carry across every dsh-crew v0.7.0 rule that applies to a Claude Code plugin.
2. Carry each one with the mechanism this port has, where the mechanism differs
   (tool names, no approval file, no hooks). **Corrected by CRD 0004:** this list used
   to name "a role that runs once" as one of this port's mechanisms. It is not one.
   Measured on 2026-08-21: the `Agent` tool returns at once so roles run in the
   background, `ListAgents` lists them, and a finished role can be resumed with its
   context. Roles still cannot message each other — that is the deny list, and it
   stays.
3. Skip dsh machinery, and write the reason where the next pass will read it.
4. Leave the repository markdown only. No `hooks/`, `scripts/`, `lib/`, `tools/`
   or `package.json` (design rule 6, principle P3).
5. Ship as version 0.3.0, in both JSON manifests and both READMEs.

## How success is measured

The acceptance checks below. Every one is a check on a file in this repository, so
a person who did not do the work can run it.

## Not in scope

These are dsh machinery. Each one gets its reason in `docs/porting.md` or in the
comment above its line in `upstream.sums`, so the next pass does not re-open it.

- `host/git-guard.js` and its fixes, `host/crew.js`, `tools/verify-*.mjs`,
  `tools/lib/boot-log.mjs`, the preset installer and its temp-folder fix.
- `.github/workflows/*`, `package.json`, and upstream CRD 0009 and CRD 0011 **as
  machinery** — QA cases wired into `npm test`, a Verdicts gate in `npm test`, CI
  on every push. The rule underneath — QA's cases are real files that run again
  from the project's own test command — is in scope, because it is a rule the crew
  applies to the *user's* project, not to this repository.
- The dsh preset's configuration comments: `roleAllow`, `roleDeny`, `roleModels`,
  `rolesDir`, and `cordis.patch.yml`. Claude Code has no presets; a role's tool
  filter is its own frontmatter.
- Upstream's own project record — its `docs/decisions/*`, `docs/qa/*` and
  `docs/design/tasks.md`. Those are dsh-crew's history, not rules.
- The researcher's "this preset has no `web_fetch`" note. Our researcher has
  `WebFetch`, so that paragraph is carried **with a change**, not copied.

Also not in scope: rewriting the published `0.2.0` section of `CHANGELOG.md`. The
new `0.3.0` section says instead that `0.2.0` only reached upstream's half-way
commit.

## Language and stack

This repository already has a stack, so there is nothing to choose. Read from
`CLAUDE.md`, the file tree and the git history:

- **Language:** Markdown, plus two JSON manifests (`.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`) and one checksum file (`upstream.sums`).
- **Package manager:** none. There are no dependencies and no lock file.
- **Framework:** none. It is a Claude Code plugin; Claude Code loads
  `./agents/` and `./skills/` by default discovery.
- **Database or storage:** none in the repository. Job state lives outside it, in
  `~/.claude/crew/jobs/<job>/state.json`.
- **Build step:** none. No bundler.
- **Test framework and the exact test command:** there is no test framework, and
  adding one is forbidden by design rule 6. The only runnable check is the
  upstream comparison:

  ```sh
  cd <dsh-crew checkout> && sha256sum -c ~/workspace/claude-crew/upstream.sums
  ```

  For this job that checkout is
  `/tmp/claude-1000/-home-stuart-workspace-claude-crew/8ec5abc5-4ba3-485c-b294-04978badfddb/scratchpad/dsh-crew`
  at tag `v0.7.0`. The user's own `~/workspace/dsh-crew` must never be read or
  touched — it is a working copy and is usually half-finished.
- **Lint and format:** none.
- **How to run it by hand:** install the plugin in Claude Code and ask for work
  big enough that the `team-lane` skill loads.
- **Runner-up not picked:** shipping runnable checks (a `docs/qa/**/*.sh` set, or
  a node checker). Not picked because it puts scripts back in a plugin that was
  twice cleaned of them, and because the user decided this job is verified by
  document review plus the PM's own line-by-line checks.
- **Not checked on this machine:** nothing. There is nothing to run a version
  check against.

## Verification for this job

The user decided this on 2026-08-21: **`crew-qa` is skipped for this job.** This
repository has no test runner and no code, and writing runnable QA case files
would put shell scripts back into a markdown-only plugin. Instead:

- `crew-doc-reviewer` is the main gate, with the normal round rules;
- the PM checks every acceptance check below against the real files itself and
  shows the output;
- the PM re-runs the upstream checksum command and shows the real result.

This is recorded here so nobody later reports a QA verdict that never happened.

## Where this job's own documents live

This job writes its own documents at the **new** upstream paths, not the old ones:

- this PRD at `docs/design/prd.md`;
- the high level design at `docs/design/hld.md` and the task table at
  `docs/design/tasks.md`;
- decision records at `docs/decisions/adr/NNNN-<short-name>.md`;
- change requests at `docs/decisions/crd/NNNN-<short-name>.md`;
- research, if any, at `docs/research/`.

The reason: the job's whole purpose is to abolish `docs/crew/`. Creating that
folder now, only to delete it in `M1`, would leave the repository contradicting
its own new rules for the length of the job. Every role in this job must use the
paths above, even where its own prompt still says `docs/crew/` — that prompt is
one of the things this job is fixing.

`crew-qa` is skipped for this job, so no `docs/qa/` folder is created here.

## Milestones

| id | goal | how the user tries it |
| --- | --- | --- |
| `M1` | The PM playbook says what dsh-crew v0.7.0 says: 18 steps, ADRs, bugs as task rows, the new document paths, parallel by default, the new limits. | Read `skills/team-lane/SKILL.md` against upstream `roles/pm.md`. Acceptance checks 1 to 9. |
| `M2` | All seven role prompts match their upstream v0.7.0 files, with the mechanism changed where it must be. | Read each `agents/*.md` against its upstream `roles/*.md`. Acceptance checks 10 and 11. |
| `M3` | The reasons and the port map catch up: `principles.md` at the repository root with 20 principles, `docs/porting.md` re-mapped, `upstream.sums` re-pinned to v0.7.0. | Run the checksum command; read `principles.md` and `docs/porting.md`. Acceptance checks 12 to 14. |
| `M4` | What a reader sees is true and says 0.3.0: both READMEs, `CLAUDE.md`, `CHANGELOG.md`, both manifests. | Read `README.md` and `README-zh.md` side by side; `grep 0.3.0` in the two manifests. Acceptance checks 15 to 20. |

`M1` is the walking skeleton: the skill is the only entry point to the crew and the
riskiest single file here. It is the only task in `M1`, one engineer builds it, and
the user reviews it before anything else runs.

## Acceptance checks

**M1 — the skill.**

1. `skills/team-lane/SKILL.md` holds 18 numbered steps. Step 13 is release and
   upgrade plans for a milestone that ships. Step 17 is merge and clean up, on
   three separate yeses (merge / push `main` / delete the branch). Step 18 is
   Finish.
2. Step 10 says the three checks — code review, security review and QA — run in parallel
   by default, and gives the reason. **The title stays "the three checks" even though
   step 10 now has four labelled sub-steps**: `10d`, the doc review, runs on every
   landing rather than being one of the three that decide a task, and three reviewers
   asked in round 3 that the title not be changed. What must be true is that `10a` to
   `10d` are all present and each says when it starts.
3. The limits section says: no cap on crew agents for one job, 20 crew roles awake
   at the same time, 3 review rounds.
4. The skill holds a section on decisions about how: every one gets an ADR, the ADR
   lists **every** option with its cost and why it lost, marks the recommendation,
   and the user may overturn it at the milestone review.
5. The skill says a bug becomes a task row and its DoD section is written first.
6. The skill says the opening document is `docs/design/prd.md` in both lanes, and
   that the DoD is a section inside it, never a file of its own.
7. Every crew document path in the skill is a new-layout path. The full v0.7.0 set
   is `docs/design/`, `docs/design/api/` (boundary contracts), `docs/decisions/adr/`,
   `docs/decisions/crd/`, `docs/qa/`, `docs/release/` (the release and upgrade plans
   of a milestone that ships) and `docs/research/`. The skill holds no `docs/crew/`
   path. *(The repository-wide sweep for `docs/crew/` is check 18, in `M4`, because
   it cannot pass until every file has landed — CRD 0001.)*
8. The skill states the fixed job-slug shape and says the PM announces the slug
   before it makes the job folder or the branch.
9. The skill's frontmatter `description` still says **when** to use the crew, and no
   longer says roles are started "one at a time" (design rule 8, principle 18).

**M2 — the roles.**

10. Each of the seven `agents/*.md` carries its upstream v0.7.0 changes. At least:
    `crew-engineer` has "a false red is not evidence" and "when you fix a bug, find
    at least two ways first"; `crew-qa` has "a false red is not evidence", its "Git"
    section and the standing testability list; `crew-security-reviewer` has its
    "First, read" section; `crew-researcher` has the release-and-upgrade-plan
    section and writes to `docs/research/`; `crew-architect` and
    `crew-code-reviewer` and `crew-doc-reviewer` carry their v0.7.0 text.
11. No agent's `tools` or `disallowedTools` list changed, and design rules 1 to 4 in
    `CLAUDE.md` still hold when read line by line against each file's frontmatter.

**M3 — reasons and the map.**

12. `principles.md` is at the repository root. It holds principles 1 to 20 with
    upstream's exact numbers and titles, plus this port's `P1` to `P5`.
    `docs/principles.md` no longer exists, and every reference to that path in the
    repository points at the new one — **except** the published `0.2.0` section of
    `CHANGELOG.md`, which the "Not in scope" list says must not be rewritten and
    where the old path is history, not a pointer (CRD 0001, ADR 0003).
13. `porting.md` — moved to the repository root by CRD 0002, so that `docs/` holds
    only crew job output — maps every upstream v0.7.0 path, and its "did not port"
    table names each skipped item from the "Not in scope" list above with its
    reason. `docs/porting.md` no longer exists, and every reference to the old path
    points at the new one.
14. `upstream.sums` records v0.7.0 (`87a4332`) in its header, one line per ported
    file, and `sha256sum -c` reports `OK` for every line when run in a `v0.7.0`
    checkout.

**M4 — what a reader sees.** Checks 19 and 20 are cross-cutting: the work for them
happens in every milestone, and they are only *verifiable* once the last file has
landed, so they are checked here.

15. `README.md` and `README-zh.md` say the same thing. Both show version 0.3.0, 18
    steps, parallel by default, and the new document paths. Both keep the "what is
    not enforced" section with the `PreToolUse` hook the user can add themselves.
16. `CLAUDE.md`'s design rules and its "State and documents" section match the new
    layout and the new rules, and still name every rule nothing enforces.
17. `CHANGELOG.md` has a `0.3.0` section that says which dsh-crew version was
    carried across, and says plainly that `0.2.0` only reached upstream's half-way
    commit `649ee52`. `.claude-plugin/plugin.json` and
    `.claude-plugin/marketplace.json` both say `0.3.0`.
18. The string `docs/crew/` appears nowhere in the repository, **except** inside
    this job's own documents under `docs/design/` and `docs/decisions/`, which quote
    the old paths as history, and inside `CHANGELOG.md`'s sections for `0.2.0` and
    earlier. Before the job the sweep found 75 lines in 10 files; outside those two
    exclusions the target is 0. (Moved here from check 7 by CRD 0001, because it
    cannot pass before `M4`.)
19. **CRD 0004.** No document claims a crew role cannot be messaged, and none claims a
    fresh role is the **only** way to run a second round. Saying that a later round may
    reach a role as a message **or** as a fresh role is required, not forbidden — that
    is shared sentence `S9`, and every role prompt must carry it.
    `skills/team-lane/SKILL.md` says the PM may message a role, live or finished; it
    carries the rule that a message may hold a **pointer** (a document path with its
    version), **evidence** (something copied out of the world that could be copied
    again — a diff, a command's output, a CI log, the text of a file), or a **request**
    for something the sender needs, and that anything which is none of the three is a
    decision, and decisions go in a document first; it carries the
    "user said stop" rule; and its `state.json` shape holds an agent id and a list of the
    commits the PM made. No `agents/*.md` frontmatter changed.

    *(Reworded at PRD version 7. Version 6 required the test to read "a document path and
    a version and nothing else". That wording forbade ten things the same file orders —
    sending a diff to a reviewer, a command's output to a role with no shell — and was
    stricter than upstream, whose `roles/pm.md` line 62 says only "Never decide anything
    in a message". Found by code review round 2; the wording is `S6` in
    `docs/design/tasks.md` version 4.)*
20. **CRD 0005.** Every document names **unit test** (written by `crew-engineer`, in the
    project's own suite, run by the project's test command) and **QA test** (written by
    `crew-qa`, under `docs/qa/<task-id>/`, run by `bash docs/qa/run-all.sh`) as two
    different things, and never uses one word for both. No document tells the crew to
    edit the project's test command. QA's `run.sh` and case files are in the code
    reviewer's file list.


## Risks

- **The skill is one very large file.** Upstream's `roles/pm.md` grew by about 850
  lines. A single engineer rewriting it can quietly drop a rule that nothing checks.
  This is why `M1` is alone and reviewed by the user.
- **Nothing here is enforced.** There is no test, no lint, no CI. Every design rule
  in `CLAUDE.md` is kept by a person reading it. The doc review and the PM's own
  checks are the only gate.
- **Two documents can disagree.** The same rule is written in the skill, in a role
  prompt, in `principles.md` and in both READMEs. Upstream principle 20 exists
  because of this. Any missed copy is a silent drift.
- **The Chinese README is a translation of a moving target.** It must be changed in
  the same commit as the English one, or the two split.
- **Path renames hide in prose.** `docs/crew/` appears in eleven files. A grep for
  the exact string is the only reliable check.

## Questions still open

- None blocking. The user has settled: full port, 0.3.0, `crew-qa` skipped for this
  job, documents in English, PRD with four milestones.
- Upstream is still moving. Anything committed to dsh-crew `main` after `87a4332`
  is out of scope here; this port targets the tag.
