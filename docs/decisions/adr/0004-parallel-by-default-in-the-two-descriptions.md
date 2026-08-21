# ADR 0004: how "parallel by default" reaches the two descriptions nothing checks

Version: 1

## The choice

Upstream CRD 0004 reversed the rule: agents run **in parallel by default**, and
serializing needs a real reason. Upstream principle 18 carries it. Locally, the
words "one at a time" are written in two places that are load-bearing and that
nothing checks:

1. `skills/team-lane/SKILL.md`'s frontmatter `description` — "start
   crew-architect, crew-engineer, ... **one at a time**, review their work, and
   commit". `CLAUDE.md` design rule 8 says this description is the only entry
   point to the crew: if it goes vague or short, the crew simply never runs and
   nothing says why.
2. `.claude-plugin/plugin.json`'s `description` — "... started **one at a time**,
   talking only through files on disk". This is what a user reads in
   `/plugin` and in the marketplace.

Both are user-visible strings that no rule, test or grep protects. The question
is how each one changes without weakening what it does.

## Every option

### Option A — rewrite both, keep every trigger word, replace the phrase with what the crew now does **(recommended)**

For the skill: drop "one at a time" and put the parallel rule in its place, and
raise "14 steps" to "18 steps". Keep every word that makes the model reach for
the skill: "bigger than one small clear change", "a feature, a refactor, several
steps, code plus tests, or any open design choice", the seven role names, "Load
it before you start, not halfway through".

For `plugin.json`: replace "started one at a time" with wording that says roles
run in parallel where their files do not overlap.

- **Cost.** Two strings edited by hand in two different tasks (`T-01` and
  `T-11`), with no check that they agree.
- **Where it hurts later.** If a later editor shortens either one, the crew stops
  being found and nothing reports it. That risk exists today and does not get
  worse.
- **Why it wins.** It is the only option that both tells the truth and keeps the
  entry point strong. The phrase being removed is a claim about mechanism; the
  words that trigger the skill are claims about **when** to use it, and none of
  them are touched.

### Option B — delete the phrase and say nothing about how roles run

- **Cost.** Free, and the shortest edit.
- **Where it hurts later.** The description then says less than it did. Design
  rule 8 says the description must say **when** to use the crew — a mechanism
  sentence is not what triggers it — but a shorter description is measurably
  weaker at being chosen, and nothing here can measure it.
- **Why it lost.** It gives up a chance to state a real rule for no gain, and
  parallel-by-default is one of the two headline changes of this port.

### Option C — change the skill description only, and leave `plugin.json`

- **Cost.** One edit instead of two.
- **Where it hurts later.** The plugin's own marketplace description would then
  be the last place in the repository still promising "one at a time". A user
  reading `/plugin` gets a false picture of the product, and the two files
  disagree.
- **Why it lost.** `M4` exists precisely so that what a reader sees is true.

### Option D — put both strings in one task, so one engineer keeps them identical

- **Cost.** `T-01` would then own `.claude-plugin/plugin.json`, which belongs to
  `M4`, not `M1`. `M1` must be exactly one task owning exactly one file.
- **Where it hurts later.** It breaks the walking-skeleton rule the PRD sets for
  `M1`, and it lands a version-manifest edit before the user has reviewed the
  skill.
- **Why it lost.** The two strings do not have to be identical — they are written
  for different readers. They only have to agree on the fact. Writing the fact
  into `docs/design/tasks.md` for both rows does that without merging the tasks.

## The recommendation

**Option A.** Both descriptions change, in their own tasks, and
`docs/design/tasks.md` states the one fact both must carry: **roles run in
parallel by default; only a shared file or a real dependency serializes them.**
Each task's check is a `grep` for the exact old phrase, expecting zero hits, and
a `grep -n` for the new wording so a person reads what landed.

## The thing this ADR cannot fix

Nothing verifies that a description still works as a trigger. That is a known,
recorded hole (`CLAUDE.md` design rule 8 exists because of it), and the only
defence is a person reading it. The doc review of `M1` and of `M4` is that
person.
