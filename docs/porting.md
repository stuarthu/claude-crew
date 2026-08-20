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
| `host/roles.js` | every `agents/*.md` frontmatter | dsh builds the tool filters at run time; Claude Code reads them from the agent file. `tools/check.mjs` checks the design rules the table used to guarantee. |
| `host/jobs.js` | `skills/team-lane/SKILL.md`, step 0 | Not code here. The PM looks in `~/.claude/crew/jobs/` itself when the skill loads. |
| `host/git-guard.js` | `agents/crew-engineer.md`, `agents/crew-qa.md`, and the "What is not enforced" section of both READMEs | **Not ported as code.** The plugin ships no hooks. The rule is stated in every role that owns a shell, and the README offers a hook the user can add to their own settings. See principle 15. |
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
| The git guard, as running code | The plugin is markdown only. See principle 15. |
| `send_message`, `interrupt_agent`, `list_agents` | A role runs once. A second round is a fresh role. |
| The one-shot push approval file | A crew role can never push, so there is nothing to approve. |
| The per-turn job notice | Claude Code adds hook text to context instead of replacing it, so it is printed once at session start. |

## A port pass, step by step

1. `node tools/check-upstream.mjs ../dsh-crew` — it lists every upstream file
   that moved and the claude-crew files each one feeds.
2. Read the real change: the report prints the `git -C ../dsh-crew log -p` line
   for each file.
3. Decide, per change, which of three it is:
   - **carry it across** — the rule changed, and it applies here too;
   - **carry it with a change** — the rule applies but the mechanism differs
     (tool names, one-shot roles, no approval file);
   - **skip it** — it is about dsh machinery this port does not have. Write the
     reason in `upstream.json` under that file's `note`, so the next pass does
     not re-open the question.
4. If a role's tool filter changed, edit the agent file's frontmatter, and add
   any new tool name to `KNOWN_TOOLS` in `tools/check.mjs`.
5. If a rule changed, update the matching principle in `docs/principles.md`.
6. `node tools/check.mjs`.
7. `node tools/check-upstream.mjs --update ../dsh-crew` to re-stamp.
8. Add a line to `CHANGELOG.md` saying which dsh-crew version was carried across.

## A new role upstream

`check-upstream.mjs` reports a new `roles/*.md` file as one this port has never
seen. To add it:

1. Write `agents/crew-<name>.md` with exactly **one** of `tools` or
   `disallowedTools` in its frontmatter.
2. Add it to the `ROLES` list in `tools/check.mjs`, saying which filter it uses.
3. Name it in `skills/team-lane/SKILL.md` — the PM only uses what its playbook
   describes.
4. If the allow list names a tool that is not in `KNOWN_TOOLS` in
   `tools/check.mjs`, add it there — but only after checking Claude Code really
   calls it that.
5. `node tools/check.mjs`, then `--update` the manifest.
