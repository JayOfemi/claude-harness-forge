---
name: stack-policy
layer: agnostic
when_to_read: Considering any new vendor, framework, library, or cloud service
---

# Stack policy - the no-new-vendors rule

**Standard**: No new vendors or frameworks unless the existing toolkit cannot do it. Your workspace defines the toolkit in `<YOUR-TOOLKIT>` (fill this in with your locked choices for cloud, server, web, and mobile). If a gap exists, name it and propose a fix from inside the toolkit before suggesting an addition.

The acceptable answers to "why did you pick this approach?" are exactly two:

1. **"It's the standard."** Point at the precedent (an INDEX entry or a sibling project's working solution).
2. **"There's no standard yet, OR this is better than the existing standard, and here's why."** State the gap or improvement BEFORE shipping, not after being caught.

If a precedent exists but you did not know about it, that is a research failure, not a free pass to invent. Grep `INDEX.md` before designing.

## Toolkit placeholder

Replace the rows below with your actual locked choices. One neutral illustration row is included to show the expected shape:

| Domain | <YOUR-TOOLKIT> |
|---|---|
| Cloud | <YOUR-CLOUD-PROVIDER> |
| Server runtime | <YOUR-SERVER-RUNTIME> |
| Web frontend | <YOUR-WEB-STACK> |
| Mobile | <YOUR-MOBILE-STACK> |

Illustration (one operator's choices - replace with yours):

| Domain | Example |
|---|---|
| Cloud | A single cloud provider for compute, storage, and managed services |
| Server runtime | A single server language/runtime for all backend services |
| Web frontend | A single framework + styling library (e.g. component framework + utility CSS) |
| Mobile | A single cross-platform framework + state manager |

One filled-in example of how this standard plays out in practice: `examples/craft-globals-example.md`.

**Reference**: your stack specifics live in `Platform/`, `Web/`, `Mobile/`, and `Server/` domain files once you add them (see `PROTOCOL.md`).

**NOT**: a new SaaS per problem; framework-of-the-week; "modern alternative" swaps without a named gap.

**Why**: drift is how a portfolio becomes a vendor zoo; one bill, one auth story, one tooling pattern.
