---
name: monetization-initiative
description: PlayTS monetization project - user system, payments, freemium model. Open source constraints apply.
type: project
---

PlayTS monetization initiative started 2026-03-14.

Key constraints:
- App is open source — NEVER expose secrets, API keys, or sensitive configs in code
- User authentication must be delegated to a third-party provider (no in-house auth)
- Payment processing must be delegated to a third-party provider (no in-house payment handling)
- There's an existing landing page that can be used for payment flows
- The user wants a team approach: architect, UI dev, market analyst, QA

**Why:** User wants to generate revenue from PlayTS while keeping it open source.
**How to apply:** All monetization features must have clear free/paid tier separation. Backend services handle auth/payments via third-party SDKs. No secrets in the repo.
