# 01 — Domain-Driven Architecture

Enforced by ESLint (`no-restricted-imports`, `.eslintrc.js`). Violations fail `npm run lint`.

## Layers

```
src/
  app/        Composition root. Providers, RootNavigator, Redux store assembly,
              bootstrap (AppStatus), app-shell screens (ChooseLanguage, Maintenance).
  core/       Infrastructure. No UI knowledge, no business rules.
              api/ (baseApi, errorHandler, retryRegistry, configApi)
              config/ (env, app constants, layout constants)
              i18n/ · theme/ · storage/ (MMKV, authStorage, StorageKeys)
              store/ (globalErrorSlice, typed hooks) · navigation/ (navigationService, route types)
              toast/ · notification/ · permissions/ · hooks/ (useApi, useNetworkMonitor…)
  shared/     Reusable, domain-agnostic code.
              ui/ (UI kit: primitives + composite components)
              context/ · utils/ · types/ (global .d.ts)
  domains/    Business logic, one folder per bounded context.
  assets/     Fonts, images, lottie, locales.
```

## Dependency direction (one way only)

```
app  →  domains  →  shared  →  core
```

| Layer | May import | Must NOT import |
|---|---|---|
| `app/` | everything | — |
| `domains/<x>/` | `core`, `shared`, own files (relative), other domains **via `@/domains/<y>` only** | `app/`, `@/domains/<y>/<deep-path>` |
| `shared/` | `core` | `domains`, `app` |
| `core/` | own files, **type-only** from `@/app/store` (RootState) | `shared`, `domains`, runtime `app` |

If `core` needs something from a domain → invert it (callback, registry, or move the type down into `core`). Example: `RegisterFcmTokenPayload` lives in `core/notification/notificationTypes.ts`; auth re-exports it.

## Domain anatomy

```
domains/<name>/
  index.ts          ← PUBLIC API. The only file other domains/app may import.
  api/              ← RTK Query endpoints (baseApi.injectEndpoints) = repository layer
  hooks/            ← domain hooks (business logic, orchestration)
  store/            ← Redux slice + selectors (only if client state is needed)
  components/       ← domain-specific UI (built from @/shared/ui)
  screens/<Name>Screen/
    <Name>Screen.tsx
    hooks/use<Name>Screen.ts
    index.ts
  navigation/       ← domain stack navigator
  types/            ← domain models, DTOs, enums
  constants/        ← domain constants (state-machine maps, limits)
```

Create sub-folders only when needed; never put code outside this shape.

## Current domains

| Domain | Owns |
|---|---|
| `auth` | login/register/OTP/forgot password, tokens, auth slice, FCM token registration |
| `identity` | user account, profile edit, password, preferences, language. **Next:** creator/brand profiles, social account linking (Meta Business/Creator), AI portfolio & bio, vacation mode, rate cards |
| `marketplace` | campaigns, brief builder, matchmaking, offers/negotiation, deal pipeline, draft/content review, barter catalog, UGC, offline event booking |
| `finance` | wallet, deposits (brands), withdrawals (creators), escrow holds/releases, refunds, contracts, invoices |

Planned — add when first feature lands, do not pre-create:
`analytics` (ROI dashboards, affiliate links, discount codes, QR visit tracking), `reputation` (multi-tier ratings, badges, rankings, anonymous brand reviews), `messaging` (in-app negotiation/chat — all agreements must stay in-app for dispute audit), `notifications` (inbox, prefs).

A new domain = new folder + `index.ts` + tab/stack registered in `app/navigation`. Route param types go in `core/navigation/types.ts`.

## Imports

- Always `@/` alias across folders: `@/core/api`, `@/shared/ui`, `@/domains/finance`.
- Relative imports only inside the same domain / same module. Max depth `../../` (lint-enforced).
- Import from barrels (`@/core/storage`, `@/core/store`, `@/core/navigation`), not deep files, when a barrel exists.
- Inside `src/shared/ui/**` use relative imports (`../primitives`) — never the `@/shared/ui` barrel (circular).

## Navigation

- Root stack renders one branch per `AppStatus` (`app/bootstrap`). No conditional navigation elsewhere.
- Each domain owns its navigator in `navigation/`; `app/navigation/RootNavigator.tsx` composes them.
- Imperative navigation from non-React code: `navigate/replace/goBack` from `@/core/navigation`.
- Two user roles (creator, brand) will get separate tab sets — branch on role in `RootNavigator`, never inside screens.
