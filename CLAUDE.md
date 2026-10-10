# CLAUDE.md

Sada (صدى) React Native app. **Rules in `.claude/rules/` are mandatory.** Files with `paths:` frontmatter auto-load when you touch matching files; working in an area whose rule isn't loaded yet → Read it first.

- **Graphify:** orient with `graphify query "<q>"` before grep/read. `graphify-out/graph.json` stale → `graphify update`.
- **Artifacts:** never publish an Artifact / Design canvas / run `quickstart` unless the user asks in that message. Mockups = ASCII in chat.

## Product

B2B influencer marketplace, Syria-first, Arabic-first. Replaces email/WhatsApp/payment-app chaos between brands and creators. Spec: `project-define.txt`.

- **Creators:** phone sign-up → link Meta Creator/Business accounts → auto stats/audience → AI portfolio/bio → prices, city, niche → apply to campaigns or get offers → drafts in-app → publish + proof link → escrow released to wallet → withdraw (local e-wallets, instant cash-out).
- **Brands:** phone sign-up → type (company/store), name, socials, industry → brief builder (budget, niche, goal, do/don't) → smart match + city filters → compare ≤ 3 creators → pay escrow → review drafts → ROI (views, engagement, affiliate links, discount codes, QR visits).
- **Ad types:** paid post/story/reel, barter, affiliate commission, visit-based (QR), UGC, offline event booking.
- **Trust:** escrow wallet, auto contracts/invoices, refunds, disputes, mutual multi-criteria ratings, badges/rankings.
- **Deal:** `pending_approval → awaiting_payment → in_progress → under_review → ready_to_publish → published → completed` (+ `disputed`). Rule 06.

## Rules index

| File | Scope | Loads |
|---|---|---|
| `01-domain-driven-architecture` | folders, layers, boundaries, navigation | always |
| `02-strict-design-system` | UI kit only, tokens, zero hardcoding | UI files |
| `03-localization-rtl` | typed i18n, RTL-only props | always |
| `04-data-layer` | RTK Query repos, Redux, storage | always |
| `05-quality-gates` | strict TS, perf, tests, style | always |
| `06-business-state-and-money` | state machines, money, idempotency | always |
| `07-security-and-privacy` | tokens, PII, uploads, deep links | always |
| `08-brand-identity` | color roles, status colors, type, radii, cards, glass, tiers, currency | UI files |
| `08b-brand-palette-logo` | raw hexes, contrast, tab bar spec, logo, native assets, brand book | theme tokens, logo, native, brand |
| `09-screen-playbook` | archetypes, mockup-first, states, forms, live motion, banned | UI files |
| `09b-money-archetype` | wallet hero, ledger, amount entry, receipt visuals | finance |
| `10-component-reuse` | reuse-first, DevShowcase registry | UI files |
| `11-mobile-docs` | `docs/mobile-architecture.md` update = Definition of Done | always |
| `12-ref-boot-navigation` | boot pipeline, AppStatus, tabs, App.tsx wiring, push/app links | `src/app`, core nav/notification/linking/config |
| `13-ref-ui-kit` | every `@/shared/ui` part, screen chrome, wizards, lists, theme hooks | UI files |
| `14-ref-core-infra` | baseApi, toasts, errors, storage, form/data helpers, money format | core, `api/` `hooks/` `schemas/` `store/` |
| `15-ref-auth-identity` | login, onboarding, verification, deletion, suspension, push prompt, inbox | auth / identity / notifications |
| `16-ref-finance-deals` | deal parts, wallet, top-ups, payouts, withdrawals | finance / marketplace |
| `17-ref-native-env` | env, Firebase, app links, network security, store ids, native gaps | ios / android / `.env*` / config |

Most rules are lint-enforced (`.eslintrc.js`). A rule blocks you → stop and ask; never disable a lint rule inline.

## Stack

React Native **0.87 CLI** (bare, not Expo) · React 19 · TypeScript strict · React Navigation v7 (native-stack + bottom-tabs) · RTK Query + Redux Toolkit + redux-persist · MMKV · i18next · Reanimated 4 · FlashList v2 · react-hook-form + yup · Firebase Messaging + Notifee · react-native-config.

## Commands

```bash
npm run ios | npm run android
npx react-native start --reset-cache     # after moving/renaming files
npx tsc --noEmit                         # typecheck
npm run lint                             # architecture + style gates
npm test                                 # jest
cd ios && pod install                    # after adding a native package
ENVFILE=.env.staging npx react-native run-ios
```

`.env*` baked in at native build time → change needs rebuild, not Metro reload.

## Layout (rule 01)

```
src/
  app/        App.tsx, navigation/RootNavigator, store/, bootstrap/, screens/ (Boot, ChooseLanguage, Onboarding, Maintenance, ForceUpdate)
  core/       api/ config/ i18n/ theme/ storage/ store/ navigation/ toast/ notification/ permissions/ hooks/
  shared/     ui/ (UI kit) · context/ · utils/ · types/
  domains/    auth/ · identity/ · notifications/ · marketplace/ · finance/
  assets/     fonts/ images/ lottie/ locales/{ar,en}/common.json
```

`app → domains → shared → core`. Alias `@/` → `src/`. Cross-domain imports only via `@/domains/<name>` (`index.ts`).

## Screen work

`/sada-screen` skill. ASCII mockup (AR/RTL) + archetype + parts → explicit OK → build. Brand and creator variants are separate screens.

## New feature workflow

1. Owning domain (rule 01). New bounded context → ask first.
2. Types in `types/`, endpoints in `api/` (tags in `baseApi.tagTypes`).
3. Screen folder + `hooks/use<Name>Screen.ts`; UI only from `@/shared/ui`.
4. i18n keys in **both** `ar` and `en`.
5. Route in `core/navigation/types.ts` + domain navigator; export from domain `index.ts` if others need it.
6. `npx tsc --noEmit && npm run lint && npm test`.
7. `docs/mobile-architecture.md` + Change Log (rule 11).

## Token discipline

- Output: no greetings, filler, recaps. No RN/React basics unless asked. Show only changed code/diffs.
- Tier 2/3 work (hooks, slices, navigation, native bridges, Gradle/Xcode, Reanimated, perf): 2-bullet plan before code.
- Mechanical work (find files, logs, `package.json`, adb/xcrun) → fast subagent (`model: haiku` / cavecrew). Main model for native, build, animation, perf.
- Never read `node_modules/ ios/Pods/ ios/build/ android/build/ android/.gradle/`. Large TSX: skim skeleton first, then targeted read. Build logs: grep only (`grep -i "error:"`, `grep -A 15 -B 5 "FAILED"`). Metro: JS stack trace only.
- Production-ready first time: loading/error states, effect cleanup, strict types, no `TODO`s.
- Self-verify silently (`npx tsc --noEmit` + lint) before reporting.
- UI validation mirrors backend limits (`maxLength`, etc.).
