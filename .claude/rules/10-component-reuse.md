---
paths:
  - "src/**/*.tsx"
  - "src/shared/ui/**"
  - "src/app/screens/DevShowcaseScreen/**"
  - "src/domains/*/index.ts"
---

# 10 — Component Reuse & Showcase

Enforced by `src/app/screens/DevShowcaseScreen/registry/__tests__/showcaseRegistry.test.ts` (in `npm test`).

## Before building UI

1. Check DevShowcase (Profile → `__DEV__` row) / `registry/showcaseRegistry.ts` (and rule 13).
2. Exists, needs new look → add typed **variant**, don't fork.
3. Missing → build in `src/shared/ui/<Name>/` (rule 02), then use. Never inline a one-off (row, pill, divider) in a domain/app screen.
4. Domain composites (`CreatorCard`, `DealStatusPill`) in `domains/<x>/components/`, kit parts only. Exported from domain `index.ts` → demo in DevShowcase `sada` category, listed in entry's `domainCovers`.

## Same change that adds/changes a kit export

- Export from `src/shared/ui/index.ts`.
- Registry entry in `showcaseRegistry.ts` whose `covers` lists it + demo `demos/<Name>Demo.tsx` wired in `registry/showcaseDemos.ts` (typed `Record<ShowcaseEntryId, …>`).
- Demo shows every variant, size, state (default, disabled, loading, error, empty), light/dark, RTL.
- Demo state in `demos/hooks/use<Name>Demo.ts`; strings `devShowcase.*` (ar + en).
- Non-visual exports (hooks, config, path data) → `SHOWCASE_EXEMPT` **with reason**. Never a component.

## Layouts

New archetype or `Layout`/header behaviour → screen in `DevShowcaseScreen/layoutVariants/`, route in `DevShowcaseStackParamList`, row in `demos/LayoutGalleryDemo.tsx` (`satisfies Record<LayoutVariantScreenName, …>`). Virtualized lists demoed on their own layout screen.

## Showcase code

Same rules as product code (tokens, typed i18n, logic in hooks). Mock data in `demos/mockData.ts`, labelled dev-only.
