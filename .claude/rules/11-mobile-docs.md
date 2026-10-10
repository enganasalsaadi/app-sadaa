# 11 — Mobile Docs (MANDATORY, Definition of Done)

Screen, flow, permission, or business rule changes → update `docs/mobile-architecture.md` in the **same change**, plain English, + Pitch sections if new value + Change Log.

| Change | Section |
|---|---|
| Screen added/removed/renamed, tab/navigator change | §5.2 screen map (✅ 🟡 🔜) |
| Flow changed (onboarding, KYC, linking, login, deal, wallet, push) | §5.3 journey |
| Boot gate / `AppStatus` | §5.1 |
| Permission added/removed, usage string | §7.1 (+ §7.2 if store-relevant) |
| Business rule (money, escrow, commission, deal status, roles, limits) | §4.4 / §4.5 (+ §5.3 Journey F) |
| New user-facing value | §1.2, §2.3 USPs, §3 personas, §4 as relevant |
| UX strategy (RTL, offline, loading, push prompting) | §6 |
| Roadmap shipped / blocker resolved or found | §7.3 markers, §7.4 |

How:
- **No code**: no identifiers, paths, hook/component names, endpoints, snippets. What the user sees and why it matters. ASCII screen map is the only diagram.
- Honest status: ✅ live · 🟡 built not wired/partial · 🔜 planned. Never present planned as live.
- Unsourced market figures stay `[DATA NEEDED]`.
- Update `Last updated` in header table. Change Log row (newest first): absolute date, one line, sections touched.
- Pure refactors with no user-visible/permission/rule change → no update.
