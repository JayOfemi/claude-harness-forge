# Customize first

The template ships mechanisms; you supply the choices. This is the replacement order that pays off fastest.

1. **The craft globals** (`Claude/CLAUDE.md`). The always-loaded master for how work is crafted: your style rules, commit discipline, hard gates. Fill every `<YOUR-*>` section. Steal freely from `examples/craft-globals-example.md` in the template repo - it is one operator's real, battle-tested set - but steal deliberately: every line you keep loads into every session forever, so each must earn its slot.

2. **The style gate's rules** (`hooks/house-rules.mjs`). The shipped file carries one demo rule so the machinery provably works. Replace it with your actual bans - the things that, if they appear in shipped text or code, embarrass you. The worked example (`examples/house-rules-example.mjs`) shows a full rule-pack with severities. Whatever you ban in the craft globals prose, wire here too, so the machine enforces what the prose declares.

3. **The git gate's hard lines** (in your `settings.json`, from the settings template). Name the operations an agent must never do on its own: which repos it may push, whether it deploys, anything money-touching. These belong in BOTH the craft globals (prose, Tier 1) and the gate message (enforcement), verbatim.

4. **Your stack standards.** The `STANDARDS/` bank ships agnostic; your vendor and framework choices go in new domain files (`STANDARDS/Platform/`, `Web/`, whatever fits), each with a routing line in `INDEX.md`. The two files in `examples/stack-standards/` show the shape. Write them as you decide things, not before: a standard records a decision you actually made.

5. **The locked-decisions table** (`STANDARDS/project-bootstrap.md`). Every choice you never want re-debated per project (cloud, frameworks, hosting) goes in this table once. New projects then inherit answers instead of bikeshedding.

6. **Role names** (`Agents/AGENT_ROLES.md`). Replace each `<YOUR-NAME>` with a persona from fiction you love. The charters are ready as shipped.

7. **Your never-publish list** (`deny-list.txt` next to `tools/deny-sweep.mjs`). Seed it with your name, employer, internal project names, domains, and paths. Run the sweep before anything in this workspace goes public, ever.

8. **REBUILD.md.** As you wire hooks and settings, paste the live versions into its record sections. It is Tier 4 (loads never), but it is the only durable copy of everything git cannot see - the difference between losing a machine and losing the operation.

What NOT to customize early: the constitution's integrity rules, the tier model, the intake protocol, and the gate doctrine. They are the accumulated lessons the template exists to transfer; live with them for a few weeks before overriding, and when you do override, dual-note it per integrity rule 3.
