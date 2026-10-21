# Store submission kit: App Store + Google Play

For: the Sada team preparing the first store submission (Syria market, real-world-services marketplace with a wallet).
Status of every item: `[ ]` to do · `[x]` done · `[?]` needs legal / policy confirmation.

---

## 1. Positioning (say the same thing everywhere)

Sada connects brands with social-media creators. A brand books a creator for a **real-world service** (a post, story, reel, UGC video, or event appearance) that is performed **outside the app** on the creator's own social accounts. The brand's payment is held in escrow and released to the creator after proof of publication.

- No digital goods, features, subscriptions, boosts, or unlocks are sold inside the app.
- Wallet balance can be spent **only** on bookings with creators. No user-to-user transfers. Creators withdraw **earned** payouts only.
- Store listing, Review Notes, Data Safety form, and Financial Features declaration must all describe it this way, in the same words.

---

## 2. Red lines (each one is a rejection or account-termination risk)

1. **Never sell a digital in-app feature from the wallet** (featured profile, boost, contact unlock, paid plan, extra applications). That needs Apple IAP (guideline 3.1.1) and Google Play Billing. If one is ever planned, it goes through IAP / Play Billing, not the wallet.
2. **No reviewer detection.** The app and backend behave identically for reviewers and real users (no IP, version, or account-based "review mode"). See `backend-prompt.md` §0.
3. **No hiding of the market.** Store metadata, screenshots, and in-app content show Syria and its currencies as they are.
4. **Wording.** Never use "coins", "credits", "points", "tokens", or "buy balance". Use: "wallet balance", "escrow", "payment for a service", "earnings", "withdrawal".
5. **No location permission** unless a feature needs the device location to work. The phone-country prefill uses the device region setting (no permission).

---

## 3. Demo accounts (seed on production before submitting)

Reviewers cannot pay with Syrian channels or receive SMS on Syrian numbers. Everything must be reachable without that.

| Account | State to seed |
|---|---|
| Demo brand | Verified, company info complete, **wallet pre-funded** (e.g. 500 USD), one approved and one pending top-up in history, deals in: `pending_influencer`, `awaiting_payment`, `in_progress` (draft waiting for review), `completed` |
| Demo creator | Verified, rate cards set, portfolio filled, **withdrawable earnings**, one saved payout method, one completed withdrawal in history, an incoming offer to accept / decline |

- [ ] Both log in with **phone + password**. If any step requires an OTP, the backend must accept a fixed OTP **for these two numbers only** (documented below), because the reviewer cannot receive Syrian SMS. This is an account fixture, not a review mode: anyone using these accounts gets the same behaviour.
- [ ] Re-check before each submission that balances, deals, and deadlines have not expired.
- [ ] Demo accounts are excluded from Explore / matching results shown to real brands.

---

## 4. App Store Connect

### 4.1 Account and listing
- [x] Published under the company (organisation) Apple Developer account: required for apps that hold or move money (guideline 5.1.1(ix)).
- [ ] Seller name and support URL match the company.
- [ ] Privacy policy URL and terms URL live and reachable (same URLs as `GET /config` → `urls`).
- [ ] Age rating questionnaire: answer user-generated content honestly, unrestricted web access = No. State "for businesses and creators aged 18+" in the description.
- [ ] Availability: countries where the company may legally offer the service. [?] Confirm with counsel.
- [ ] Export compliance: HTTPS only, no custom crypto → `ITSAppUsesNonExemptEncryption = NO` in `Info.plist`.

### 4.2 Account deletion (guideline 5.1.1(v))
- [ ] In-app deletion reachable from Profile without contacting support. Review Notes state where it is.
- [ ] Wallet with non-zero balance: deletion flow explains what happens to the money (withdraw first / refund), and does not trap the user.

### 4.3 Privacy nutrition labels (must match the privacy policy)

