---
paths:
  - "ios/**"
  - "android/**"
  - ".env*"
  - "src/core/config/**"
  - "src/core/linking/**"
  - "src/core/permissions/**"
  - "package.json"
---

# 17 — Ref: Native, Env, Known Gaps

- **Firebase:** `google-services.json` / `GoogleService-Info.plist` belong to old project. App ids now `com.getsadaapp` both platforms (scheme `sada://`) → Firebase must be regenerated.
- **App links:** `PUBLIC_WEB_HOST` empty until backend has a stable public web host. Set in `.env*` (JS allow-list + Android `manifestPlaceholders`) **and** Xcode build setting `PUBLIC_WEB_HOST` (Associated Domains; Debug adds `?mode=developer` via `APP_LINKS_MODE`). Unset native fallback = `links.invalid` (https filter without host would claim every https link).
- **API:** `API_BASE_URL` in `.env.staging`/`.env.production` still points to old domain.
- **Network security:** release = HTTPS + system CAs only (`main/res/xml`); debug override `android/app/src/debug/res/xml` (cleartext + user CAs). iOS ATS keeps only `NSAllowsLocalNetworking`.
- **Permission strings** localized in `ios/Sadaa/{en,ar}.lproj/InfoPlist.strings` — keep in sync with Info.plist.
- **`IOS_APP_STORE_ID`** (`.env*`) empty until first App Store release → force-update button opens App Store home until set.
- **`react-native-fast-image`** outdated (legacy-peer-deps + TS shim). Replace with `expo-image`/RN `Image` later in a dedicated refactor; all images go through `@/shared/ui` `Image` so the swap touches one file.
