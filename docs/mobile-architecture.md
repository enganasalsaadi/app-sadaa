# Sada (صدى): Living Mobile Architecture & Pitch Guide

> **Trust in every deal** · «ثقة في كل صفقة»

| | |
|---|---|
| **Product** | Sada (صدى): a B2B influencer marketplace for the Creator Economy |
| **Market** | Syria first, Arabic first, built to expand across the region |
| **Platforms** | iOS and Android (one shared codebase) |
| **Document owner** | Mobile team |
| **Last updated** | 2026-10-09 |
| **Status of this document** | Living. It is updated whenever a screen, flow, permission or business rule changes (see `.claude/rules/11-mobile-docs.md`). |

**How to use this document**

- **Part 1 (Pitch Deck)** is written so you can lift sections straight onto slides. Every heading is a slide, and the bullets are speaker notes.
- **Part 2 (Mobile UX & Architecture)** explains what the app does today, how people move through it, and what stands between us and the stores.
- Where something is **live in the app today**, it is marked ✅. Where it is **designed or partly built but not yet connected to the live service**, it is marked 🟡. Where it is **on the roadmap**, it is marked 🔜.
- Figures marked **[DATA NEEDED]** are placeholders for market research. Never present them as facts until they are sourced.

---

# PART 1: THE PITCH DECK

## 1. Problem & Solution

### 1.1 The market gap

The Creator Economy is one of the fastest-growing advertising channels in the region. In Syria and the surrounding markets, businesses of every size (restaurants, clothing stores, electronics shops, clinics, startups) already pay local creators to promote them. **But the way they do it is broken.**

A single sponsored post today typically involves:

1. **Discovery by word of mouth.** A brand scrolls Instagram, asks friends, or messages creators blindly. There is no trusted directory and no way to filter by city, niche or real audience size.
2. **Negotiation over WhatsApp.** Prices, deliverables, deadlines and "do's and don'ts" are scattered across voice notes and chat threads. Nothing is written down in a form either side can rely on.
3. **Unverifiable numbers.** Creators send screenshots of their stats. Brands cannot tell real reach from inflated reach.
4. **Drafts sent through chat apps.** Videos are compressed, feedback is lost in long threads, and there is no record of what was approved.
5. **Payment on trust alone.** Either the brand pays upfront and hopes the creator posts, or the creator posts and hopes the brand pays. Both sides carry the risk.
6. **No results.** After the post goes live, the brand has no clear report of what it achieved: views, engagement, visits or sales.

**The core pain is trust and money.**
- **Brands fear** paying and getting nothing, or getting content that ignores their brief.
- **Creators fear** doing the work and chasing payment for weeks, or being underpaid because they do not know the market rate.

This chaos keeps the market small and informal. Small businesses stay away because the risk feels too high, and talented small creators stay invisible because they have no professional storefront.

### 1.2 Our solution: one trusted place for the whole deal

Sada replaces the email, WhatsApp, screenshot and payment-app chaos with **one app that runs the entire deal from first contact to final payout.**

| Today (fragmented) | With Sada (all-in-one) |
|---|---|
| Find creators by word of mouth | Search by city, niche, price and verified audience tier |
| Screenshots of stats | Live profile linked to the creator's real social accounts, with stats checked automatically |
| Negotiation in chat threads | A structured campaign brief and an in-app offer, accept or negotiate flow |
| Drafts compressed over WhatsApp | Original-quality draft upload, review and approval inside the app |
| "Pay first and pray" | **Escrow:** the brand's money is held by Sada and released only when the agreed content is published |
| No paperwork | Contracts and invoices generated automatically for every deal |
| No results | Performance reports, affiliate links, discount codes and QR visit tracking |
| No reputation system | Two-way ratings on several criteria, plus badges and rankings |

**One sentence:** Sada is the trusted operating system for local influencer marketing: discovery, agreement, content approval, escrowed payment and results, all in one Arabic-first app.

### 1.3 Why now

- **Mobile-first market.** Business in our launch market already runs on smartphones and messaging apps. A mobile app is where the work already happens.
- **Local e-wallets are ready.** Mobile wallet services make instant digital payments and payouts possible without traditional banking.
- **Creators are professionalising.** Creator and Business accounts on Meta platforms are now standard, so audience data can be verified.
- **No local incumbent.** Global influencer platforms do not support the local language, currency, payment rails or city-level discovery. **[DATA NEEDED: competitor scan]**

---

## 2. Elevator Pitch & Unique Selling Points

### 2.1 Elevator pitch (30 seconds)

> Brands in Syria spend real money on influencer ads, but every deal runs on WhatsApp and blind trust. Brands worry the creator won't post; creators worry they won't get paid. **Sada** is an Arabic-first app that runs the whole deal in one place. Brands find verified local creators by city and niche, send a clear brief, and pay into **escrow**. Creators upload their draft in the app, publish once it is approved, and get paid to their wallet as soon as publishing is confirmed. Every step is recorded, so both sides are protected. **Sada: trust in every deal.**

### 2.2 Elevator pitch (10 seconds)

> Sada is the escrow-protected marketplace where local brands and creators find each other, agree, approve content and get paid, all in one Arabic app.

### 2.3 Unique Selling Points

1. **Escrow-protected deals (the trust layer).**
   The brand's payment is locked by the platform the moment a deal is agreed. The creator sees "funds secured, you can start safely" before they lift a camera. Money is released to the creator only after the content is published and verified. If the creator fails to deliver, the money goes back to the brand automatically, with no argument.

2. **Verified, living creator profiles.**
   Creators link their real social accounts. Sada looks up their public follower numbers automatically and places them in a **follower tier** (Nano, Micro, Mid-tier, Macro, Mega). When an account cannot be checked automatically, the creator picks a tier and our team reviews it, and brands see an "under review" label until it is approved. Brands see real numbers, not screenshots.

3. **Hyper-local discovery.**
   Brands can filter creators by governorate and city (Damascus, Aleppo, Latakia, Homs and more). That matters most to restaurants, shops and other physical businesses that need foot traffic from a specific neighbourhood, not global reach.

4. **A structured deal pipeline.**
   Every deal moves through clear stages that both sides can see:
   *Waiting for creator approval → Waiting for payment → In progress → Draft under review → Ready to publish → Published → Completed* (plus *Disputed*, *Cancelled* and *Refunded* when needed). Nobody wonders "where are we?" any more.

5. **In-app content review in original quality.**
   Drafts are uploaded inside the app in full quality (no chat-app compression). The brand comments and approves in one place, and that approval becomes part of the deal record.

