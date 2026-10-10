# 01 — Domain-Driven Architecture

Lint-enforced (`no-restricted-imports`, `.eslintrc.js`).

## Layers

- `app/` composition root: providers, RootNavigator, store assembly, bootstrap (AppStatus), shell screens.
- `core/` infrastructure, no UI, no business rules: `api/ config/ i18n/ theme/ storage/ store/ navigation/ toast/ notification/ permissions/ hooks/`.
- `shared/` reusable, domain-agnostic: `ui/` (kit) · `context/` · `utils/` · `types/`.
- `domains/` business logic, one folder per bounded context. `assets/` fonts, images, lottie, locales.

## Dependency direction: `app → domains → shared → core`

| Layer | May import | Must NOT |
|---|---|---|
| `app/` | everything | — |
| `domains/<x>/` | `core`, `shared`, own files (relative), other domains **via `@/domains/<y>` only** | `app/`, `@/domains/<y>/<deep-path>` |
| `shared/` | `core` | `domains`, `app` |
| `core/` | own files, **type-only** from `@/app/store` (RootState) | `shared`, `domains`, runtime `app` |

`core` needs something from a domain → invert (callback, registry, or move the type into `core`). E.g. `RegisterDevicePayload` lives in `core/notification/notificationTypes.ts`; auth re-exports.

## Domain anatomy (create sub-folders only when needed)

```
domains/<name>/
  index.ts       ← PUBLIC API, only file others import
  api/           ← RTK Query endpoints = repository
  hooks/ store/ components/ navigation/ types/ constants/
  screens/<Name>Screen/{<Name>Screen.tsx, hooks/use<Name>Screen.ts, index.ts}
```

## Domains

| Domain | Owns |
|---|---|
| `auth` | login/register/OTP/forgot password, tokens, auth slice, FCM registration |
| `identity` | account, profile edit, password, preferences, language. Next: creator/brand profiles, Meta linking, AI portfolio/bio, vacation mode, rate cards |
| `notifications` | inbox, push tap routing (typed map). Next: preferences |
| `marketplace` | campaigns, brief builder, matching, offers/negotiation, deal pipeline, content review, barter, UGC, offline events |
| `finance` | wallet, deposits (brands), withdrawals (creators), escrow, refunds, contracts, invoices |

Planned, don't pre-create: `analytics` (ROI, affiliate, discount codes, QR), `reputation` (ratings, badges, rankings), `messaging` (in-app negotiation/chat; agreements stay in-app for dispute audit). New domain = folder + `index.ts` + tab/stack in `app/navigation`; route types in `core/navigation/types.ts`.

## Imports

- `@/` alias across folders. Relative only inside same domain/module, max `../../`.
- Import from barrels (`@/core/storage`, `@/core/store`, `@/core/navigation`) when one exists.
- Inside `src/shared/ui/**` use relative imports — never the `@/shared/ui` barrel (circular).

## Navigation

- Root stack renders one branch per `AppStatus`. No conditional navigation elsewhere.
- Each domain owns its navigator in `navigation/`; `app/navigation/RootNavigator.tsx` composes.
- Non-React nav: `navigate/replace/goBack` from `@/core/navigation`.
- Roles (creator | brand) get separate tab sets — branch on role in `RootNavigator`, never in screens.
