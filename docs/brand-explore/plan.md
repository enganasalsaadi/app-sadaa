Brand Home & Explore: plan
Where things go
Part	Domain	Notes
explore, brand/home, shortlist endpoints, CreatorCard/BrandHome types, snake→camel mappers	marketplace	new tags: BrandHome, ExploreCreators, ExploreFilters, Shortlist
Public Media Kit price lock + views {src:'search'} beacon	identity (MediaKitPublicScreen)	prices can be null, so the mediaKit.ts types change
search_impressions tile	identity (MediaKitInsights)	render it when it isn't null
Lock reason → CTA route map	marketplace/constants	Record<LockReason, …>, exhaustive
Cursor infinite scroll	core hook useCursorList	the current helper uses page numbers, but this API uses next_cursor and returns no total
Phases
P0 Data: types, API, mappers + tests, shortlist toggle (optimistic update patched into every cached Explore/Home/Shortlist query, rolled back on error).
P1 Brand Home: Dashboard archetype. ✅ 2026-10-10 (search bar, categories and "See all" open Explore, so they ship with P2; ❤️ header icon ships with P3).
P2 Explore: List archetype, filter sheet, sort sheet, 403 gated_parameter → verification. ✅ 2026-10-10 (Home search bar, categories, "See all" and the empty-state CTA wired too).
P3 Shortlist: List screen, ❤️, 409 shortlist_full toast. ✅ 2026-10-10 (Home header ❤️ → Shortlist; un-heart = optimistic removal + Undo toast after the server confirms; toasts gained an optional action).
P4 Media Kit lock: 🔒 rate rows, verify CTA in the footer, always refetch after verification. ✅ 2026-10-10 (lock map moved to identity to avoid an identity ↔ marketplace cycle; footer also covers guests → Sign in and creators → text only; locked kit body hangs on the `User` tag so any verification save or push drops it).
P5 Creator tile. ✅ 2026-10-10 (Insights grid, types and tile order already rendered `search_impressions` whenever non-null; `src=search` beacon already sent by `useCreatorCardActions`. Added a screen test for the 5th half-width tile. Docs line → P6.)
P6 Finish: i18n ar/en, docs/mobile-architecture.md, tsc/lint/test. ✅ 2026-10-10 (ar/en parity verified, only Arabic extra plural forms differ; docs gained the search-appearances insights tile + Change Log row; tsc, lint, 952 tests green).
Each phase gets its own short session so context stays small.

A. Brand Home (tab root, Dashboard chrome)

┌──────────────────────────────────────┐
│ navy hero  (GlowOrbs)                 │
│ 🔔 ❤️                  شركة النور ▸ 🏢 │  ← company + governorate
│                              دمشق 📍  │
│ ┌──────────────────────────────────┐ │
│ │ 👁   الرصيد المتاح                │ │  ← eye = hide/show (local)
│ │      $1,250   ≈ 18,750,000 ل.س   │ │  ← SYP hidden if stale
│ └──────────────────────────────────┘ │
│ ┌ LiveIsland ● ────────────────────┐ │  ← island (null → hidden)
│ │ وثّق حسابك لرؤية الأسعار  [ابدأ] │ │
│ └──────────────────────────────────┘ │
├──────────────────────────────────────┤
│ 🔍 ابحث عن صانع محتوى…              │  ← tap → Explore (focus)
│ [مطاعم] [موضة] [تقنية] [سفر] ←scroll │  ← categories → Explore prefilled
│                                      │
│ قريبون منك                  عرض الكل │  ← rail (see_all → Explore)
│ ┌─────┐┌─────┐┌─────┐               │
│ │card ││card ││card │  ← horizontal │
│ └─────┘└─────┘└─────┘               │
│ موثّقون                     عرض الكل │
│ تسليم سريع                  عرض الكل │
│ جدد على صدى                 عرض الكل │
│ شاهدتهم مؤخراً                       │  ← no see_all
│                                      │
│ ┌ تحتاج مساعدة؟  [تواصل مع الدعم] ┐ │  ← hidden if whatsapp_url null
└──────────────────────────────────────┘
States: skeleton hero + 2 rail skeletons. Error → InlineError + retry. All rails empty → empty card with an "Explore creators" CTA. Pull to refresh. Home is fetched on mount, on pull, and on focus only if the data is more than 2 minutes old, because every Home call records impressions.

B. Rail card (compact, ~156w) / Row card (Explore, Shortlist)

