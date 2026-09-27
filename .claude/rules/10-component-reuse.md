# 10 — Component Reuse & Showcase

Goal: one kit, every part visible in one place, no look-alike one-offs. Enforced by `src/app/screens/DevShowcaseScreen/registry/__tests__/showcaseRegistry.test.ts` (runs in `npm test`).

## Before building UI

1. Open the DevShowcase (Profile → `__DEV__` row) or `registry/showcaseRegistry.ts` and look for an existing part.
2. Exists but needs a new look → add a typed **variant** to it (rule 02), don't fork it.
3. Missing → build it in `src/shared/ui/<Name>/` (rule 02 convention), then use it. Never inline a one-off in a domain or app screen, even a "small" one (a row, a pill, a divider).
4. Domain-specific composites (`CreatorCard`, `DealStatusPill`) live in `domains/<x>/components/`, built only from kit parts. A domain component exported from the domain's `index.ts` gets a demo in the DevShowcase `sada` category, listed in its entry's `domainCovers` (the registry test fails otherwise).

## Same change that adds or changes a kit export

- Export it from `src/shared/ui/index.ts` (the test fails if a `shared/ui` folder is not re-exported).
- Add or extend a registry entry in `showcaseRegistry.ts` whose `covers` lists the export, and its demo in `demos/<Name>Demo.tsx`, wired in `registry/showcaseDemos.ts` (typed `Record<ShowcaseEntryId, …>`, so a missing demo is a TS error).
- The demo shows every variant, size and state (default, disabled, loading, error, empty) in light/dark and RTL — it is the review surface for that component.
- Demo state goes in `demos/hooks/use<Name>Demo.ts`; demo strings in `devShowcase.*` (both `ar` and `en`).
- Non-visual exports (hooks, config, path data) go in `SHOWCASE_EXEMPT` **with a reason**. A component never goes there.

## Layouts

- A new screen archetype or `Layout`/header behaviour gets a screen in `DevShowcaseScreen/layoutVariants/`, a route in `DevShowcaseStackParamList`, and a row in `demos/LayoutGalleryDemo.tsx` (`satisfies Record<LayoutVariantScreenName, …>`, so a missing row fails the build).
- Virtualized lists can't nest in a category's scroll view: demo them on their own layout screen.

## Showcase code rules

Showcase screens follow the same rules as product code (tokens only, typed i18n, logic in hooks). Mock data lives in `demos/mockData.ts`, clearly labelled dev-only.
