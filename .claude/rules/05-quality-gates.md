# 05 — Quality Gates

Done only when `npx tsc --noEmit && npm run lint && npm test` pass + `docs/mobile-architecture.md` updated when screen/flow/permission/business rule changed (rule 11).

## Strict TS

`strict`, `noImplicitAny`, `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch`.
- No `any` (`unknown` + guards / generics / interfaces). No `@ts-ignore`; `@ts-expect-error <reason>` only for third-party typing bugs.
- No `!` on API/storage/params data — narrow. `as` only at trust boundaries (JSON parse, native modules).
- Explicit types for every API req/res, props, route params, slice state. `import type` for types.
- Backend enums → string-literal unions + `as const` maps. Exhaustive `switch` ends with `const _exhaustive: never = value;`.

## Performance

- List items `React.memo` + stable `keyExtractor`. Lists = `SuperList` only (no `FlatList`/`ScrollView.map` for dynamic data).
- Prop callbacks `useCallback`; expensive derived `useMemo`; don't memo trivial primitives. Selectors `createSelector`, narrowest slice.
- Reanimated worklets on UI thread; no `setState` in scroll handlers.
- `Image` primitive with sized thumbnails, never full-res in lists. No work in render (date formatting loops, JSON.parse). Heavy screens lazy-mounted.

## Imports

`@/` → `src/` (`tsconfig.json` + `babel.config.js`). After move/rename: `npx react-native start --reset-cache`.

## Style

- Components `PascalCase.tsx`, hooks `useCamelCase.ts`, others `camelCase.ts`. One component per file. Screen logic in `hooks/use<Name>Screen.ts`.
- No `console.log` (gate behind `env.ENABLE_LOGS`). No dead code, commented-out blocks, unused exports. Comments explain *why*.

## Tests

Jest (`@react-native/jest-preset`), co-located `Foo.test.ts(x)` or `__tests__/`. Must test: state-machine transitions, money math/formatting, selectors, `transformResponse` mappers, form schemas. Native modules mocked in `jest.setup.ts`; never hit network.
