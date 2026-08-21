# ADR 0012: `crew-architect` keeps its shell and gains a Git section

Version: 1

## The choice

The doc review of `T-01` found it while listing the drift between the skill and
the role prompts (item 8), and it is more than drift:

- `agents/crew-architect.md` has **no git section at all**;
- its frontmatter is `disallowedTools: Agent, Task, Workflow, SendMessage,
  ListAgents`, which denies delegation and nothing else — so the role holds
  `Bash`, and a shell can commit;
- `CLAUDE.md` design rule 5 says: *every role that owns a shell is told, in its
  own prompt, that the PM does all the git work*;
- `skills/team-lane/SKILL.md` claims, in its hard rules, that "no crew role ever
  pushes, publishes or commits — that rule lives in every role's own prompt".

So the skill makes a promise about a file that does not keep it. `agents/crew-engineer.md`
and `agents/crew-qa.md` are the other two shell-owning roles and both have the
rule; the architect is the only one missing it.

This is not a v0.7.0 change. Upstream's `roles/architect.md` has no git section
either, and upstream's `host/roles.js` gives its architect the same
deny-delegation-only filter — but upstream ships `host/git-guard.js`, running code
that refuses a child's git write at the tool call. Upstream's architect needs no
sentence because upstream has a guard. This port has no hooks, so the sentence
**is** the mechanism (principle P3).

## Every option

### Option A — add a Git section to `agents/crew-architect.md`, in `T-02` **(recommended)**

The same rule the engineer and QA carry, in the architect's own words: reading git
is fine and useful, writing git is not, and the PM does all the git work.

- **Cost.** One short section in a file `T-02` is rewriting anyway. No frontmatter
  change, so PRD acceptance check 11 still passes.
- **Where it hurts later.** It is one more place the same rule is written, so one
  more place that can drift. `principles.md` P3 and both READMEs already carry the
  list of shell-owning roles, and `T-04` is putting the same fact in the other two
  prompts, so the wording is set once in `docs/design/tasks.md` and copied.
- **Why it wins.** It closes a live breach of a binding design rule of this
  repository, and it makes the skill's own claim true. It is also the only option
  that costs nothing anybody has to agree to.

### Option B — take `Bash` away: give the architect an allow list

`tools: Read, Glob, Grep, Write`. Then design rule 5 does not apply, because the
role owns no shell.

- **Cost.** A frontmatter change, which PRD acceptance check 11 forbids in this
  job ("no agent's `tools` or `disallowedTools` list changed") — so it needs a CRD
  and the user's yes. It also takes away something the prompt uses: "read the code,
  read the documents, **check the git history**" needs a shell, and so does reading
  a large tree quickly.
- **Where it hurts later.** An architect that cannot read git history designs
  without knowing why the code is the way it is, which is the failure the "do not
  design in the air" rule exists to stop. And a role that writes files gains
  nothing from an allow list: design rule 2's reasoning is about **reviewers**,
  where the point is that a role which must not write anything cannot be given a
  shell.
- **Why it lost.** It costs a confirmed acceptance check and a capability the
  prompt relies on, to avoid writing one paragraph.

### Option C — leave it as it is, because upstream leaves it as it is

- **Cost.** Free.
- **Where it hurts later.** The rule that no crew role commits is kept here by
  words in prompts and nothing else. One of the three shell-owning roles never
  hears it, while the skill tells the PM that all of them did. That is the exact
  shape principle P3 warns about: a claim with nothing behind it.
- **Why it lost.** Fidelity to upstream cannot mean copying a gap that only
  upstream's running code makes safe. `porting.md` already carries this rule as a
  mechanism difference (Class C, ADR 0009).

### Option D — say it in the PM's briefing instead of the prompt

- **Cost.** Free.
- **Where it hurts later.** The skill's own hard rule says "nothing that matters
  lives only in a briefing", and design rule 5 names the role's **own prompt** on
  purpose: a briefing is written fresh every time by a PM under time pressure.
- **Why it lost.** It relies on the one channel the rules say not to rely on.

## The recommendation

**Option A**, in `T-02`, with the wording set in `docs/design/tasks.md` so that
`T-02` and `T-04` say the same thing. The section says three things:

1. reading git is fine — `status`, `diff`, `log`, `show`;
2. writing git is not — no `commit`, no `add`, no branch, no push, no stash, no
   switch — and the PM does all the git work;
3. nothing here stops you, and nothing hides you either: the PM runs `git log`
   before every commit and before any merge, and a commit it did not write stops
   the job until it is sorted out.

Point 3 is the same fact `T-04` puts into `agents/crew-engineer.md` and
`agents/crew-qa.md`, and it is only true because `T-01`'s fix round adds that
check to the skill (security review blocking finding 1). The three files have to
land saying the same thing, so the clause **`git log` before every commit and
before any merge** is written once in `docs/design/tasks.md` and copied
character for character.

This is a Class B difference from upstream (ADR 0009): the rule is upstream's, the
place it is written is this port's.
