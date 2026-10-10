# 03 — Localization & RTL

Default **Arabic (`ar`)**, RTL; English secondary. Design + test RTL first.

## Type-safe i18n

- `i18next` + `react-i18next`, single namespace `common`: `src/assets/locales/{ar,en}/common.json`.
- Types from `resources.en` (`src/core/i18n/types.ts`). Missing key = TS error — never silence with casts, `as any`, or key concatenation.
- Dynamic keys → typed record:
  ```ts
  const STATUS_KEY = {
    pending_approval: 'marketplace.deal.status.pendingApproval',
  } as const satisfies Record<DealStatus, ParseKeys>;
  ```
- `t('auth.login.title')`, not `t('common:…')`. Interpolation `t('x', { count })`; Arabic plurals `_zero _one _two _few _many _other`. Outside React: `i18n.t` from `@/core/i18n`.
- Top-level keys = domain/area: `auth identity marketplace finance common errors validation tabs chooseLanguage account`.
- Every key in **both** `ar` and `en`, same order. No hardcoded user-facing strings (incl. `accessibilityLabel`, placeholders, toasts, alerts). Server text shown as-is.

## Formatting

- `formatNumber` / `formatMoney` / `formatDate` (`@/core/i18n`, `Intl` with `<lang>-u-nu-latn`). Never `toFixed()` + manual symbols or raw `Intl` in components.
- **Western digits both languages** (`1,250`). Currency from integer minor units (rule 06). Phones: `libphonenumber-js`, E.164 to API.

## Strict RTL (lint `no-restricted-syntax`)

Banned → use: `marginLeft/Right` → `marginStart/End` (`ms`/`me`) · `paddingLeft/Right` → `paddingStart/End` · `left/right` → `start/end` · `borderLeft*/borderRight*` → `borderStart*/borderEnd*` · `borderTopLeftRadius…` → `borderTopStartRadius…` · `textAlign: 'left'` → `'auto'` / `align="start"`.

- Directional icons flip: `transform: [{ scaleX: isRTL ? -1 : 1 }]`.
- `flexDirection: 'row'` auto-flips — don't reverse manually.
- Language switch → `syncRTL()` + restart (LanguageScreen/ChooseLanguage). Never toggle `I18nManager` elsewhere.
