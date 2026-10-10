---
paths:
  - "src/domains/auth/**"
  - "src/domains/identity/**"
  - "src/domains/notifications/**"
---

# 15 — Ref: Auth, Identity, Notifications

## Login & registration

- Login = phone + password (`HeroSheet`). Forgot password = 3-step wizard (phone → OTP → new password → back to Login prefilled).
- Registration wizards run under `AppStatus.REGISTRATION_INCOMPLETE`; `RootNavigator` picks branch from server `userType`.
  - **Brand:** account → phone OTP → profile → optional verification picker (4 ways, below) → welcome.
  - **Creator** (`constants/influencerOnboarding.ts`, `resolveInfluencerOnboardingStep`): account → phone OTP → niches (max 3) + platforms (draft in MMKV `INFLUENCER_SOCIALS_DRAFT` until saved) → optional rates (`price_usd` via `toPriceUsd`) → optional ID KYC (step 4, front + back) → welcome.
- KYC steps share `useFilePicker` (`@/shared/ui`) + `utils/kycSubmission` (skip = `is_skipped=1`; `kyc_already_*` on retry → `runStep` `resubmit` as skip).
- Follower tiers use brand ladder `FOLLOWER_TIER_STYLE` (neutral → teal → navy → mustard for MEGA only).
- OTP steps: `useOtpCodeForm` + `OtpCodeField`.
- Onboarding core `useOnboardingFlow`: write → re-read `/onboarding/progress` → navigate where server says; retry never repeats the write; wrong-step rejections `onboarding_step_out_of_order` / `kyc_already_*` / `phone_not_verified` re-read and reroute; resolvers route by `current_step` (contract §15.11). Per role: `useBrandOnboardingFlow(step)` / `useInfluencerOnboardingFlow(step)`. Phone OTP shared via `usePhoneVerifyStep` + `PhoneVerifyStepView`. First-load gate `OnboardingProgressGate`.

## Suspension

`SuspendedScreen` (auth): WhatsApp support (`config.support.whatsapp` → `SUPPORT_WHATSAPP_NUMBER`), re-check progress, logout, delete account. Gate logic: rule 12.

## Brand company verification (identity; contract `docs/company-verification.md`)

- 4 picker options over 3 routes:
  - registry/license + owner ID/passport → `POST /user/kyc` (`BRAND_KYC_DOCUMENT_GROUPS` company|owner, `BRAND_KYC_DOCUMENT_SLOTS`; `KycScreen { documentGroup }`)
  - social page proof (`/brand/verification/social-dm`, `SocialProofScreen`: code + DM, manual review, polling on focus + 60 s, deep link only via `toSafeDeepLink`)
  - domain email (`/brand/verification/domain-email`, `DomainEmailScreen`: sent/expired, resend gated by `resend_available_at` + 429 `retry_after`)
- `verificationApi` (tag `Verification`), mappers `utils/verificationMappers` (unknown → `null`), schemas `socialProofSchema` / `domainEmailSchema`.
- Hub `CompanyVerificationScreen` (Settings stack; brand `KycCard` → here; open attempts via `selectActiveAttempts`, verified premium card). Pushes `brand_social_proof_*` / `brand_domain_verified` → `sada://verification` → here.
- Parts: `VerificationMethodList` (grouped|compact) `VerificationCodeCard` `VerificationAttemptCard` (internal).
- Onboarding: auth can't import identity → app passes `BRAND_KYC_STEP_SCREENS` into `BrandOnboardingNavigator kycScreens` (picker `BrandVerificationStepScreen` + `Brand*` wizard wrappers). Each screen takes a `VerificationFlow` (`useSettingsVerificationFlow` | `useWizardVerificationFlow`): settings → `popTo('CompanyVerification')`; wizard → step 3 `is_skipped=1` → progress → welcome.
- Server labels (`status_label`, `method_label`…) shown as-is; i18n `account.verification.*` fallback.

## Account deletion

`DeleteAccountSheet` (`@/domains/auth`, `visible`/`onClose`) owns the whole flow: `DELETE /auth/account` with `current_password`; 422 → field; 429 countdown; `422 account_has_funds` → blocked state (creator + `onOpenWallet` (Profile only) → Go to wallet + support link, else Contact support). Session + local drafts wiped only on success. Mounted in Profile, `SuspendedScreen`, both registration wizards (`useDeleteAccountEntry` → `WizardShell action`).

## Push permission

- Never asked on launch. Automatic triggers (welcome CTAs) → `usePushPrompt().promptThen(next)` + `PushPromptSheet` (auth): only while OS can still ask, 48h after "Not now", max 3 per install (`core/notification/pushPrompt.ts`).
- Live OS status for a future Settings screen: `notificationManager.getPushPermission()` (re-read on foreground; old `usePushPermission` hook in git history before blocker 7).

## Notifications domain

- Inbox `NotificationsScreen` (RTK `infiniteQuery` on `/user/notifications`, optimistic read/read-all, bell badge = `/me` `unread_notifications_count`), hosted in Settings stack.
- No notification-preferences screen yet: build once backend has Sada notification categories.
- `LanguageScreen` still calls template `PUT /account/preferences` (not in contract).