Rail:                    Row:
┌──────────┐             ┌────────────────────────────────────┐
│     ❤️   │             │ ❤️          ريم الأحمد ✓   (avatar)│
│ (avatar) │             │        حلب · طعام، سفر    [Gold]   │
│ ريم ✓    │             │  📸 48.2K ✓   ⚡ 2 يوم   🆕         │
│ 📸 48.2K │             │  ابتداءً من $40 (≈600,000 ل.س)     │
│ من $40   │             │  — locked: 🔒 وثّق لرؤية السعر     │
└──────────┘             └────────────────────────────────────┘
Badges: ✓ KYC, ✓ next to the follower count when followers are verified, ⚡ rush, 📍 on site, 🆕 new. Tapping a card opens the Media Kit with src=search. Tapping ❤️ toggles the shortlist optimistically. The existing CreatorCard (rating, Money) doesn't match this contract, so I'll refactor it into variant: 'rail' | 'row' and fold the old props in (reuse-first).

C. Explore (pushed from Home; List chrome)

┌──────────────────────────────────────┐
│ ←  [🔍 مطاعم دمشق…            ✕]     │  ← q 2–60, debounce 400ms
│ [⚙ فلترة •3] [↕ الأنسب] [✓موثّق] [⚡]│  ← quick toggles + sheets
│ ┌ 🔒 الأسعار مخفية — وثّق حسابك  ▸ ┐ │  ← if meta.price_locked
│ row card                             │
│ row card                             │
│ …infinite (next_cursor), no count    │
└──────────────────────────────────────┘
Empty → "No results" + "Clear filters". Using a 🔒 filter or sort while locked never sends the request: it opens the verification CTA sheet. If the server still returns 403 gated_parameter, the app shows the same sheet.

D. Filter sheet (BottomSheet, draft state, apply/reset)

┌──────────────────────────────────────┐
│ الفلاتر                  إعادة ضبط   │
│ المحافظة   [دمشق✓][حلب][حمص]…        │
│ المنصة     [انستغرام✓][تيك توك]…     │
│ المجال     [طعام][موضة]…  (+المزيد)  │
│ الفئة      [Nano][Micro][Gold]…      │
│ المتابعون  [min] — [max]             │
│ مدة التسليم ≤ [3 أيام ▾] (buckets)   │
│ ☐ موثّق  ☐ متابعون موثّقون ☐ مستعجل ☐ في الموقع │
│ السعر 🔒   [min] — [max]  ☐ ضمن ميزانيتي │
├──────────────────────────────────────┤
│        [ عرض النتائج ]                │
└──────────────────────────────────────┘
Sort sheet: radio list; 🔒 on price sorts when locked.

E. Shortlist (from the ❤️ icon in the Home header)

┌──────────────────────────────────────┐
│ ←  المفضّلة                           │
│ row card (❤️ filled)                  │
│ …cursor scroll                       │
│ empty: ❤️ "احفظ صناع المحتوى هنا" [استكشف] │
└──────────────────────────────────────┘
Un-hearting a creator removes them from the list with an undo toast. 409 → toast "المفضّلة ممتلئة (200)".

F. Media Kit, locked

│ باقات الأسعار                         │
│ ┌ ريل انستغرام · 3 أيام · تعديلان ──┐ │
│ │                        🔒 ••••   │ │
│ └──────────────────────────────────┘ │
├──────────────────────────────────────┤
│ 🔒 وثّق حسابك لرؤية الأسعار [وثّق الآن] │  ← footer, label per reason
Lock reason → action
kyc_required/kyc_rejected → company verification · kyc_pending → status screen with no CTA ("قيد المراجعة") · onboarding_incomplete → company info · account_suspended → the suspended gate already handles it · brand_only → can't happen in the brand app, so it falls back to plain text.

Decisions needed
Tab: the brand tab is currently "استكشاف" (Compass). Should its root be Brand Home with Explore pushed on top (recommended), or should the tab root be Explore itself?
Shortlist entry: ❤️ icon in the Home header (recommended), or a row in the Account menu?
❤️ on Media Kit: the kit response has no is_shortlisted field. Skip it in v1 (recommended), or ask the backend to add the field?
Hide-wallet preference: remember it across app restarts in plain storage (recommended), or reset it every session?
Price display: USD first with ≈SYP as a secondary line, OK? I also need to confirm from_usd is whole dollars and not minor units. The handoff doesn't say, so I'll check against the existing price_from_usd handling before writing the mapper.
Support link: a general help card at the bottom of Home only, never inside a deal (rule 06). OK?
Approve or change these and I'll start P0.