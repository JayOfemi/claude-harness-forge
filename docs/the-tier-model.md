# The tier model, for newcomers

The single most expensive real estate in an agent session is the context that loads every time, whether or not the task needs it. It costs money on every session, and it costs quality, since model performance degrades as input grows even when the extra tokens are irrelevant, and compliance with standing rules decays as their count rises. A governance layer that dumps its whole rulebook into every session is taxing itself twice.

So this layer sorts everything an agent might read into four tiers, and the placement is deterministic:

| Tier | Loads | Belongs there |
|---|---|---|
| **1 Always** | at session start, every session | identity, the integrity rules, your hard gates, routing pointers - the things a session must be unable to miss |
| **2 Hook** | mechanically injected | the standards INDEX (a routing table, one line per standard) and hook messages that gate or detect - never re-teach |
| **3 JIT** | when the task matches a trigger | every standard's depth, project research, procedures - found via the INDEX, read just-in-time |
| **4 Archival** | never by default | history: old decisions, rotated logs, superseded plans - pointed at, not loaded |

The placement algorithm, in plain words: if breaking the rule would be expensive and an agent might never open a related file, it earns a Tier 1 kernel (one or two lines) with its depth living in Tier 3. If it helps FIND things, it is routing (Tier 2). If only some tasks need it, it waits in Tier 3 behind an index line. If it is true but past, it is archival.

Two consequences worth internalizing early:

- **Kernels plus pointers, never copies.** A rule stated in full in two places will drift into two rules. The always-loaded file carries the one-line kernel; the standard carries the depth; each points at the other.
- **The budget is measured, not vibed.** Keep the Tier 1 core (constitution + craft globals + index + skill descriptions) around ten thousand tokens or less. When it grows, something is riding in Tier 1 that belongs lower - move it down rather than accepting the creep. Harness vendors publish the same guidance: instruction files past a couple hundred lines cost adherence, not just tokens.

The hooks follow the same philosophy: they gate (block a forbidden operation before it runs) or detect (flag a violation the moment it is introduced, silently passing everything clean), and they never re-teach rules the session already loaded. Machinery holds the bar; prose explains it once.
