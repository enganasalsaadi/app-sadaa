# 04 — Data Layer

RTK Query (server state) · Redux Toolkit slices (global client state) · MMKV (persistence). No TanStack Query, Zustand, Axios, or raw `fetch` in components.

## RTK Query

- One base `baseApi` (`src/core/api/baseApi.ts`); domains `injectEndpoints({ overrideExisting: true, … })`.
  ```ts
  getCampaigns: builder.query<PaginatedData<Campaign[]>, CampaignFilters>({
    query: params => ({ url: 'campaigns', params }),
    extraOptions: { withPagination: true },
    providesTags: r => [...(r?.items.map(c => ({ type: 'Campaign' as const, id: c.id })) ?? []), { type: 'Campaign', id: 'LIST' }],
  }),
  ```
- New tag → `tagTypes` in `baseApi.ts`. Mutations `invalidatesTags` precisely by id, never blanket.
- Optimistic: `onQueryStarted` + `updateQueryData` + `patchResult.undo()` on failure.

## Repository pattern

`Screen → use<Screen>Screen → domain/RTK hook → api/<x>Api.ts → baseApi`. `domains/<x>/api/*.ts` is the repository. Components never fetch, build URLs, or read tokens. Map snake_case DTOs → domain models in `transformResponse`. Uploads with progress / external URLs → `queryFn` in the api file.

## Envelope

`{ success, message, data, error_code, errors, meta: { locale, retry_after? } }` (`docs/mobile-contract.md` §1; `errors` field map on 422 only). `normalizeApiError` → `AppApiError.code` (typed `ApiErrorCode`) + `retryAfter` + `reason` + `availableAt`; branch on `code`, never `message`. Success meta → `extraOptions: { withMeta: true }` → `WithMeta<T>`. Paginated → `{ items, pagination: { total, page, per_page, pages } }`.

## Error routing (centralised in baseQuery — don't re-handle)

| Status | Behaviour |
|---|---|
| 401 | clear tokens + credentials + `resetApiState()`, redirect Login |
| 403 | `account_suspended` (with session) → `auth/setAccountSuspended` → `SUSPENDED` gate, even silent calls · `phone_not_verified` → passed through · others → toast + `showForbiddenError` |
| 422 | toast + passed through (map `errors` to fields) |
| 400/404 | passed through → `<InlineError />` |
| 409/429 | passed through — screen handles (`otp_cooldown` from `retryAfter`, out-of-order → re-read progress) |
| 500/503 | `GlobalErrorModal` (503 auto-retry countdown) |
| offline | `NetworkSnackbar` |

Retry callbacks: `retryRegistry.register(fn)` → only key in Redux.

## Redux

- Global UI/session state only (auth session, global errors, active role, flags). Slice in owning domain `store/`, registered in `src/app/store/rootReducer.ts`.
- Never server data (that's RTK cache), never functions/non-serializable.
- `useAppSelector` / `useAppDispatch` (`@/core/store`). Selectors in `store/<x>Selectors.ts`, derived via `createSelector`.
- Persist only what must survive restart (`app/store/persistConfig.ts`, MMKV).

## Local state & storage

- `useState`/`useReducer` screen-local. Forms `react-hook-form` + yup (`domains/<x>/schemas/` or screen hook).
- `appStorage` (typed `StorageKeys`) + `authStorage` (`@/core/storage`). New key → `StorageKeys` + `StorageSchema`. Tokens → rule 07.

## Paginated lists

`SuperList` + `usePaginatedList`-style hook: `LoadPhase = 'idle' | 'initial' | 'refreshing' | 'more'`, abort in-flight before new trigger, `hasNextPage = page < pages`, skeleton on initial + refresh, abort on unmount.