| Data type | Collected | Linked to user | Purpose |
|---|---|---|---|
| Name | Yes | Yes | App functionality |
| Phone number | Yes | Yes | App functionality, account |
| Email address (if asked) | Yes | Yes | App functionality |
| Physical address (shipping for product deals) | Yes | Yes | App functionality |
| Payment info: payout phone / bank details, transfer receipts | Yes | Yes | App functionality |
| Photos or videos (drafts, receipts, avatar) | Yes | Yes | App functionality |
| Other user content (briefs, messages, reviews) | Yes | Yes | App functionality |
| Device ID / push token | Yes | Yes | App functionality (notifications) |
| Crash data | Yes, if crash reporting is on | No | App functionality |
| Public social-profile data (handles, follower counts) | Yes | Yes | App functionality |

- Tracking: **No** (no cross-app tracking, no ATT prompt).
- Precise / coarse location: **No**.

### 4.4 Review Notes (paste, then fill the brackets)

```
Sada is a B2B marketplace that connects brands with social-media creators.
Brands book creators for real-world advertising services (posts, stories,
reels, UGC videos, event appearances) that are performed outside the app on
the creator's own social-media accounts. Under guideline 3.1.3(e) these are
services consumed outside the app, so they are paid outside In-App Purchase.

Wallet:
- Brands top up their wallet by a local bank or e-wallet transfer, then
  upload the transfer receipt. Our finance team verifies it and credits the
  balance (manual approval).
- The balance can only be used to pay for bookings with creators. It is held
  in escrow and released to the creator after the creator submits proof that
  the content was published.
- There are no user-to-user transfers and no digital goods, subscriptions or
  in-app features for sale. Creators can withdraw only their earnings.
- The app is published by [Company legal name, Germany], which operates the
  marketplace.

Demo accounts (pre-funded, so no real transfer is needed):
- Brand:   [+963…] / [password]   (OTP if asked: [code])
- Creator: [+963…] / [password]   (OTP if asked: [code])

Where to look:
- Brand: Home → pick a creator → book → pay from wallet (balance already
  loaded). Deals tab shows bookings in every stage.
- Creator: Deals tab → incoming offer, drafts, published proof. Wallet →
  earnings and withdrawal.
- Account deletion: Profile → Settings → Delete account.

Permissions: camera / photo library (upload drafts and receipts, only when
the user taps upload), notifications (deal updates).
```

---

## 5. Google Play Console

- [?] **Developer account type.** Apps with financial features may require an **organisation** account (D-U-N-S verified). The current account is personal (2017). Check the current Play policy before uploading; the safe path is a new organisation account under the German company and publishing there from the first release (moving an app between accounts later is slower).
- [ ] **Financial features declaration** (App content): declare a wallet / stored balance used for marketplace payments; not a bank, not a loan, not crypto, not peer-to-peer transfers.
- [ ] **Payments policy:** real-world services are outside Play Billing. Nothing digital is sold.
- [ ] **Data safety form:** same data as §4.3. Data encrypted in transit: Yes. Users can request deletion: Yes (in-app + web URL; Play requires a **web** deletion link too).
- [ ] **App access:** paste the demo credentials and steps from §4.4.
- [ ] **Target audience:** 18+. Content rating questionnaire: business / marketplace, user-generated content.
- [ ] **Permissions:** no `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION`, no SMS / call-log permissions (OTP auto-read uses the SMS Retriever / User Consent API only, if at all).
- [ ] Store listing countries match the App Store availability decision.

---

## 6. Open items for counsel (do not ship on assumptions)

- [?] Does operating a closed-loop marketplace balance for Syrian users need a local or German / EU payment licence, or is escrow by the marketplace operator enough?
- [?] Sanctions and export-control screening: current US and EU status for Syria, and whether any banks or e-wallet operators used as top-up / payout channels are on a restricted list.
- [?] App Store / Play availability: which storefronts may list the app.

---

## 7. Pre-submit run-through (each release)

- [ ] Install the store build on a clean device, log in with both demo accounts, walk every path in §4.4.
- [ ] Wallet screens show only allowed wording (§2.4).
- [ ] No debug / staging endpoints, no test banners, `ENABLE_LOGS` off.
- [ ] Screenshots are from the real build and show the real market.
- [ ] Privacy policy lists every data type in §4.3.