6. **More ad types than a "paid post".**
   Paid post, story or reel · **Barter** (products or services in exchange for content) · **Affiliate** commission on sales · **Visit-based** campaigns with a personal QR code per creator · **UGC** (content made for the brand's own ads, not posted by the creator) · **Offline event booking** (book a creator by the hour for an opening or live event).

7. **Automatic contracts, invoices and audit trail.**
   Each accepted deal produces a simple contract (dates, deal value, platform commission, publishing date, refund terms) and an invoice. Agreements, negotiations, approvals and proof of publishing all happen in the app, so any dispute can be settled from the record.

8. **Reputation that rewards professionalism.**
   Brands and creators rate each other on several criteria (on time, content quality, communication, real results). Badges such as "Fastest responder" and "Top 10 in Beauty" raise visibility, so good behaviour pays off directly.

9. **Built for the market, not translated for it.**
   Arabic is the primary design language, with a complete right-to-left layout. The app also covers local payment wallets, local cities and local pricing, with Western digits for clear money display. English is fully supported as a second language.

10. **Fast payouts for creators.**
    Earnings land in the creator's in-app wallet and can be withdrawn to a local e-wallet. **Instant cash-out** (in minutes, for a small fee) is planned as a premium option.

### 2.4 Brand promise

- **Tagline:** «ثقة في كل صفقة» / "Trust in every deal".
- **Visual identity, "Navy Trust":** deep navy for trust and identity, teal for interaction, **mint used only for money** (balances, earnings and payouts, so green always means money), and mustard reserved for distinction (top creators, badges, premium features). The logo, the "Concentric Echo", shows brand reach (left arcs) meeting creator resonance (right arcs) around a central dot that stands for the escrowed money at the heart of every deal.

---

## 3. Target Personas

Sada is a two-sided marketplace. Each side has its own registration path, home experience and wallet rules.

### 3.1 Brands (the demand side)

#### Persona B1: "Rania", independent store owner
- **Who:** Owns a clothing boutique or café in one city. Small marketing budget, no agency.
- **Goals:** More customers through the door this month. Wants creators *from her own city*.
- **Pains:** Doesn't know how to write an ad brief. Has paid creators before who posted late or not at all. Can't tell whether the ad brought anyone in.
- **What Sada gives her:**
  - City filter, so she only sees creators near her shop.
  - **Brief Builder** templates that turn "I want an ad" into a clear brief: content type, mandatory keywords, things not to mention.
  - Escrow, so she pays only for content that is actually published.
  - **Visit-based campaigns** with a QR code per creator, so she can count the customers each creator sent her.
  - **Barter** option: she can pay in products instead of cash.

#### Persona B2: "Omar", marketing manager at a growing company
- **Who:** An electronics chain, restaurant group or FMCG distributor with several branches and a regular campaign calendar.
- **Goals:** Run several creators per campaign, compare them, and report ROI to management.
- **Pains:** Coordinating several creators by hand, chasing invoices, no consolidated reporting.
- **What Sada gives him:**
  - **Smart matching** that suggests the best-fit creators for a brief (budget, niche, goal).
  - **Compare up to 3 creators** side by side (numbers, prices, engagement) before hiring.
  - Automatic contracts and invoices for finance.
  - **Analytics:** views, engagement, clicks, affiliate sales and discount-code usage per creator.
  - **UGC** hiring for content his team can run as paid ads.

**Brand registration today ✅:** phone number and password → SMS code → business profile (company or store, name, industry, social links) → optional business document (commercial register, industrial register or trade licence) → welcome.

### 3.2 Creators (the supply side)

Creators are segmented by **follower tier**. The tier is shown everywhere as a crest badge (chevrons for Nano, Micro and Mid-tier, a star for Macro, a crown for Mega). Tapping any badge explains what each tier means. The exact follower ranges are set by the platform and returned by the server, so they can be tuned per market without an app update. *(Industry convention for reference only: Nano ≈ 1K–10K, Micro ≈ 10K–100K, Mid-tier ≈ 100K–500K, Macro ≈ 500K–1M, Mega 1M+.)*

#### Persona C1: "Lina", Nano creator (the long tail and our growth engine)
- **Who:** A university student or young professional with a small, loyal, local audience. Posts about food, fashion or daily life in her city.
- **Goals:** Earn her first income from content and look professional to brands.
- **Pains:** Invisible to brands. Doesn't know what to charge and often undercharges. Has been ghosted on payment before.
- **What Sada gives her:**
  - A **professional storefront** from day one: a verified profile, tier badge and price list.
  - Access to **open campaigns** she can apply to (like a freelance marketplace) and **city alerts** when a local brand posts a campaign.
  - **Barter deals**, a low-risk way to start.
  - Escrow, so she knows the money exists before she starts filming.
  - Planned: a **Local Rate Index** and **Smart Rate Calculator** so she stops underpricing.

#### Persona C2: "Karim", Micro creator (the sweet spot for brands)
- **Who:** A dedicated niche creator (tech reviews, beauty, fitness) with high engagement. Content is a serious side income or his main job.
- **Goals:** Steady deal flow, fair prices, payment on time, less admin.
- **Pains:** Juggles several brands over WhatsApp, loses track of deadlines and revisions, chases invoices.
- **What Sada gives him:**
  - One **deal pipeline** for all his brands, with clear stages and deadlines.
  - In-app **draft review**, so feedback and approvals are recorded.
  - **Saved rate cards** (for example "3 stories" or "reel + story") he can send in one tap.
  - **Wallet and fast withdrawals** to a local e-wallet.
  - **Reputation badges** that move him up in search results.
  - **Vacation mode** to pause offers without hurting his ranking.

#### Persona C3: Mid-tier, Macro and Mega creators (the premium tier)
- **Who:** Established names with broad reach, often already working with agencies.
- **Goals:** High-value, long-term partnerships and protection for their brand.
- **What Sada gives them:** Premium visibility (mustard distinction), **Exclusive Brand Clubs** (monthly retainer ambassadorships, planned), **Offline Event Booking** at an hourly rate, and **Group Collaboration** packages with other creators (planned).

**Creator registration today ✅:** phone number and password → SMS code → choose up to 3 niches and link social platforms (with automatic follower lookup) → optional price list → optional national ID check (front and back) → welcome.

**Creator requirement:** accounts must be professional (Creator or Business) and connected to a Facebook Page, so audience data can be verified.

### 3.3 Platform staff (internal)
- **Reviewers** approve manually entered follower tiers and identity or business documents.
- **Support** steps in on disputed deals, with the full in-app record as evidence.
- *(Planned)* **Content quality reviewers** who can check a creator's draft to get the brand a better result.

---

## 4. Business Model & Value

### 4.1 How Sada creates value

| For brands | For creators | For the market |
|---|---|---|
| Zero-risk spend: pay only for delivered content | Guaranteed payment, secured before work starts | Turns an informal, cash-and-trust market into a professional one |
| Hours saved on discovery, negotiation and admin | A professional storefront and steady deal flow | Rewards reliability through public reputation |
| Measurable ROI (views, visits, sales) | Fair pricing through market transparency | Brings small businesses and small creators into the market |
| Contracts and invoices for bookkeeping | Less admin: one pipeline, one wallet | Creates a verified data layer for local ad pricing |

### 4.2 Revenue streams

1. **Commission on each completed deal (primary).** A percentage is deducted from the deal value when escrow is released to the creator. The commission is shown upfront on the invoice and contract, so there are no surprises.
2. **Instant cash-out fee.** Creators who want their money in minutes instead of the standard payout cycle pay a small fee.
3. **Premium features (planned).** Paid tiers for brands (advanced analytics, more creators per comparison, priority matching) and for creators (boosted visibility, Brand Club access). Premium is always shown in the mustard "distinction" colour.
4. **Value-added services (planned).** Platform-managed content quality review and UGC production packages.

### 4.3 Go-to-market pricing strategy: "free first, commission later"

- **Launch phase:** the service is **completely free for a limited time.** The message to both sides: *"Our only goal right now is to organise the market and protect your rights."* This removes every reason to hesitate and drives sign-ups on both sides at once.
- **Habit phase:** once brands and creators run their daily work through Sada, the platform becomes part of how they operate.
- **Monetisation phase:** commission is switched on **gradually**, starting low and rising with the value delivered (escrow protection, contracts, analytics).

### 4.4 The money flow (how escrow works)

1. **Top-up.** The brand sends money to Sada's account through a local channel (Al-Haram or Al-Fouad exchange offices, Syriatel Cash, MTN Cash or Sham Cash, or a bank transfer), then files a top-up request in the app with the transfer number and a photo of the receipt. Sada's team checks the transfer and then adds the dollars to the wallet. Dollars are added as sent; Syrian pounds are converted at the rate of the moment the request is sent, which is then locked: before sending, the app shows an estimate; after sending, the amount on the request is final.
2. **Agreement.** The brand and creator agree on a deal. The creator accepts, and the brand sees a detailed invoice.
3. **Escrow hold.** The agreed amount is **frozen** in escrow straight away. The creator is notified: *"Funds deposited. You can start working safely."* The creator cannot touch this money yet.
4. **Production and review.** The creator uploads the draft, and the brand reviews and approves it in the app.
5. **Publish and prove.** The creator publishes on their real account at the agreed time and submits the post link as proof.
6. **Verification and release.** The system checks the link. Once it is confirmed (and any agreed tracking period ends), the money is **released to the creator's wallet, minus platform commission.**
7. **Withdrawal (🟡 awaiting live-server testing).** The creator withdraws to one of their saved payout methods: an exchange office (cash at Al-Haram or Al-Fouad), an e-wallet (Syriatel Cash, MTN Cash or Sham Cash) or a bank account, in dollars or Syrian pounds when the method takes both. The amount is held from the balance as soon as the request is sent, and Sada's team transfers it, usually within 24 hours. Instant cash-out for a fee is planned (🔜).
8. **Refund path.** If the creator breaches the agreement or misses the publishing deadline, the escrowed amount is **returned automatically** to the brand's wallet.
9. **Dispute path.** If the two sides disagree, the deal moves to *Disputed* and platform support decides using the in-app record.

*Under consideration:* a staged release (for example 30% when work starts and the rest on completion). The final split will be confirmed before payments go live.

### 4.5 Strict money rules (our trust guarantees)

- **Brands deposit and pay. Creators only withdraw.** The app never shows an action that the user's role is not allowed to perform.
- **The server is the only source of truth** for balances, escrow holds, commission, refunds and deal status. The app displays what the server confirms and never calculates final amounts itself. Any amount the app works out on its own is clearly labelled as an *estimate*.
- **No double charges.** Every top-up, withdrawal or cancellation carries one key per user action. The same key is reused when the user retries that action (weak connection, app reopened, a mistake fixed), so the server charges once and a repeat simply returns the first result. Payment buttons lock while a payment is in progress. The only automatic retry is when the server says the first request is still running: the app asks again after about 2 seconds (at most 3 times), which can never charge twice.
- **Top-up limits.** One top-up is between $10 and $10,000 (Syrian pounds: the same range at the current rate). The service sends the exact range for each method and currency, and any amount inside it is accepted. Syriatel Cash and MTN Cash take Syrian pounds only, so they pause while the rate is out of date; Sham Cash and dollar top-ups keep working. Every request needs the transfer number and a receipt (photo or PDF, up to 10 MB). A transfer number can be used once per method (a rejected request frees it, so the same transfer can be sent again with a clearer receipt). A brand can have at most 5 requests in review at a time. A top-up is only money once Sada approves it; until then it shows as "in review" and can be rejected with a reason. Sada can reverse an approved top-up (a bounced or fraudulent transfer): the amount is taken back out of the wallet and the request shows as reversed, in red, with the reason.
- **Payout methods (creators).** A creator can save up to 10 accounts in their own name to receive withdrawals. Exchange offices need the recipient's full name, a Syrian mobile number and the governorate (city optional); e-wallets need the name and the mobile number (Sham Cash also needs the wallet's account code: 4 to 64 Latin letters, digits or dashes); banks need the name, the bank, the account number and optionally an IBAN, which the app checks for typos before sending. Exactly one method is primary once any exist: the first one saved becomes primary, the creator can make another one primary, and deleting the primary promotes the newest remaining method. A method's type can't change after saving (delete it and add a new one). Withdrawals already sent keep their own copy of the destination, so editing or deleting a method never redirects money already on its way. Managing methods is allowed at any time, even before identity verification or with a frozen wallet; those rules block the withdrawal itself. Only the last four digits of a phone or account number are shown in lists. **Security alert:** whenever a method is added, or its account details change, the creator gets a notification naming the method type and asking them to contact support if it wasn't them; renaming a method alone sends nothing.
- **Withdrawal rules (creators, 🟡 awaiting live-server testing).** Before confirming, the server prices every withdrawal: the amount taken from the balance, the method's fee, what arrives, and for a Syrian pound payout the pounds at today's rate, fixed at the moment of sending. If it refuses, every reason is listed (account not active, identity not verified, wallet frozen, withdrawals paused, below the minimum, over the daily limit, a withdrawal already on its way, too soon since the last one with a countdown to the next allowed time, not enough balance, an out-of-date rate for pounds, a currency the method doesn't pay, or a fee larger than the amount) and Continue stays disabled, the one place a button is disabled on purpose, because only a change of amount or time can fix it. The default rules are shown up front: at least $25, at most $500 a day, one withdrawal every 7 days, one request open at a time; the service will send its own numbers later. A request can be cancelled while it is in transfer, and the amount goes straight back to the balance. A transfer the payout partner sends back is returned to the balance in full, with the reason.
- **Wallet buttons follow the server.** Top up (brands) and Withdraw (creators) are enabled only when the server allows it; it explains why when they are not (registration or verification unfinished, account suspended, wallet frozen, or withdrawals paused).
- **No deleting an account that still holds money.** While the wallet has a balance, pending money, money in escrow, a top-up under review or an open withdrawal, deletion is refused (🟡 handled in the app, awaiting live-server testing).
- **All amounts are exact.** Money is stored as whole units of the smallest denomination with a currency code, never as rounded decimals. The default display currency is **US dollars** (in cents); Syrian pounds have no fractions and are shown as whole pounds with the «ل.س» / "SYP" symbol. Digits are Western in both languages.
- **Amounts are shown the same way everywhere.** Statements, receipts, quotes and confirmations always show the exact amount. Short forms (1.2K, 6.5M) appear only in summary tiles and stats. A balance shown without cents is always rounded down, so the app never shows more money than the user has. The wallet can hide every amount with one tap (eye icon) for privacy in public.
- **Deal actions stay in the app.** We never offer "continue on WhatsApp" for anything related to a deal, because the in-app record protects both parties.

### 4.6 Key metrics to track (for investors)

- Registered brands and creators, split by city, tier and niche
- Registration completion rate (account created → onboarding finished)
- Share of creators with a verified (automatic) tier vs. under review
- Deals created, deal completion rate, average time per stage
- **Gross Merchandise Value** (total escrowed deal value) and take rate once commission is switched on
- Dispute rate and refund rate (trust health)
- Repeat brand rate and creator retention
- **[DATA NEEDED: targets per launch milestone]**

---

# PART 2: MOBILE UX & ARCHITECTURE

## 5. User Journeys & Navigation

### 5.1 How the app decides what to show

When the app opens, it decides which "world" the user belongs in **before** anything appears. The native splash screen (the Sada symbol on navy) stays up while it runs these checks in order:

1. **Language.** On the very first launch, the user picks Arabic or English.
2. **Remote configuration.** The app asks the server for live settings (with a 3-second limit). The checks that follow are:
   - **Maintenance:** the server says the platform is down for maintenance → *Maintenance screen*.
   - **Forced update:** this app version is too old to be safe → *Update Required screen*, which links to the store.
   - **Optional update:** a newer version exists → a one-time friendly reminder, and the user carries on.
   - If the configuration can't be fetched, the app **carries on anyway** (it never locks users out because of a slow network) and uses the last known settings.
3. **Intro slides.** First-time visitors see 3 short slides (*For Brands*, *For Creators*, *For Everyone*: escrow protection). Signed-in users never see them again.
4. **Account state.** The user then lands in exactly one of these:
   - **Not signed in** → Login.
   - **Signed in, registration unfinished** → the registration wizard, resumed at the exact step the server says is next.
   - **Account suspended** → Suspended screen.
   - **Fully registered** → the main app.

If these checks take longer than 1.5 seconds, a branded loading screen with a spinner appears so the app never looks frozen.

### 5.2 Screen map

```
APP LAUNCH
│
├── Choose Language (first launch only)                          ✅
├── Intro Slides (3 slides, first launch only)                   ✅
├── Maintenance (server-controlled)                              ✅
├── Update Required (server-controlled)                          ✅
│
├── AUTH (not signed in)
│   ├── Login (phone + password)                                 ✅
│   ├── Forgot Password: phone → SMS code → new password         ✅
│   ├── Register as Brand  ────────┐                             ✅
│   └── Register as Creator ───────┤                             ✅
│                                  ▼
├── REGISTRATION WIZARD (signed in, not finished; "Delete my account" on every step)   ✅
│   ├── Brand:   Verify phone → Business profile → Business document (optional) → Welcome   ✅
│   └── Creator: Verify phone → Niches & platforms → Prices (optional) → ID check (optional) → Welcome   ✅
│
├── SUSPENDED (blocking: contact support, re-check status, log out, delete account)   ✅
│
├── CREATOR PUBLIC PROFILE (opened from a shared Sada link; over Login or the main app)   🟡 built, awaiting device and live-server testing
│     profile card · platforms · prices · "Profile not available" for any hidden or unknown link
│
└── MAIN APP (bottom tab bar: floating rounded glass capsule; page content
    │   shows blurred through it; slides away on scroll down, back on scroll up;
    │   hidden on inner screens; active tab shown in teal)                           ✅
    │   Five tabs, different per role:
    │     brand:   Explore · My campaigns · Messages · Wallet · Account
    │     creator: Home · Deals · Messages · Wallet · My profile
    ├── Home (creator) dashboard                                 🟡 built, awaiting device and live-server testing
    │     navy hero: greeting (beside the bell) · photo + name, verified mark
    │       · tier and handle on their own line
    │       · live island: the one blocker (incl. "Set up your prices"), pulsing dot
    │       + glass strip of 30-day numbers (reach · profile views · brands) → insights
    │     · media kit card (visibility, link, Share, Preview)
    │     · profile strength (five-stage track + next step) · my platforms (+ add) · my prices → My prices
    │     scrolled: navy bar pinned with photo, name, tier and the bell
    │     ├── Media kit: all insights                                🟡 built, awaiting device and live-server testing
    │     │     period switch (7 / 30 / 90 days) · numbers vs the previous period
    │     │     · daily views line · cities brands view from · most-viewed work · Share
    │     └── Media kit: preview as brands see it                    🟡 built, awaiting device and live-server testing
    │           hidden-kit warning · profile card · platforms · prices (tap: what's included)
    │           · collaboration terms · Share
    │           └── Media kit settings (gear in the header)          🟡 built, awaiting device and live-server testing
    │                 link name with a live availability check · show / hide from brands
    ├── Explore (brand) tab                                      🟡 placeholder today    🔜
    ├── My campaigns (brand) / Deals (creator) tab               🟡 "coming soon" page   🔜
    ├── Messages tab                                             🟡 "coming soon" page   🔜
    ├── Wallet tab (same layout, each role's own words)          🟡 built, awaiting device and live-server testing
    │     balance hero (eye hides every amount) · the one blocker · money held in escrow
    │     · monthly earnings (creator) or campaign spend (brand) · today's rate · latest activity
    │     ├── Statement (every line, by type and period)          🟡 built, awaiting device and live-server testing
    │     │     └── Receipt (one line's details, share, report)   🟡 built, awaiting device and live-server testing
    │     ├── Top up (brand, 4 steps: method → amount → transfer and receipt → review)   🟡 built, awaiting device and live-server testing
    │     ├── Top-up history (by status) → top-up request (timeline, reason, receipt)     🟡 built, awaiting device and live-server testing
    │     ├── Payout methods (creator: saved accounts, primary first, up to 10)   🟡 built, awaiting device and live-server testing
    │     │     ├── Pick a type (sheet: exchange offices · e-wallets · banks)
    │     │     └── Add / edit a method (details per type, short name, primary switch, delete)   🟡 built, awaiting device and live-server testing
    │     ├── Withdraw (creator, 2 steps: destination and amount with a live price → review)   🟡 built, awaiting device and live-server testing
    │     │     └── Add a payout method (type sheet → form, then back to the withdrawal)
    │     ├── Withdrawal history (by status) → withdrawal request (timeline, reason, cancel)     🟡 built, awaiting device and live-server testing
    └── Account (brand) / My profile (creator) tab
          ├── Profile (navy header + cards, different per role)  🟡 built, awaiting device testing
          │     ├── Notifications inbox (bell with unread count in the header)   🟡 built, awaiting device and live-server testing
          │     ├── Verification: creator ID (front + back) or brand company document   🟡 built, awaiting device and live-server testing
          │     ├── Creator: My prices (grouped by platform + in person)   🟡 built, awaiting device and live-server testing
          │     │     └── One price: add / edit / delete (package, price, delivery, revisions,
          │     │           how long it stays live, rush delivery)          🟡 built, awaiting device and live-server testing
          │     ├── Creator: My platforms → one platform (switches, link to its prices)  🟡 built, awaiting device and live-server testing
          │     ├── Creator: My niches                           🟡 built, awaiting device and live-server testing
          │     ├── Creator: Personal info (name, email, city, area)   🟡 built, awaiting device and live-server testing
          │     ├── Creator: Payout methods (opens the wallet's page)   🟡 built, awaiting device and live-server testing
          │     ├── Creator: Media kit settings (same page as from Home)   🟡 built, awaiting device and live-server testing
          │     └── Brand: Company info (name, email, activity, city, links)   🟡 built, awaiting device and live-server testing
          ├── Change password                                    ✅
          ├── Language                                           ✅
          ├── Terms & Privacy (in-app web pages)                 ✅
          └── Delete my account (password-confirmed)             ✅
```

**Planned tabs 🔜:** brands and creators will get **separate tab sets** suited to their jobs, for example *Home · Campaigns · Deals · Wallet · Profile* for brands and *Home · Opportunities · Deals · Wallet · Profile* for creators. Tabs for analytics, messages and notifications follow as those features arrive.

### 5.3 Core journeys in plain English

#### Journey A: Creator registration and social linking ✅
1. **Create account.** The creator enters their name, phone number and a password. An SMS code is sent automatically.
2. **Verify phone.** They type the 6-digit code. Wrong codes shake the input. After several wrong attempts they must request a new code, and the "resend" button has a countdown so nobody can spam SMS.
3. **Choose niches and link platforms.**
   - They pick up to **3 content niches** (for example Food, Fashion, Tech).
   - They add each social platform (Instagram, Facebook, TikTok, YouTube, Telegram, website) by typing a username, an @handle or pasting the profile link.
   - **Automatic lookup:** for supported platforms, Sada checks the account's public data (this can take up to 30 seconds, with a clear loading indicator). Then one of these happens:
     - **Found:** a card shows the profile photo, name, follower count and **tier**, and the tier is locked, because the numbers are verified.
     - **Not found or private:** "Account not found, check the username", with the option to choose a tier by hand.
     - **Couldn't verify right now:** a friendly notice, and the tier can be chosen by hand.
     - **Already linked to another creator:** blocked. One social account can belong to only one creator.
     - **Platform without lookup** (Telegram, website): the tier is chosen by hand straight away.
     - **Too many lookups:** "Try again in X minutes", and manual entry is still allowed.
   - **Manually chosen tiers are marked "Under review"** until the Sada team approves them. They still count for applying to campaigns, and brands see the "under review" label.
   - The creator can mark one platform as **primary**. If they don't, Sada uses their biggest account.
   - Unsaved platform entries are kept on the device, so closing the app doesn't lose the work.
4. **Set prices (optional).** For each linked platform the app lists the services Sada offers there (for example reel, story, feed post on Instagram), plus in-person services such as an on-site visit. The creator ticks what they offer, picks the package (for example story frames or video length) and sets a price between $5 and $50,000. Delivery time, revisions and the rest take sensible defaults they can change later from My prices. They can skip this step.
5. **Verify identity (optional).** They upload the front and back of their national ID (photo or PDF, up to 10 MB). Skipping is allowed and registration still completes. Verification raises trust with brands.
6. **Welcome.** A celebration screen. At this natural moment, the app may *offer* to turn on notifications (see §6.4).

#### Journey A2: Managing platforms, prices and niches after registration 🟡
- **Entry points:** the prices, platforms and niches cards on the Profile, and the "complete your profile" cards for linking platforms, getting them verified and setting prices (which now opens My prices). Without any price, the Profile shows a "Set up your prices" warning in place of the prices row.
- **My platforms:** a calm list, one card per account (username, tier badge, and small labels for primary, under review, rejected or not available). Tapping a card opens that platform; adding uses the same username + automatic lookup sheet as registration. Only platforms not linked yet can be added (one account per platform).
- **One platform:** the account (username, followers or "tier picked by you", last update) with a refresh button (the server allows two refreshes per hour; the app shows when the next one is possible). Two switches save immediately: **available for requests** (when off, brands can't send requests on that platform; the creator's overall tier is recalculated from the available, non-rejected accounts) and **primary account** (hidden for rejected accounts; there is always exactly one primary, so it changes by making another platform primary). A rejected account shows the reason and an edit button; a manual tier shows that the team is reviewing it. Editing the username or tier re-runs the lookup.
- **Prices on a platform's page:** a row with the number of prices on that platform opens My prices. With none yet, a warning explains that brands can't book the creator there, with a button to add prices.
- **My prices:** one list grouped by platform (primary first), with in-person services (on-site visit) at the end. Each line shows the service, its package and the price; tapping it opens that price. A platform with no price yet invites the creator to add one. "Add a price" is the one main button. While the creator has no price at all, a warning at the top says brands can't send them requests yet. What can be priced, and every label, comes from Sada's service catalog, so new services appear without an app update.
- **One price:** choose the platform (or in person) and the service, then the package (only packages not priced yet are offered), the price ($5 to $50,000), the delivery time (in days, within the catalog's range), the number of revision rounds and how long the post stays live (not for on-site visits). Where the service allows it, **rush delivery** adds a fixed fee for delivery within 24 or 48 hours; it must be faster than the normal delivery time (24 hours needs at least 2 days, 48 hours at least 3), so shortening the delivery time adjusts or turns off rush. Once saved, the platform and service are fixed (delete and add again to change them), only what changed is sent, and the page shows the "what's included" list brands see. Deleting asks first. Server errors appear next to the field they concern.
- **Removing a platform** asks for confirmation and warns that its prices are removed too. The last remaining platform can't be removed; the app explains why.
- **My niches:** pick 1 to 3 niches and save.
- **Unsaved edits:** leaving a price or the niches page with unsaved changes asks before discarding them.

#### Journey A3: Editing your own details (different for creators and brands) 🟡
- **Creators and brands edit different things.** The edit button in the Profile header, and the matching "complete your profile" cards, open the right page for the role.
- **Creator, "Personal info":** full name, email (optional), governorate and area (optional). Everything opens filled in with what is saved.
- **Brand, "Company info":** company name, email, business type, governorate and social links (Instagram, Facebook, TikTok first, the rest behind "More links"). Links are checked against each platform's real addresses, like at registration. Email changes apply at once.
- **The phone number can't be changed in the app**, because it is the account's identity. It is shown locked, with a "contact support to change your number" link that opens WhatsApp with a ready message.
- Only what changed is saved. Leaving with unsaved changes asks first. Server errors appear next to the field they concern.
- **Verification after registration:** the verification card on the Profile opens the upload page when an upload is possible (never sent, or rejected; a rejection shows the reason and an "Upload again" button). Creators upload the front and back of their national ID (photo or PDF, up to 10 MB). Brands choose the document type (commercial register, industrial register or trade license) and upload one document (JPG, PNG or PDF, up to 10 MB). Files are checked on the phone before sending. While a request is under review, or once verified, the page shows only the status and its date. Sending is limited to 5 tries per hour (shared with registration); when reached, the button shows a countdown. The result arrives as a notification and refreshes the status.
- **Completion adds up to 100%.** Every step the server counts has its own "complete your profile" card, verification included (35% for brands, 20% for creators), so the cards always add up to what is missing. The verification card opens the upload page; while a request is under review it only says so; after a rejection it asks to upload again.
- **The Profile band:** built like the creator Home's so both tabs feel like one product and have the same height: the page name on the top line beside the two icons, then a larger photo (tap to change) with the name, gold check mark, city and email on the full width, then a frosted completion card where the KPI strip sits on Home: the label and a large percentage on one line, a thicker bar, and one line on why it matters (creators only). At 100% the card stays and says "Your profile is complete" with a check, so the band never jumps in height. The same barely visible corner light as Home sits on the navy.
- **How the Profile moves:** the navy band behind the photo and name stays navy when pulled down (no grey gap), drifts slightly slower than the page, and the cards slide up over it as a rounded sheet. The top bar stays fully see-through until the band has scrolled away, then shows a small photo, the name and the verified mark aligned to the page's start edge (not a centred title), with the icons ending on the page's other edge; Home's pinned bar lines up the same way. The refresh spinner is white on the navy band.
- **The brand Profile is lighter than the creator's:** the header shows the company logo (tap to change), name, business type and city; below come the completion cards (the photo step reads "add your company logo"), notifications, business verification and a company card (business type, city, links). Platforms, niches and prices are creator-only and never appear for brands.

#### Journey A4: The creator Home 🟡
- **What it is:** the first tab a creator lands on. A navy band greets them by time of day ("Good morning" / "Good evening") on the top line, next to the bell. Below it, their photo sits beside their name (with a gold check mark once their identity is verified), and a second line shows their tier badge and primary account, so nothing is squeezed next to the bell. The bell opens the notification inbox with the unread count; tapping the photo opens the Profile. At rest the top bar is fully see-through and shows only the bell.
- **While scrolling:** once the band scrolls away, a solid navy bar fades in that keeps what matters in view: a small photo, the name, the verified mark and the tier crest (tap → Profile), with the bell on the other side. There is no generic "Home" title.
- **Numbers at a glance:** under the greeting, a glass strip shows the last 30 days: total reach (followers across every linked account), profile views with their change against the 30 days before ("New" when there is nothing to compare), and how many brands looked. Tapping anywhere on the strip opens the insights page. A number that can't be known yet shows a dash, never zero; if the numbers fail to load, the strip says so and a tap retries.
- **Feel:** the navy band moves slower than the page (a gentle parallax) and the content slides over it as a sheet with rounded corners. Pulling down to refresh stretches the navy band, so the page background never shows above it. The parallax switches off when the phone asks for reduced motion. On short phones the band trims to one row (photo, name, tier) beside the bell, plus the blocker title and the numbers. Since the 2026-10-08 redesign ("Navy Trust, live"), the band is a deeper navy with three soft, edgeless teal lights that drift very slowly. They move with the band but don't stretch when it is pulled. The 30-day numbers roll up to their value the first time they appear, and the sections below rise in one after another when the page opens. The app's colours did not change: life comes from light and gentle motion, never from new colours or the logo. Every movement stops when the phone asks for reduced motion.
- **One notice at a time:** if something blocks bookings, a single "live island" in the navy band explains it, with a small pulsing dot that means "happening now" (tap it to act). The order is: a platform needs fixing (opens My platforms) → identity verification was rejected (upload again) → no price yet, so brands can't send requests (opens My prices) → platforms under review (information only) → the media kit is hidden (make it public in one tap). Nothing blocking means no notice.
- **Media kit card:** one job, sharing. It shows whether the kit is visible to brands or hidden, a line on what the kit is for (or, with no visits yet, a nudge to share the link), the public link with a copy button, **Share** (the only main button on the screen) and "Preview", which opens the preview page. The creator's identity and numbers moved up to the navy band, so the card no longer repeats them.
- **Media kit insights (🟡):** the creator picks the last 7, 30 or 90 days (today included). Each number (profile views, brands that looked, link opens, shares) shows its change against the same length of time just before, or "New" when there was nothing to compare to; numbers the service doesn't report yet stay hidden. Below come a small line of daily profile views, the cities the viewing brands are based in (only once at least three brands have looked, so no single brand can be identified), and the most-viewed portfolio work once portfolios exist. With no activity yet, the page invites the creator to share their link. **Share** is the page's one main button, and a hidden kit asks to be made public first. Pull down to refresh; a failed load shows a retry.
- **Media kit preview (🟡):** the creator sees their kit exactly as brands do: photo, verified badge, tier, every niche and the lowest price, each linked platform with its followers (a check mark only when the count is verified) and tier, and their prices. Each price shows the service, package and amount; tapping it opens what's included (length, delivery time, revisions, how long it stays live) and any rush delivery fee. Sada's collaboration terms close the kit. Parts with nothing to show stay hidden. A note says "this is how brands see you", or, when the kit is hidden, a warning with "Make public". Opening the preview never counts as a profile view. **Share** is the one main button; the gear opens the settings.
- **Media kit settings (🟡, from the preview or from My profile):** the creator picks the name in their link (for example `anas.style`). While they type, the app says whether the name is free, already taken or reserved, after a short pause so it doesn't ask on every letter; shape problems (length, allowed characters) are explained straight away without asking the server. A link name can change **once every 30 days**: during that time a note gives the date the next change opens, and going back to the previous name is still allowed (the old link keeps working for 30 days and nobody else can take it). If the server refuses on save (name just taken, still in the waiting period), the reason shows under the field with the date where relevant. A switch shows or hides the kit from brands; hiding asks for confirmation first, because the link then shows "Profile not available" and sharing stops. Leaving with an unsaved name asks before discarding it.
- **Profile strength:** a white card with the completion percentage in large teal type and one line on why it matters ("the more complete your profile, the more brands get to see you"). Below it, a five-stage track shows where the creator is:
  - the stages are Your info → Photo → Platforms → Prices → ID
  - finished stages carry a check, and the current stage pulses gently
  - the line between stages fills up once, when the card first shows

  Under the track, the single next useful step sits in a teal row (for example "Add your prices +10%") that opens the right page. The card disappears at 100%; the full list of steps stays on the Profile.
- **My platforms:** no sideways swiping; every linked account is a compact horizontal card stacked down the page: the platform icon on the reading-start side, then the platform name and handle, then the follower count and tier badge on the far side. The primary account comes first, framed in teal with a "Primary" label. A card shows a status label only when something needs attention (a review problem first, otherwise "not available"); verified accounts stay quiet. A dashed "Add platform" row closes the list. Tapping a card opens that platform, and "Manage" opens the list. With no linked account, a card invites the creator to add one.
- **My prices:** one line per saved price, with the platform icon, the service, the platform name, the package and the amount. "Edit" opens My prices. With no prices yet, the card invites the creator to add them so brands can book them.
- **Refresh and errors:** pulling down refreshes everything on the page. Each section loads and fails on its own, with its own retry, so one slow answer never blanks the whole screen. Wallet, offers and deals stay off Home until those services exist.
- **Brands** still see the Explore placeholder on this tab; their dashboard is a separate design.

#### Journey A5: Opening a creator's shared link 🟡
- **What it is:** a creator shares their media kit link (on WhatsApp, Telegram or anywhere). When someone with Sada installed taps it, the app opens straight on that creator's public profile instead of the web page. The web page's "Open in app" button does the same.
- **Who sees it:** signed-in brands and creators open it over their tabs; people who aren't signed in see it over Login, since the profile is public. If the app is still on another screen that must come first (language choice, intro slides, maintenance, an unfinished registration, a suspended account), the link waits up to 30 seconds and is then dropped, so nobody is thrown into a profile minutes later.
- **What it shows:** the same profile brands see in the creator's own preview: photo, verified badge, tier, niches, each platform with its followers and the prices. Pull down to refresh.
- **Counting views:** each opening counts one profile view for the creator's insights (a brand who is signed in also counts toward "brands that looked"). Counting happens quietly in the background and never slows down or blocks the page; the creator's own visits and quick repeats are not counted by the service.
- **Old links keep working:** if the creator changed their link name in the last 30 days, the old link still opens their profile, and the app switches to the new name behind the scenes.
- **Safety:** only links on Sada's own web address in the form "/c/name" (or the app's own link type) are accepted, and the name must follow the link-name rules; anything else just opens the app normally. A profile that is hidden, suspended, deleted or simply doesn't exist always shows the same "Profile not available" message, so a link never reveals which one it is.
- **Not live yet:** links on the web address open the app only once Sada's permanent public web address is set and the app is registered with it; until then only the "Open in app" button works.

#### Journey B: Brand registration ✅
1. **Create account** (name, phone, password) → SMS code is sent.
2. **Verify phone** (same protected code screen as creators).
3. **Business profile:** company or store, business name, industry, and social links (Facebook, Instagram and so on).
4. **Business document (optional):** pick the document type (commercial register, industrial register or trade licence) and upload it (photo or PDF, up to 10 MB). Can be skipped.
5. **Welcome**, then the main app.

#### Journey C: Resuming an unfinished registration ✅
If someone closes the app halfway through, the next launch (or login) asks the server "what step is this user on?" and takes them **straight to that step**. If two devices or a slow network get out of sync, the app re-checks with the server and reroutes instead of showing an error. A step is never submitted twice by accident.

#### Journey D: KYC (identity and business verification) ✅ at registration · 🔜 in-app
- **Today:** verification is an optional final step of registration for both roles.
- **What happens after upload:** the document goes to a review queue, and the account's verification status moves through *unverified → pending → verified* (or *rejected*, with the option to resubmit).
- **Planned:** a "Verify my account" entry in Settings so users who skipped can verify later, plus a visible **verified badge** on profiles.
- **Limits:** a small number of submissions per hour, to prevent abuse.

#### Journey E: Login, forgot password and suspension ✅
- **Login:** phone and password. Too many attempts show a "please wait" message.
- **Forgot password:** phone → SMS code → new password → back to Login with the phone number already filled in.
- **Suspension:** if the platform suspends an account, the app switches immediately to the Suspended screen, wherever the user was. From there they can contact support on WhatsApp (for account support only, never for deal actions), re-check whether the suspension has been lifted, log out, or delete their account.

#### Journey F: The deal lifecycle 🟡 components ready · 🔜 live service
The visual building blocks are already designed and built (deal cards, status pills, a progress timeline, draft review cards, creator cards, wallet balance card, payment breakdown). They will be connected once the marketplace service is ready:

1. A brand posts a campaign (via the Brief Builder) **or** sends a direct offer to a creator.
2. The creator receives a notification, opens the brief, and chooses **Accept, Reject or Negotiate**.
3. *Waiting for payment* → the brand pays into escrow → *In progress*.
4. The creator uploads the draft → *Under review* → the brand approves or asks for changes.
5. *Ready to publish* → the creator publishes and submits the link → *Published*.
6. Verification and tracking window → *Completed*, and the money is in the creator's wallet.
7. Either side can raise a *Dispute* at any time. Breaches lead to *Refunded*.

Each stage always shows text and an icon, never colour alone. The app only offers the actions that role is allowed to take at that stage, and the server re-checks every action.

#### Journey G: Deleting an account ✅
- **Where:** "Delete my account" is in Settings, on the Suspended screen, and in the header of every registration step. Anyone who can create an account can delete it, even halfway through registration or while suspended (an Apple requirement).
- **Confirmation:** a sheet explains exactly what happens: Sada deletes the profile, verification documents, photo and linked accounts, and the phone number becomes free to sign up again. It cannot be undone. The user confirms with their current password.
- **Protection:** a wrong password shows under the field. After too many tries (5 per minute) the sheet says "Try again in m:ss".
- **After deletion:** the app signs out, wipes everything it kept on the phone for that user (session, cached data, unsaved registration drafts), shows "Your account has been deleted" and returns to Login.
- **Money still in the account (🟡 awaiting live-server testing):** the server refuses deletion while the wallet holds any money (balance, pending, escrow, a top-up under review or an open withdrawal). The sheet then drops the password field and shows the server's reason. A creator on the Profile gets "Go to wallet" to withdraw the balance, plus "Contact support" for money stuck in escrow; brands, and anyone deleting from the Suspended screen or registration, get "Contact support" on WhatsApp.

#### Journey H: The Wallet tab (both roles) 🟡
- **What it is:** the fourth tab for both roles, the same layout in each role's own words. A navy band with slow drifting lights shows the money that can be used now in very large type: "Available to withdraw" for creators, "Available for campaigns" for brands, with a still mint dot. The digits roll up to the amount once when it first appears. A balance shown without cents is always rounded down. On short phones the band uses a smaller amount and drops the month line.
- **Under the balance:** a small mint line says how much came in this month (creators) or was topped up this month (brands). Two glass tiles show the other money:
  - creators: money on its way out to their e-wallet, and money held in escrow for their active deals
  - brands: money held in escrow, and top-ups still under review

  The month line, the creator's escrow tile and the brand's top-ups tile need new data from the service (🔜); until it arrives they stay hidden and appear on their own once it does.
- **Privacy:** the eye in the top bar hides every amount on the page and remembers the choice on this phone.
- **One blocker at a time:** when the role's money action is off, a single live island in the band says why. The order is: wallet closed → wallet frozen → a wallet state the app doesn't know → withdrawals paused (creators) → identity verification needed, under review or rejected → registration unfinished. Verification problems open the verification page; a closed or frozen wallet opens WhatsApp support with a ready message. Nothing blocking means no island.
- **While scrolling:** once the band scrolls away, a solid navy bar keeps the available balance in view, with the eye beside it.
- **Money held in escrow:** a card draws the path of the money: for creators, brand → Sada escrow → your wallet; for brands, your wallet → Sada escrow → the creator. Mint dots flow along it while money is held, with the amount and what releases it ("released automatically once publishing is confirmed"). With nothing held yet, the same path is shown still, with one line on how escrow protects both sides. The live version needs new data from the service (🔜); until then every user sees the explanation.
- **Monthly chart (🔜 needs new data from the service):** creators see what they earned each month and brands what they spent on campaigns, over 6 months or a year. The current month carries its amount, and the bars grow once when the card first shows. The chart stays hidden until there is something to show.
- **Today's rate:** one row with today's dollar to Syrian pound rate and when it was last updated. When the rate is out of date, a warning replaces it: payouts (creators) or top-ups (brands) in Syrian pounds are paused until it is updated.
- **Latest activity:** the five newest lines, grouped under Today, Yesterday or the date. Each line shows what happened and with whom, a status label only while it is still open (for example "On its way" for a withdrawal), the time, and the amount: money in is mint with a plus sign, money out stays neutral. A Syrian pound payout also shows the pounds paid. With no activity yet, the card says where earnings (creators) or top-ups and payments (brands) will appear. Names, status labels and pound amounts on lines need new data from the service (🔜); until then lines show their type only.
- **To the statement and receipts:** a statement icon beside the eye, "See all" on the activity section and, when there are more than five lines, "View full statement" under them. Tapping any line opens its receipt.
- **Statement (🟡):** every wallet line, newest first, grouped under Today, Yesterday or the date (with the year for older ones), loading more as the user scrolls, with "End of statement" at the bottom. A row of chips stays pinned under the title:
  - **Period:** all time, this month, last month, last 3 months, this year, or a custom range of past days picked on a calendar. A chosen period shows on the chip with a × to clear it.
  - **Type:** "All" plus the three kinds each role looks for most. Creators: deal earnings, withdrawals, rewards. Brands: top-ups, escrow holds, refunds. A role never sees a type it can't have.

  The number of lines found shows above the list. With nothing found, the page says so and, if filters are on, offers "Clear filters". The eye works here too and stays in sync with the Wallet tab. Pulling down refreshes; a failed load offers a retry.
- **Receipt (🟡):** the line's icon, what happened and with whom, the exact amount (money in mint with a plus sign, money out neutral) and a status label only while the line is still open. Two cards follow: **Details** (type, from or to, date and time, and the reference, which copies with one tap) and **Amount** (the amount, the Syrian pounds paid and the rate used when the line had two currencies, and the balance after the line). Amounts always show on a receipt, even with the eye closed, because opening one is a deliberate tap. The share icon sends a plain-text receipt through the phone's share sheet; "Report a problem" opens WhatsApp support with the reference already in the message. A line that isn't the user's (or no longer exists) shows "This transaction isn't available", with the same report link. A receipt only shows what the service sent; a withdrawal's fee breakdown is on its request page.
- **Top up (brands, 🟡):** the navy band has two buttons under the tiles: **Top up** and **Top-up history**. Top up is greyed out while the server doesn't allow it (the blocker island explains why). The "top-ups in review" tile opens the history filtered to requests in review. The top-up itself is four short steps under one solid header with a slim step bar ("Step 2 of 4"):
  1. **Method:** exchange offices, e-wallets and banks, each with the currencies it takes. A method that is paused says why ("Paused: the exchange rate is being updated"); while the rate is out of date a note explains that dollars still work.
  2. **Amount:** dollar or Syrian pound (only what the method takes), the amount with its allowed range, and a live card: amount sent, the rate, and what reaches the wallet (exact for dollars, marked as an estimate for pounds).
  3. **Transfer and receipt:** Sada's receiving account for that method (every account when there are several), every line copyable with one tap (the exact amount first), the brand's own Sada code last ("Write this code in the transfer note", so the finance team can match the payment faster), the method's instructions or a reminder to send exactly that amount, then the transfer number and the receipt (from photos or files).
  4. **Review:** what reaches the wallet, the transfer and the proof, each with "Edit", and **Send request**.

  Leaving with something entered asks first. If the server refuses the request, the app goes back to the step that can fix it (a changed rate, a method paused meanwhile with the methods reloaded, an amount out of range with the range reloaded, a transfer number already used, a field error); if the wallet is blocked it returns to the wallet, where the island explains; with 5 requests already in review it says so and opens the requests in review. Sending is protected against double charges (one key for the whole top-up). After sending, the request page confirms it: "We got your request", the amount, "In review" and a three-stage timeline (sent → Sada review, with the method's usual review time when Sada has set one → added to the wallet), with **Back to wallet** and a link to the history.
- **Top-up history and requests (🟡):** every request newest first, grouped by day, with chips for All, In review, Completed, Rejected and Reversed. A request page shows the amount, the timeline, why it was rejected or reversed, the details (method, date, amount sent, rate, transfer number, a copyable request number) and the receipt (photos open in the app; PDFs open only from Sada's own server; the receipt link is private and lasts 10 minutes, so the app fetches a fresh one when it has expired). Rejected or reversed requests offer **New top-up** (prefilled with the same method and amount) and "Report a problem"; a completed one opens its wallet line.
- **Methods and accounts from the service (🟡 awaiting live-server testing):** methods, their order, currencies, limits, pause state, Sada's receiving accounts, instructions, review time and the brand's Sada code all come from the service, fetched fresh every time the top-up opens. A server older than this release has no methods endpoint: the app then builds the methods itself from the agreed rules and today's rate, and the transfer step asks the brand to message support for the account details (test builds show clearly marked sample details).
- **Payout methods (creators, 🟡 awaiting device and live-server testing):** under the escrow card, a "Payout method" card shows the primary method (its short name or type, the governorate or bank, the last four digits) with **Manage**, or "Add a payout method" when there is none. The same page opens from a row on My profile. The page explains "Where should we send your earnings?", lists the saved methods in one card (primary first, with a "Primary" label, the currencies each one takes and "3 of 10"), and has one button, **Add a payout method**, which opens a sheet grouped into exchange offices, e-wallets and banks, each with how the money arrives and its currencies. The form then asks only what that type needs (see 4.5), prefilled with the account's name and mobile number; the type can be changed while adding and is locked when editing. An optional short name (up to 40 characters, "only you see it") tells methods apart, and a switch makes the method primary (locked on for the first method and for the current primary, with a line naming the current primary otherwise). Editing has a delete button in the header; the confirmation names who becomes primary next, or warns that withdrawals stop with no method left. At 10 methods the add button gives way to a note to delete one first; if the server still refuses, the list reloads. Leaving with unsaved changes asks first. Saved destinations are not money requests, so they carry no double-charge key.
- **Withdraw (creators, 🟡 awaiting device and live-server testing):** the navy band has two buttons under the tiles: **Withdraw** and **Withdrawal history**. Withdraw is greyed out while the server doesn't allow it (the blocker island explains why). The "in transfer" tile opens the history filtered to requests on their way. The withdrawal is two short steps under one solid header with a slim step bar ("Step 1 of 2"):
  1. **Amount:** a card shows where the money goes ("To" the primary payout method, its type and last four digits) with **Change**, which opens a sheet of the saved methods and "Add payout method". With no method yet, an "Add payout method" card opens the type sheet and the form, and the new method comes back already picked. A dollar / Syrian pound switch shows only when the method pays in both. The amount is typed from the balance, with "Available" in mint, a **Withdraw all** chip and the default limits underneath. A moment after typing stops, the server prices it: taken from the balance, the method's fee, what arrives (mint) and, for pounds, the pounds received at today's rate "fixed when you send". While a new price loads the old one dims. When the server refuses, a warning lists every reason, a countdown pill shows when the next withdrawal opens (the app asks again by itself when it ends), the caption says "Change the amount or come back later" and Continue stays disabled.
  2. **Review:** "You receive on Sham Cash" with the amount that arrives in large type and the fee under it, then two sections each with an **Edit** link: the destination (method, account holder, the last four digits) and the amount (taken from the balance, fee, net, rate). A note says the amount is held as soon as it is sent and can be cancelled while in transfer. **Confirm withdrawal** sends it once (one key per withdrawal, the button locks while sending). If the server refuses, the app goes back to the amount step with the reasons; a blocked wallet goes back to the wallet.
  - Leaving after typing something asks first. Success replaces the steps with the confirmation page: "We sent your withdrawal request", the amount taken and "In transfer", a timeline (request sent → Sada team transfer, usually within 24 hours, with a notification → arrived), the details and the amounts, then **Back to wallet** with links to the history and **Cancel request**.
- **Withdrawal history and requests (🟡):** every request newest first, grouped by day, with chips for All, In transfer, Completed, Returned, Rejected and Cancelled; each row shows "Withdrawal to …", a status label until it is completed, the time, the amount out (struck through when it never left or came back) and the pounds received for a pound payout. A request page shows the amount, the timeline, why it was rejected or returned (returned money goes back to the balance in full), the details (destination, request date, completion or return date, a copyable receipt number and request number) and the amounts (amount, fee, net, pounds received and rate). A request in transfer can be cancelled after a confirmation; a returned one offers **Review payout methods**; every request has "Report a problem" and a share button in the header that sends a plain-text receipt (amount, pounds received, status, date, receipt and request numbers). A withdrawal notification (paid, rejected or returned) opens that request directly, with the wallet home underneath.
- **Not yet linked (🔜):** links from a line to its deal appear as those screens are built, so nothing leads to an unfinished screen.
- **Refresh and errors:** pulling down refreshes everything on the page, including the reason for any blocker. Each section loads and fails on its own, with its own retry. A wallet notification refreshes the balance, the escrow card and the chart.

---

## 6. UX Strategies

### 6.1 Arabic first and a correct right-to-left layout

- **Arabic is the main design target.** Every screen is designed and tested in Arabic first. English is a full second language, not an afterthought.
- **The whole layout mirrors.** Navigation, lists, forms, icons with direction (back arrows, chevrons) and progress all flip correctly for right-to-left reading. This is enforced automatically in development: layout rules that would break in Arabic are rejected before the code is accepted.
- **Western digits everywhere** (1,250 in both languages), so prices, follower counts and money stay clear and consistent. This is a deliberate brand decision.
- **Syrian month names in Arabic** (كانون الثاني، شباط، آذار … كانون الأول), the names Syrian users read every day, instead of the Egyptian-style يناير/فبراير. This covers every date in the app: chart labels, statement days, receipts and the calendar title.
- **One typeface for both scripts:** Tajawal, chosen for its readability in Arabic and Latin, with even-width numbers in prices and timers so amounts line up.
- **No missing translations.** Every visible text, including screen-reader labels, exists in both languages. A missing translation stops the app from building.
- **Language switch** is in Settings. The app restarts so the whole layout can flip direction cleanly.
- **Content from users and brands** (bios, briefs) is shown exactly as written and never machine-translated.

### 6.2 Offline and poor-network handling

Connectivity in our launch market can be unreliable, so the app is designed to stay calm and honest:

- **Offline banner.** When the connection drops, a small bar says so and disappears when the connection returns. Screens don't pile up their own error pop-ups on top of it.
- **Never locked out by the network.** If the startup configuration can't load, the app carries on with the last known settings.
- **Server trouble.** A clear "something went wrong" dialog appears with a retry option, including an automatic countdown when the server signals a temporary outage.
- **Work is not lost.** Unfinished social-platform entries in registration are saved on the device. Registration steps can always be resumed.
- **Safe retries.** Retrying never repeats an action that already succeeded (for example, a registration step or, later, a payment).
- **Long operations are expected.** Social-account lookups get up to 35 seconds before timing out, with a visible loading indicator.

### 6.3 Loading, empty and error states

Every screen must handle every state before it is considered done:

| State | What the user sees |
|---|---|
| **Loading** | A grey placeholder in the shape of the coming content (a skeleton), so the layout doesn't jump. Spinners are used only for short actions. |
| **Empty** | A friendly message explaining why it's empty, plus a clear next action. |
| **Error** | A clear message right where the problem is, plus a retry button. |
| **Submitting** | The button shows progress and can't be tapped twice. |
| **Form mistakes** | Errors appear next to the exact field, including errors returned by the server. Buttons stay tappable, and validation runs when pressed. |
| **Keyboard open** | Content scrolls, and the navy header shrinks to a compact version so the form stays visible. |
| **Offline** | The global offline bar (see §6.2). |

**Consistency:** every screen is built from one shared kit of components and follows one of the approved layouts (entry form, multi-step wizard, celebration, list, detail, settings, dashboard, money).

**Look and motion (redesign "Navy Trust, live", 2026-10-08):** the colours stay exactly as approved. The look is softer and more modern:
- rounder corners
- cards that float on a soft navy shadow instead of a grey outline
- deeper navy main headers with slow, soft light, and no logo or shapes inside them
- a glass "lens" that glides under the active tab

A few elements tell the user what is happening without reading:
- a stage track for anything that moves through steps (deals, profile strength)
- a live island for the one thing that needs attention
- numbers that roll up once
- mint dots that show money on its way

Only three things ever move continuously: the header lights, the pulse on what is live now, and money in flow. Everything else animates once. All motion stops when the phone asks for reduced motion. A catalog of every component is kept inside the development build, so the app looks like one designer made it. Every screen has exactly **one primary action**.

**Accessibility:** status is never shown by colour alone. Text contrast meets WCAG AA in light and dark mode. Touch targets are at least 44 points. Every button has a screen-reader label in both languages. Reduced-motion settings are respected.

**Light and dark mode:** the app follows the phone's setting by default. Both modes are designed together.

### 6.4 Push notification engagement

Notifications are central to a marketplace (new offers, payment secured, draft approved, money released), so we ask for permission **respectfully, at the right moment**:

- **Never on first launch.** A cold permission request on day one is the top cause of permanent "Don't allow".
- **Ask at moments of value.** The app first shows its own friendly explanation (for example, at the end of registration: "Get notified the moment a brand sends you an offer"). Only if the user agrees does the system permission prompt appear.
- **Respect "Not now".** After a decline, the app waits at least 48 hours before asking again, and asks at most 3 times per installation. If the phone can no longer show the system prompt, the app stops asking.
- **Always in control.** The user can change the permission at any time in the phone's settings. The Profile screen shows the live status: while notifications are off, a card explains that campaigns may be missed and offers to turn them on (or opens the phone's settings if the system can no longer ask). Once on, it shows a calm confirmation. A notifications screen with Sada's categories comes with the notification inbox.
- **Fresh data on every notification.** When a notification arrives or is tapped, the app refreshes the user's data so the screen matches what the notification said.
- **Safe notification links.** Notification content is checked against an approved list before it is acted on. A notification can never send the user to an arbitrary screen. Tapping a notification opens its screen: verification results open the verification page, platform results open that platform (creators only; brands land in the inbox), top-up results (approved, rejected or reversed) open that top-up request for brands, withdrawal results (paid, rejected or returned) open that withdrawal request for creators, payout method alerts (a method added or its details changed) open the creator's payout methods page, other wallet updates (wallet frozen or unfrozen) open the Wallet tab, anything else opens the inbox. A wallet notification also refreshes the balance and the related list (a payout method alert refreshes only the saved methods). If the tap launched the app, it waits until sign-in has finished, then opens the screen, with the Profile (or the wallet home) underneath so Back always works.
- **Notification inbox.** A bell in the Profile header shows the unread count. The inbox lists notifications newest first, with an unread dot and bold title, how long ago each arrived, and more as the user scrolls. Tapping one marks it read and opens its screen; one header button marks everything read. An empty inbox says so plainly.
- **Device registration.** The app registers the device for notifications when the user signs in, when the notification token changes, and when the language changes (so notifications arrive in the right language). On logout the device is unregistered and all local data is cleared.
- **Planned:** a notifications screen in Settings with the live permission status and categories that fit Sada's events, and **city alerts** for creators when a local brand posts a campaign.

### 6.5 Security and privacy by design

- **Phone-based identity** with SMS verification. The user's role (brand or creator) always comes from the server, never from a choice made only on the phone.
- **Session safety.** If a session expires or is revoked, the app signs out and wipes every piece of cached personal data.
- **Encrypted on the phone.** The login session, the saved profile, unsaved registration drafts and device-registration details are stored encrypted. The key is kept in the phone's secure key store (Keychain on iPhone, Keystore on Android). It never leaves the device, and it isn't included in backups or synced to other devices. Only non-personal settings such as language and theme stay unencrypted. If the key is ever lost, the app throws away the unreadable data and asks the user to log in again instead of crashing. Users updating from an older version keep their session: their data is moved into encrypted storage silently on first launch.
- **Right to leave.** Users can delete their account themselves at any stage, confirmed by password. The server removes their documents, photo and devices and frees their phone number; the phone keeps nothing (see Journey G).
- **No secrets in the app.** Sensitive keys (AI services, analytics) are only ever used on the server.
- **No personal data in logs.** Phone numbers, tokens, wallet data and amounts are never logged.
- **Link safety.** Social links and proof-of-publishing links are only accepted from approved social networks. In-app web pages only open approved addresses. Links that open the app (a creator's shared profile) are accepted only from Sada's own web address in one exact form; anything else is ignored and the app simply opens.
- **Uploads.** File type and size are checked before upload, and drafts are kept at original quality.
- **Permissions are requested only when needed**, with an explanation (see §7.1).

---

## 7. App Store & Launch Status

### 7.1 Device permissions: what we ask for and why

| Permission | Platform | Why we need it (user-facing reason) | When it's asked | Status |
|---|---|---|---|---|
| **Notifications** | iOS, Android 13+ | "So you hear the moment a brand sends an offer, a payment is secured, or your money is released." | Only after a friendly in-app explanation at a moment of value; never on first launch | ✅ |
| **Photo library** | iOS (Android uses the system photo picker, which needs no permission) | "Sada uses your photo library so you can choose a profile photo and upload verification documents or campaign content." Shown in Arabic or English to match the phone's language. | When the user taps to choose a photo | ✅ |
| **Camera** | iOS only (Android opens the phone's own camera app, which needs no permission) | "Sada uses your camera so you can take a profile photo or photograph your ID or business documents for account verification." Shown in Arabic or English. | When the user chooses to take a photo. No screen takes photos yet; it's ready for ID capture and content drafts | 🟡 explanation ready, not used by any screen yet |
| **Internet / network state** | Android | Needed to connect to Sada and to show the offline banner | Automatic (no prompt) | ✅ |
| **Vibration** | Android | Gentle feedback on notifications and errors | Automatic (no prompt) | ✅ |

**Not requested:** location. It was removed because no feature uses it. City-based matching will use the city the user picks in their profile. If a future feature needs the phone's location, it gets added back with its own explanation.

**Principles:** ask at the point of use, always with a plain-language explanation in the user's language, and never request anything at app start except notifications after onboarding. If the user has turned a permission off for good, Sada explains in their language why it's needed and offers a button that opens the phone's Settings.

### 7.2 App Store and Google Play compliance checklist

| Requirement | Status | Notes |
|---|---|---|
| **In-app account deletion** (Apple requirement) | ✅ | "Delete my account" is in Settings, on the Suspended screen and on every registration step, password-confirmed and connected to the Sada service. It works for unfinished, active and suspended accounts. |
| **Privacy policy and terms** reachable in the app | ✅ | Opened as in-app pages from Settings. Final legal text and addresses still needed. |
| **Clear permission explanations** | ✅ | The camera and photo explanations say exactly what Sada uses them for, in Arabic and English. Unused permissions (location, and camera on Android) were removed, so the store listings only show what the app really uses. |
| **Secure connections only** | ✅ | Store builds on iOS and Android connect only over encrypted HTTPS and trust only the phone's built-in certificates. Insecure connections are allowed only in developer builds on a local network. |
| **Privacy "nutrition label" (Apple) and Data Safety form (Google)** | 🔜 | Must declare: phone number, name, identity and business documents, social account handles, device notification token, and usage data. |
| **Sign in with Apple** | ✅ not required | We use only phone and password, with no third-party social login. |
| **Payments and wallet** | 🔜 | Deals pay for real-world advertising services, not digital goods, so app-store in-app purchase rules should not apply to escrow. This needs confirming during review. Premium subscriptions, if added, need a separate review. |
| **User-generated content** (drafts, bios, reviews) | 🔜 | Reporting, blocking and moderation tools are required once drafts, reviews and messaging go live. |
| **Encryption export declaration** | 🔜 | Declare standard HTTPS use only, at submission. |
| **Age rating and target audience** | 🔜 | Business audience. Set the rating and confirm minimum age in the terms. |
| **Store listing** | 🔜 | Brand name "Sada" / «صدى», final icon ready (navy, Concentric Echo). Screenshots in Arabic and English needed. |

### 7.3 Current roadmap

**✅ Done: foundation and onboarding**
- Brand identity "Navy Trust": logo, colours, typography, dark mode, brand book.
- Complete shared component kit, including deal, wallet, money and tier components.
- Startup pipeline: language choice, maintenance and forced update switches, optional update reminder, intro slides, resume where you left off.
- Login, forgot password, account suspension handling.
- Full brand and creator registration, including phone verification, automatic social lookup with manual fallback, prices, and optional identity or business verification.
- Notification foundations: device registration, respectful permission prompt, safe notification parsing.
- Error, offline and loading handling across the app.

**🔜 Next: profile and account (immediate)**
- New "Me" home data and a full profile screen for both roles.
- 🟡 Edit creator and brand profiles (separate pages per role) and change avatar or logo: built, awaiting testing. Change password on the new service.
- 🟡 Manage social platforms after registration (add, edit, refresh, set primary, availability, remove): built, awaiting testing.
- 🟡 Prices v2: one price per service and package, with delivery time, revisions, how long it stays live and rush delivery, plus in-person services; set in registration or from My prices: built, awaiting testing against the live service.
- 🟡 Verify identity (creators) or the business (brands) later from the Profile: built, awaiting testing.
- 🟡 Notification inbox with unread count and tap-to-open: built, awaiting testing. Sada-specific notification categories follow.
- 🟡 Creator Home dashboard with the shareable media kit, its insights page (7 / 30 / 90 days), the "preview as brands see it" page and the link and visibility settings: built, awaiting testing.
- 🟡 Opening a creator's shared link inside the app (their public profile, with a counted view): built, awaiting testing. Web links need Sada's permanent public web address and the app's identity registered with it.

**🔜 Then: marketplace core (the revenue engine)**
- Campaign Brief Builder, open campaigns, applications and direct offers.
- Smart matching, hyper-local filters, compare up to 3 creators.
- Offer, accept or negotiate, and the full deal pipeline with in-app draft review.
- Proof-of-publishing submission and verification.

**🔜 Then: finance (the trust layer goes live)**
- Wallet, brand top-ups via local e-wallets, escrow holds and releases.
- Creator withdrawals (standard 24h, then instant cash-out).
- Automatic contracts and invoices, refund pipeline, disputes.

**🔜 Later: growth and differentiation**
- Analytics and ROI (views, engagement, affiliate links, discount codes, QR visits).
- Reputation: multi-criteria ratings, badges, rankings, anonymous brand reviews.
- In-app messaging for negotiation (kept in the app as dispute evidence).
- AI-generated creator bio and portfolio.
- Barter catalog, UGC marketplace, offline event booking.
- Vacation mode, saved rate cards, Local Rate Index, Smart Rate Calculator.
- Group collaboration packages, Exclusive Brand Clubs.

### 7.4 Launch blockers

These must be solved before a public store release. Ordered by severity.

| # | Blocker | Impact | Owner |
|---|---|---|---|
| 1 | **Marketplace and finance are not yet live.** The brand Explore tab is a placeholder, and campaigns and deals are not connected to the service. The Wallet tab, statement and receipts read the service (balance, activity, rate) and brands can file top-up requests against the service's methods and receiving accounts (awaiting live-server testing); creators can request withdrawals to their saved payout methods (awaiting live-server testing), and the escrow card, monthly chart and month summary wait for new server data. | No core value for users yet. A store reviewer may reject the app for minimal functionality. | Mobile + backend |
| 2 | **Notification service is set up for the previous project.** iOS and Android now share one app identity (aligned 2026-10-06), but the notification service still expects the old one. | Push notifications will not arrive until the notification service is set up again for the new identity. | Mobile + DevOps |
| 3 | **The server address still points to the old domain.** | The production app can't reach the Sada service. | Mobile + DevOps |
| 4 | ✅ **Resolved 2026-10-03.** ~~The iOS build allows insecure connections.~~ Store builds now use HTTPS only on both platforms, and Android no longer trusts user-installed certificates. | | Mobile |
| 5 | ✅ **Resolved 2026-10-03.** ~~Login sessions are stored on the device without encryption.~~ Sessions and personal data are now stored encrypted, with the key in Keychain (iPhone) or Keystore (Android). Existing users stay logged in after updating. | | Mobile |
| 6 | ✅ **Resolved 2026-10-03.** ~~Generic permission explanations, plus an unused location permission on Android.~~ Explanations rewritten in Arabic and English. Location and the Android camera permission were removed. | | Mobile |
| 7 | ✅ **Resolved 2026-10-03.** ~~Leftover text from the previous project in the profile area, and old notification-settings fields.~~ The booking counter, the old app name and the old notification settings screen were removed. The phone home screen now shows «صدى» in Arabic and "Sada" in English. | | Mobile |
| 8 | ✅ **Resolved 2026-10-03.** ~~Account deletion is not confirmed against the new backend.~~ Deletion is connected to the Sada service and reachable from Settings, the Suspended screen and registration. | | Mobile + backend |
| 9 | **App Store listing ID not set yet**, so the forced-update button opens the App Store home page instead of Sada's page. | Poor update experience until the first release. Set it right after the listing is created. | Mobile |
| 9b | **Shared-link verification is waiting on two inputs.** The app's identity details (Apple team, app ids, Android signing fingerprints, link scheme) are ready and handed to the backend team; still missing are Sada's permanent public web address and the App Store listing id. The Google Play signing fingerprint can only be read once the app is uploaded to Play. | Links on the web address won't open the app until the backend registers the identity and the web address is set. The "Open in app" button works meanwhile. | Mobile + backend + DevOps |
| 10 | **Not yet verified on real devices** after the visual redesign: some text fields in right-to-left, and card shadows. | Visual polish and right-to-left correctness. | Mobile QA |
| 11 | **Payment partner and legal framework** for escrow with local e-wallets, plus contract templates. | Escrow can't launch without them. | Business + legal |
| 12 | **Privacy label, Data Safety form, final legal pages, store screenshots.** | Required for submission. | Product + legal |

---

## Change Log

Every change to a screen, flow, permission or business rule adds a row here (newest first).

| Date | Change | Sections updated |
|---|---|---|
| 2026-10-09 | Withdrawal notifications (paid, rejected or returned) and their inbox entries now open the withdrawal request itself for creators (brands land on the Wallet tab); a withdrawal request can be shared as a plain-text receipt from its header. | 5.3, 6.4 |
| 2026-10-09 | Creator withdrawals built (🟡 awaiting device and live-server testing): Withdraw and Withdrawal history buttons in the creator's wallet band (the "in transfer" tile opens the requests on their way); a two-step withdrawal (destination, currency and amount with a live price from the server listing every reason it can't go ahead and a countdown to the next allowed withdrawal, then a review) with an "Add payout method" path that comes back to the withdrawal; a confirmation page with a transfer timeline; a history filtered by status; request pages with the rejection or return reason, the receipt number and cancel while in transfer. The default limits ($25 minimum, $500 a day, one every 7 days) show up front until the service sends them. Withdrawal notifications still open the Wallet tab. | 4.4, 4.5, 5.2, 5.3 (Journey H), 7.4 |
| 2026-10-09 | Sham Cash payout methods now also ask for the wallet's account code. New security alerts when a payout method is added or its details change; tapping one opens the payout methods page (creators). | 4.5, 6.4 |
| 2026-10-09 | Creator payout methods built (🟡 awaiting device and live-server testing): a payout methods page in the wallet (also from My profile) with up to 10 saved accounts, primary first; a type sheet (exchange offices, e-wallets including the new Sham Cash, banks); a form per type with Syrian mobile, governorate, account number and IBAN checks; a primary switch; delete with a warning naming the next primary; a "Payout method" card under the escrow card on the creator wallet. Sham Cash added to the top-up methods too. | 4.4, 4.5, 5.2, 5.3 (Journey H) |
| 2026-10-09 | Brand top-ups on the final service contract (🟡 awaiting device and live-server testing): methods, limits, accounts and instructions come from the service; the transfer step shows the brand's Sada code to write in the transfer note; a used transfer number, a paused method, a moved range and the 5-requests-in-review limit each get their own answer; the submitted page shows the method's review time; the private receipt link is refreshed after 10 minutes; reversed top-ups show in red; top-up notifications (approved, rejected, reversed) open the request itself. | 4.4, 4.5, 5.3 (Journey H), 6.4, 7.4 |
| 2026-10-09 | Brand top-ups built (🟡 awaiting device and live-server testing): Top up and Top-up history buttons in the wallet band; a four-step top-up (method, amount with a live estimate, Sada's account with copy buttons plus transfer number and receipt, review) that returns to the step able to fix a refused request; a confirmation page with a review timeline; a history filtered by status; request pages with the rejection or reversal reason, the receipt and "New top-up". Until the service ships the methods endpoint, the app builds the methods from the agreed rules and the transfer step points brands to support for the account details. | 4.4, 4.5, 5.2, 5.3 (Journey H), 7.4 |
| 2026-10-09 | Statement and receipts built for both roles (🟡 awaiting device and live-server testing): every wallet line grouped by day with period filters (presets or a custom past range) and per-role type chips, clear-filters empty state, and the shared eye. Each line opens a receipt with details, a copyable reference, the pounds paid and rate when present, the balance after, a share option and "Report a problem" on WhatsApp. The Wallet tab now links to both. Arabic dates now use Syrian month names (كانون الثاني … كانون الأول). | 5.2, 5.3 (Journey H), 6.1, 7.4 |
| 2026-10-09 | Wallet tab built for both roles (🟡 awaiting device and live-server testing): large balance in the navy band with rolling digits, an eye that hides every amount, one blocker at a time (wallet closed or frozen, withdrawals paused, identity verification, unfinished registration), money held in escrow drawn as a path with flowing dots, a monthly earnings or spend chart, today's rate (or an out-of-date warning) and the latest activity grouped by day. The month summary, the creator's escrow figure, the brands' top-ups in review, live escrow, the chart and richer activity lines wait for new service data and stay hidden until it arrives. Money actions, statement and receipts come in the next steps. | 5.2, 5.3 (Journey H), 7.4 |
| 2026-10-08 | App redesign "Navy Trust, live" (🟡 built, awaiting device testing). Colours unchanged; the logo is kept out of tab screens. Changes: rounder corners, borderless cards on a soft navy shadow, a deeper header with slow drifting teal lights, a liquid lens under the active tab, and three looping motions only. Creator Home: the blocker notice moved into the header as a live island; the 30-day numbers roll up once; profile strength became a white card with a five-stage track; sections rise in on open. Deal cards can show the stage track and the amount held in escrow (no deal screen yet). Lighter grey secondary text was darkened for contrast. | 5.2, 5.3 (Journey A4), 6.3 |
| 2026-10-08 | Wallet safety ahead of the wallet screens (🟡 awaiting live-server testing): one key per money action, reused on retries, with a single automatic retry rule (server still busy). Deleting an account that still holds money is refused with a way out (Go to wallet for creators, Contact support otherwise). Wallet notifications open the Wallet tab and refresh the balance. Top up / Withdraw availability now comes from the server. | 4.5, 5.3 (Journey G), 6.4 |
| 2026-10-08 | Money display unified ahead of the wallet (🟡 no wallet screen yet): Syrian pounds are whole pounds with a fixed «ل.س» / "SYP" symbol, short forms (1.2K, 6.5M) only in summary tiles, balances without cents always rounded down, and amounts can be hidden for privacy. Exact amounts stay on statements, receipts and quotes. | 4.5 |
| 2026-10-08 | Prices rebuilt on Sada's new price system (🟡 awaiting device and live-server testing). All old prices were cleared by the server, so creators see "Set up your prices" on Home, the Profile and each platform page until they save one. A new "My prices" page groups prices by platform plus in-person services; each price has a package, delivery time, revisions, how long it stays live and optional rush delivery. Registration's price step offers the catalog's services per platform with a package and price. The per-platform price form is gone (the platform page links to My prices). The media kit shows what each price includes and Sada's collaboration terms. | 5.2, 5.3 (Journeys A, A2, A4), 7.3 |
| 2026-10-07 | Creator Home "My platforms" redesigned (🟡 awaiting device testing): the swipeable small tiles became compact horizontal cards stacked down the page (icon, name and handle, followers and tier), the primary account first with a teal frame and "Primary" label, status shown only when something needs attention, and a dashed "Add platform" row at the end. | 5.3 (Journey A4) |
| 2026-10-07 | Profile band unified with the creator Home (🟡 awaiting device testing): same structure and height (page name beside the icons, larger photo with name, city and email, then a frosted completion card with a large percentage, thicker bar and why it matters, kept at 100% as a "complete" state), the same faint corner light, and on scroll a pinned photo + name aligned to the page edges instead of a centred title. Home's pinned bar now also lines up with the page edges. | 5.2, 5.3 (Journeys A3, A4) |
| 2026-10-07 | Creator Home looks livelier (🟡 awaiting device testing): a barely visible soft light in two corners of the navy band (the first version's bright circle and thick rings were removed after review), and the profile strength card turned into a plain small navy card with a big percentage, a line on why completing the profile helps brands find you, and the next step as a frosted row. | 5.3 (Journey A4) |
| 2026-10-07 | Creator Home header reworked (🟡 awaiting device testing): the greeting gets its own line beside the bell, and the photo, name, tier and handle get the full width below it instead of being squeezed next to the bell. When the band scrolls away, the bar pins the creator's photo, name, verified mark and tier (tap → Profile) instead of a generic "Home" title. | 5.2, 5.3 (Journey A4) |
| 2026-10-07 | Profile now moves like the creator Home (🟡 awaiting device testing): the navy band stretches when pulled down instead of showing a grey gap, drifts slightly as the page scrolls, and the cards slide up over it as a rounded sheet; the top bar stays see-through until the band scrolls away; the refresh spinner is white on navy. Content of the band is unchanged. | 5.3 (Journey A3) |
| 2026-10-06 | Creator Home redesigned (🟡 awaiting device testing): richer navy band (time-of-day greeting, verified mark, tier, handle) with a glass strip of 30-day numbers that opens insights; the band now has parallax and stretches when pulled down, and the top bar stays fully transparent until the band scrolls away (it used to start fading in before any scroll). The media kit card is slimmed to sharing only (visibility, link, Share, Preview); platform tiles are larger (two and a half on screen) with an "Add platform" tile; prices show platform icons. | 5.2, 5.3 (Journey A4) |
| 2026-10-06 | App identity details for shared links collected and handed to the backend team (Apple team and app ids, Android signing fingerprints for debug and release, link scheme). Still open: permanent public web address, App Store listing id, Google Play signing fingerprint. No screen changed. | 7.4 |
| 2026-10-06 | Creator public profile from a shared link built (🟡 awaiting device and live-server testing): tapping a creator's link opens their profile in the app for signed-in users and over Login for everyone else, counts one view in the background, follows a renamed link to the new name, and shows "Profile not available" for any hidden or unknown creator. Only Sada's own link form is accepted. iOS and Android now share one app identity. Web links start working once the permanent public web address is set. | 5.2, 5.3 (Journey A5), 6.5, 7.3, 7.4 |
| 2026-10-06 | Media kit preview and settings built (🟡 awaiting device and live-server testing). Preview (from "Preview" on the creator Home) shows the kit exactly as brands see it, with a hidden-kit warning and Share. Settings (gear on the preview, or the new "Media kit" row in My profile) checks the link name live as the creator types, explains the once-per-30-days change limit with its date while still allowing a return to the previous name, and shows / hides the kit from brands after a confirmation. | 5.2, 5.3 (Journey A4), 7.3 |
| 2026-10-06 | Media kit insights page built (🟡 awaiting device and live-server testing), opened from "All insights" on the creator Home: 7 / 30 / 90-day switch, every reported number with its change vs the previous period ("New" when there is nothing to compare), a daily views line, brand cities (shown from three brands up), most-viewed work once portfolios exist, and Share as the one main button. | 5.2, 5.3 (Journey A4), 7.3 |
| 2026-10-06 | Creator Home built (🟡 awaiting device and live-server testing): greeting band with tier and bell, one blocker notice at a time, the media kit card with Share, profile strength with the next step, swipeable platform tiles and a prices card. "All insights" and "Preview" show "coming soon" until their screens ship. Brands keep the Explore placeholder. | 5.2, 5.3 (Journey A4), 7.3, 7.4 |
| 2026-10-06 | Creator media kit card built (🟡 not on a screen yet, arrives with the creator Home): shows how brands see the creator, last-30-days views, brands and link opens (a number that isn't live yet is hidden, and a figure with nothing to compare to is marked "New"), the public link with a copy button, and one Share button. A hidden kit asks the creator to make it public before sharing. | none yet (journey and screen map update when Home ships) |
| 2026-10-06 | Bottom bar: the active tab is now shown only by its teal icon and name, with no highlight shape behind it. | 5.2 |
| 2026-10-06 | The bottom bar is a floating, rounded capsule again, now made of frosted "liquid" glass: the page shows blurred through it, and a soft droplet glides and stretches to the tapped tab. Every tab shows its icon and name. It slides away while scrolling down and returns on scroll up. Replaces the docked bar from 2026-10-04. | 5.2 |
| 2026-10-04 | The bottom bar now shows the full five-tab set for each role (brand: Explore, My campaigns, Messages, Wallet, Account; creator: Home, Deals, Messages, Wallet, My profile), with larger tabs, icons and labels. Tabs that aren't built yet open a "coming soon" page. | 5.2 |
| 2026-10-04 | New bottom tab bar: a solid bar docked to the bottom edge instead of a floating one. Pages now end above it, so nothing is hidden behind it, and it no longer slides away while scrolling. The active tab grows into a soft teal pill with its name. | 5.2 |
| 2026-10-04 | Notification inbox added: a bell with the unread count in the Profile header, a list with unread markers and "how long ago", tap to mark read and open the related screen, and "mark all as read". Tapping a phone notification now opens its screen too, even when it launched the app. The "complete your profile" cards now include verification, so they add up to the missing percentage. | 5.2, 5.3 (Journey A3), 6.4, 7.3 |
| 2026-10-04 | Verification can now be done after registration from the Profile card: creators upload both sides of their ID, brands pick the document type and upload one company document. The page shows the current status (under review, verified with date, rejected with reason), allows uploading only when the server does, and counts down when the hourly limit is reached. The verification card wording now differs for brands. | 5.2, 5.3 (Journey A3), 7.3 |
| 2026-10-04 | Editing details is now separate per role. Creators get "Personal info" (name, email, governorate, area) and brands get "Company info" (company name, email, business type, governorate, social links), both opening filled in with the saved values. The old edit page (empty name, a phone field that could never be saved) was removed. The phone number is shown locked, with a WhatsApp link to support for changing it. The brand Profile now shows the company logo, business type and city in the header and a company card, with no creator sections. | 5.2, 5.3 (Journey A3), 7.3 |
| 2026-10-04 | Creators can now manage their platforms after registration: a "My platforms" list, a page per platform (refresh followers, available-for-requests and primary switches, rejection or review notice, edit, remove with a warning) with that platform's prices, and a "My niches" page (1 to 3). The Profile cards and the matching "complete your profile" steps open these pages. Leaving with unsaved prices or niches asks first. | 5.2, 5.3 (Journey A2), 7.3 |
| 2026-10-04 | Profile redesigned. A short navy header shows the photo (tap to change), name, city and area, email and profile completion; the completion bar disappears at 100% and the header shrinks into a slim bar on scroll. Below: swipeable "complete your profile" cards with the percentage each step adds, the notification status card, identity verification in four states (verified shows a soft gold card), a platforms summary, niches, settings as tiles with an in-place light/dark/system choice, logout and delete account. Detailed screens (platform management, niche editing, ID upload, notification inbox) follow. | 5.2, 6.4 |
| 2026-10-03 | Launch blocker 7 resolved. Leftover booking wording and the old app name were removed from the profile. The old notification settings screen (booking categories, never reachable) was removed until Sada's categories exist. The home screen name is now «صدى» / "Sada". | 5.2, 6.4, 7.3, 7.4 |
| 2026-10-03 | Launch blocker 5 resolved. The login session and personal data are stored encrypted, with the key in the phone's secure key store. Users updating keep their session. If the key is lost, the user is asked to log in again. | 6.5, 7.4 |
| 2026-10-03 | Launch blocker 8 resolved. Account deletion is connected to the Sada service, confirmed by password, and reachable from Settings, the Suspended screen and every registration step. Deleting signs out and wipes everything the phone kept for that user. | 5.2, 5.3 (Journeys E, G), 6.5, 7.2, 7.4 |
| 2026-10-03 | Launch blockers 4 and 6 resolved. Store builds connect over HTTPS only. Location and the unused Android camera permission were removed. The camera and photo explanations are now specific and available in Arabic and English. The "permission turned off" message is translated and explains why each permission is needed. | 7.1, 7.2, 7.4 |
| 2026-10-03 | First version of the living guide, written from the current app: onboarding for both roles, social lookup, KYC, suspension, push permission strategy, device registration, and launch blockers. | All |
