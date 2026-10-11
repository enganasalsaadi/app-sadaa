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
2. Exists, needs new look → add typed **variant** (or redesign the part), don't fork.
3. Missing → screen-specific piece in `screens/<Name>Screen/components/` (or domain `components/`); generic piece (rows, pills, dividers any screen would use) in `src/shared/ui/<Name>/` (rule 02). Promote to kit when a second screen needs it.
4. Reuse is for consistency of behaviour, not sameness of look. The concept is designed first on a blank page (rule 09 §0); kit parts are matched to it afterwards — a part that doesn't fit → new variant or new part, never bend the concept to the kit.
5. Domain composites (`CreatorCard`, `DealStatusPill`) in `domains/<x>/components/`, kit parts only. Exported from domain `index.ts` → demo in DevShowcase `sada` category, listed in entry's `domainCovers`.

## Same change that adds/changes a kit export

- Export from `src/shared/ui/index.ts`.
- Registry entry in `showcaseRegistry.ts` whose `covers` lists it + demo `demos/<Name>Demo.tsx` wired in `registry/showcaseDemos.ts` (typed `Record<ShowcaseEntryId, …>`).
- Demo shows every variant, size, state (default, disabled, loading, error, empty), light/dark, RTL.
- Demo state in `demos/hooks/use<Name>Demo.ts`; strings `devShowcase.*` (ar + en).
- Non-visual exports (hooks, config, path data) → `SHOWCASE_EXEMPT` **with reason**. Never a component.

## Layouts

New `Layout`/header behaviour worth reusing → screen in `DevShowcaseScreen/layoutVariants/`, route in `DevShowcaseStackParamList`, row in `demos/LayoutGalleryDemo.tsx` (`satisfies Record<LayoutVariantScreenName, …>`). Virtualized lists demoed on their own layout screen.

## Showcase code

Same rules as product code (tokens, typed i18n, logic in hooks). Mock data in `demos/mockData.ts`, labelled dev-only.
