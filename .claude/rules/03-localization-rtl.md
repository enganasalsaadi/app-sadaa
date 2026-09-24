# 03 — Localization & RTL

Default language: **Arabic (`ar`)**, RTL. English secondary. Arabic is the primary design target — test RTL first.

## Type-safe i18n

- `i18next` + `react-i18next`. Single namespace `common`: `src/assets/locales/{ar,en}/common.json`.
- Types derive from `resources.en` (`src/core/i18n/types.ts`, `CustomTypeOptions`). A missing/misspelled key is a **TypeScript error** — never silence it with casts, `as any`, or string concatenation of keys.
- Dynamic keys: map with a typed record, not template strings.
  ```ts
  const STATUS_KEY = {
    pending_approval: 'marketplace.deal.status.pendingApproval',
    under_review: 'marketplace.deal.status.underReview',
  } as const satisfies Record<DealStatus, ParseKeys>;
  t(STATUS_KEY[status]);
  ```
- Call `t('auth.login.title')`, not `t('common:auth.login.title')`.
- Interpolation: `t('errors.server.retryIn', { count })`; plurals via i18next `_one/_other` suffixes (Arabic needs `_zero _one _two _few _many _other`).
- Outside React: `import i18n from '@/core/i18n'` → `i18n.t(...)`.

## Key structure

Top-level key = domain or core area: `auth`, `identity`, `marketplace`, `finance`, `common`, `errors`, `validation`, `tabs`, `chooseLanguage`, `account`.

```
marketplace.campaign.create.title
marketplace.deal.status.underReview
finance.wallet.balance
```

- Add every key to **both** `ar` and `en` in the same change. Keys identical order in both files.
- Never hardcode user-facing strings — including `accessibilityLabel`, placeholders, toasts, alert titles, error messages.
- Server-provided text (campaign briefs, bios) is displayed as-is; never translate on client.

## Formatting

- Numbers, currency, dates: `formatNumber` / `formatMoney` / `formatDate` from `@/core/i18n` (built on `Intl` with locale `<lang>-u-nu-latn`). Never `toFixed()` + manual symbols, never raw `Intl` in components.
- **Western digits in both languages** (rule 08): `1,250` in Arabic too — never Arabic-Indic `١٬٢٥٠`. The helpers force `latn`; don't bypass them.
- Currency is locale-formatted from integer minor units (see rule 06).
- Phone numbers: `libphonenumber-js`, E.164 to API.

## Strict RTL layouts

Lint-enforced (`no-restricted-syntax`). Banned in styles and props:

| Banned | Use |
|---|---|
| `marginLeft` / `marginRight` | `marginStart` / `marginEnd` (`ms` / `me`) |
| `paddingLeft` / `paddingRight` | `paddingStart` / `paddingEnd` (`ps` / `pe`) |
| `left` / `right` | `start` / `end` |
| `borderLeftWidth`, `borderRightColor`… | `borderStartWidth`, `borderEndColor` |
| `borderTopLeftRadius`… | `borderTopStartRadius`… |
| `textAlign: 'left'` | `textAlign: 'auto'` or `align="start"` on `Text` |

- Directional icons (chevrons, back arrows) flip in RTL: `transform: [{ scaleX: isRTL ? -1 : 1 }]`.
- `flexDirection: 'row'` auto-flips — do not manually reverse for RTL.
- Language switch → `syncRTL()` + app restart (already handled in LanguageScreen/ChooseLanguage). Never toggle `I18nManager` elsewhere.
