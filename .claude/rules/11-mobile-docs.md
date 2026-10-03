# Mobile Docs — Living Architecture & Pitch Guide

**MANDATORY:** Whenever a screen, flow, permission, or business rule changes, update `docs/mobile-architecture.md` in plain English. Keep the Pitch sections updated if new value is added. Update the Change Log. Required for Definition of Done.

## What triggers an update

| Change | Update in `docs/mobile-architecture.md` |
|---|---|
| Screen added / removed / renamed, tab or navigator change | §5.2 screen map (+ ✅ 🟡 🔜 marker) |
| Flow changed (onboarding, KYC, social linking, login, deal, wallet, push) | §5.3 journey walkthrough |
| Boot gate / `AppStatus` added | §5.1 |
| Permission added/removed, usage string changed | §7.1 table + §7.2 if store-relevant |
| Business rule (money, escrow, commission, deal status, role rules, limits) | §4.4 / §4.5 (+ §5.3 Journey F) |
| New user-facing value (feature, ad type, differentiator) | §1.2 table, §2.3 USPs, §3 personas, §4 model as relevant |
| UX strategy (RTL, offline, loading states, push prompting) | §6 |
| Roadmap item shipped / blocker resolved or found | §7.3 status markers, §7.4 table |

## How to write it

- **Plain business English. No code**: no identifiers, file paths, hook/component names, endpoints, or snippets. Describe what the user sees and why it matters. (The ASCII screen map is the only diagram style allowed.)
- Mark status honestly: ✅ live · 🟡 built but not wired / partial · 🔜 planned. Never present a planned feature as live.
- Unsourced market figures stay `[DATA NEEDED]`.
- Update `Last updated` in the header table.
- Add a **Change Log** row (newest first): date (absolute), one-line change, sections touched.
- Pure refactors with no user-visible, permission, or rule change → no update needed.

## Definition of Done

A change that hits any trigger above is not done until the guide is updated in the **same change** (alongside `npx tsc --noEmit && npm run lint && npm test`).
