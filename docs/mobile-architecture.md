# Sada (صدى): Living Mobile Architecture & Pitch Guide

> **Trust in every deal** · «ثقة في كل صفقة»

| | |
|---|---|
| **Product** | Sada (صدى): a B2B influencer marketplace for the Creator Economy |
| **Market** | Syria first, Arabic first, built to expand across the region |
| **Platforms** | iOS and Android (one shared codebase) |
| **Document owner** | Mobile team |
| **Last updated** | 2026-10-06 |
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

1. **Top-up.** The brand adds funds to their Sada wallet through a local payment method (for example a mobile e-wallet transfer to the platform's wallet).
2. **Agreement.** The brand and creator agree on a deal. The creator accepts, and the brand sees a detailed invoice.
3. **Escrow hold.** The agreed amount is **frozen** in escrow straight away. The creator is notified: *"Funds deposited. You can start working safely."* The creator cannot touch this money yet.
4. **Production and review.** The creator uploads the draft, and the brand reviews and approves it in the app.
5. **Publish and prove.** The creator publishes on their real account at the agreed time and submits the post link as proof.
6. **Verification and release.** The system checks the link. Once it is confirmed (and any agreed tracking period ends), the money is **released to the creator's wallet, minus platform commission.**
7. **Withdrawal.** The creator withdraws to a local e-wallet (standard payout within 24 hours, or instant cash-out for a fee).
8. **Refund path.** If the creator breaches the agreement or misses the publishing deadline, the escrowed amount is **returned automatically** to the brand's wallet.
9. **Dispute path.** If the two sides disagree, the deal moves to *Disputed* and platform support decides using the in-app record.

*Under consideration:* a staged release (for example 30% when work starts and the rest on completion). The final split will be confirmed before payments go live.

### 4.5 Strict money rules (our trust guarantees)

- **Brands deposit and pay. Creators only withdraw.** The app never shows an action that the user's role is not allowed to perform.
- **The server is the only source of truth** for balances, escrow holds, commission, refunds and deal status. The app displays what the server confirms and never calculates final amounts itself. Any amount the app works out on its own is clearly labelled as an *estimate*.
- **No double charges.** Every payment or withdrawal carries a unique one-time key, so a double tap or a weak connection can never charge twice. Payment buttons lock while a payment is in progress, and payments are never retried automatically.
- **All amounts are exact.** Money is stored as whole units of the smallest denomination with a currency code, never as rounded decimals. The default display currency is **US dollars**, formatted for the user's language.
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
└── MAIN APP (bottom tab bar: floating rounded glass capsule; page content
    │   shows blurred through it; slides away on scroll down, back on scroll up;
    │   hidden on inner screens; active tab shown in teal)                           ✅
    │   Five tabs, different per role:
    │     brand:   Explore · My campaigns · Messages · Wallet · Account
    │     creator: Home · Deals · Messages · Wallet · My profile
    ├── Home / Explore tab                                       🟡 placeholder today
    │     (will become: brand dashboard / creator opportunities)                         🔜
    ├── My campaigns (brand) / Deals (creator) tab               🟡 "coming soon" page   🔜
    ├── Messages tab                                             🟡 "coming soon" page   🔜
    ├── Wallet tab                                               🟡 "coming soon" page   🔜
    └── Account (brand) / My profile (creator) tab
          ├── Profile (navy header + cards, different per role)  🟡 built, awaiting device testing
          │     ├── Notifications inbox (bell with unread count in the header)   🟡 built, awaiting device and live-server testing
          │     ├── Verification: creator ID (front + back) or brand company document   🟡 built, awaiting device and live-server testing
          │     ├── Creator: My platforms → one platform (switches, prices)  🟡 built, awaiting device and live-server testing
          │     ├── Creator: My niches                           🟡 built, awaiting device and live-server testing
          │     ├── Creator: Personal info (name, email, city, area)   🟡 built, awaiting device and live-server testing
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
4. **Set prices (optional).** A price per service type (reel, story, post, visit). They can skip this and add prices later.
5. **Verify identity (optional).** They upload the front and back of their national ID (photo or PDF, up to 10 MB). Skipping is allowed and registration still completes. Verification raises trust with brands.
6. **Welcome.** A celebration screen. At this natural moment, the app may *offer* to turn on notifications (see §6.4).

#### Journey A2: Managing platforms, prices and niches after registration 🟡
- **Entry points:** the platforms and niches cards on the Profile, and the "complete your profile" cards for linking platforms, getting them verified and setting prices.
- **My platforms:** a calm list, one card per account (username, tier badge, and small labels for primary, under review, rejected or not available). Tapping a card opens that platform; adding uses the same username + automatic lookup sheet as registration. Only platforms not linked yet can be added (one account per platform).
- **One platform:** the account (username, followers or "tier picked by you", last update) with a refresh button (the server allows two refreshes per hour; the app shows when the next one is possible). Two switches save immediately: **available for requests** (when off, brands can't send requests on that platform; the creator's overall tier is recalculated from the available, non-rejected accounts) and **primary account** (hidden for rejected accounts; there is always exactly one primary, so it changes by making another platform primary). A rejected account shows the reason and an edit button; a manual tier shows that the team is reviewing it. Editing the username or tier re-runs the lookup.
- **Prices per platform:** the app defines the services (reel, story, post, visit); the creator ticks what they offer and sets a price for each. Saving keeps the prices of every other platform unchanged. "Save prices" is the only main button on the page.
- **Removing a platform** asks for confirmation and warns that its prices are removed too. The last remaining platform can't be removed; the app explains why.
- **My niches:** pick 1 to 3 niches and save.
- **Unsaved edits:** leaving the prices or niches page with unsaved changes asks before discarding them.

#### Journey A3: Editing your own details (different for creators and brands) 🟡
- **Creators and brands edit different things.** The edit button in the Profile header, and the matching "complete your profile" cards, open the right page for the role.
- **Creator, "Personal info":** full name, email (optional), governorate and area (optional). Everything opens filled in with what is saved.
- **Brand, "Company info":** company name, email, business type, governorate and social links (Instagram, Facebook, TikTok first, the rest behind "More links"). Links are checked against each platform's real addresses, like at registration. Email changes apply at once.
- **The phone number can't be changed in the app**, because it is the account's identity. It is shown locked, with a "contact support to change your number" link that opens WhatsApp with a ready message.
- Only what changed is saved. Leaving with unsaved changes asks first. Server errors appear next to the field they concern.
- **Verification after registration:** the verification card on the Profile opens the upload page when an upload is possible (never sent, or rejected; a rejection shows the reason and an "Upload again" button). Creators upload the front and back of their national ID (photo or PDF, up to 10 MB). Brands choose the document type (commercial register, industrial register or trade license) and upload one document (JPG, PNG or PDF, up to 10 MB). Files are checked on the phone before sending. While a request is under review, or once verified, the page shows only the status and its date. Sending is limited to 5 tries per hour (shared with registration); when reached, the button shows a countdown. The result arrives as a notification and refreshes the status.
- **Completion adds up to 100%.** Every step the server counts has its own "complete your profile" card, verification included (35% for brands, 20% for creators), so the cards always add up to what is missing. The verification card opens the upload page; while a request is under review it only says so; after a rejection it asks to upload again.
- **The brand Profile is lighter than the creator's:** the header shows the company logo (tap to change), name, business type and city; below come the completion cards (the photo step reads "add your company logo"), notifications, business verification and a company card (business type, city, links). Platforms, niches and prices are creator-only and never appear for brands.

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
- **Money (when the wallet goes live):** the server decides whether an account can be deleted. If an active deal or money held in escrow blocks deletion, the sheet shows the server's reason.

---

## 6. UX Strategies

### 6.1 Arabic first and a correct right-to-left layout

- **Arabic is the main design target.** Every screen is designed and tested in Arabic first. English is a full second language, not an afterthought.
- **The whole layout mirrors.** Navigation, lists, forms, icons with direction (back arrows, chevrons) and progress all flip correctly for right-to-left reading. This is enforced automatically in development: layout rules that would break in Arabic are rejected before the code is accepted.
- **Western digits everywhere** (1,250 in both languages), so prices, follower counts and money stay clear and consistent. This is a deliberate brand decision.
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

**Consistency:** every screen is built from one shared kit of components and follows one of six approved layouts (entry form, multi-step wizard, celebration, list, detail, settings). A catalog of every component is kept inside the development build, so the app looks like one designer made it. Every screen has exactly **one primary action**.

**Accessibility:** status is never shown by colour alone. Text contrast meets WCAG AA in light and dark mode. Touch targets are at least 44 points. Every button has a screen-reader label in both languages. Reduced-motion settings are respected.

**Light and dark mode:** the app follows the phone's setting by default. Both modes are designed together.

### 6.4 Push notification engagement

Notifications are central to a marketplace (new offers, payment secured, draft approved, money released), so we ask for permission **respectfully, at the right moment**:

- **Never on first launch.** A cold permission request on day one is the top cause of permanent "Don't allow".
- **Ask at moments of value.** The app first shows its own friendly explanation (for example, at the end of registration: "Get notified the moment a brand sends you an offer"). Only if the user agrees does the system permission prompt appear.
- **Respect "Not now".** After a decline, the app waits at least 48 hours before asking again, and asks at most 3 times per installation. If the phone can no longer show the system prompt, the app stops asking.
- **Always in control.** The user can change the permission at any time in the phone's settings. The Profile screen shows the live status: while notifications are off, a card explains that campaigns may be missed and offers to turn them on (or opens the phone's settings if the system can no longer ask). Once on, it shows a calm confirmation. A notifications screen with Sada's categories comes with the notification inbox.
- **Fresh data on every notification.** When a notification arrives or is tapped, the app refreshes the user's data so the screen matches what the notification said.
- **Safe notification links.** Notification content is checked against an approved list before it is acted on. A notification can never send the user to an arbitrary screen. Tapping a notification opens its screen: verification results open the verification page, platform results open that platform (creators only; brands land in the inbox), anything else opens the inbox. If the tap launched the app, it waits until sign-in has finished, then opens the screen, with the Profile underneath so Back always works.
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
- **Link safety.** Social links and proof-of-publishing links are only accepted from approved social networks. In-app web pages only open approved addresses.
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
- 🟡 Manage social platforms after registration (add, edit, refresh, set primary, availability, remove) and edit prices per platform: built, awaiting testing.
- 🟡 Verify identity (creators) or the business (brands) later from the Profile: built, awaiting testing.
- 🟡 Notification inbox with unread count and tap-to-open: built, awaiting testing. Sada-specific notification categories follow.

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
| 1 | **Marketplace and finance are not yet live.** Home is a placeholder, and campaigns, deals and wallet are not connected to the service. | No core value for users yet. A store reviewer may reject the app for minimal functionality. | Mobile + backend |
| 2 | **Notification service is set up for the previous project**, and app identifiers don't match across iOS, Android and the notification service. | Push notifications will not arrive. Store identity is inconsistent. | Mobile + DevOps |
| 3 | **The server address still points to the old domain.** | The production app can't reach the Sada service. | Mobile + DevOps |
| 4 | ✅ **Resolved 2026-10-03.** ~~The iOS build allows insecure connections.~~ Store builds now use HTTPS only on both platforms, and Android no longer trusts user-installed certificates. | | Mobile |
| 5 | ✅ **Resolved 2026-10-03.** ~~Login sessions are stored on the device without encryption.~~ Sessions and personal data are now stored encrypted, with the key in Keychain (iPhone) or Keystore (Android). Existing users stay logged in after updating. | | Mobile |
| 6 | ✅ **Resolved 2026-10-03.** ~~Generic permission explanations, plus an unused location permission on Android.~~ Explanations rewritten in Arabic and English. Location and the Android camera permission were removed. | | Mobile |
| 7 | ✅ **Resolved 2026-10-03.** ~~Leftover text from the previous project in the profile area, and old notification-settings fields.~~ The booking counter, the old app name and the old notification settings screen were removed. The phone home screen now shows «صدى» in Arabic and "Sada" in English. | | Mobile |
| 8 | ✅ **Resolved 2026-10-03.** ~~Account deletion is not confirmed against the new backend.~~ Deletion is connected to the Sada service and reachable from Settings, the Suspended screen and registration. | | Mobile + backend |
| 9 | **App Store listing ID not set yet**, so the forced-update button opens the App Store home page instead of Sada's page. | Poor update experience until the first release. Set it right after the listing is created. | Mobile |
| 10 | **Not yet verified on real devices** after the visual redesign: some text fields in right-to-left, and card shadows. | Visual polish and right-to-left correctness. | Mobile QA |
| 11 | **Payment partner and legal framework** for escrow with local e-wallets, plus contract templates. | Escrow can't launch without them. | Business + legal |
| 12 | **Privacy label, Data Safety form, final legal pages, store screenshots.** | Required for submission. | Product + legal |

---

## Change Log

Every change to a screen, flow, permission or business rule adds a row here (newest first).

| Date | Change | Sections updated |
|---|---|---|
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
