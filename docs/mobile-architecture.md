# Sada (صدى): Living Mobile Architecture & Pitch Guide

> **Trust in every deal** · «ثقة في كل صفقة»

| | |
|---|---|
| **Product** | Sada (صدى): a B2B influencer marketplace for the Creator Economy |
| **Market** | Syria first, Arabic first, built to expand across the region |
| **Platforms** | iOS and Android (one shared codebase) |
| **Document owner** | Mobile team |
| **Last updated** | 2026-10-24 | Launch blockers: push notifications and the server address resolved; shared links verified on Android, iPhone waiting on the backend. |
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
2. **Agreement.** The brand builds a direct offer from the creator's published prices (fixed, no haggling), adding fixed-price extras such as rush delivery or an extra revision. The creator accepts, declines with a reason, or asks once for more time (up to 14 extra days). Both sides sign the contract in the app.
3. **Escrow hold.** The agreed amount is **frozen** in escrow straight away. The creator is notified: *"Funds deposited. You can start working safely."* The creator cannot touch this money yet.
4. **Production and review.** The creator hands in each deliverable's draft in the app; the brand approves it or asks for changes within the revision rounds agreed in the offer (48 hours to answer, then it is approved automatically). One more round can be bought at the creator's fixed price; it is held from the brand's wallet only once the creator accepts.
5. **Publish and prove.** The creator publishes on their real account at the agreed time and submits the post link as proof.
6. **Verification and release.** The system checks the link. Once it is confirmed (and any agreed tracking period ends), the money is **released to the creator's wallet, minus platform commission.**
7. **Withdrawal (🟡 awaiting live-server testing).** The creator withdraws to one of their saved payout methods: an exchange office (cash at Al-Haram or Al-Fouad), an e-wallet (Syriatel Cash, MTN Cash or Sham Cash) or a bank account, in dollars or Syrian pounds when the method takes both. The amount is held from the balance as soon as the request is sent, and Sada's team transfers it, usually within 24 hours. Instant cash-out for a fee is planned (🔜).
8. **Refund path.** If the creator breaches the agreement or misses the publishing deadline, the escrowed amount is **returned automatically** to the brand's wallet.
9. **Dispute path (🟡 built, not yet device or live-server tested).** If the two sides disagree, either one opens a dispute: the deal moves to *Disputed*, every timer pauses and the held money goes to no one. Both sides have 24 hours to add evidence; then Sada's team rules on the in-app record: all back to the brand, all to the creator, or a split. The ruling shows exactly what each side gets and Sada's fee, as the service states it. The opener can withdraw while it is open and the deal picks up where it stopped.
10. **Keep-up path (🟡 built, not yet device or live-server tested).** After completion each post must stay up for the agreed period. If the brand reports it taken down, made private or changed, the creator has 24 hours to restore it or contest; a restore gives the brand 24 hours to confirm (silence counts as confirmed). A contest, a rejected restore or a creator who stays silent goes to Sada's team. If the team upholds the report it can take money back from the creator's wallet to the brand's; both sides see the exact amount on the deal and it shows in their statements as a clawback.

*Under consideration:* a staged release (for example 30% when work starts and the rest on completion). The final split will be confirmed before payments go live.

### 4.5 Strict money rules (our trust guarantees)

