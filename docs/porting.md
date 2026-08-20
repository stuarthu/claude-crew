# Porting from dsh-crew

claude-crew is a port of [dsh-crew](https://github.com/stuarthu/dsh-crew). The
rules are the same. Only the machinery differs, because Claude Code is not dsh.

This file says how to keep the two in step.

## The map

| dsh-crew file | claude-crew file(s) | What changes on the way |
| --- | --- | --- |
| `roles/pm.md` | `skills/team-lane/SKILL.md` | All of it goes in the skill: step 0 (unfinished work), the PM rules, the roster and limits, then the 14 steps. |
| `roles/researcher.md` | `agents/crew-researcher.md` | Add frontmatter. Rename tools. Add "you run once". |
| `roles/architect.md` | `agents/crew-architect.md` | Same. |
| `roles/engineer.md` | `agents/crew-engineer.md` | Same. |
| `roles/qa.md` | `agents/crew-qa.md` | Same. |
| `roles/code-reviewer.md` | `agents/crew-code-reviewer.md` | Same. |
| `roles/security-reviewer.md` | `agents/crew-security-reviewer.md` | Same. |
| `roles/doc-reviewer.md` | `agents/crew-doc-reviewer.md` | Same. |
| `host/roles.js` | every `agents/*.md` frontmatter | dsh builds the tool filters at run time; Claude Code reads them from the agent file. Nothing checks them here — the design rules are written out in `CLAUDE.md` and in both READMEs instead. |
| `host/jobs.js` | `skills/team-lane/SKILL.md`, step 0 | Not code here. The PM looks in `~/.claude/crew/jobs/` itself when the skill loads. |
| `host/git-guard.js` | `agents/crew-engineer.md`, `agents/crew-qa.md`, and the "What is not enforced" section of both READMEs | **Not ported as code.** The plugin ships no hooks. The rule is stated in every role that owns a shell, and the README offers a hook the user can add to their own settings. See principle P3. |
| `host/crew.js` | `skills/team-lane/SKILL.md` | Nothing loads at session start. The skill's description is what makes Claude reach for the crew. |
| `host/roles-preset.js` | `agents/*.md` frontmatter | Claude Code has no presets. |
| `docs/principles.md` | `docs/principles.md` | Keep the numbering the same, so a principle can be quoted across both repositories. |
| `README.md` | `README.md` + `README-zh.md` | Rewritten, not translated — the install and the mechanics differ. |

## Things that deliberately did NOT port

Do not "fix" these by adding them back. Each one is a decision, and
`docs/principles.md` says why.

| dsh-crew | Why it is absent here |
| --- | --- |
| The preset installer and the `.bak` rescue | Claude Code plugins install themselves. There is no folder to overwrite. |
| `maxDepth: 1` | No equivalent setting, and none needed: Claude Code applies each agent's tool list itself, so a role does not have a delegation tool to use. |
| The git guard, as running code | The plugin is markdown only. See principle P3. |
| `send_message`, `interrupt_agent`, `list_agents` | A role runs once. A second round is a fresh role. |
| The one-shot push approval file | A crew role can never push, so there is nothing to approve. |
| The per-turn job notice | Claude Code adds hook text to context instead of replacing it, so it is printed once at session start. |

## A port pass, step by step

1. `git -C ../dsh-crew status` — an uncommitted change there is work in
   progress, not something to carry across.
2. `cd ../dsh-crew && sha256sum -c ~/workspace/claude-crew/upstream.sums` — every
   `FAILED` line is a file that moved. The comment above that line in
   `upstream.sums` says which claude-crew file it feeds.
3. Read the real change: `git -C ../dsh-crew log -p <file>`.
4. Decide, per change, which of three it is:
   - **carry it across** — the rule changed, and it applies here too;
   - **carry it with a change** — the rule applies but the mechanism differs
     (tool names, one-shot roles, no approval file);
   - **skip it** — it is about dsh machinery this port does not have. Write the
     reason in the comment above that line in `upstream.sums`, so the next pass
     does not re-open the question.
5. If a role's tool filter changed, edit the agent file's frontmatter — then
   re-read the design rules in `CLAUDE.md` against it, line by line. Nothing
   else will.
6. If a rule changed, update the matching principle in `docs/principles.md`.
7. Replace that file's line in `upstream.sums` with the output of
   `sha256sum <file>` run in the dsh-crew checkout, and update the Source and
   Commit lines at the top when the whole pass is done.
8. Add a line to `CHANGELOG.md` saying which dsh-crew version was carried across.

## A new role upstream

`sha256sum -c` cannot report a file it has never heard of, so look for a new role
by hand during a port pass:

```sh
git -C ../dsh-crew log --diff-filter=A --name-only <ported commit>..HEAD -- roles/
```

To add one:

1. Write `agents/crew-<name>.md` with exactly **one** of `tools` or
   `disallowedTools` in its frontmatter.
2. Name it in `skills/team-lane/SKILL.md`, in its roster table, and in the role
   table of both READMEs — the PM only uses what its playbook describes.
3. Re-read the design rules in `CLAUDE.md` against the new frontmatter.
4. Add a line for it in `upstream.sums`, with the map comment above it.
