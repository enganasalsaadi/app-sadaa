# 04 — Data Layer (RTK Query + Redux Toolkit)

Stack decision: **RTK Query** for server state, **Redux Toolkit** slices for global client state, **MMKV** for persistence. Do not introduce TanStack Query, Zustand, Axios, or raw `fetch` in components.

## Server state — RTK Query

- One base: `baseApi` in `src/core/api/baseApi.ts`. Every domain injects into it:
  ```ts
  // src/domains/marketplace/api/campaignApi.ts
  export const campaignApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: builder => ({
      getCampaigns: builder.query<PaginatedData<Campaign[]>, CampaignFilters>({
        query: params => ({ url: 'campaigns', params }),
        extraOptions: { withPagination: true },
        providesTags: result => [
          ...(result?.items.map(c => ({ type: 'Campaign' as const, id: c.id })) ?? []),
          { type: 'Campaign', id: 'LIST' },
        ],
      }),
    }),
  });
  export const { useGetCampaignsQuery } = campaignApi;
  ```
- `overrideExisting: true` on every `injectEndpoints`.
- New tag types → add to `tagTypes` in `baseApi.ts`. Mutations must `invalidatesTags` precisely (by id), never blanket-invalidate.
- Optimistic updates via `onQueryStarted` + `updateQueryData` + `patchResult.undo()` on failure.

## Repository pattern

`domains/<x>/api/*.ts` **is** the repository. Components never call `fetch`, never build URLs, never read tokens.

```
Screen  →  use<Screen>Screen hook  →  domain hook / RTK Query hook  →  api/<x>Api.ts  →  baseApi
```

- Screens contain no data logic — only render what `use<Screen>Screen` returns.
- Map API DTOs (snake_case) to domain models in `transformResponse` when shapes differ; UI uses domain models.
- Non-standard endpoints (external URLs, uploads with progress) → `queryFn` inside the api file, still no fetch in components.

## API envelope

Server returns `{ success, message, data, error_code, errors, meta: { locale, retry_after? } }` (`docs/mobile-contract.md` §1; `errors` is a field map on 422 only, else `null`). `normalizeApiError` → `AppApiError.code` (typed `ApiErrorCode`) + `retryAfter` + `reason` + `availableAt` (top-level `meta`); branch on `code`, never on `message`. Success meta needed by a screen → `extraOptions: { withMeta: true }` → `WithMeta<T>`. `baseQuery` unwraps `data`, turns `success:false` into an error. Paginated: `extraOptions: { withPagination: true }` → `{ items, pagination: { total, page, per_page, pages } }`.

## Error routing (centralised in baseQuery — do not re-handle)

| Status | Behaviour |
|---|---|
| 401 | clear tokens + credentials + `resetApiState()`, redirect Login (tokens non-refreshable) |
| 403 | `account_suspended` (with a session) → `auth/setAccountSuspended` → `AppStatus.SUSPENDED` gate, even for silent calls · `phone_not_verified` → passed through (onboarding resolver routes it) · others → toast + `showForbiddenError` |
| 422 | toast + passed through (map `errors` to form fields) |
| 400/404 | passed through → `<InlineError />` |
| 409/429 | passed through — screen handles (`otp_cooldown` countdown from `retryAfter`, out-of-order → re-read progress) |
| 500/503 | `GlobalErrorModal` (503 auto-retry countdown) |
| no network | `NetworkSnackbar` |

Retry callbacks: `retryRegistry.register(fn)` → store only the key in Redux.

## Client state — Redux Toolkit

- Global UI/session state only: auth session, global errors, active role, feature flags.
- Slice lives in the owning domain `store/`; registered in `src/app/store/rootReducer.ts`.
- Never store server data in slices (that's RTK Query cache). Never store functions/non-serializable values.
- Typed hooks: `useAppSelector` / `useAppDispatch` from `@/core/store`.
- Selectors colocated (`store/<x>Selectors.ts`); memoise derived data with `createSelector`.
- Persist only what must survive restart (`app/store/persistConfig.ts`), via MMKV.

## Local state

`useState` / `useReducer` for screen-local state. Forms: `react-hook-form` + `yup` resolver (schemas in `domains/<x>/schemas/` or co-located in the screen hook).

## Storage

- `appStorage` (typed, `StorageKeys` only) and `authStorage` from `@/core/storage`.
- New key → add to `StorageKeys` + `StorageSchema`.
- Tokens: see rule 07 (secure storage).

## Paginated lists

Use `SuperList` + a `usePaginatedList`-style hook: `LoadPhase = 'idle' | 'initial' | 'refreshing' | 'more'`, abort in-flight requests before new triggers, `hasNextPage = page < pages` (server), skeleton on initial and refresh, abort on unmount.
