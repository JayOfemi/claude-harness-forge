> Example of a Layer-1 domain standard; replace the vendor choices with yours.

---
name: ci
layer: platform
when_to_read: Setting up or modifying continuous integration on any repo
---

# CI

**Standard**: GitHub Actions `.github/workflows/ci.yml` runs on every PR + push to `main`. Builds + tests; never deploys.

**NOT**: CI that deploys (deploys are release-gated per `deploy-triggers.md`); third-party CI vendors.

**Why**: proof the tree builds on every change, with deployment kept on its own human-gated trigger.
