> **Status:** implemented by the backend on 2026-10-13 (additive). Final contract: `docs/direct-deals/mobile-plan.md` P2.1 / P2.4.

You are working on the Sada backend (B2B influencer marketplace, escrow wallet, Syria-first, Arabic-first). The mobile app is building the brand's Direct Deals offer wizard (3 steps: services → brief → review & sign). Today a brand only learns that an offer can't be sent when it taps **Send** (`409 deal_offer_exists`, `deal_offer_limit`, `deal_draft_limit`, `422 deal_creator_unavailable`, `403 kyc_required`), after filling in all three steps. That wasted effort makes brands abandon the wizard. Please add the items below. **Additive changes only.** The app treats every new field as optional and falls back to today's send-time errors when a field is missing.

## Conventions (keep them)
- Envelope `{ success, message, data, error_code, errors, meta }`.
- Every `label` is localized from `Accept-Language` (ar | en).
- Codes are stable strings, and the app branches on them, never on `message`.
- Money is a USD string with 2 decimals. Timers are in hours.

## 1. New `GET /brand/deals/preflight?influencer_profile_id={id}` (or the creator slug, whichever you prefer)
This runs before the wizard opens, when there are no lines yet. KYC is **not** required to call it, because the answer itself says `kyc_required`.
```json
{
  "can_offer": false,
  "blockers": [
    { "code": "deal_offer_exists", "label": "لديك عرض مفتوح مع هذا المؤثر", "deal_id": "01J..." }
  ],
  "resume_draft_id": "01J... | null",
  "open_offers": { "used": 7, "limit": 20 },
  "drafts": { "used": 3, "limit": 50 }
}
```
- `blockers[].code` uses the same values as the send errors: `kyc_required | deal_offer_exists | deal_offer_limit | deal_draft_limit | deal_creator_unavailable`. Add a `deal_id` only for `deal_offer_exists`, so the app can link to that deal.
- `resume_draft_id` is the brand's newest unsent draft for this creator, if one exists. The app offers «أكمل مسودتك» instead of starting a new one.
- `can_offer` is `true` when `blockers` is empty.

## 2. `blockers` on `POST /brand/deals/quote`
Use the same `blockers[]` shape as §1, evaluated on every quote, because the state can change while the brand is in the wizard. Keep returning `200` with the prices. The quote stays a preview, and send still enforces everything.

## 3. Lifecycle windows on `POST /brand/deals/quote`
The review step shows a "what happens after you send" timeline. The app must not hard-code SLA hours, so please return them from `config('deals.sla_hours')`:
```json
"windows": {
  "influencer_response_hours": 48,
  "payment_top_up_hours": 24,
  "brand_ship_hours": 120,
  "brand_review_hours": 48,
  "publish_window_hours": 48
}
```

## 4. Tests
- `preflight` returns each blocker code on its own, and `can_offer: true` with none.
- `preflight` returns `resume_draft_id` for an existing draft with this creator.
- `quote` includes `blockers` and `windows`, and its existing fields are unchanged.