- **Brands deposit and pay. Creators only withdraw.** The app never shows an action that the user's role is not allowed to perform.
- **Creator prices are for verified brands (🟡 awaiting live-server testing).** Only a business-verified, active brand sees creators' prices, on Home, Explore, the shortlist and the creator's public profile. Everyone else (people not signed in, brands still unverified, in review or with an unfinished company profile, and other creators) gets no prices at all from the service: the app shows a lock and the one step that opens them. Once a brand is verified, any profile it saw while locked is loaded again instead of being reused.
- **The server is the only source of truth** for balances, escrow holds, commission, refunds and deal status. The app displays what the server confirms and never calculates final amounts itself. Any amount the app works out on its own is clearly labelled as an *estimate*.
- **No double charges.** Every top-up, withdrawal, cancellation and deal signature that moves or holds money (accepting an offer, asking for or approving more time, funding, withdrawing an offer, asking for an extra revision round) carries one key per user action. The same key is reused when the user retries that action (weak connection, app reopened, a mistake fixed), so the server charges once and a repeat simply returns the first result. Payment buttons lock while a payment is in progress. The only automatic retry is when the server says the first request is still running: the app asks again after about 2 seconds (at most 3 times), which can never charge twice.
- **Top-up limits.** One top-up is between $10 and $10,000 (Syrian pounds: the same range at the current rate). The service sends the exact range for each method and currency, and any amount inside it is accepted. Syriatel Cash and MTN Cash take Syrian pounds only, so they pause while the rate is out of date; Sham Cash and dollar top-ups keep working. Every request needs the transfer number and a receipt (photo or PDF, up to 10 MB). A transfer number can be used once per method (a rejected request frees it, so the same transfer can be sent again with a clearer receipt). A brand can have at most 5 requests in review at a time. A top-up is only money once Sada approves it; until then it shows as "in review" and can be rejected with a reason. Sada can reverse an approved top-up (a bounced or fraudulent transfer): the amount is taken back out of the wallet and the request shows as reversed, in red, with the reason.
- **Payout methods (creators).** A creator can save up to 10 accounts in their own name to receive withdrawals. Exchange offices need the recipient's full name, a Syrian mobile number and the governorate (city optional); e-wallets need the name and the mobile number (Sham Cash also needs the wallet's account code: 4 to 64 Latin letters, digits or dashes); banks need the name, the bank, the account number and optionally an IBAN, which the app checks for typos before sending. Exactly one method is primary once any exist: the first one saved becomes primary, the creator can make another one primary, and deleting the primary promotes the newest remaining method. A method's type can't change after saving (delete it and add a new one). Withdrawals already sent keep their own copy of the destination, so editing or deleting a method never redirects money already on its way. Managing methods is allowed at any time, even before identity verification or with a frozen wallet; those rules block the withdrawal itself. Only the last four digits of a phone or account number are shown in lists. **Security alert:** whenever a method is added, or its account details change, the creator gets a notification naming the method type and asking them to contact support if it wasn't them; renaming a method alone sends nothing.
- **Withdrawal rules (creators, 🟡 awaiting live-server testing).** Before confirming, the server prices every withdrawal: the amount taken from the balance, the method's fee, what arrives, and for a Syrian pound payout the pounds at today's rate, fixed at the moment of sending. If it refuses, every reason is listed (account not active, identity not verified, wallet frozen, withdrawals paused, below the minimum, over the daily limit, a withdrawal already on its way, too soon since the last one with a countdown to the next allowed time, not enough balance, an out-of-date rate for pounds, a currency the method doesn't pay, or a fee larger than the amount) and Continue stays disabled, the one place a button is disabled on purpose, because only a change of amount or time can fix it. The default rules are shown up front: at least $25, at most $500 a day, one withdrawal every 7 days, one request open at a time; the service will send its own numbers later. A request can be cancelled while it is in transfer, and the amount goes straight back to the balance. A transfer the payout partner sends back is returned to the balance in full, with the reason.
- **Wallet buttons follow the server.** Top up (brands) and Withdraw (creators) are enabled only when the server allows it; it explains why when they are not (registration or verification unfinished, account suspended, wallet frozen, or withdrawals paused).
- **No deleting an account that still holds money.** While the wallet has a balance, pending money, money in escrow, a top-up under review or an open withdrawal, deletion is refused (🟡 handled in the app, awaiting live-server testing).
- **All amounts are exact.** Money is stored as whole units of the smallest denomination with a currency code, never as rounded decimals. The default display currency is **US dollars** (in cents); Syrian pounds have no fractions and are shown as a bare whole amount, with no currency symbol or code. Digits are Western in both languages.
- **Amounts are shown the same way everywhere.** Statements, receipts, quotes and confirmations always show the exact amount. Short forms (1.2K, 6.5M) appear only in summary tiles and stats. A balance shown without cents is always rounded down, so the app never shows more money than the user has. The wallet can hide every amount with one tap (eye icon) for privacy in public.
- **Shipping protects both sides.** A problem report pauses every deal timer until the brand re-ships or cancels; a brand cancelling over a shipping problem gets the held money back and the creator's rating is untouched; a creator whose product never shipped or whose report went unanswered can cancel for free. Confirming receipt, both cancellations and the creator's signature with the address are pressed and held, and cancellations carry one key per action so they never run twice. The delivery address is personal data: only the creator and, while it ships, the brand can see it, and the app never stores it on the phone.
- **Ending or extending a running deal is explicit and logged.** A brand cancelling sees first where every held dollar goes (back to its wallet, the creator's compensation, Sada's fee) as the service states it; if those terms change while the sheet is open the brand sees the old and new compensation and confirms again, and a deal that can only be ended through a dispute says so instead of offering a button. A creator withdrawing is told it records a strike, how many are active and how long a new one lasts (no strike while the free shipping cancel is open). Extra work is a signed addendum: the brand sends it after seeing the service's price and whether its wallet covers it, the creator accepts by pressing and holding on this phone or declines with a reason, and nothing is charged until the creator accepts. Cancelling, withdrawing and sending extra work are pressed and held and carry one key per action so they never run twice.
- **Disputes are judged on the record, within limits.** Each side picks from its own list of reasons (a brand: brief not followed, poor quality, missed deadlines, not responding, a problem with the live post; a creator: asks beyond the agreement, brand not responding, a product problem, unfair rejection, too many revisions; both: other) and writes a statement of 20 to 2,000 characters. Each side can add up to 20 evidence entries, 10 files and 10 links across the dispute; every entry needs a note, and nothing can be edited or removed once sent. Files keep their original quality; links must be https and open only when they point at a known platform (otherwise they are copied). A deal allows a limited number of disputes, and the app says how many are left. A creator is warned before opening that losing records a strike, with the active count. Opening is pressed and held.
- **Keeping a post up is checked on proof, by people.** The brand can report only while the server says the period is open and one report per post is open at a time. A report needs a reason (deleted, made private, changed, other; a note is required for other) and 1 to 3 screenshots; a restore needs 1 to 3 screenshots and may add the new link, which the server checks like a publishing link (the creator's own account, not a link already used). Contesting and rejecting each need a note of up to 1,000 characters, read by the team. None of these moves money by itself: only the team's decision can, and the app shows the amount the server reports.
- **A campaign deal has a free way out at the start (🟡 awaiting live-server testing).** For 24 hours after the brand pays and the private brief opens, the creator can leave with no strike and the brand is refunded in full; a creator who withdraws before the brand has paid also takes no strike. Past that, the usual withdrawal rules apply.
- **Batch tools are careful with addresses and with broadcasts (🟡 awaiting live-server testing).** Opening the shipping manifest tells the service that this brand viewed the creators' addresses, so it is logged for audit; the app says so on the page, keeps addresses hidden until tapped, hides them again when the app leaves the screen, and never offers a bulk copy or export. Shipping many parcels is one act per batch of 20 that cannot be sent twice by a retry, and each parcel gets its own answer. A broadcast is informational only (it never changes terms or prices), reaches only creators on funded deals, and is limited to three per campaign in any 24 hours; the number of creators reached always comes from the service, and a link inside it is shown to creators to copy, never opened by the app.
- **Returned samples and restrictions (🟡 awaiting live-server testing).** When a campaign asks for the sample back, the return opens as soon as the deal closes. The creator has five days to enter the courier and tracking number; entering it (or the brand letting the sample go) unlocks the account at once, and it can be corrected until the brand answers. Missing the five days records one normal strike and the lock stays until the waybill is in. While locked the creator cannot apply to public campaigns, accept direct offers or ask for more time. A severe strike (withdrawing or defaulting after receiving a gift product) bans public applications for 30 days; direct offers stay open. The brand answers once, and every answer is final and held rather than tapped: confirm receipt, report a problem (a note of at least 5 characters, up to five photos), or waive the sample before receipt is confirmed. If the brand stays silent for 14 days after the waybill, receipt confirms itself. A reported problem goes to Sada's team with no automatic penalty for the creator. Every date, status name and restriction text comes from the service.
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
   - **Markets:** the same answer lists the countries Sada serves (open now, or coming soon). The app remembers it, so the next launch already knows it. Phone fields have no country picker and no dial code: people type their number the local way, starting with 0 («0944 123 456»); a number without the leading 0 is rejected. The app turns it into the full international number before sending it. Phone numbers shown back (profile, code screens) use the same local form.
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
│   ├── Brand:   Verify phone → Business profile → Business verification (optional: one of four ways) → Welcome   🟡 verification step rebuilt, awaiting device and live-server testing
│   └── Creator: Verify phone → Niches & platforms → Prices (optional) → ID check (optional) → Welcome   ✅
│
├── SUSPENDED (blocking: contact support, re-check status, log out, delete account)   ✅
│
├── CREATOR PUBLIC PROFILE (opened from a shared Sada link; over Login or the main app)   🟡 built, awaiting device and live-server testing
│     live navy stage (photo with echo rings, name, handle, bio, tier · niche +N · city,
│     total followers + share per platform) · numbers · audience 🔜 · past work 🔜 ·
│     brands worked with 🟡 · prices: platform filter + price tickets, "All prices" ·
│     escrow card (brand → Sada escrow → creator, 3 steps, terms) · join card (visitors) ·
│     bottom bar: "from $X" or the picked total + "Request a direct service" (brands), or 🔒 the next
│     step when the viewer can't see prices · "Profile not available" for any hidden link
│     └── Direct offer builder (brands, over the app)              🟡 built, awaiting device and live-server testing
│           checking → navy header (close, creator, save state; step rail: icon + name of current step) over 3 steps:
│           1 services (quantity, add-ons, product or not, deadline, rush) ·
│           2 brief (templates, talking points + tone, don'ts, #tags, @mentions,
│             discount code, tracking link, up to 5 files) ·
│           3 deal pass + contract + wallet hold + deal journey → press and hold to sign
│           · blocked page (verify, creator closed, open offer exists, limits)
│           · price changed sheet · continue-draft sheet · sent stamp + journey + top-up
│
├── HOW A DEAL COMPLETES (deal guide, one page per role; from the offer builder,
│     the sent page and Settings)                                  🟡 built, awaiting device testing
│     navy hero + station map (tap jumps) + 3 trust facts · bar "station n of N"
│     with reading progress · one chapter per station · questions · shipping chapter
│     only where a product can ship
│
└── MAIN APP (bottom tab bar: docked at the bottom edge, never over the page;
    │   shows only on each tab's main screen; icon + name on every tab; active
    │   tab in a teal squircle, a teal rail on the bar's top edge stretches to
    │   the tab being pressed 🟡)                                                    ✅
    │   Tabs, different per role:
    │     brand:   Home · Deals · Wallet · Account
    │     creator: Home · Deals · Opportunities · Wallet · My profile
    │       (Opportunities is hidden while the service has campaigns closed)
    ├── Home (creator) dashboard                                 🟡 built, awaiting device and live-server testing
    │     "v3": navy hero: photo, greeting, name, verified, tier (beside the bell)
    │       · the link strip: public / private · copy · preview · share (or make public)
    │       · last 30 days: storefront views · brands that visited · reach → insights
    │       · content sinks and fades behind the sheet while scrolling
    │     · body sheet (rounded both sides, never over the hero), every section always shown:
    │       · task deck: the one blocker → deals waiting on the creator → before the first
    │         offer, the storefront steps still open; swipe or Next · calm card when nothing waits
    │       · Sada map: offers · my deals · campaigns (or notifications) · wallet · my prices
    │         · my platforms · my media kit · my insights → each place; red strike bar → strikes
    │       · your running deals (stage bar, price, time left) → the deal / all deals;
    │         welcome card before the first offer
    │       · "Campaigns for you" (only while campaigns are open): one card, new invitations,
    │         up to three ranked campaigns (take-home, seats) → the campaign; My applications
    │         or browse all → the feed; a calm card when nothing fits
    │       · your money: held on deals (mint, flowing to the wallet) → Wallet · ID-check nudge
    │       · your storefront to brands: views + daily line → insights · link · preview · share
    │       · readiness ring (five stages, next-stage button, "complete" at 100%)
    │       · your audience (bar by platform, accounts, + add)
    │       · your prices as tags hanging from a rail (+ new) → My prices
    │     scrolled: navy bar pinned with photo, name, tier, share and the bell
    │     ├── Media kit: all insights                                🟡 built, awaiting device and live-server testing
    │     │     period switch (7 / 30 / 90 days) · numbers vs the previous period
    │     │     · daily views line · cities brands view from · most-viewed work · Share
    │     └── Media kit: preview as brands see it                    🟡 built, awaiting device and live-server testing
    │           hidden-kit warning · profile card · platforms · prices (tap: what's included)
    │           · collaboration terms · Share
    │           └── Media kit settings (gear in the header)          🟡 built, awaiting device and live-server testing
    │                 link name with a live availability check · show / hide from brands
    ├── Home (brand) «Spotlight»                                 🟡 built, awaiting device and live-server testing
    │     greeting + "company · city" (→ account) beside ❤️ (→ Shortlist) and the bell
    │     · one quiet wallet line: balance → Wallet · "Top up" when allowed
    │     · big question "Who will tell your story this week?"
    │     · «My active campaigns» (only while campaigns are open, after «your deals»): a
    │       rail of seat cards (up to five, the ones needing the brand first), each with its
    │       seats drawn as pills (paid · waiting for payment · empty), applications, seats
    │       waiting for payment, time to the drop, and a bar with the service's own words for
    │       the next decision → top-up, the applicants or the campaign page · "All my campaigns"
    │     · «Two ways to work with creators» (only for a brand with no open deal and no active
    │       campaign, while campaigns are open; gone by itself after the first): a switch
    │       «Direct deal / Public campaign» moves a small picture, three comparison rows (who
    │       chooses, price, best for) and one button → Explore, or the campaign wizard
    │     · search pill → Explore · filter key → Explore
    │     · the one blocker the service picks (verify, under review, rejected,
    │       finish profile) → verification or company info
    │     · category chips ("All" + the service's categories) → Explore
    │     · rails from the service, each in its own shape, "See all" → Explore:
    │         near you = swipeable story deck (full photo cards, ❤️, price)
    │         verified = tall photo tiles (tier, niche · city, followers, price)
    │         fast delivery = ruled rows with the days as a big figure
    │         new · recently viewed = story rings
    │     · help line (WhatsApp)
    │     ├── Explore (search, filters, sort)                     🟡 built, awaiting device and live-server testing
    │     │     search in the bar · filter / sort / category / verified / rush chips
    │     │     · price-locked banner · creator rows loading on as you scroll
    │     (each with a teal handshake disc → offer builder)
    │     │     · filter sheet · sort sheet · "why prices are hidden" sheet
    │     └── Shortlist (saved creators)                          🟡 built, awaiting device and live-server testing
    │           saved creator rows loading on as you scroll · ❤️ removes with Undo
    │           · handshake disc → offer builder
    │           · Invite (header): pick creators → pick an open campaign → report per creator
    │           · empty → Explore
    ├── Deals tab (brand and creator)                            🟡 built, awaiting device and live-server testing
    │     ├── Campaign wizard (brand: «+» in the tab header, over the app)  🟡 built, awaiting device and live-server testing
    │     │     navy header (close, campaign name + cover, save state; 4-step rail) over:
    │     │     1 idea (cover, title, activity, public announcement) · 2 required (content
    │     │     from the catalog, who can apply, ranking preferences, product question,
    │     │     private brief sheet with files) · 3 money & seats (fixed or bidding, seats,
    │     │     maximum-hold estimate + wallet, deadline, delivery window or one drop) ·
    │     │     4 review (one row per part with edit, the brief locked as creators meet it,
    │     │     wallet + verification notes) → send · verify / live-limit sheets ·
    │     │     changes requested: strip + the team's note, send again
    │     │     └── In review (same screen once sent): navy page, handed-in ticket,
    │     │           sent → in review → published track, top-up nudge     🟡 built
    │     ├── Public campaigns | Direct requests pill at the top of the tab (brand; campaigns first) 🟡 built, awaiting device and live-server testing
    │     │     title + guide + «new» (campaign or request) · amber count on a face when the
    │     │     other one waits on you · scrolling filter chips with counts, each face remembers
    │     │     its own: campaigns All / Active (opens here) / In review / Drafts / Finished;
    │     │     requests All (opens here) / Waiting on you / Awaiting reply / In progress /
    │     │     Drafts / Finished · cards swap softly · every chip has its own empty message
    │     │     campaigns: one card shell for both faces (soft shadow, same station track) ·
    │     │     card = title + status, activity · city, seats as dots, what is asked of each
    │     │     creator, track (review · applications · seats · running · done), a line with the
    │     │     time left or what the state means, strip for a suspension or freed seat, price
    │     │     + new applications + «budget secured» · draft cards with a readiness ring and a
    │     │     ⋯ sheet (continue / copy / delete) · finished rows, compact
    │     │     └── Campaign page (brand): a short cover behind the header (the campaign's photo,
    │     │           or rings on the brand gradient) with status and time left; then in order:
    │     │           quick-action circles (the common ⋯ actions for the status) · the «now» card
    │     │           (a ring for the clock or count that matters, what is happening, what the
    │     │           campaign waits on from the brand as rows, what comes next) · the terms as
    │     │           tiles with an edit / locked chip · the campaign tools · the five-stop journey
    │     │           · the campaign's own history; ⋯ in the header holds every action: add seats ·
    │     │           extend the deadline · edit · copy · close recruiting / cancel (press-and-hold)
    │     │           · delete a draft; edit after publishing reopens the wizard with one «Save
    │     │           changes» button   🟡 built
    │     │     └── Campaign tools (brand, tiles on the campaign page; each shows only when it applies)  🟡 built, awaiting device and live-server testing
    │     │           ├── Launch room (campaigns with a drop): a short top with the countdown by the
    │     │           │     second to the live link, then to the drop, then «on air» with a ring of who
    │     │           │     has posted · a card with the three stations and their times, and the three
    │     │           │     reminders · a team strip (creators behind schedule blink) · filter pills ·
    │     │           │     one row per creator → their deal
    │     │           ├── Shipping manifest (campaigns that send a product): four counts (waiting, ready,
    │     │           │     held, shipped) · a fixed line «viewing addresses is logged» · tick every ready
    │     │           │     parcel and pick one courier for all · a card per parcel: tick to open courier,
    │     │           │     tracking number and optional link; the address stays hidden until tapped
    │     │           │     (copy one at a time) · held parcels show a clock or «address missing» ·
    │     │           │     press and hold to ship; shipped parcels are stamped, failed ones rise with the
    │     │           │     service's reason and stay editable
    │     │           └── Broadcast (once a seat is taken): three dots for today's broadcasts (lit from the
    │     │                 real history) above a message box (3–1,000 characters) and an optional https
    │     │                 link · a fixed line «informational only» · press and hold to send · at three
    │     │                 in 24 hours the dots turn amber and a clock replaces the button, the text kept ·
    │     │                 below, the history with how many creators each message reached
    │     │     └── Recruiting table (brand, «Review applicants» on the seats card)  🟡 built, awaiting device and live-server testing
    │     │           seat strip (faces fill the seats) + wallet balance · tabs new / shortlisted /
    │     │           selected with big counts · filter chips (city, niche, followers, invited) and a
    │     │           sort-and-filter sheet (ended, rejected, not selected, cancelled live there) ·
    │     │           photo-led applicant cards with the 72-hour clock (warm in the last 6 hours)
    │     │           ├── Applicant page: cover photo, three numbers, the pitch as a quote, price (bid or
    │     │           │     fixed), accounts, Media Kit button · dock: Select (leads), Shortlist, Reject
    │     │           ├── Compare (up to 3, from the header or a long press on a pending card): sticky
    │     │           │     faces, rows for price, followers, rating, deals, accounts, city; Select under each
    │     │           ├── Select sheet: price, what they deliver, «seat X of Y», wallet estimate, press and hold
    │     │           ├── Selected page: funded = navy scene, the face rises into its seat; waiting for
    │     │           │     payment = 24-hour funding card + Top up
    │     │           └── «Complete or close recruiting?» sheet (shown once when the service asks)
    │     ├── Deal board (tab home): big title with the count of moving deals
    │     │     · guide button · tabs (brand: active / drafts / closed;
    │     │     creator: new / ongoing / closed) · creator: amber strikes
    │     │     strip when any is active (→ Strikes) · «your turn» stack of navy
    │     │     passes (swipe through, soonest deadline first) · one ticket per
    │     │     deal: status line with time left filling behind it, every
    │     │     stage by name (tap or slide → bubble), "next" line
    │     ├── One deal: navy orbit hero (whole journey, current window
    │     │     ticking, tap or swipe a stage) · next step (or how it ended)
    │     │     · offer file (items + add-ons, ad script, tags/code/link to
    │     │     copy, files, delivery) · stage card with its history
    │     │     · delivery track while the work is on (one card per
    │     │     deliverable: status, round bars, clock, the role's button)
    │     │     · after completion: keep-up rings per post + report
    │     │     cases (report / restore / contest / confirm / reject
    │     │     sheets, team decision, clawback)               🟡 built
    │     ├── Hand in a round (creator): brand's notes ticket · files on a
    │     │     strip of film that develop as they upload (1–10, reorder)
    │     │     · caption as the post shows it + brief chips · hand-in bar
    │     │     · after handing in: seal + the round, read only   🟡 built
    │     ├── Review a round (brand): navy stage (video plays, timeline,
    │     │     hold the bar to pin a note at that second, notes on whole
    │     │     files) · caption · your notes · earlier rounds · ask for
    │     │     changes / hold to approve · extra round when used up  🟡 built
    │     ├── Hand in the post (creator): «ON AIR» lamp that lights when
    │     │     ready · brand's fix note · link as an address bar (platform
    │     │     detected, paste, why a link was refused) · 1–3 screenshots
    │     │     as phone screens · after handing in: on air until verified  🟡 built
    │     ├── Check the post (brand): post on a glass card (open link,
    │     │     account matched / not checked) · screenshots to zoom ·
    │     │     auto-verify fuse · submissions record · hold to confirm
    │     │     (last one completes the deal) / ask for a fix (2 max)  🟡 built
    │     ├── Contract: Arabic / English · parties · deliverables · payment
    │     │     · schedule · terms · signatures + fingerprint · addenda
    │     ├── Deal files (both roles, from a «Files» strip on the deal page):
    │     │     a navy deck with the latest files fanned, how many and how
    │     │     heavy · filters (brief, drafts, proof, dispute, shipping…) ·
    │     │     a photo grid grouped by section and round; each tile saves
    │     │     itself from its corner (ring → ✓); expired files stay,
    │     │     striped · long-press to pick several · «Download all» dock
    │     │     with a live count; a creator sees the brief locked until
    │     │     the brand funds the deal                       🟡 built
    │     ├── Campaign attachments (brand, from the campaign page): the
    │     │     same vault for the campaign's cover and brief files  🟡 built
    │     ├── File viewer (every photo, video and document in the app,
    │     │     incl. media kit work and top-up receipts): pinch / double-
    │     │     tap zoom with a minimap, swipe between files, swipe down to
    │     │     close · videos with a scrubber and speed · PDFs read in the
    │     │     app page by page · save to Photos / Downloads / Files, share
    │     │     or open in another app                         🟡 built
    │     ├── Add to the deal (brand): a new service from the creator's
    │     │     prices or an add-on on a deliverable · server price · wallet
    │     │     check / top-up · hold to send                         🟡 built
    │     ├── Dispute file (both roles): scales over the held amount
    │     │     (sways while weighed, tips once on the ruling) · evidence
    │     │     window countdown / team's target time · ruling split ·
    │     │     statement · both sides' evidence on one spine · add
    │     │     evidence sheet · withdraw (opener)                    🟡 built
    │     └── Strikes (creator only): active count · one fuse card per
    │           strike with days left · clean-record state            🟡 built
    ├── Messages tab                                             🔜 hidden until built
    ├── Opportunities tab (creator)                              🟡 built, awaiting device and live-server testing
    │     one capsule at the top: For you · Saved · My applications
    │     ├── For you: opportunity tickets (cover and brand, the creator's take-home as the big
    │     │     number, seats left, time left with a draining bar); filters: kind of ad + fixed price / bidding
    │     ├── Saved: the same tickets, newest save first
    │     ├── My applications: Open · Selected · Closed; one card per application with its status,
    │     │     take-home, the brand's 72-hour ring, Withdraw (open ones) or Open the deal (selected)
    │     └── Campaign page (creator): cover behind the header; numbered sections (take-home,
    │           what is asked, schedule, conditions, the sealed private brief); dock with seats,
    │           time left and the one action (also opened by the notification link)
    │           └── Apply sheet: price (typed bid with ± and a ruler, or the fixed price), one account
    │                 per platform, a message, the terms summary, the 72-hour consent, press and hold
    ├── Wallet tab (same layout, each role's own words)          🟡 built, awaiting device and live-server testing
    │     balance dial on the navy hero (eye hides every amount) · the one blocker
    │     · money held in escrow as tickets · payout method (creator) · monthly tide
    │     · today's rate · latest activity on a printed receipt
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
          ├── Profile (navy band with the completion ring, then blocks per role)  🟡 built, awaiting device testing
          │     ├── Notifications inbox (bell with unread count in the header)   🟡 built, awaiting device and live-server testing
          │     ├── Creator: Verification (ID front + back)          🟡 built, awaiting device and live-server testing
          │     ├── Brand: Business verification (pick one of four ways)   🟡 built, awaiting device and live-server testing
          │     │     choices · requests in progress (under review / rejected) · verified card
          │     │     ├── Company document or owner's ID / passport upload
          │     │     ├── Instagram or Facebook page proof (page link → code → send it in a DM)
          │     │     └── Official domain email (domain + email → confirmation link)
          │     ├── Creator: My prices (grouped by platform + in person)   🟡 built, awaiting device and live-server testing
          │     │     └── One price: add / edit / delete (package, price, delivery, revisions,
          │     │           how long it stays live, add-ons)                🟡 built, awaiting device and live-server testing
          │     ├── Creator: My platforms → one platform (switches, link to its prices)  🟡 built, awaiting device and live-server testing
          │     ├── Creator: My niches                           🟡 built, awaiting device and live-server testing
          │     ├── Creator: Personal info (name, email, city, area)   🟡 built, awaiting device and live-server testing
          │     ├── Creator: Payout methods (opens the wallet's page)   🟡 built, awaiting device and live-server testing
          │     ├── Creator: Media kit settings (same page as from Home)   🟡 built, awaiting device and live-server testing
          │     └── Brand: Company info (name, email, activity, city, links)   🟡 built, awaiting device and live-server testing
          ├── Change password                                    ✅
          ├── Language                                           ✅
          ├── How a deal completes (opens the deal guide for the role)   🟡 built, awaiting device testing
          ├── Terms & Privacy (in-app web pages)                 ✅
          ├── Help & support (opens Sada support, both roles)    🟡 built, awaiting device testing
          └── Delete my account (password-confirmed)             ✅
```

**Tabs and campaigns 🟡:** brands and creators have **separate tab sets**. Brands: *Home · Deals · Wallet · Account*; the brand's Deals tab holds a «Public campaigns | Direct requests» pill (campaigns first; direct requests alone, without the pill, while campaigns are closed). Creators: *Home · Deals · Opportunities · Wallet · My profile*. Messages has no tab until in-app chat is built (no "coming soon" pages in the store build). Tabs for analytics and notifications follow as those features arrive.

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
   - **Gender (optional).** The same step asks for the creator's gender (male or female) or lets them skip it. It is saved with the platforms and only matters for campaigns that target one gender; without it, those campaigns tell the creator what is missing.
   - Unsaved platform entries are kept on the device, so closing the app doesn't lose the work.
4. **Set prices (optional).** For each linked platform the app lists the services Sada offers there (for example reel, story, feed post on Instagram), plus in-person services such as an on-site visit. The creator ticks what they offer, picks the package (for example story frames or video length) and sets a price between $5 and $50,000. Delivery time, revisions and the rest take sensible defaults they can change later from My prices. They can skip this step: like every optional registration step, the skip button sits in the fixed bottom bar under the main button, with a one-line note above it, so it is always visible without scrolling.
5. **Verify identity (optional).** They upload the front and back of their national ID (photo or PDF, up to 10 MB). Skipping is allowed (same always-visible skip button in the bottom bar) and registration still completes. Verification raises trust with brands.
6. **Welcome.** A celebration screen. At this natural moment, the app may *offer* to turn on notifications (see §6.4).

#### Journey A2: Managing platforms, prices and niches after registration 🟡
- **Entry points:** the prices, platforms and niches cards on the Profile, and the "complete your profile" cards for linking platforms, getting them verified and setting prices (which now opens My prices). Without any price, the Profile shows a "Set up your prices" warning in place of the prices row.
- **My platforms:** a calm list, one card per account (username, tier badge, and small labels for primary, under review, rejected or not available). Tapping a card opens that platform; adding uses the same username + automatic lookup sheet as registration. Only platforms not linked yet can be added (one account per platform).
- **One platform:** the account (username, followers or "tier picked by you", last update) with a refresh button (the server allows two refreshes per hour; the app shows when the next one is possible). Two switches save immediately: **available for requests** (when off, brands can't send requests on that platform; the creator's overall tier is recalculated from the available, non-rejected accounts) and **primary account** (hidden for rejected accounts; there is always exactly one primary, so it changes by making another platform primary). A rejected account shows the reason and an edit button; a manual tier shows that the team is reviewing it. Editing the username or tier re-runs the lookup.
- **Prices on a platform's page:** a row with the number of prices on that platform opens My prices. With none yet, a warning explains that brands can't book the creator there, with a button to add prices.
- **My prices:** one list grouped by platform (primary first), with in-person services (on-site visit) at the end. Each line shows the service, its package and the price; tapping it opens that price. A platform with no price yet invites the creator to add one. "Add a price" is the one main button. While the creator has no price at all, a warning at the top says brands can't send them requests yet. What can be priced, and every label, comes from Sada's service catalog, so new services appear without an app update.
- **One price:** choose the platform (or in person) and the service, then the package (only packages not priced yet are offered), the price ($5 to $50,000), the delivery time (in days, within the catalog's range), the number of revision rounds and how long the post stays live (not for on-site visits). Under **Extras**, the page lists the add-ons Sada offers for that service, in Sada's order, each with its own icon and switch: rush delivery, extra revision, exclusivity, paid-ads usage, link in bio and pinned post (an on-site visit has none; which ones appear and their wording come from Sada, so new ones show up without an app update). Switching one on asks for its fixed fee (in dollars) and, where it has one, its duration: rush within 24 or 48 hours, paid-ads usage 30 or 60 days, link in bio and pinned post 7 or 30 days; exclusivity has a single 14-day term, shown as plain text rather than a choice; an extra revision needs only the fee. One duration per add-on. Rush must be faster than the normal delivery time (24 hours needs at least 2 days, 48 hours at least 3), so shortening the delivery time adjusts or turns off rush. Add-ons a newer app version added stay on the price untouched when it is edited here. Once saved, the platform and service are fixed (delete and add again to change them), only what changed is sent, and the page shows the "what's included" list brands see. Deleting asks first. Server errors appear next to the field they concern.
- **Removing a platform** asks for confirmation and warns that its prices are removed too. The last remaining platform can't be removed; the app explains why.
- **My niches:** pick 1 to 3 niches and save.
- **Unsaved edits:** leaving a price or the niches page with unsaved changes asks before discarding them.

#### Journey A3: Editing your own details (different for creators and brands) 🟡
- **Creators and brands edit different things.** The edit button in the Profile header, and the matching "complete your profile" cards, open the right page for the role.
- **Creator, "Personal info":** full name, email (optional), governorate, gender (optional, male or female), area (optional) and a short bio (optional, up to 300 characters, with a live counter). The bio is public on the media kit, so it can't carry contact details: links, @handles, emails and phone numbers (also written in Arabic digits, with spaces or as "dot com") are flagged under the field as the creator types, and the service has the final say when saving. Everything opens filled in with what is saved.
- **Brand, "Company info":** company name, email, business type, governorate and social links (Instagram, Facebook, TikTok first, the rest behind "More links"). Links are checked against each platform's real addresses, like at registration. Email changes apply at once.
- **Brand, "Show my brand on creators' profiles" (🟡, My profile, under Company):** one switch, on by default. When a creator lists the brands they have worked with on their media kit, a brand that turned this off is left out of the list (it still counts in the creator's total). The switch changes at once and goes back with a short message if the save fails; if the setting can't load, a retry is offered instead of showing a guessed value. Creators never see this row. No visible effect yet: "worked with" stays hidden until deals go live.
- **The phone number can't be changed in the app**, because it is the account's identity. It is shown locked, with a "contact support to change your number" link that opens WhatsApp with a ready message.
- Only what changed is saved. Leaving with unsaved changes asks first. Server errors appear next to the field they concern.
- **Verification after registration:** the verification pill under the name on the Profile opens the upload page (creators) or the business verification page (brands) when an upload is possible (never sent, or rejected). A rejection also shows a red strip right under the band with the reason and an "Upload again" button. Creators upload the front and back of their national ID (photo or PDF, up to 10 MB). Brands first pick one of four ways to verify (Journey D); the two document ways open this upload page with the right document types. Files are checked on the phone before sending. While a request is under review, or once verified, the page shows only the status and its date. Sending is limited to 5 tries per hour (shared with registration); when reached, the button shows a countdown. The result arrives as a notification and refreshes the status.
- **Completion adds up to 100%.** Every step the server counts has its own slice of the completion ring and its own "complete your profile" ticket, verification included (35% for brands, 20% for creators), so the tickets always add up to what is missing. Tickets and ring markers are ordered by what each step is worth, highest first; verification goes first on a tie. While a request is under review its ticket only says so; a rejected verification has no ticket because the red strip already asks to upload again.
- **The Profile band (redesigned 2026-10-13):** the same navy hero as the creator Home and the Wallet: it moves slower than the page, stretches when pulled down, and the sections slide up over it as a sheet (unified 2026-10-13). The tab name sits beside two frosted icons (notifications with the unread count, edit info). In the centre, the photo (a rounded square logo for brands; tap to change; an "add photo" outline when there is none) sits inside one ring split into one slice per completion step: done slices are teal, missing ones a faint track, verification under review a dashed blue slice and a rejected one a dashed red slice. Up to three of the most valuable missing steps sit on the ring as small tappable markers showing the points they add, and the percentage hangs at the ring's foot. Below: the name, city (or business type and city for brands) and a verification pill (not verified, under review, verified, rejected). When every step is done the slices merge into one plain ring, gold once the account is verified, with a gold check on the photo, and the markers and percentage disappear. There is only ever one ring around the photo.
- **How the Profile moves:** the ring draws itself once when the screen opens (pull to refresh does not replay it), the markers pop in once, and an unverified account's verification marker sends three soft ripples and then rests. Nothing loops after that; with reduced motion everything appears in its final state. Tapping a marker or ticket gives a light haptic tap. The sections below rise in once. The top bar stays fully see-through until the band has scrolled away, then shows a small photo, the name and the verified mark aligned to the page's start edge (not a centred title), with the icons ending on the page's other edge; Home's pinned bar lines up the same way. The refresh spinner is white on the navy band.
- **Below the band, per role:** the rejection strip (if any), "complete your profile" as tear-off tickets (steps and points to gain in the title), a notifications card only while they are off (a faded notification that never arrived; "Turn on" or, when the phone blocks them, "Open settings"), then the role's blocks. **Creators:** "My platforms" as swipeable cards (follower count, tier, handle, review status; the primary account on navy; a dashed card to link another) and a tools grid: prices (a warning tile with "Add your prices" while none are set), payout methods, the media kit with its public link, whether it is public or private, and a share button, and niches. **Brands:** company info as stacked rows (long business types wrap; links shown one per line, or an "add your account links" shortcut) and the "show my brand" switch as a small navy stage where a warm light falls on the brand's tile when it is shown. Both end with settings in one panel (appearance, notifications row once they are on, language with the current one, password, terms, privacy), then logout, delete account and the version. Platforms, niches, prices and the media kit are creator-only and never appear for brands.

#### Journey A4: The creator Home 🟡
- **What it is (redesigned 2026-10-22, "v3"):** the first tab a creator lands on, built so a creator never gets lost: everything they need to do, and every place they can go, is on this one page. The navy band greets them by time of day with their photo (tap → Profile), name (gold check once identity is verified) and tier, next to the bell (unread count; opens the inbox).
- **Their link, first:** right under the name sits a glass strip with the creator's public link (profile and media kit in one) and whether brands can open it (a mint dot for public). Three one-tap keys: Copy (the key turns mint with a check for a moment, and a toast confirms), Preview as brands see it, and Share. While the kit is private the strip shows a lock, "Your kit is private" and a "Make public" button instead of Copy and Share. A failed share explains itself right under the strip; if the link fails to load, tapping the strip retries.
- **The last 30 days:** three glass cells under the link: storefront views, brands that visited, and reach across every linked account. A number that can't be known yet shows a dash, never zero; tapping opens the insights page, or retries if the numbers failed.
- **The band and the sheet:** the band ends at a clean edge; the page below is a sheet with rounded corners on both sides and nothing in it ever floats over the band. As the creator scrolls, the band's content sinks a little, shrinks and fades behind the sheet; once the sheet reaches the top, a solid navy bar keeps the photo, name, verified mark and tier (tap → Profile), Share (while the kit is public) and the bell in view.
- **One deck of tasks (first in the sheet):** everything waiting on the creator as a stack of cards, the most pressing in front and the next ones peeking from behind. The card names the kind of task and where it sits ("New offer · 1 of 4" with dots), then who, what to do in large type (the service's wording), the price in mint, the time left (amber under 12 hours; "Clock paused" when the service froze it), one button that names the action, and a "Next" key. Swipe the card or tap Next to bring up the next one.
  - *Order:* the one blocker first, in its own colour ("Needs your attention"; for a new creator "Start here"): a platform needs fixing → identity verification was rejected → no price yet → platforms under review (information only) → the media kit is hidden (make it public in one tap). Then the deals waiting on the creator, in the service's order. Before the very first offer, each storefront stage still open joins the deck as a "Get your storefront ready" card (finish your info, add your photo, link your platforms, add your prices, verify your ID); a stage the blocker already asks for is not repeated.
  - *Nothing waits:* a calm card ("Nothing waits on you · The ball is with the brands right now") with the soonest upcoming deadline. A skeleton holds the space while it loads.
- **Sada map:** every place a creator goes, three tiles to a row and two wide ones last: Offers (new count and a red badge), My deals (active count), Campaigns (open count and a teal badge for new invitations; Notifications with the unread count instead when public campaigns are off), Wallet (the balance in mint, masked when amounts are hidden), My prices, My platforms (amber when none is linked or one needs action; "In review" while checked), My media kit (public or private) and My insights. Each shows "…" until its number arrives, never a guessed zero. Offers and My deals open the Deals tab on the right tab.
- **Strikes:** while the creator has a live withdrawal strike, a red bar under the map says so ("You have 1 active strike — see why") and opens the strikes page. No strike, no bar.
- **Your running deals:** up to three deals moving without the creator (the ball is with the brand): the brand, the work, where it stands (the service's wording), a thin bar of the deal's stages, the price and the time left; "All deals (N)" opens the Deals tab. Before the first offer ever the section is a welcome card ("Your first offer is on its way") with shortcuts to set prices and link accounts.
- **Campaigns for you** (only while public campaigns are on): one card with how many campaigns fit and a gold chip for new invitations, then up to three the service ranked, each with its cover, the brand, "Invited" or the kind of campaign, a small bar of seats still free, and what the creator takes home. The card ends with "My applications · N in review", or "Browse all campaigns" when nothing is under review. When nothing fits, a calm card points to the prices.
- **Your money:** the money held for the creator on active deals in large mint type (masked when amounts are hidden), with mint dots travelling from "Your deals" to "Your wallet" and a line that it arrives by itself as each deal is done; "Wallet" opens the Wallet. Nothing held: a calm card that explains when money will show here. When there is a balance to withdraw but identity isn't verified, an amber row ("Verify your ID to withdraw $320.00 available now") opens the ID check. A placeholder holds the space while the wallet loads.
- **Your storefront to brands:** the views of the last 30 days in large type with how many brands looked and the daily views as a small line (tap → insights), the link with Preview and Share (or Make public), whether the kit is public and shows in search, and a nudge to share when nobody has looked yet.
- **Readiness:** a ring that draws itself to the completion percentage, "Your storefront is almost ready" (or "Let's finish your storefront" under 60%) with how many steps are left, the five stages as small tappable marks (a teal check when done, a ringed mark for the next), and one button for the next stage. At 100% it stays as "Your storefront is complete" with a gold check.
- **Feel:** the band's three soft teal lights drift very slowly; pulling down to refresh stretches the band so the page background never shows above it. Numbers roll up once; the sections rise in one after another when the page opens; the price tags swing once on their strings as they appear. Only the lights, the live dots and the money dots move continuously; they pause off screen. With reduced motion everything appears in its final state and the band's content only fades.
- **Media kit insights (🟡):** the creator picks the last 7, 30 or 90 days (today included). Each number (profile views, brands that looked, link opens, shares, and how many times the creator appeared in brands' search results) shows its change against the same length of time just before, or "New" when there was nothing to compare to; numbers the service doesn't report yet stay hidden. Below come a small line of daily profile views, the cities the viewing brands are based in (only once at least three brands have looked, so no single brand can be identified), and the most-viewed portfolio work once portfolios exist. With no activity yet, the page invites the creator to share their link. **Share** is the page's one main button, and a hidden kit asks to be made public first. Pull down to refresh; a failed load shows a retry.
- **Media kit preview (🟡):** the creator sees their kit exactly as brands do, on the same live stage and sections as the public profile (Journey A5): photo, name, pills and reach on the navy stage, then numbers, audience, past work, brands, price tickets under the platform filter and the escrow card with Sada's collaboration terms. Tickets can't be picked here and there is no shortlist or join card. Parts with nothing to show stay hidden. Above the first section, a note says "this is how brands see you", or, when the kit is hidden, a warning with "Make public". Opening the preview never counts as a profile view. **Share** is the one main button; the gear opens the settings.
- **Media kit settings (🟡, from the preview or from My profile):** the creator picks the name in their link (for example `anas.style`). While they type, the app says whether the name is free, already taken or reserved, after a short pause so it doesn't ask on every letter; shape problems (length, allowed characters) are explained straight away without asking the server. A link name can change **once every 30 days**: during that time a note gives the date the next change opens, and going back to the previous name is still allowed (the old link keeps working for 30 days and nobody else can take it). If the server refuses on save (name just taken, still in the waiting period), the reason shows under the field with the date where relevant. A switch shows or hides the kit from brands; hiding asks for confirmation first, because the link then shows "Profile not available" and sharing stops. Leaving with an unsaved name asks before discarding it. At the top, a **cover photo** section frames the picture the way the page shows it (wide strip). The creator picks a photo (JPG, PNG or WebP up to 5 MB), sees it in the frame with a note that nothing is saved yet, and only then confirms; the service crops it to the same strip. A saved cover can be changed or removed (removing asks first; the page goes back to the plain navy band). Uploads are limited to 10 an hour; hitting the limit says so and keeps the chosen photo.
- **Every section stays on Home.** The deck, the map, the deals, money, the storefront, readiness, the audience and the prices always show (campaigns while the feature is on), each with its own loading placeholder, error with retry and empty state that invites the next step, so a new creator never sees a blank page.
- **Your audience (unchanged):** one bar split by platform shows where the followers are, then one row per linked account in the same shade: platform mark, name and handle, a status label only when something needs attention (a review problem first, otherwise "not available"), followers and tier. The primary account comes first with a "Primary" label. A dashed "Add platform" row closes the list; "Manage" opens the list. With no linked account: "No platforms linked yet" and an Add button.
- **Your prices:** every saved price is a tag hanging from one sideways rail on its own string (the place, the service on up to two lines so nothing is cut, the package, the price large), each leaning a little its own way, closed by a dashed "New rate" tag. Tapping any tag, or "Edit", opens My prices. With no prices: "Your list is empty", why it matters, and "Add your prices".
- **Refresh and errors:** pulling down refreshes everything on the page. Each section loads and fails on its own, with its own retry, so one slow answer never blanks the whole screen. A deal notification refreshes the deck by itself.
- **Brands** have their own Home (Journey A4b).

#### Journey A4b: The brand Home 🟡
- **Top:** a greeting with "company · city" (opens the account), the ❤️ for saved creators and the bell with the unread count. Under it, one quiet line holds the money: a mint dot, the available balance (hidden when the brand hid amounts on the Wallet tab) and "available in your wallet", which opens the Wallet; "Top up" sits at its end only when the service allows a top-up. Money never shares the greeting row.
- **Next step:** when the service names one thing to do next (verify the business, wait for review, fix a rejected request, pay for offers creators already accepted, finish the company profile), a tinted card with a pulsing dot under the money line shows its title and line and opens the right page; for offers waiting for money it opens the top-up, and the waiting deals are paid by themselves once the top-up lands.
- **Your deals 🟡:** a section in two layers, so the brand sees at a glance what needs them and where everything else stands. The line under the title counts the deals waiting on the brand (amber) and those moving without them, both from the service; "All your deals" opens the deals tab.
  - *On top, «Your next step»:* one navy card per deal waiting on the brand, soonest first: the creator's photo and name, the work and its price, what to do in large type (the service's wording), the time left (amber under a day; "Timer paused" when the service froze it), and one button that names the action ("Reply now", "Review the draft", "Pay $90.00"…) and opens that deal. "1 of 3" with small dashes counts them; the arrow or a sideways swipe throws the card off with a light tick and the next one rises from behind, whose edge already peeks under the card with who and what comes next. Reduced motion swaps cards at once.
  - *Nothing waiting:* a short calm card with a mint tick, "All your deals are running smoothly · Nothing needs you right now", so the trackers below draw the eye.
  - *Below, «Moving without you»:* every other open deal as one row: photo, name, the work and the service's stage, the amount, and a straight tracker Agree ← Prepare ← Publish ← Done whose current stop pulses gently. A dispute turns the current stop red and names it with the service's word. "All your deals (n)" closes the list when the service has more open deals than it sent. Tapping a row opens the deal.
  - *No open deal:* a calm card ("No deals in progress right now", true whether or not the brand had deals before) with two creators from the rows below and a "+", one line on how deals work here, and "Discover creators", which opens Explore.
  - *Loading and errors:* a skeleton in the card's and rows' shape while Home loads; if Home fails, the section simply stays out and comes back with a pull. A deal notification refreshes it on its own.
- **The question:** a big headline, "Who will tell your story this week?", then a tall search pill (opens Explore with the keyboard ready) with a navy filter key (opens Explore to browse). Category chips follow: "All", then the service's categories with an icon each, opening Explore already filtered.
- **Creators near you, as stories:** the "Near you" creators come as a stack of full-photo cards with story bars on top. Swiping the top card away (either side) brings the next one forward with a light tick; the deck loops. Each card shows the tier, the verified mark, ❤️, the name, city and niche, followers on the main platform, fastest delivery, and the starting price (or a lock with its reason). Tapping a card opens the creator's public profile (counted as a view from search). Screen readers get a "Next" action instead of the swipe.
- **Every other row has its own shape:** "Verified" as tall photo tiles, each with tier, niche and city, followers with the platform, and the starting price; "Fast delivery" as ruled rows (photo, name with verified mark, starting price, niche and city, tier and followers) with the delivery days as a big teal figure at the end; "New on Sada" and "Recently viewed" as story rings with first names. Empty rows are never shown; rows the service gives a "See all" for open Explore with that row's filters.
- **Save (❤️):** fills at once and pops; if the service refuses (for example the 200-creator limit), it springs back and a message explains why. A creator saved in one place shows as saved everywhere.
- **Help:** a closing line opens Sada support on WhatsApp; hidden when the service sends no support link, never inside a deal.
- **Loading and errors:** a skeleton of the deck and rows holds the space while Home loads; a failure shows a banner with Retry and a dash for the balance; if every row is empty, a note invites the brand to explore all creators. Pulling down refreshes. Because each Home visit counts as an impression for the creators shown, the app asks the service again on return only when the page is more than two minutes old.
- **Tab bar:** the same docked bar for both roles: icon and name on every tab, the active one in a teal squircle under a teal rail that stretches toward the tab being pressed. The deals tab carries an amber count of the deals waiting on the brand only (the service's number, "9+" above nine; read out with the tab's name), updated whenever Home refreshes.

#### Journey A4c: Explore creators 🟡
- **Search:** type a name, a niche or a city in Arabic or English (for example "مطاعم دمشق"); results update a moment after typing stops. One letter is not enough to search; up to 60 characters.
- **Quick chips:** under the search, "Filters" (with how many are set), the current sort, the category picked on Home (× removes it), and one-tap "Verified" and "Rush" toggles.
- **Filters sheet:** governorate, platform, niche (a few shown, "+ more" for the rest), tier, follower range, delivery time, verified creator, verified followers, rush, visits on site, and a price range with "within my budget". Changes stay in the sheet until "Show results"; "Reset" clears the sheet. A reversed range (minimum above maximum) is read the way it was meant.
- **Sort sheet:** best match (default; favours the brand's own city when no governorate is picked), most followers, newest, fastest delivery, and price low/high.
- **Results:** creator rows with photo, name and verified mark, tier, city and niches, followers, fastest delivery, on site, "New", and the starting price in dollars with a rough Syrian-pound value. More rows load as the brand scrolls; there is no total count. Tapping a row opens the creator's public profile (counted as a view from search); ❤️ saves, as on Home. A small teal handshake disc in each row's lower corner starts a direct offer to that creator straight away (the offer builder's own check decides whether it can go ahead, Journey F step 1).
- **Prices before verification:** a brand that isn't verified sees a lock instead of prices, and a banner at the top of the list with the one step that unlocks them (verify, fix a rejected verification, or finish the company profile; "under review" has nothing to tap). Price filters and price sorts are shown with a lock; tapping one opens a sheet explaining why, with that same step. They are never sent while locked, and if the service still refuses one, the app drops it and shows the same sheet instead of an empty list.
- **Empty and errors:** no results says so, and offers "Clear filters" when filters are set (the search and sort stay). Loading shows skeleton rows; a failure shows Retry; pulling down refreshes.

#### Journey A4d: The Shortlist (saved creators) 🟡
- **Opening it:** the ❤️ beside the bell in the Home header. The list is asked for again on every visit, so a creator who became unavailable since the last visit has already dropped out.
- **The list:** the same creator rows as Explore (price or lock line included, handshake disc to start an offer), newest saved first; more rows load as the brand scrolls, with no total count. Tapping a row opens the creator's public profile (counted as a view from search).
- **Removing:** tapping the filled ❤️ takes the row off the list at once and unfills the heart wherever that creator shows (Home, Explore). Once the service confirms, a message names the creator with **Undo**, which saves them back. If the service refuses, the row returns and a message says the shortlist couldn't be updated.
- **Limit:** a brand can save up to 200 creators; saving one more anywhere springs the heart back with "Your shortlist is full (200)".
- **Inviting to a campaign (🟡):** the header's invite button turns the list into a pick list (a tick on each card instead of the heart and the handshake; a tap picks or drops, up to 100 at a time). A tray at the bottom shows the faces picked and the Invite button. It opens a sheet listing the brand's open campaigns (the newest is ready; a campaign that is full, suspended or closed is not offered). Sending shows the service's report for every creator: invited, or left out with the service's own reason (not on the shortlist, already invited, already applied, not eligible with what is missing, or the campaign's limit of 50 invitations reached), and how many of the 50 are used. Invited creators are notified, see the campaign first with an «Invited» badge, and show in the applicants table's «invited» filter. If the campaign stopped accepting applications meanwhile, the sheet shows the service's message and the list of campaigns refreshes. Done leaves invite mode.
- **Empty and errors:** an empty shortlist says "Save creators here", explains the ❤️, and offers "Explore creators". Loading shows skeleton rows; a failure shows Retry; pulling down refreshes.

#### Journey A5: Opening a creator's shared link 🟡
- **What it is:** a creator shares their media kit link (on WhatsApp, Telegram or anywhere). When someone with Sada installed taps it, the app opens straight on that creator's public profile instead of the web page. The web page's "Open in app" button does the same.
- **Who sees it:** signed-in brands and creators open it over their tabs; people who aren't signed in see it over Login, since the profile is public. If the app is still on another screen that must come first (language choice, intro slides, maintenance, an unfinished registration, a suspended account), the link waits up to 30 seconds and is then dropped, so nobody is thrown into a profile minutes later.
- **What it shows («The stage» layout, 🟡):** the page opens on a live navy stage: the creator's photo in the middle with echo rings leaving it and a slowly turning teal-and-mustard ring around it, the verified seal, the name (up to two lines), their handle, a two-line bio, then pills for tier, the first niche (a "+N" pill opens the other niches underneath) and city. Below, the total followers roll up in a large number, with a bar split in each platform's own colors and a tile per platform (followers, verified mark, share of the total; one tile centred, two side by side, more in a 2 × 2 grid). Waves melt the stage into the page; a cover photo, when set, shows faintly at the top of the stage and melts into the navy further down, so it never ends in a visible edge. Then, each section rising in as it scrolls into view: **the numbers** (engagement with a ring, average views, share of the audience inside Syria, campaigns completed with the faces of brands served; only what the service reports), **the audience** (women / men bar, top cities, age groups with the biggest highlighted, and the source), **past work** (four in a staggered two-column grid, "See all" opens the rest in place, a tap opens the photos full screen), **brands worked with on Sada** (one row of wide cards that scrolls sideways, each about two fifths of the screen so the next one peeks in: logo beside the full name and the number of campaigns; the title carries the full count), **prices** and **the escrow promise**. Prices: with more than one platform, a row of platform pills (logo, name, number of packages) sits above the tickets and switches them; one platform shows its tickets straight away. Each price is a ticket: what is offered (delivery, revisions, how long it stays up, "Details" for inclusions and add-ons, always in the same order: rush delivery, extra revision, exclusivity, paid-ads usage, link in bio, pinned post, each with its own icon, its duration where it has one ("Pinned post · 30 days", "Rush delivery · 24 hours") and its fee; a kind of add-on this app version doesn't know yet is left out instead of breaking the page) and the price on a stub past a tear line; "Fastest" marks the one service that is strictly quickest. Up to four per platform; "All prices (N)" lays every ticket out and "By platform" goes back. Brands who can see prices tap tickets to build an estimate, and picks stay when switching platform. The escrow card shows a coin travelling brand → Sada escrow → creator, held while the work is done, released after "Published", with the same three moments written underneath and lit in turn; "Terms (N)" opens the creator's collaboration terms. Visitors without an account end on a card inviting them to create their own media kit or start a campaign as a brand. Every animation pauses off screen and under reduced motion everything shows at rest; only the parts of the stage that actually move are redrawn, so scrolling stays smooth. A section with nothing to show stays out. Pull down to refresh. The bar at the bottom (price and save, the unlock step, or Share on the creator's preview) stays out of sight when the page opens so the stage shows whole, and slides up once the visitor starts scrolling down; back at the top it slides away again. The same page opens from brand Home, Explore and the shortlist.
- **Picking services and saving (brands, 🟡):** a brand that can see prices taps "Add" on the services it needs; the card highlights and the bottom bar switches from "from $X" to "2 services picked" with the estimated total rolling to its new value (an estimate of the base prices only; the real offer is priced by the service). Direct offers are not live yet, so the bar's main button saves the creator to the shortlist (then becomes "View shortlist"); the heart in the top bar does the same and removes them again (filled while saved). The heart shows only when the service says shortlisting applies to this viewer, so guests, creators and the creator themself never see it. A full shortlist (200) says so. Picks are not kept after leaving the page. A share icon appears once the service sends the profile's public link.
- **Locked prices (🟡):** when the viewer may not see prices, every price still says what it offers (service, package, what's included, rush delivery) but shows a lock instead of the amount, and a bar at the bottom explains why with one step: an unverified brand gets "Verify now" (opens business verification), a rejected one "Review verification", a brand with an unfinished company profile "Complete your company profile"; a brand in review gets the explanation only. Someone not signed in gets "Sign in" (back to Login), and a creator viewing another creator sees a plain note. After verification is sent or approved, the profile is loaded fresh, never from the locked copy.
- **Counting views:** each opening counts one profile view for the creator's insights (a brand who is signed in also counts toward "brands that looked"). Counting happens quietly in the background and never slows down or blocks the page; the creator's own visits and quick repeats are not counted by the service.
- **Old links keep working:** if the creator changed their link name in the last 30 days, the old link still opens their profile, and the app switches to the new name behind the scenes.
- **Safety:** only links on Sada's own web address in the form "/c/name" (or the app's own link type) are accepted, and the name must follow the link-name rules; anything else just opens the app normally. A profile that is hidden, suspended, deleted or simply doesn't exist always shows the same "Profile not available" message, so a link never reveals which one it is.
- **Not live yet:** links on the web address open the app only once Sada's permanent public web address is set and the app is registered with it; until then only the "Open in app" button works.

#### Journey B: Brand registration ✅
1. **Create account** (name, phone, password) → SMS code is sent.
2. **Verify phone** (same protected code screen as creators).
3. **Business profile:** company or store, business name, industry, and social links (Facebook, Instagram and so on).
4. **Business verification (optional):** the brand picks one of the four ways described in Journey D. Picking an option is the action, so the bottom bar holds only "Skip for now" (with the note "You can verify later from your account"). Once a document is sent, a confirmation email is sent, or a page-proof code is created, registration moves on to Welcome while the review continues in the background; "Pick another way" always returns to the four choices. 🟡 awaiting device and live-server testing.
5. **Welcome**, then the main app.

#### Journey C: Resuming an unfinished registration ✅
If someone closes the app halfway through, the next launch (or login) asks the server "what step is this user on?" and takes them **straight to that step**. If two devices or a slow network get out of sync, the app re-checks with the server and reroutes instead of showing an error. A step is never submitted twice by accident.

#### Journey D: KYC (identity and business verification) ✅ creators · 🟡 brands (four ways, awaiting device and live-server testing)
- **When:** verification is an optional final step of registration for both roles, and can be done later from the Profile's verification card.
- **Creators:** upload the front and back of their national ID; the team reviews it, and the status moves through *unverified → pending → verified* (or *rejected*, with the option to upload again).
- **Brands choose how to verify.** Many Syrian businesses have no company papers, so brands get four ways, and passing any one is enough. The page groups them as "with documents" and "without documents":
  1. **Commercial register or license** (registered companies): commercial or industrial register, or trade license, one file. Reviewed by the team.
  2. **Owner's national ID or passport** (home businesses and freelancers): front and back of the ID, or one passport page. Reviewed by the team.
  3. **Instagram or Facebook page proof** (stores that live on social media): the brand pastes their store's page link (only real Instagram or Facebook page addresses are accepted), Sada creates a code, and the brand sends it in a direct message **from the store's account** to Sada's official account. On Facebook, Messenger opens with the code already typed; Instagram can't pre-fill a message, so the code is copied first. A person on Sada's team matches the code by hand, so the app never promises instant approval. A code never expires; creating a new one replaces the old one (the app asks first). While a code waits for review, the page checks again each time it is opened and every minute while it stays open.
  4. **Official domain email** (businesses with a website): the brand enters their domain and an email on it; public email providers (Gmail, Hotmail and the like) are refused, and the email must be on that exact domain. Sada emails a confirmation link; opening it verifies the business at once, with no human review. The page shows when the link expires, a "Resend" button that waits a minute between sends, and "I opened the link, check again". An expired link offers a new one.
- **One page shows where things stand:** requests in progress (under review, awaiting confirmation, rejected with the team's reason) appear at the top with the other ways still available below, because a rejection or a pending request never blocks another way. Once verified, the page shows a gold "Your business is verified" card naming the way that was approved and the date. Status names come from the server in the user's language.
- **Results arrive as notifications** (page proof approved or rejected, domain confirmed) and open this page.
- **Limits** (enforced by the server, shown as a countdown on the button): 5 document uploads, 5 page-proof codes and 3 confirmation emails per hour; a confirmation email can be resent only once a minute. Once a brand is verified, every way is closed.
- **Privacy:** only Sada's verification team sees the files and details.

#### Journey E: Login, forgot password and suspension ✅
- **Login:** phone and password. Too many attempts show a "please wait" message.
- **Forgot password:** phone → SMS code → new password → back to Login with the phone number already filled in.
- **Suspension:** if the platform suspends an account, the app switches immediately to the Suspended screen, wherever the user was. From there they can contact support on WhatsApp (for account support only, never for deal actions), re-check whether the suspension has been lifted, log out, or delete their account.

#### Journey F: The direct deal lifecycle 🟡 foundation + offer builder + deal guide + deal board + deal page + reply and payment + drafts and review + publishing + ratings + shipping + changes built
A brand asks one creator for specific work at the creator's fixed prices (public campaigns come later). The deal's states, the server's labels and the actions each side may take are now built into the app and tested; the offer builder, the deal guide, the deal board, the deal page, the contract, the reply and payment actions, the drafts and review, publishing and verifying, ratings, product shipping, cancellations, withdrawals and extra work are built (awaiting device and live-server testing); disputes follow.

1. **Offer (🟡 built).** On a creator's public profile the brand picks services and taps "Request a direct service", or taps the handshake disc on that creator's row in Explore or the Shortlist (the builder then opens with no service picked). The builder first checks the brand may send (verified business, creator open to offers, no open offer with this creator yet, under the open-offer and draft limits); if not, a calm page says why, with the one step that fixes it and anything else that also blocks. Otherwise three steps under a navy header: close, the creator in the middle and the save state in words («saving…», «saved», «not saved»), and below them a step rail where the current step opens into a white capsule with its icon, name and position («2/3»), finished steps show a check and take the brand back when tapped, and coming steps show their own icon. Scrolling down tucks the top row away so only the rail stays; scrolling up brings it back, with a floating navy bar at the bottom carrying the live total and "Continue" (asleep until a service is picked): **services** (quantity up to 10 per service and 20 per offer, fixed-price add-ons, whether a product ships as a gift or a returnable sample, a deadline: as soon as possible, two weeks, a month or a number of days, or rush delivery when offered), **brief** (one-tap templates, talking points with a tone, don'ts, hashtags, mentions, discount code, tracking link, up to 5 images or PDFs; everything optional and part of the contract) and **review** (the deal as one clean business card: brand and creator side by side, what is bought with retention and revisions, the server's total, delivery time, product shipping and brief items, a note on where the money waits in escrow, and a link to the full contract terms; the creator's average views when known, the wallet: nothing is charged now, the amount is held only on acceptance; a short balance is a warning, never a block). The total always comes from the server, live as the brand builds. After the first step the offer saves itself as a draft (a brand coming back to the same creator is offered to continue it; drafts expire after 30 days untouched). The brand signs by pressing and holding the capsule at the bottom for a second until it fills. If the creator's prices changed meanwhile, a sheet shows old and new totals and the brand signs again or edits. Once sent, the ticket is stamped "Sent", the journey moves to the creator's reply with a live countdown, and a short wallet gets a one-tap prefilled top-up.
   - **The deal journey** (on the review step and after sending): every station of the deal on one line (sign → reply → escrow → shipping, only with a product → creation → your review → publishing → complete), drawn up to "now" with a light running to the next station. Tapping a station or swiping the card shows its status, who acts (you, the creator or Sada), how long it takes (hours and days from the server's windows, never calendar dates), what happens, your part and what happens if it is late. Under reduced motion everything shows at rest.
   - **The deal guide** ("How a deal completes", one page for brands and one for creators): a navy hero with a station map (tap jumps to that chapter) and three trust facts, then one chapter per station (who acts, how long, what happens, key points, what if late) and common questions. A bar slides in after the hero with "station n of N" and reading progress. The shipping chapter is shown, tagged "with a physical product", in the general guide (Settings) or a deal with a product, and left out entirely when opened from a digital deal.
   - **The deal board** (the deals tab, both roles, 🟡 built): a big title with how many deals are moving, then tabs (brands: active, drafts, closed; creators: new offers, ongoing, closed), each with its count. A creator with active strikes first sees a calm amber strip: how many are active and when the soonest clears; tapping it opens their strikes. It disappears once the record is clean, and refreshes whenever a deal moves or a strike notice arrives. On top, «your turn now»: every deal waiting on the user as a stack of navy passes, soonest deadline first, each with a ring of the time left and the one thing to do; swipe for the next, tap to open. Then one ticket per deal: who and how much, a full-width line with the server's status and the time left (the line fills as the window runs out, turns amber under 12 hours, shows stripes and "timer paused" when the server froze it, or when it closed), every stage of the deal by name (done ticked, now ringed, next dashed; tap or slide a finger across them for a bubble that explains the stage, with a light tap of haptics), and a "next" line saying who moves and what. Whose turn it is comes from the deal's status and deliverables; the server still checks every action.
   - **The deal page** (🟡 built): the same navy hero as Wallet and Profile, which the page slides over as it scrolls. In it, the deal as an orbit: the outer ring is drawn up to now, the inner ring fills as the current window runs out, a small light runs toward the next stage, and the other side's photo sits in the middle with the time left ticking. A dispute marks the stage red; a deal that ended early freezes grey with a ✕ where it stopped. Tapping a stage or swiping the orbit changes the stage card below: what that stage means for the user, their part, and what the history recorded there with times (notes such as "product shipped" or "rating sent" included). Below the hero, the next step and who acts (or, for an early end, how it ended and what it meant for the money); then the **offer file**, the same for both sides, in numbered chapters: what was ordered (each deliverable with its delivery window, revisions, how long it stays up, every add-on and its own status; prices for the brand only), what the ad says as a numbered script with a red «avoid» box, the hashtags, mentions, discount code and tracking link (one tap copies each, ready to paste into the post), the attached files (photos open full screen; videos and documents show their type, name and size and open with the drafts viewer later), and delivery and shipping (deal type, work time, sent date, and the total for the brand). Chapters with nothing in them are left out. The stage card comes after it. Station names on the orbit keep clear room from the ring and sit above everything drawn on it. The header holds the contract and the deal guide. While the deal waits on the user's answer, money or the product's shipping, a decision bar is pinned at the bottom (steps 2 to 4 below).
   - **The contract** (🟡 built): the signed contract in Arabic or English (the Arabic text governs): both parties with their identity check, deliverables, the total, Sada's commission, the cancellation fee and the free-cancel window, the schedule, shipping and every term; then who signed and when, and a fingerprint of the text that any change would break (copyable). Each addendum (deadline extension, extra work) follows with its clause and its own signatures.
2. **Creator reply (48 hours, 🟡 built).** A slim decision bar is docked full width at the bottom of the deal page, so it never crowds the deal on short phones. On top, one thin clock line: a live dot, what the clock waits on («the offer closes in»), the time left, and right under it a hairline ruler with one tick per hour of the window (the hours gone dim, the current hour breathes, a longer tick every six). Under 12 hours left the clock line turns amber. Below it, one main button «accept» with the deal value, and «more time» and «decline» as two outlined halves of one row. Every sheet the bar opens has a white header with its title, its content on the light grey page color, and its decision pinned in a white footer that stays above the keyboard.
   - **Accept:** a sheet shows what the creator signs as a slip: the deal value with «held by Sada before you start», then each commitment in turn (the deliverables, the delivery time and, with a product, that the clock starts on receipt, the revisions and how long posts stay up when every deliverable shares them), a link to the full contract, and **press and hold to sign** (hold for one second while a ring closes and the button fills; letting go early drains it and asks to keep holding; screen readers sign with one action). It replaced sliding, which was unreliable on Android. If the brand's wallet is short, the creator is told the deal now waits for the brand's payment.
   - **Decline:** four reason tiles (schedule full, not a fit, on vacation, something else); «something else» asks for a short note (up to 500 characters). Declining before accepting records no strike.
   - **More time (once per deal):** a ruler of days from today's delivery time up to 14 more; dragging snaps to a day with a light tap and shows the new total and how many days it adds. A reason (3 to 500 characters) is required. Asking signs the contract and the time addendum by pressing and holding; the brand then has 48 hours, and declining it cancels the offer.
   - **The brand's answer to more time:** the request appears as the deal's next step: the offer's time as a block with the added days stretching out of it in stripes, the new total, and the creator's reason quoted. «Approve and sign» signs the addendum by pressing and holding and holds the money at once; «decline» confirms that the offer will be cancelled and nothing charged. While the creator hasn't answered yet, the brand's bar shows the same clock («waiting for a reply») and an outlined «withdraw offer» button, with a line saying nothing has been charged and withdrawing is free before acceptance; withdrawing asks for an optional reason.
3. **Payment (24 hours, 🟡 built).** If the brand's wallet is short when the creator accepts (or the brand approves more time), the deal waits for payment. The brand sees what the wallet still lacks as the headline, a bar of covered against missing, and a dial draining the 24 hours. The main button tops up exactly the missing amount (the top-up form opens prefilled) and a top-up pays the waiting deal by itself once approved; «fund now» retries by hand. A frozen wallet says so and offers support instead; a brand whose top-ups are switched off is told so. The brand can still withdraw the offer, nothing charged. Paid money is held in escrow. If time ran out in the meantime, the app says «the offer has closed», reloads the deal and shows how it ended.
4. **Product (only when there is one, 🟡 built).** Shipping sits on the deal page as one card shaped like a waybill: a navy head with the courier and the shipping date, the brand and the creator on either side of an arrow, a torn-off edge, then the tracking number in big type with a barcode drawn from it, «copy», «track» and, for the brand, «edit».
   - **The delivery address (asked at signing):** when the offer includes a product, accepting it (or asking for more time) first asks where it goes: the recipient's name, a Syrian mobile the courier will call, the governorate, city, area, the street line, and an optional landmark and note for the courier. The form starts from the address used last time (or the account's name and phone). The signature sheet then shows «ships to …» with «change». The creator can change it until the product is on its way; the brand sees it only while it has to ship, with one tap to copy it for the courier.
   - **Ship (brand):** a decision bar with the ship-by clock opens a sheet: pick the courier from quick choices (Al-Qadmous, Aramex, Syrian Post, direct delivery) or «other» to type one, the tracking number, and an optional tracking link. The label at the top fills in as the brand types. The link must start with https://; anything else is caught before sending. The brand can correct the details until the creator confirms receipt or reports a problem.
   - **On the way:** a row of day cells counts the days up to day 7, the day a delay can be reported; «track» opens the courier's page in the browser, only for a well-formed https link.
   - **Received (creator):** pressing and holding «confirm receipt» starts the work clock; afterwards the shipping card shrinks to a receipt row with a green «received» stamp.
   - **A problem (creator):** «a problem?» under the receipt button opens a report: damaged, incomplete or wrong item (1 to 5 photos required, sent in original quality as evidence), delayed (locked, with how many days are left, until the server's day) or something else (a note required). Sending pauses every deal timer and the waybill gets an amber «problem» stamp.
   - **The brand's answer:** re-ship (a new waybill, while re-ships are left) or cancel; cancelling shows the refund to the wallet and is pressed and held. Both happen under the answer clock.
   - **Free cancel (creator):** if the brand misses the ship-by time or leaves a report unanswered, the server opens a free cancel; pressing and holding it ends the deal with no effect on the creator's rating.
   - Earlier shipments stay listed under the card with their problem and photo count.
5. **Work, per deliverable (🟡 built).** While the work is on, the deal page shows a **delivery track**: one card per deliverable with its status in the server's words, a short bar per possible round (amber = sent back, teal = now, empty = still open), whose clock is running and the button for whoever must act; the next-step card carries the same button.
   - **Hand in a round (creator):** if the brand sent the last round back, its notes come first as a torn-off amber ticket (the overall note, then each note with its file and second). The files sit on a strip of film: up to 10 photos or videos from the gallery in original quality, each one «developing» from a navy veil as it uploads, with retry or remove on a failed one and a long press to move it to another place (the order is the post's order). The caption is written as the post will show it, under the creator's ring and name, up to 2,200 characters; the brief's mentions, hashtags and discount code are one tap away and turn into a check once they're in. A revision round starts from the caption the brand already saw. The hand-in bar shows the brand's revisions left and fills while files upload; handing in is a plain press. After it, a seal turns once and the round stays visible, read only, with how long the brand has to review. Leaving with picked files asks first.
   - **Review a round (brand):** the round plays on a navy stage with a countdown to its automatic approval. Under a video, a timeline fills as it plays; pressing and holding it pins a note at that exact second (a light tap, the video pauses), and any file can get a note as a whole. Notes show as cards and can be removed before sending. The brand then either **asks for changes** (an overall note up to 2,000 characters plus up to 20 pinned notes, each up to 500; the sheet says which round it uses and warns on the last one) or **approves** by pressing and holding, which moves the deliverable to publishing. Earlier rounds and what was said on each stay below as the record.
   - **Out of rounds:** asking for changes with none left opens an **extra round** at the creator's fixed price, quoted by the server first (price, rounds before and after, and what the wallet lacks, with a top-up for exactly that); pressing and holding signs the request with this phone. Nothing is charged until the creator accepts (the creator's side arrives with upsells).
   - **Creator late on changes:** once the revision window has passed without a new round, the brand can approve the last round as it is.
   - If the brand stays silent for 48 hours the round is approved automatically.
6. **Publish and verify (🟡 built).** Once a draft is approved, the deliverable's button on the delivery track opens publishing instead of drafts.
   - **Hand in the post (creator):** a navy studio with an «ON AIR» lamp that stays dark until the post is ready, then lights teal with a light tap. The link goes in a field shaped like a browser address bar (or «paste» from the clipboard); the platform's icon lights up as soon as the link belongs to it, and a link from another platform or that isn't a link is caught before sending. The server then checks the link really is from the creator's account in the contract; if it refuses, the field shakes and says why in plain words with what to do (not a valid link, not from this platform, from another account, or already used for another deliverable). One to three screenshots of the post are added as phone screens that «develop» as they upload (photos only, original quality, kept as deal evidence). A deliverable without a platform (a visit or event) can go without a link. If the brand asked for a fix, its note leads, with which fix request it is and which submission it was about. After handing in, the screen becomes a broadcast ring with what was sent and the time until it is confirmed automatically; once confirmed, a teal stamp.
   - **Check the post (brand):** the post sits on a glass card in the navy hero: the creator with the platform on their photo, the link with «open» (only links on the known platforms open, straight in the platform's app or browser), and whether Sada matched the account to the contract. When it couldn't read the account, an amber «account not checked» tells the brand to rely on the screenshots. The screenshots follow as phone screens (tap to zoom full screen), then a fuse counting down to automatic confirmation, and the record of every submission and what came of it. The brand **confirms** by pressing and holding; on the last deliverable a mint line says confirming completes the deal and releases the escrow. Or the brand **asks for a fix**: a sheet with quick reasons that write the note (editable, up to 2,000 characters, required), and which of the two allowed fix requests it is. The creator then has a short window to send a correct link. With no fix requests left the button disappears (a dispute is the way then).
   - If the brand stays silent for 48 hours after the post is handed in, it is confirmed automatically. When every deliverable is confirmed the deal is *Completed* and the money goes to the creator's wallet minus commission.
7. **After: mutual rating (🟡 built).** Once the deal completes, each side rates the other blind for 7 days; neither sees the other's answer until both have answered or the 7 days end. The brand rates the creator on content quality, timeliness and communication; the creator rates the brand on brief clarity, review speed and clarity of revision requests, each 1 to 5.
   - **The invite:** the completed deal page shows one card: «rate your experience with …», «3 questions · under a minute», a ring of the days left and one «start rating» button. If the other side has already rated, a line says so: rating back opens both now.
   - **Rating:** a sheet rises only as tall as it needs, so the deal stays in sight above it. The other side's face and «private until both open» sit over a deck of question cards: one criterion per card, with five tall pads from 1 (poor) to 5 (excellent), each with its word. A tap lifts the pad with a light buzz, and a moment later the card flies off and the next one rises; «back» and «skip» sit on the card itself. The last card sums up the three scores (a tap goes back to that question) with an optional note (up to 1,000 characters) and «seal rating», a plain press because a rating moves no money.
   - **Sealed:** the same sheet turns into the seal moment: a wax seal presses onto your envelope with your average in it (a heavier buzz), the other side's envelope waits beside it, and a clock says the latest they open. After that the deal page shows both envelopes in one card until the reveal. (The server keeps your own scores hidden until the reveal too, so the average on your envelope shows only right after sending.)
   - **Skip:** skipping asks first, because it is final: the server takes no rating from that side afterwards. You still see what was said about you at the reveal.
   - **The reveal:** what the other side said about you comes first and big: their average with stars, a bar per criterion filling in, and their note. Your own rating of them is one row that opens on tap. A side that skipped or never answered says so in words.
   - A closed window or a second answer from another phone shows the server's message and refreshes the deal.
   - **Keep-up period (🟡 built, not yet device or live-server tested):** once the deal completes, a «Post retention» section shows one card per post: a ring that empties slowly as the agreed time runs (drawn once, no loop), the time left large, and the period it belongs to; a permanent post keeps a full ring with the date reports stay open until; a finished period closes into a full green ring with a check. The brand sees a low red «Report a problem with the post» link while a report is allowed; the creator sees a reminder that deleting or hiding the post can record a strike.
   - **Report (brand):** a sheet with what happened as tiles (deleted, made private, changed, other), a note (required for other), 1–3 screenshots shown as phone screens uploading with progress, and a plain «Send report» button. The creator then has 24 hours.
   - **The case card:** every report sits near the top of the deal page, open ones first, under a tinted band that says where it stands for the viewer (amber waiting for the creator, green restored, grey with the team or closed, red when the team upholds it). It shows the reason, when it was reported, the note and screenshots (tap to view full screen), the creator's restore (the link, which opens only on a known platform and is otherwise copied, whether the account matched, and the screenshots) or contest note, the brand's rejection note, the team's note, and any amount taken back (green for the brand who got it, red for the creator who lost it). While a side has to act, the card counts down the server's deadline and says what happens when it runs out.
   - **Answer (creator):** «I restored it» opens a sheet for 1–3 screenshots and an optional new link (a refused link says why, as on publishing), or «Contest instead»; «Contest» asks for a note and warns that an upheld report can record a strike and take money back.
   - **Decide (brand):** «Confirm restore» closes the report; «Reject» asks for a note and sends the case to the team.
   - A case that moved in the meantime (a timer ran out, the window closed) shows the server's message and reloads the deal.
8. **Changes mid-deal (🟡 built).** Low on the deal page, quiet and never a big button, sit the ways to change a running deal; the page shows none of them once a deal has ended.
   - **Cancel (brand):** «Cancel deal» opens a sheet that follows the service's terms. Free cancel (before work starts) shows the held amount, a bar that is entirely green (all of it returns to the wallet) and how long it stays free. A kill fee shows one bar in three colours: green back to the wallet, amber for the creator's compensation and grey for Sada's fee, each with its amount. When work has started and drafts were handed in, the only way out is a dispute: the sheet explains it and the held amount that waits, with a button that opens one. Otherwise the brand picks a reason (no longer needed, budget changed, timing changed, other) with an optional note and presses and holds to cancel (the button shows the fee when there is one). If the terms moved while the sheet was open, a banner shows the old and new compensation and the brand confirms again.
   - **Withdraw (creator):** «Withdraw» warns first that it records a strike, with a row of dots for the active strikes and a dashed red dot for the new one, how many are active and how many days a new one lasts, and a «what are strikes?» link to the strikes page. The creator picks a reason (schedule full, personal, concerns about the brief, other) and holds to withdraw. When the free shipping cancel is open the sheet offers that instead, with no strike.
   - **Strikes (creator):** a count, then one card per active strike with its reason, date and a fuse that burns down to the day it disappears (days left in words). A clean record is a calm page of its own; pulling down refreshes. The page is reached from the withdraw sheet and from the «strikes cleared» notice.
   - **Extra work, sent (brand):** «Add a service or add-on» opens a page with two choices: a new service from the creator's prices (the same cards as the offer builder, one at a time, with quantity and add-ons) or an add-on on a deliverable already in the deal. The service's price appears as the pick changes, with the deal's value before and after and whether the wallet covers it; a short wallet turns the button into a top-up of exactly the gap. Holding sends it. Waiting for the creator, the page shows the addendum with its countdown and «Withdraw addendum».
   - **Extra work, received (creator):** the addendum sits near the top of the deal page as a page clipped to the contract: what it adds, the extra money in green, the deal's current value, how long the request stays open and, when it applies, that the review timer is paused until the answer. Holding signs it (it joins the contract); «Decline» asks for a reason (schedule full, not a fit, other). Answered addenda are listed at the bottom with their outcome.
9. **When things go wrong (🟡 built, not yet device or live-server tested).** Either side can open a dispute; the deal's timers pause and Sada's team rules a refund, a payout or a split.
   - **Open:** a low red «Open a dispute» link near the bottom of the deal page says how many disputes are left. The sheet says first what changes (brand: timers and money freeze; creator: losing records a strike, with the active count), then the side's own reasons as tiles, the statement (20 characters at least), that both sides then have 24 hours for evidence, and press and hold. When a dispute can't be opened (limit used, the deal's state), the sheet says why and offers support instead.
   - **On the deal page:** while a dispute is open or ruled, a navy slip replaces the next-step card: the reason, the evidence countdown with a bar, then the team's target time, then the ruling and what it means for the viewer's wallet. Tapping it opens the dispute file.
   - **The dispute file:** a pair of scales on the navy hero with the held amount between the pans: the viewer's pan on one side, the other party's on the other, each with how many entries it holds. The beam sways slowly while the case is weighed (still under reduced motion and when the screen is out of view); after the ruling it tips once toward the side it favoured and that pan lights in mint, and the centre shows what the viewer gets. Below: the evidence window (countdown, then «under review» with the target time), or the ruling (the viewer's amount large, one bar split into back to the brand, to the creator and Sada's fee, and the team's reason); the opener's statement; then every evidence entry on a centre spine, the viewer's leaning to one side and the other party's to the other, each with its note, links, files (photos open full screen; a purged file says so) and what it points at (a draft, a proof, the brief, a shipment photo). Pulling down refreshes; the contract is one tap away in the header.
   - **Add evidence:** a sheet with a required note, photos and video or files (PDF) uploaded as they're picked with progress, retry and remove, https links added one by one, and the courier's problem photos to tick. It shows what's left for the side and says that sent evidence can't be edited or removed.
   - **Withdraw (opener only):** a confirm sheet with how many disputes are left on the deal; the deal resumes where it stopped and the page returns to it.

Every status shows the server's own wording with an icon and colour, never colour alone. Timers count down from the server's deadline and show "paused" when the server freezes them. Prices are in US dollars only, exactly as the contract states them. If the deal changed in the meantime (the other side acted, a timer ran out), the app shows the server's message and reloads the deal.

Deal notifications lead somewhere safe: every deal notice (and the matching inbox entry) opens that deal in the deals tab with the deal board underneath, and a "strikes cleared" notice opens the creator's strikes. A deal notice only says something changed, so receiving or tapping one reloads that deal, the deal lists, its history, the brand Home, the money held in escrow and the creator's strikes; a "strikes cleared" notice reloads the strikes alone.

Deal files (drafts, publishing screenshots, brief files, dispute evidence, keep-up reports) all go up the same way, built and tested ahead of the screens: the app checks type and size on the phone first (video MP4, MOV or WebM up to 300 MB; JPG, PNG or WebP photos up to 20 MB; PDF up to 20 MB where allowed, e.g. brief and evidence; publishing and keep-up proofs are photos only), then sends the original file straight to secure storage with a live progress bar. Each file uploads on its own, can be removed or retried, and stops cleanly if the user leaves the screen. Nothing is compressed.

#### Journey F2: Public campaigns 🟡 both sides built (brand: campaign, applicants, selection, invitations · creator: opportunities, the campaign page, applying, my applications · deal details, returns and restrictions)
A brand can publish one campaign that many creators apply to, instead of asking creators one by one. Creators see it in their Opportunities tab, apply with their own price or the fixed one, and each chosen creator gets a normal direct deal. Today a brand can build a campaign, send it for review, follow it in My campaigns and manage it once live; reviewing applicants, selecting creators and inviting them are also built; on the creator side the feed, saved campaigns, the campaign page, applying and My applications are built; and the deal that comes out of a campaign now carries the campaign's own rules (below).
- **Built (🟡):** the app understands campaign states, prices and a campaign notification or link opens the campaign page for each role (the brand's own page, or the creator's opportunity page). If the service says campaigns are closed, the Opportunities tab is hidden.
- **Built (🟡 not yet device or live-server tested), the brand campaign wizard:** four steps under the same navy header and step rail as the offer builder, with the campaign's name and cover replacing the title. The draft saves itself as the brand types (the title creates it; up to 20 drafts) and a step only moves on once its changes are saved. (1) Idea: cover, name, kind of activity, the public announcement every creator sees. (2) Required: the work wanted from each creator (from the service catalog, up to 20 units), who can apply (gender, minimum followers) and who is preferred (cities, niches; ranking only), one product question with three choices (no product, a gift, a sample that comes back; a product widens the gap before a drop from 5 to 10 days), and an optional private brief (talking points, don'ts, hashtags, mentions, links, discount code, tracking link, up to 5 files) that creators only see after funding. (3) Money and seats: a fixed price or bidding within a range (with an optional budget cap), 1 to 20 seats, the most that could be held (the service's estimate, never charged now) against the wallet, the apply deadline (up to 30 days), and either a delivery window or one synchronized drop in Damascus time. (4) Review: one row per part with what it holds or what is still missing and a way back to it, the brief shown locked as creators meet it, then the wallet and the brand's verification.
- **Sending:** anything missing sends the brand to that step instead. Only verified brands can send: an unverified brand gets a sheet leading to company verification (the draft stays saved), and one whose verification is under review is told to wait. A brand with 5 campaigns already in review or live is told to close or cancel one. Once sent, the same screen turns into an «in review» page (handed-in ticket, sent → in review → published, a top-up nudge if the wallet can't cover every seat); nothing can be edited or cancelled while the team reviews.
- **Changes requested (🟡):** the draft reopens fully editable with a strip under the header and the team's note on the review step; the brand sends it again from there.
- **Deals tab, public campaigns face (🟡 not yet device or live-server tested):** a brand's Deals tab opens on its campaigns, with a pill to switch to its direct requests; an amber count on a face says something in it waits on the brand (an applicant waiting, a freed seat, changes requested by the team, a deal to review or pay). Scrolling chips with counts filter the face: All, Active (the opening one), In review, Drafts, Finished. A campaign in review or running shows what it is for (activity and city), its seats as dots, what each creator is asked to make, and a track of stations (review, applications, seats, running, done) with a line saying what the current one means («5 days left», «seats are full»). A suspension or freed seat adds a strip on the card. A draft shows how ready it is (a ring out of 7) and its ⋯ opens continue / copy / delete (deleting asks first; twenty drafts is the limit). Finished campaigns are compact rows. Each chip has its own empty message, and the ones that can start something offer to.
- **The campaign page (🟡):** a short cover runs behind the header with the status and the time left to apply (the campaign's photo, or rings on the brand gradient when it has none). Under it, in order: **quick actions** (up to four circles for what the status makes common: extend, seats, edit, copy, reopen, the chosen creators); the **«now» card** (a ring for the one clock or count that matters, a sentence on what is happening, and what the campaign waits on from the brand as rows, lit when pressing, with the time left before the system acts; with nothing to do it says so and what comes next; the team's note sits in it after changes were requested or a rejection); the **terms** as tiles (what each creator delivers, the seat price in mint, the dates, the audience, where the campaign ranks, what ships) with a chip saying whether they can still change: edit, locked once an application exists, or fixed during the team's review; the **campaign tools**; the **journey** (reviewed, applications, seats, running, done) with the present stop open and any other opening on a tap; and the campaign's **history** (the latest three events, then show all). A suspended campaign (an applicant waited too long) leads with a one-tap reopen, repeated at the bottom, and cancels itself after 7 days. If the deadline passes with nobody applying, the brand chooses within 7 days: one-time +4 days, edit the terms, or cancel. If a creator leaves before work begins, the brand can drop the freed seat or, on a full campaign, reopen applications (asking for a new date when the old one has passed). A waiting applicant shows the 48-hour warning. The bottom button follows the status: finish or resubmit the draft, reopen, review the waiting applications, or open the chosen creators. Drafts and campaigns with requested changes list what is missing as rows in the «now» card.
- **The ⋯ menu (🟡):** the rows follow the status. A draft: continue, copy, delete. Changes requested: continue, copy, cancel. A live campaign: add seats (up to 20 in all, with a new apply deadline when the old one passed), extend the deadline (a later day, within 30 days of publishing and clear of the drop gap; applications close at the end of that day, Damascus time), edit, copy, and one way to end it. Ending is **close recruiting** once a seat is taken (the running deals carry on) or **cancel** while none is; both turn waiting applications into «not selected» and are confirmed by pressing and holding. A full campaign can add seats, edit and copy, but not end (every seat is a running deal). Anything the status doesn't allow is shown disabled with the reason.
- **Editing a live campaign (🟡):** the same wizard, with one «Save changes» button instead of saving itself, because each change reaches creators at once (no new review) and is logged in the campaign history. Seats and the deadline are changed from the ⋯ menu, not here. After the first application only the name and the public announcement can change; the rest is shown locked, and if the app didn't know yet, the service's refusal reverts those parts and shrinks the form to the one step. Leaving with unsaved changes asks first.
- **The recruiting table (🟡 not yet device or live-server tested):** «Review applicants» on the seats card opens it. On top, a strip of seats whose faces fill as creators are chosen, with the wallet balance that pays for the next pick. Three tabs (new, shortlisted, selected) show the service's counts in large numbers; filter chips (city, niche, minimum followers, invited) and a sort sheet sit under them, and a status filter (ended, rejected, not selected, cancelled) replaces the tabs. Each applicant is a photo-led card: name, tier, city and niche, reach on each platform, rating, the pitch, the price they would be paid (their bid or the fixed price, shown as the service sends it, before Sada's fee) and a 72-hour clock that warms in the last 6 hours. A chosen applicant's card shows the deal's status.
- **An applicant's page (🟡):** the cover photo with the clock and the kind (invited or not); three numbers (rating, completed deals, followers); the pitch as a quote; the price; the accounts (verified ones marked; unavailable ones dimmed); and a button to the full Media Kit. The dock shows only what the service allows for that applicant: **Select** leads, with Shortlist and Reject beneath it. Reject asks first; Shortlist keeps the applicant for later and stays on the page. An applicant who expired, was rejected or cancelled shows a note instead of the dock. If the applicant moved meanwhile (72 hours passed, the seat is gone), the service's message appears and the page refreshes.
- **Comparing (🟡):** from the header button or by pressing and holding a pending card (new or shortlisted only) the table enters pick mode: ticks on the photos, a floating tray with three slots, and «Compare» from two picks; a fourth pick is refused with a buzz and a word. The compare page keeps the faces pinned while scrolling and lines up price, total followers, rating, completed deals, accounts, and city with niche. The best value in each numeric row is marked with a background and a word (lowest price, highest followers), never by colour alone, and a full tie marks no one. Select sits under each column.
- **Selecting (🟡):** Select opens a sheet with the exact price, what the creator will deliver (from the campaign), «seat X of Y», and a clearly labelled **estimate** of whether the wallet covers it (the service decides). The brand presses and holds to confirm; the request carries this device's id and a key that makes a retry the same act, never a second selection. If the service refuses (the seat went, the applicant is unavailable, over budget, too close to the drop date, or the application expired), the sheet closes, the service's message shows and the table refreshes; for any other failure (for example a brand that is not verified, or no connection) the service's message shows and the sheet stays.
- **After selecting (🟡):** if the wallet covered the price, a navy page shows the creator's face rising into its seat with a short buzz, and «held in escrow» with the amount from the service; if not, the seat is reserved and a card shows the 24-hour clock with what is missing, a Top up button that opens the wallet's top-up, and «Later» (the deal expires after 24 hours; a top-up funds it automatically and the page turns into the funded one). Both offer «Open the deal» and «Keep reviewing applicants».
- **Complete or close recruiting? (🟡):** when the service says the wallet cannot cover every open seat, returning to the table after a selection asks once: the balance against what the open seats need, a Top up shortcut, «Keep recruiting», or closing recruiting by pressing and holding (the running deals carry on).
- **Opportunities (creator, 🟡 not yet device or live-server tested):** the tab opens on «For you», one capsule away from «Saved» and «My applications». Each campaign is a ticket: the cover with the brand (verified marked) and badges (invited, budget secured, product shipped to you), the title and what is asked (each item with its count, plus the drop day), then a torn-off stub with **what the creator takes home** as the big number (a bidding campaign shows the range), the seats left as dots («3 of 5 available») and the days left to apply, warm in the last 24 hours, with a thin bar that drains toward the deadline. The service has already ranked and filtered the feed for this creator; the creator can narrow by kind of ad and fixed price or bidding. An empty feed explains the rules that decide eligibility (platform, followers, gender) and leads to the profile. A campaign that waits on the creator's gender shows it on the ticket and a tap opens personal info. The heart saves a campaign at once and puts it back if the service refuses.
- **Saved (🟡):** the same tickets, newest save first; un-saving takes the ticket out immediately. Empty: «no saved campaigns yet» with a way back to the feed.
- **The campaign page for creators (🟡):** the cover runs behind a see-through header (save button included) with the brand, the badges and the title, and numbered sections rise over it: first what the creator takes home (a fixed price with a bar for the creator's share, Sada's fee and the net; a bid shows the range, the suggested start and the **binding maximum**), then what is asked, the schedule (apply deadline, the brand's 72 hours to answer, drop or delivery date, shipping), the public conditions (gender, followers, cities, niches, the shipping card for gifts and returned products), and the private brief shown as a **sealed stamp** with nothing inside until the deal is funded. The dock holds the seats, the time left and one button: «Apply now» or «Place your bid»; «Set your gender» when only that is missing; or the service's reasons above a disabled button when the creator cannot apply; or «Applications closed». Opening the page always reads it fresh, and that read marks an invitation as seen.
- **Applying (🟡):** the button opens a sheet. **Price:** a fixed campaign shows the campaign price, Sada's fee and the net, with nothing to type; a bidding campaign has a typed amount with − and + in one-dollar steps, a ruler from $5 to the binding maximum (the suggested range lit, the knob red when out of range) and a live line «your net if accepted» labelled **estimate**. **Account:** one choice per platform the campaign asks for, from the creator's linked accounts (an account under the follower minimum, under review, rejected or unavailable is dimmed with its reason; a platform with no account offers «link an account»). **Message:** optional, up to 500 characters with a counter. **Terms:** what will be delivered, the offer, the net (estimate), shipping and the delivery or drop date; the private brief is not part of it. Then the creator ticks the consent «a binding offer for 72 hours» and presses and holds. The hold is never disabled: when something is missing it shows what (price, account, consent) and nothing is sent. The request carries this device's id and one key that makes a retry the same act, never a second application. On success the sheet closes, a toast says the brand has 72 hours, and the page turns to «You applied». Refusals: a price the service rejects shows under the number; an account it rejects outlines that platform; a missing gender shows a banner with a button to personal info; the 10-open-applications limit and a restriction show the service's words in a banner; a campaign that closed or no longer fits the creator closes the sheet with the reason and refreshes the page.
- **My applications (🟡):** the third destination, with three tabs: **Open** (waiting on the brand, shortlisted ones included), **Selected** and **Closed**. Each card shows the cover, the title and brand, the **status in the service's own words**, what the creator takes home (and the bid, if there was one), and for open ones the brand's 72-hour clock as a ring that drains and warms in the last 6 hours. An open application can be **withdrawn** from its card: a plain confirmation (not a hold, since it commits no money) says there is no penalty but also no second try on this campaign; if the brand decided in the meantime, the service's message shows and the lists refresh. Once the creator is selected the card shows **the deal's stage** instead and one button opens the deal; a tap anywhere on a card opens the deal, or the campaign page when there is no deal yet. «Not selected», expired, withdrawn and cancelled applications are shown neutrally: faded, with no reason and no warning colour. A deal update (for example a notification that the brand paid) refreshes the cards. Each tab has its own empty message and a link back to the feed.
- **The deal from a campaign (🟡 not yet device or live-server tested):** a deal that came from a public campaign looks like any other deal, with these additions. **The campaign** appears as a small chip on the deal page and on its card in the lists; tapping it opens the campaign. **The private brief** stays sealed for the creator until the brand has paid: the deal file shows a locked «private brief» block saying it opens the moment the deal is funded. **The 24-hour clean exit (creator):** once the deal is funded and the brief opens, a calm notice at the top of the page says the creator can walk away with no strike until a stated time; it opens a sheet with an optional note (up to 500 characters) and a press-and-hold button. Leaving returns the brand's money in full and frees the seat. The clock hides the notice a minute before the service closes it, and if the service says the window is over, its message shows and the page refreshes. While the window is open, the usual «withdraw» link leads to this exit instead of the penalty flow. **Withdrawing before payment** carries no strike, and the sheet and the link under it say so. **Shipping (brand):** while the creator's brief review runs, the Ship button is disabled with a clock «Shipping opens in…»; if the service still refuses a send as too early, the sheet closes. **The drop:** when a campaign has a synchronized drop, both sides see a notice on the deal page that follows the clock: the drop's date and time with how long until the live link opens, then «posting is open, the drop is in…», then «the drop has happened». The creator can upload screenshots at any time, but the button that hands in the live link stays disabled, reading «Posting opens in…», until about 15 minutes before the drop; if the device clock runs ahead and the service refuses, its message shows and the deal is read again. When the drop has passed and the creator still owes a post, the notice turns amber for both sides («behind on the drop») while the service's extra time runs. **Announcements:** a brand's announcement to everyone on the campaign appears in the deal's history as a megaphone card with its text and optional link, informational only; the link is shown and can be copied but is not opened from the app, because a brand can type any address.
- **Returned samples and restrictions (🟡 not yet device or live-server tested):** a campaign that asks for the sample back adds a ticket-shaped card to the deal page for both sides: a coloured head with the service's own status as the title and a small road from the creator to the brand with a parcel on it, a perforated line, and what this side needs next. The parcel pulses while the waybill is owed, travels while the sample is on its way, arrives with a green line when received, and stays with the creator, with an open lock, when the brand lets it go; the motion stops off-screen and with reduced motion. **Creator:** while the waybill is owed the card shows how much of the five days has gone (amber, red once late), what stays locked, and a button that opens the waybill sheet (courier chips with «Other», tracking number, optional https link, and when it was handed over: today, yesterday or a number of days ago from 2 to 14). Saving is a plain button, not a hold, because the waybill can be changed until the brand answers; it unlocks the account with a short vibration and a message. Once the sample is on its way the card shows the waybill, a bar for the brand's 14 days of silence, the open lock and an edit button. After a reported problem the creator reads the brand's note and opens its photos in the gallery, read-only. **Lock banner (creator):** on the Opportunities tab an amber banner while a waybill is owed, with a button straight to the waybill sheet, or a red banner for a ban with its end date that opens My strikes; when the lock lifts it turns green for a moment, then folds away. On a campaign page the apply button becomes «Enter the return waybill» (or a quiet locked bar with «Why?» for a ban), and on a direct offer accept and extension are replaced by the lock while decline stays. **My strikes** shows a «severe» or «normal» chip from the service's text and the service's reason text. **Brand:** the same ticket shows the creator's waybill, the clock to the creator's deadline and, once it is in, the brand's own 14-day clock with three answers: a large «Confirm the sample arrived» button, «Report a problem» and «Waive». While the waybill is still owed only waiving is offered. Each answer opens a sheet and ends with a press-and-hold: confirming shows the waybill to match against the parcel and says it is final; the report takes a note (5 to 1,000 characters) and up to five photos with the same photo slots as the shipping report, and says it goes to Sada's team; waiving takes an optional reason (up to 500 characters) that the creator sees on their ticket. If the service says the return has already moved on, its message shows, the deal refreshes and the sheet closes; a throttled report keeps the text and photos.
- **Home and the tab bar (🟡 not yet device or live-server tested):** while campaigns are open, both Home screens gain one section; when the service says campaigns are closed, both disappear and nothing else changes. **Brand, «My active campaigns»:** a sideways rail under «your deals», up to five campaigns with the ones that need the brand first. A card shows the status, whether the budget is secured, the title, the seats as a strip of pills (paid, waiting for the brand's payment, empty) with «3 of 5 available», and three numbers: applications waiting, seats waiting for payment and the time left to the drop. A campaign that needs a decision wears an amber ring and its bottom bar carries the service's own words («Fund the selected seats», «Review applicants»…); a calm one just says «Open the campaign». A pulsing line above the rail counts the campaigns that need the brand, and a last tile opens the full list when there are more. Tapping goes where the decision is: funding opens the wallet top-up (each seat's deal pays itself once the balance arrives), reviewing applicants opens the applicants, everything else opens the campaign page. The money island also says how many of the waiting-for-payment deals are campaign seats, and a deal that came from a campaign shows a small campaign chip on its row and on the «next step» card. **Creator, «Campaigns for you»:** under «Your turn». Three count chips (campaigns open to the creator, new invitations, applications under review, each shown only above zero) lead to the feed or to My applications; below them up to three tickets with the creator's take-home as the biggest number (a bidding campaign shows its range), the brand, the title, seats left and days left; an invited campaign has a gold frame and badge. A last tile opens the whole feed. When nothing fits yet a calm dashed card points the creator to finish their prices. **The tab badge:** the Opportunities tab shows a count of unseen invitations; an invitation counts as seen once its campaign page has been opened. **Brand, «Two ways to work with creators»:** a brand that has just joined, with no open deal and no active campaign, sees one card under «your deals» that tells a direct deal from a public campaign. A two-segment switch slides between them and the picture changes with it: for a direct deal, a line from the brand to one creator with a fixed price on it; for a campaign, one request with five creators applying and three picked. Three rows compare who chooses, the price and what each suits, a note says every creator picked in a campaign becomes a regular deal with the same protection and follow-up, and one button follows the switch («Discover creators» opens Explore, «Create a public campaign» opens the campaign wizard). The card shows only while campaigns are open and leaves by itself as soon as the brand has an open deal or an active campaign; a brand whose only deals are finished sees it again.
- **Batch tools (🟡 not yet device or live-server tested):** on a live campaign page a «Campaign tools» section of tiles lists what applies. **Launch room** (campaigns with a drop): the page opens on a short top with a countdown that runs by the second to the moment the live link opens, then to the drop itself; once the drop passes it shows «on air» with a ring of how many creators have posted and been verified. Below it, the first card shows the three stations (link opens, the drop, on air) with their times and the three reminders sent to the creators; then a strip of the team (anyone behind schedule blinks), filter pills by stage, and a row per creator that opens their deal; a creator who is late wears an amber frame with the service's extra-time clock. It refreshes by pull and whenever a campaign or deal notification arrives. **Shipping manifest** (campaigns that send a product): one list for the creators whose deals are funded. Ready parcels can be ticked together; one courier can be chosen for all and the tracking number is typed per parcel, with an optional https link. Parcels whose creator is still reviewing the brief, or who has not entered an address, are held with a clock or a reason. Addresses are hidden until tapped. The brand presses and holds to ship; more than 20 go in turns of 20, and a retry of the same batch is the same act, never a second shipment. The service answers per parcel: shipped ones get a «shipped» stamp and freeze, failed ones rise to the top with the service's words and can be fixed and sent again alone. If the whole request fails, a banner says so and nothing from that turn is counted. **Broadcast** (once at least one seat is taken): the brand writes one message (3–1,000 characters) with an optional https link and presses and holds to send it to every creator on a funded deal. Three dots show today's broadcasts, counted from the real history over a rolling 24 hours (never a local counter); at the third the dots turn amber and a clock counts to the next one while the text stays saved, and if the service says the limit is reached anyway (another device), the same locked state appears from the time it names. If no funded deal can receive it, a calm notice says so, the text stays and it does not count against the limit. After sending, a toast says how many creators it reached (the service's number), the dot lights and the message joins the history. Creators see it in their deal's history, informational only.
- **Not built yet 🔜:** the floating "Preview" of the creator's card; dragging the bid ruler (it is read-only; the amount is typed or stepped); counters on the My applications tabs.
- **Not enough balance is a warning, not a block:** the brand can send the campaign and fund it later.

#### Journey G: Deleting an account ✅
- **Where:** "Delete my account" is in Settings, on the Suspended screen, and in the header of every registration step. Anyone who can create an account can delete it, even halfway through registration or while suspended (an Apple requirement).
- **Confirmation:** a sheet explains exactly what happens: Sada deletes the profile, verification documents, photo and linked accounts, and the phone number becomes free to sign up again. It cannot be undone. The user confirms with their current password.
- **Protection:** a wrong password shows under the field. After too many tries (5 per minute) the sheet says "Try again in m:ss".
- **After deletion:** the app signs out, wipes everything it kept on the phone for that user (session, cached data, unsaved registration drafts), shows "Your account has been deleted" and returns to Login.
- **Money still in the account (🟡 awaiting live-server testing):** the server refuses deletion while the wallet holds any money (balance, pending, escrow, a top-up under review or an open withdrawal). The sheet then drops the password field and shows the server's reason. A creator on the Profile gets "Go to wallet" to withdraw the balance, plus "Contact support" for money stuck in escrow; brands, and anyone deleting from the Suspended screen or registration, get "Contact support" on WhatsApp.

#### Journey H: The Wallet tab (both roles) 🟡
- **What it is:** the fourth tab for both roles, the same layout in each role's own words (redesigned 2026-10-11). The navy hero with slow drifting lights (the same one as the creator Home and the Profile: it moves slower than the page and the sections slide over it as a sheet) holds the **balance dial**: one ring that splits all the user's money into arcs drawn in one after another: the money that can be used now (bright mint with a soft glow), money held in escrow (faded mint) and money waiting (muted). The centre shows the money that can be used now in large type: "Available to withdraw" for creators, "Available for campaigns" for brands. Its digits roll up once when it first appears. A balance shown without cents is always rounded down. On short phones the dial is smaller and the month line is dropped.
- **The other money:** under the dial, one glass tile per arc names it and shows its short figure:
  - creators: available, money held in escrow, and money on its way out to their e-wallet
  - brands: available, money held in escrow, and top-ups still under review

  Tapping a tile picks its arc: that arc thickens, the others fade, the phone gives a light tap and the centre switches to explain it: this month's credits under the available balance, the number of protected deals under escrow, and a shortcut to the withdrawals or top-ups waiting. Tapping it again goes back to the available balance. The month line, the creator's escrow figure and the brand's top-ups figure come from the service (🟡 awaiting live-server testing); any figure the service leaves out stays out of the ring and the tiles.
- **Actions:** the role's money action (Withdraw for creators, Top up for brands) and its history sit as two large buttons under the tiles.
- **Privacy:** the eye in the top bar hides every amount on the page and remembers the choice on this phone.
- **One blocker at a time:** when the role's money action is off, a single live island in the band says why. The order is: wallet closed → wallet frozen → a wallet state the app doesn't know → withdrawals paused (creators) → identity verification needed, under review or rejected → registration unfinished. Verification problems open the verification page; a closed or frozen wallet opens WhatsApp support with a ready message. Nothing blocking means no island.
- **While scrolling:** once the band scrolls away, a solid navy bar keeps the available balance in view, with the eye beside it.
- **Money held in escrow:** "Money on its way to you" (creators) or "Your money in escrow" (brands), with the number of deals and the total, then one boarding-ticket card per held deal in a row that scrolls sideways (closest to release first): the other party, the deal when known, where the deal stands (for example «draft submitted», as the service words it; the escrow status when the hold has no deal), and past the ticket's tear the amount with what releases it. Small chevrons keep rising through a disc beside the amount: this money is climbing toward the wallet and lands soon (they rest when the row is off screen). Creators see the amount in mint; brands see it neutral. With nothing held yet, a card shows the path of the money still (brand → Sada escrow → your wallet for creators; your wallet → Sada escrow → the creator for brands) with one line on how escrow protects both sides. The tickets read the service (🟡 awaiting live-server testing). Until deals are built a ticket names the other party instead of the deal; a held amount under dispute keeps its ticket with a red status.
- **Payout method (creators):** one rounded pill says where withdrawals land (the primary method and its masked number) with "Manage"; without a method it invites the creator to add one.
- **Monthly tide (🟡 awaiting live-server testing):** creators see what they earned each month (mint) and brands what they spent on campaigns (neutral), over 6 months or a year, as a smooth line over a fading area. The line draws in once per period; the current month pulses softly and carries its amount. The total for the period sits under the title. The chart stays hidden until there is something to show.
- **Today's rate:** one printed line between dashed rules with today's dollar to Syrian pound rate and when it was last updated. When the rate is out of date, a warning replaces it: payouts (creators) or top-ups (brands) in Syrian pounds are paused until it is updated.
- **Latest activity:** the five newest lines on a paper receipt that prints out of a dark slot the first time it scrolls into view, grouped under Today, Yesterday or the date between dashed rules. Each line shows what happened, with whom, the time, a status label only while it is still open (for example "On its way" for a withdrawal), and the amount: money in is mint with a plus sign, money out stays neutral, money only held for a creator is greyed. A Syrian pound line also shows its dollar value. With no activity yet, the receipt says where earnings (creators) or top-ups and payments (brands) will appear. Names, status labels and pound amounts come from the service (🟡 awaiting live-server testing). A brand's escrow hold under dispute shows a red "disputed" label with a warning icon until it is settled.
- **Money taken back after a removed post:** when Sada's team rules that a creator broke the keep-it-live promise, the amount moves back from the creator to the brand as a «Clawback» line: money out (neutral) for the creator, money in (mint) for the brand.
- **To the statement and receipts:** a statement icon beside the eye, and "View full statement" with scissors on the receipt's torn edge. Tapping any line opens its receipt.
- **Statement (🟡):** every wallet line, newest first, grouped under Today, Yesterday or the date (with the year for older ones), loading more as the user scrolls, with "End of statement" at the bottom. A row of chips stays pinned under the title:
  - **Period:** all time, this month, last month, last 3 months, this year, or a custom range of past days picked on a calendar. A chosen period shows on the chip with a × to clear it.
  - **Type:** "All" plus the three kinds each role looks for most. Creators: deal earnings, withdrawals, rewards. Brands: top-ups, escrow holds, refunds. A role never sees a type it can't have.

  The number of lines found shows above the list. With nothing found, the page says so and, if filters are on, offers "Clear filters". The eye works here too and stays in sync with the Wallet tab. Pulling down refreshes; a failed load offers a retry.
- **Receipt (🟡):** the line's icon, what happened and with whom, the exact amount (money in mint with a plus sign, money out neutral) and a status label only while the line is still open. Two cards follow: **Details** (type, from or to, date and time, and the reference, which copies with one tap) and **Amount** (the amount, the Syrian pounds paid and the rate used when the line had two currencies, and the balance after the line). A creator's deal payment also shows the full deal amount and Sada's commission with its rate (for example "Sada commission · 10%, −40 $"); the amount above is already what the creator received, so nothing is taken twice. Amounts always show on a receipt, even with the eye closed, because opening one is a deliberate tap. The share icon sends a plain-text receipt through the phone's share sheet; "Report a problem" opens WhatsApp support with the reference already in the message. A line that isn't the user's (or no longer exists) shows "This transaction isn't available", with the same report link. A receipt only shows what the service sent; a withdrawal's fee breakdown is on its request page.
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
  1. **Amount:** a card shows where the money goes ("To" the primary payout method, its type and last four digits) with **Change**, which opens a sheet of the saved methods and "Add payout method". With no method yet, an "Add payout method" card opens the type sheet and the form, and the new method comes back already picked. A dollar / Syrian pound switch shows only when the method pays in both. The amount is typed from the balance, with "Available" in mint, a **Withdraw all** chip and the default limits underneath. A moment after typing stops, the server prices it: taken from the balance, the method's fee, what arrives (mint) and, for pounds, the pounds received at today's rate "fixed when you send". While a new price loads the old one dims. When the server refuses, a warning lists every reason (when the reason is a missing identity check, the warning carries «Verify to withdraw», which opens the ID upload: deals pay into the wallet without it, only withdrawing needs it), a countdown pill shows when the next withdrawal opens (the app asks again by itself when it ends), the caption says "Change the amount or come back later" and Continue stays disabled.
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
- a live island (on the creator Home, the blocker card at the front of the task deck) for the one thing that needs attention
- numbers that roll up once
- mint dots that show money on its way

Only a few things ever move continuously, each because something is live or waiting: the header lights, the pulse on what is live now and money in flow. They pause off screen and while another tab is open. Everything else animates once. All motion stops when the phone asks for reduced motion. A catalog of every component is kept inside the development build, so the app looks like one designer made it. Every screen has exactly **one primary action**.

**Accessibility:** status is never shown by colour alone. Text contrast meets WCAG AA in light and dark mode. Touch targets are at least 44 points. Every button has a screen-reader label in both languages. Reduced-motion settings are respected.

**Light and dark mode:** the app follows the phone's setting by default. Both modes are designed together.

### 6.4 Push notification engagement

Notifications are central to a marketplace (new offers, payment secured, draft approved, money released), so we ask for permission **respectfully, at the right moment**:

- **Never on first launch.** A cold permission request on day one is the top cause of permanent "Don't allow".
- **Ask at moments of value.** The app first shows its own friendly explanation (for example, at the end of registration: "Get notified the moment a brand sends you an offer"). Only if the user agrees does the system permission prompt appear.
- **Respect "Not now".** After a decline, the app waits at least 48 hours before asking again, and asks at most 3 times per installation. If the phone can no longer show the system prompt, the app stops asking.
- **Always in control.** The user can change the permission at any time in the phone's settings. The Profile screen shows the live status: while notifications are off, a card explains that campaigns may be missed and offers to turn them on (or opens the phone's settings if the system can no longer ask). Once on, a calm "Notifications · On" row sits in the Profile's settings panel. A notifications screen with Sada's categories comes with the notification inbox.
- **Fresh data on every notification.** When a notification arrives or is tapped, the app refreshes the user's data so the screen matches what the notification said.
- **Safe notification links.** Notification content is checked against an approved list before it is acted on. A notification can never send the user to an arbitrary screen. Tapping a notification opens its screen: verification results open the verification page (for brands: the business verification page, including page-proof and domain-email results), platform results open that platform (creators only; brands land in the inbox), top-up results (approved, rejected or reversed) open that top-up request for brands, withdrawal results (paid, rejected or returned) open that withdrawal request for creators, payout method alerts (a method added or its details changed) open the creator's payout methods page, every deal notification opens that deal in the deals tab for both roles, campaign notices open the campaign (a brand's own in the deals tab, a creator's in the opportunities tab) except the creator's "you were selected" and drop reminders, which open the deal they created, a "strikes cleared" or public-application pause notice opens the creator's strikes (brands land in the inbox), other wallet updates (wallet frozen or unfrozen) open the Wallet tab, anything else opens the inbox. A campaign notice reloads that campaign, its lists, the brand's applicants and Home, the creator's feed, saved list, applications and Home glance (a "selected" or drop-reminder notice reloads the campaign it names too); sample-return notices reload the deal and the creator's restrictions. A wallet notification also refreshes the balance and the related list (a payout method alert refreshes only the saved methods). If the tap launched the app, it waits until sign-in has finished, then opens the screen, with the Profile (or the wallet home, or the deals list) underneath so Back always works.
- **Notification inbox.** A bell in the Profile header shows the unread count. The inbox lists notifications newest first, with an unread dot and bold title, how long ago each arrived, and more as the user scrolls. Tapping one marks it read and opens its screen; one header button marks everything read. Three chips above the list filter it locally: All, Campaigns (campaign notices) and Deals (deal and sample-return notices); account and wallet notices show under All only. Every notice type has its own icon and tone, so an approval, a warning and a ban read differently at a glance. An empty inbox, or an empty filter, says so plainly.
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
- **Uploads.** File type and size are checked before upload, and drafts are kept at original quality. Deal files go straight to private storage through a one-time upload link that expires after 30 minutes and is never saved or logged.
- **Permissions are requested only when needed**, with an explanation (see §7.1).

---

## 7. App Store & Launch Status

### 7.1 Device permissions: what we ask for and why

| Permission | Platform | Why we need it (user-facing reason) | When it's asked | Status |
|---|---|---|---|---|
| **Notifications** | iOS, Android 13+ | "So you hear the moment a brand sends an offer, a payment is secured, or your money is released." | Only after a friendly in-app explanation at a moment of value; never on first launch | ✅ |
| **Photo library** | iOS (Android uses the system photo picker, which needs no permission) | "Sada uses your photo library so you can choose a profile photo and upload verification documents, brief files or deal drafts." Shown in Arabic or English to match the phone's language. | When the user taps to choose a photo | ✅ |
| **Add to photo library** | iOS only (Android 10+ saves through the system media store with no permission; Android 7–9 hands the file to the share sheet) | "Sada saves the photos and videos you choose from your deals (briefs, drafts, proof of publishing) to your library." Add-only: Sada cannot see the rest of the library. Shown in Arabic or English. | The first time the user saves a photo or video (one tap, or «Download all»); a refusal shows a short note with a way to Settings | 🟡 built, not yet device tested |
| **Camera** | iOS only (Android opens the phone's own camera app, which needs no permission) | "Sada uses your camera so you can take a profile photo or photograph your ID or business documents for account verification." Shown in Arabic or English. | When the user chooses to take a photo. No screen takes photos yet; it's ready for ID capture and content drafts | 🟡 explanation ready, not used by any screen yet |
| **Internet / network state** | Android | Needed to connect to Sada and to show the offline banner | Automatic (no prompt) | ✅ |
| **Vibration** | Android | Gentle feedback on notifications and errors | Automatic (no prompt) | ✅ |

**Removed on Android:** storage access (saving deal files uses the system media store, and older Android versions the share sheet, so it stays removed), exact alarms and the background-service slot that app libraries add on their own. Uploads use the system picker or the app's own files, and no notification is scheduled or runs in the background, so none of them is needed and the Play listing doesn't show them.

**Not requested:** location. It was removed because no feature uses it. City-based matching will use the city the user picks in their profile. If a future feature needs the phone's location, it gets added back with its own explanation.

**Principles:** ask at the point of use, always with a plain-language explanation in the user's language, and never request anything at app start except notifications after onboarding. If the user has turned a permission off for good, Sada explains in their language why it's needed and offers a button that opens the phone's Settings.

### 7.2 App Store and Google Play compliance checklist

| Requirement | Status | Notes |
|---|---|---|
| **In-app account deletion** (Apple requirement) | ✅ | "Delete my account" is in Settings, on the Suspended screen and on every registration step, password-confirmed and connected to the Sada service. It works for unfinished, active and suspended accounts. |
| **Privacy policy and terms** reachable in the app | ✅ | Opened as in-app pages from Settings. Final legal text and addresses still needed. |
| **Clear permission explanations** | ✅ | The camera, photo and «add to photo library» explanations say exactly what Sada uses them for, in Arabic and English. Unused permissions (location, and camera on Android) were removed, so the store listings only show what the app really uses. |
| **Public store pages** | ✅ | Sada is live on both stores: Google Play at https://play.google.com/store/apps/details?id=com.getsadaapp and the App Store at https://apps.apple.com/app/id6825926070. The «update required» screen opens the right page in the store app, or in the browser when the store app is missing. The iPhone link applies from the next iOS build (the first build opens the App Store home page). |
| **Secure connections only** | ✅ | Store builds on iOS and Android connect only over encrypted HTTPS and trust only the phone's built-in certificates. Insecure connections are allowed only in developer builds on a local network. |
| **Privacy "nutrition label" (Apple) and Data Safety form (Google)** | 🔜 | Must declare: phone number, name, identity and business documents, social account handles, device notification token, and usage data. |
| **Sign in with Apple** | ✅ not required | We use only phone and password, with no third-party social login. |
| **Same app for everyone** | ✅ | No reviewer detection of any kind: no branching on IP, device language, account or app version (the version is used only for the update gate). Country comes only from the phone number. Country lists, payment channels and limits are server data, shown the same to every user of that country. |
| **Payments and wallet** | 🔜 | Deals pay for real-world advertising services, not digital goods, so app-store in-app purchase rules should not apply to escrow. This needs confirming during review. Premium subscriptions, if added, need a separate review. |
| **User-generated content** (drafts, bios, reviews) | 🔜 | Reporting, blocking and moderation tools are required once drafts, reviews and messaging go live. |
| **Encryption export declaration** | ✅ | The iOS app declares it uses only standard encryption (HTTPS), so no export paperwork is asked at each upload. |
| **Support reachable in the app** | 🟡 | A «Help & support» row in Settings for both roles opens Sada support. Not yet device tested. |
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
- 🟡 Prices v2: one price per service and package, with delivery time, revisions, how long it stays live and up to six fixed-fee add-ons (rush delivery, extra revision, exclusivity, paid-ads usage, link in bio, pinned post), plus in-person services; set in registration or from My prices: built, awaiting testing against the live service.
- 🟡 Verify identity (creators) or the business (brands, four ways: company document, owner's ID or passport, social page proof, domain email) at registration or later from the Profile: built, awaiting testing.
- 🟡 Notification inbox with unread count, tap-to-open and local All / Campaigns / Deals filters: built, awaiting testing. Notification preferences (per-category switches) wait for the service to offer them.
- 🟡 Creator Home dashboard with the shareable media kit, its insights page (7 / 30 / 90 days), the "preview as brands see it" page and the link and visibility settings: built, awaiting testing.
- 🟡 Brand Home «Spotlight»: quiet wallet line, next step, «your deals» (the next action as a swipeable card over every other deal on its tracker, calm and welcome states, amber count on the deals tab), big question with search, category chips, a swipeable story deck of nearby creators, verified photo tiles, fast-delivery rows, story rings and a help line; new brand tab bar: built, awaiting testing.
- 🟡 Public campaigns on Home: the brand's active-campaign rail and the creator's campaign strip, plus the invitation badge on the Opportunities tab: built, awaiting testing.
- 🟡 Explore: search, filters, sort and price locks for unverified brands: built, awaiting testing.
- 🟡 Shortlist of saved creators (❤️ in the Home header, remove with Undo, 200 max): built, awaiting testing.
- 🟡 Opening a creator's shared link inside the app (their public profile, with a counted view, prices locked with the next step for anyone who isn't a verified brand): built, awaiting testing. Web links need Sada's permanent public web address and the app's identity registered with it.

**🔜 Then: marketplace core (the revenue engine)**
- Campaign Brief Builder, open campaigns, applications and direct offers. 🟡 Public campaigns: foundation (states, service connection, tabs, notification link, creator gender), the brand campaign wizard (build, review, send, «in review»), My campaigns, the campaign page and its actions built; applicants, selection, invitations and the creator side (opportunities, the campaign page, applying, my applications) are built too; the deal-side details (campaign chip, sealed brief, clean exit, shipping wait, the drop and announcements) are built too; the home screens and the brand's batch tools (launch room, shipping manifest, broadcasts) are built too; the returned-sample return and the account restrictions are built too; notifications come phase by phase.
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
| 1 | **Marketplace and finance are not yet live.** Brand Home, Explore (search, filters, sort) and the Shortlist read the service (awaiting live-server testing), but campaigns and deals are not connected to the service. The Wallet tab, statement and receipts read the service (balance, activity, rate) and brands can file top-up requests against the service's methods and receiving accounts (awaiting live-server testing); creators can request withdrawals to their saved payout methods (awaiting live-server testing), and the escrow card, monthly chart and month summary read the service (awaiting live-server testing). | No core value for users yet. A store reviewer may reject the app for minimal functionality. | Mobile + backend |
| 2 | ✅ **Resolved 2026-10-24.** ~~The notification service is set up for the previous project.~~ The notification service now uses the new app identity on both platforms; push notifications confirmed arriving on a real iPhone. | | Mobile + DevOps |
| 3 | ✅ **Resolved 2026-10-24.** ~~The server address still points to the old domain.~~ Store and staging builds now reach the Sada service on its permanent address. | | Mobile + DevOps |
| 4 | ✅ **Resolved 2026-10-03.** ~~The iOS build allows insecure connections.~~ Store builds now use HTTPS only on both platforms, and Android no longer trusts user-installed certificates. | | Mobile |
| 5 | ✅ **Resolved 2026-10-03.** ~~Login sessions are stored on the device without encryption.~~ Sessions and personal data are now stored encrypted, with the key in Keychain (iPhone) or Keystore (Android). Existing users stay logged in after updating. | | Mobile |
| 6 | ✅ **Resolved 2026-10-03.** ~~Generic permission explanations, plus an unused location permission on Android.~~ Explanations rewritten in Arabic and English. Location and the Android camera permission were removed. | | Mobile |
| 7 | ✅ **Resolved 2026-10-03.** ~~Leftover text from the previous project in the profile area, and old notification-settings fields.~~ The booking counter, the old app name and the old notification settings screen were removed. The phone home screen now shows «صدى» in Arabic and "Sada" in English. | | Mobile |
| 8 | ✅ **Resolved 2026-10-03.** ~~Account deletion is not confirmed against the new backend.~~ Deletion is connected to the Sada service and reachable from Settings, the Suspended screen and registration. | | Mobile + backend |
| 9 | ✅ **Resolved 2026-10-24.** ~~App Store listing ID not set yet.~~ The listing id is now set for store and staging builds, so the forced-update button opens Sada's App Store page. Takes effect from the next iOS build (the build in review still opens the App Store home page). | — | Mobile |
| 9b | **Shared-link verification: Android done, iPhone waiting.** Sada's permanent web address is set and Android opens shared creator links straight in the app. The iPhone association file on the web address is still empty, so it must list Sada's Apple team and app id for the creator-link paths. | On iPhone, shared links open the website instead of the app until the backend fills the file. The "Open in app" button works meanwhile. | Backend + DevOps |
| 10 | **Not yet verified on real devices** after the visual redesign: some text fields in right-to-left, and card shadows. | Visual polish and right-to-left correctness. | Mobile QA |
| 11 | **Payment partner and legal framework** for escrow with local e-wallets, plus contract templates. | Escrow can't launch without them. | Business + legal |
| 12 | **Privacy label, Data Safety form, final legal pages, store screenshots.** | Required for submission. | Product + legal |

---

## Change Log

Every change to a screen, flow, permission or business rule adds a row here (newest first). Only the latest 10 rows live here; older rows move to `mobile-changelog.md`.

| Date | Change | Sections updated |
|---|---|---|
| 2026-10-24 | Launch blockers updated: push notifications now arrive for the new app identity (confirmed on a real iPhone) and store builds reach the Sada service on its permanent address (both ✅); shared creator links open the app on Android, iPhone still waits on the backend's association file; Sada's App Store page is live and linked from the «update required» screen (applies from the next iOS build). | Last updated, §7.2, §7.4 |
| 2026-10-23 | Google Play link added: the update-required screen now sends Android users to Sada's live Google Play page when the Play app can't open it directly (✅). | §7.2 |
| 2026-10-23 | Files everywhere (🟡 not yet device tested): one full-screen viewer replaces the old photo gallery on every file in the app (deal brief, drafts' proofs, dispute evidence, shipping and return photos, retention screenshots, media kit work, top-up receipts) with zoom, a minimap, video controls, in-app PDF reading, and save / share; a files vault per deal (both roles) and per campaign (brand) groups every file by section with per-file saving, multi-select and «Download all»; creators see brief files locked until funding; iOS asks add-only Photos access the first time a photo or video is saved, Android keeps no storage permission. | Last updated, §5.2 screen map, §7.1, §7.2 |
| 2026-10-23 | "Coming soon" spots removed before store review (🟡 not yet device tested): the Messages tab is gone for both roles (brands now have four tabs; creators have four while campaigns are closed); the sign-up account-type sheet no longer shows the unavailable agency option; the brief files note no longer promises a future viewer; a «Help & support» row in Settings for both roles; Android no longer lists storage, exact-alarm or background-service permissions; iOS declares standard encryption only. | Last updated, §5.2 screen map, §7.1, §7.2 |
| 2026-10-22 | Phone entry and Syrian pound display simplified (🟡 not yet device tested): login, sign-up, password reset, payout and delivery-address phone fields no longer show a country picker or dial code; numbers are typed the local way and must start with 0 («0944 123 456»), and are still sent in full international form; profile and code screens show the number the same local way; Syrian pound amounts and the rate line show the bare number with no «ل.س» / "SYP" symbol. | Last updated, §4.5, §5.1 |
| 2026-10-22 | Creator Home redesigned («v3», 🟡 not yet device tested): the hero puts the creator's link first (copy, preview, share or make public) with the last 30 days, and its content sinks behind a rounded sheet while scrolling; one task deck holds the blocker, the deals waiting and, before the first offer, the storefront steps; a «Sada map» of eight tiles leads to every place (offers and my deals open the right Deals tab) with a red bar for live strikes; running deals with a stage bar; campaigns as one card; money held with its flow and the ID nudge; the storefront to brands; a readiness ring; prices as tags hanging from a rail with the service never cut. | Last updated, §5.2 screen map, Journey A4, §6 look and motion |
| 2026-10-20 | Country rules moved to the server (🟡 not yet device or live-server tested): phone format and example, currencies and top-up / withdrawal limits, payment channels, couriers, governorates and support contact are read per country instead of being fixed to Syria; wallet top-up and payout screens list only the user's country channels; shipping lists the country's couriers plus «other» with a typed name; delivery-address phones follow the country's rule; a new user's dial code is pre-filled from the phone's region setting, no location permission; demo / test-text switches are no longer used. | 5.1, 7.2 |
| 2026-10-19 | Brand Home «Two ways to work with creators» card built (🟡 not yet device tested): for a brand with nothing open yet, a switch between direct deal and public campaign moves a small picture, three comparison rows and one button (Explore or the campaign wizard); hidden when campaigns are closed and gone after the first open deal or active campaign. | Last updated, §5.2 screen map, Journey F2 |
| 2026-10-19 | The brand's launch room top slimmed (🟡 not yet device tested): the navy top keeps only the title and the clock (small tiles, or the ring once on air) so nothing hides behind the body; the three stations (now with their times) and the creator reminders moved into the first card of the body. | Last updated, §5.2 screen map, Batch tools |
| 2026-10-19 | The brand's campaign page redesigned (🟡 not yet device or live-server tested): a short cover (the photo, or rings on the brand gradient); quick-action circles for the status; one «now» card with a ring for the clock or count that matters, what is happening and what is asked of the brand as rows (lit when pressing, with the time left before the system acts), and the team's note when changes were requested; the terms as tiles with an edit / locked / fixed-during-review chip; the campaign tools as tiles; the five-stop journey; a history showing the latest three events; the bottom button now also reviews waiting applications or opens the chosen creators. | Last updated, §5.2 screen map, Journey F2 |
