# 05 — Quality Gates (Types, Performance, Imports)

A change is done only when all pass:

```bash
npx tsc --noEmit
npm run lint
npm test
```

## Strict TypeScript

`tsconfig.json`: `strict`, `noImplicitAny`, `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch`.

- `any` is banned (`@typescript-eslint/no-explicit-any`). Use `unknown` + type guards, generics, or a proper interface.
- No `// @ts-ignore`. `// @ts-expect-error <reason>` only for third-party typing bugs.
- No non-null `!` on data from API/storage/params — narrow instead.
- `as` casts only at trust boundaries (JSON parse, native modules), never to silence errors.
- Every API request/response, props, route params, slice state has an explicit type.
- Type-only imports use `import type` (lint auto-fix).
- Enums from the backend → string-literal unions + `as const` maps (see rule 06).
- Exhaustive `switch` over unions ends with `const _exhaustive: never = value;`.

## Performance

- List items: `React.memo` + stable `keyExtractor`. Lists: `SuperList` (FlashList v2) only — no `FlatList`/`ScrollView.map` for dynamic data.
- Callbacks passed as props: `useCallback`. Derived/expensive values: `useMemo`. Don't memoise trivial primitives.
- Selectors: `createSelector` for derived data; select the narrowest slice.
- Animations: Reanimated worklets on UI thread; no `setState` in scroll handlers.
- Images: `Image` primitive (fast-image) with sized thumbnails from API, never full-res in lists.
- No work in render: no `new Date()` formatting loops, no JSON.parse in render.
- Heavy screens (charts, video review) lazy-mounted within their stack.

## Imports & aliases

- Single alias `@/` → `src/` (`tsconfig.json` + `babel.config.js`).
- `@/core/...`, `@/shared/ui`, `@/domains/<name>`, `@/app/...`.
- After moving/renaming files: `npx react-native start --reset-cache`.

## Code style

- Files: components `PascalCase.tsx`, hooks `useCamelCase.ts`, others `camelCase.ts`. One component per file.
- Screens: logic in `hooks/use<Name>Screen.ts`; `.tsx` renders only.
- No `console.log` in committed code — gate debug logs behind `env.ENABLE_LOGS`.
- No dead code, no commented-out blocks, no unused exports.
- Comments explain *why*, not *what*.

## Tests

- Jest (`@react-native/jest-preset`). Tests co-located: `Foo.test.ts(x)` next to source, or `__tests__/` inside the module.
- Must test: state-machine transitions, money math/formatting, selectors, `transformResponse` mappers, form schemas.
- Mock native modules in `jest.setup.ts`; never hit network.
