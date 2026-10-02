I compared mobile-contract.md against the current code and left out the new Profile/Home/Settings screens. I haven't changed anything yet. The plan below goes in priority order: core first, because every screen depends on it.

P0 — Core API (blocks all)
#	Fix	File	Now
1	API types: errors is Record<string,string[]> | null; add error_code, meta.retry_after and an ApiErrorCode union	types.ts	errors?: unknown[]
2	normalizeApiError reads error_code (it currently reads data.code) and adds retryAfter	errorHandler.ts	the server's code is lost
3	403 branches on the error code: phone_not_verified → OTP, account_suspended → suspended state, forbidden_user_type → toast only. Delete the old jwt_auth_invalid_token branch. Explicitly pass 409/429 back to the screen	baseApi.ts:136	every 403 → toast + navigate('HomeScreen'), which breaks onboarding
4	On 401, also call baseApi.util.resetApiState() (rule 07)	baseApi.ts:127	the cache survives
5	Per-endpoint timeout ≥ 35s for the social lookup	baseApi	15s for everything
6	IDs are strings: User.id: string; UserStatus = 'draft'|'active'|'suspended'; remove pending_kyc	authTypes.ts	id: number, status is a plain string
7	Lookups: add supports_lookup per platform; type follower_tiers as Record<FollowerTierId,…>	lookupsApi.ts	missing
P1 — Auth & onboarding (the screens we already built)
#	Fix	Area
8	Both resolvers route by current_step (§15.11), not by which data exists. Influencer gets a new kyc step; check suspended first	resolveInfluencerOnboardingStep.ts, resolveBrandOnboardingStep.ts + tests
9	409 onboarding_step_out_of_order → re-read progress, then route. Check it doesn't clash with the fake 409 STEP_NOT_ADVANCED	useOnboardingFlow.ts
10	OTP changes:<br>• Resend on entry when arriving from login/launch (now: "resend available immediately").<br>• 429 otp_cooldown → restart the countdown from retry_after.<br>• Count wrong codes locally; at 5, force a resend.<br>• 429 too_many_requests → block submit.<br>Same for the reset wizard	usePhoneVerifyStep.ts, useOtpCodeForm
11	Reset success → clear tokens → Login with the phone pre-filled. Forgot flow already skips verify-otp ✅	reset wizard
12	Login: show the suspended message from errors.phone[0]; handle 429	Login
13	Influencer step 2:<br>• username → handle; follower_tier only sent for manual rows; add is_primary and is_available.<br>• New POST /social/lookup endpoint with the §14 UX (found card, manual tier picker fallback, already_claimed block, primary toggle).<br>• Migrate the old MMKV draft shape	useInfluencerSocialsScreen, PlatformAccountSheet, FollowerTierPicker, socialsDraft.ts, new socialApi
14	New influencer step 4 (KYC): InfluencerKycScreen, multipart, skippable ("1"/"0"); rates step no longer finishes onboarding	navigator, constants/influencerOnboarding.ts (mockup needed)
15	Brand step 3: is_skipped, document-type picker (3 values), no webp. Brand step 2: social_links.platform must be an enum value	brand KYC/profile steps
16	Response types for InfluencerProfileResource/BrandProfileResource; progress uses has_kyc_submission	authTypes
P2 — Session & push
#	Fix
17	/auth/fcm/register → POST /user/devices with {token, platform, device_id, app_version}. Call it after step 1, after login, on onTokenRefresh and on language change
18	Logout sends fcm_token; storage is cleared even if the call fails
19	Typed push payload parser (type, deep_link, rule 07); on receive, invalidate the User tag
20	New AppStatus.SUSPENDED plus a small blocking screen where only logout works (mockup needed)
Later (with the Profile/Home/Settings work)
GET /user/me with the new Me shape (B3), and /user/profile.
Replace /account/*: PATCH /influencer|brand/profile, POST/DELETE /user/avatar (downscale to ≤ 4096px), PUT /user/password.
Platform management (§5.3), PUT /influencer/rate-cards, in-app KYC GET/POST /user/kyc.
Notifications list and read endpoints, plus the test push.
Order of work
P0 #1–7 in one pass, then tsc/lint/tests.
P1 #8, #9 and #16 (resolver + types).
P1 #10–12 (OTP/login).
P1 #13 (lookup, the biggest piece). Ask the backend whether social_lookup is live on staging.
P1 #14–15 (KYC steps; mockup first).
P2.