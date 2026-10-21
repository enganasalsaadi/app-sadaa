export type PaginatedMeta = {
  total: number;
  page: number;
  per_page: number;
  pages: number;
};

export type PaginatedData<T> = {
  items: T;
  pagination: PaginatedMeta;
};

/** Laravel-style pagination — returned under `meta.pagination`. */
export type PaginationMeta = {
  per_page: number;
  current_page: number;
  has_more: boolean;
  total: number;
  last_page: number;
};

export type Paginated<T> = {
  items: T;
  pagination: PaginationMeta;
};

/** Mirrors backend `app/Enums/ApiErrorCode.php` (mobile contract §1). */
export const API_ERROR_CODES = [
  'unauthenticated',
  'forbidden',
  'forbidden_user_type',
  'account_suspended',
  'phone_not_verified',
  'not_found',
  'onboarding_step_out_of_order',
  'kyc_already_pending',
  'kyc_already_verified',
  'platform_already_exists',
  'last_platform',
  'platform_not_eligible_for_primary',
  'social_lookup_unavailable',
  'validation_failed',
  'too_many_requests',
  'otp_cooldown',
  'slug_unavailable',
  'slug_change_cooldown',
  'media_kit_private',
  'account_has_funds',
  'idempotency_key_required',
  'idempotency_key_reused',
  'idempotency_request_in_progress',
  'kyc_required',
  'domain_verification_cooldown',
  'wallet_frozen',
  'insufficient_funds',
  'wallet_closed',
  'currency_not_supported',
  'fx_rate_stale',
  'fx_rate_unavailable',
  'top_up_amount_out_of_range',
  'channel_paused',
  'transfer_reference_duplicate',
  'top_up_pending_limit',
  'payout_method_limit',
  'withdrawal_not_allowed',
  'withdrawal_not_pending',
  'gated_parameter',
  'shortlist_full',
  // Direct Deals (handoff §1). Admin-only codes (`deal_ruling_*`, `deal_clawback_*`) never reach the app.
  'deal_invalid_transition',
  'deal_not_draft',
  'deal_price_changed',
  'deal_offer_exists',
  'deal_offer_limit',
  'deal_draft_limit',
  'deal_creator_unavailable',
  'deal_extension_used',
  'deal_extension_out_of_range',
  'deal_deadline_passed',
  'deal_not_shipped',
  'deal_already_shipped',
  'deal_reship_limit',
  'deal_issue_too_early',
  'deal_cancel_not_available',
  'deal_upload_invalid',
  'deal_upload_limit',
  'deal_revisions_exhausted',
  'deal_revision_pending',
  'deal_live_url_invalid',
  'deal_live_url_taken',
  'deal_fix_limit',
  'deal_cancel_requires_dispute',
  'deal_cancel_terms_changed',
  'deal_free_cancel_available',
  'deal_upsell_closed',
  'deal_upsell_pending',
  'deal_upsell_not_pending',
  'deal_upsell_insufficient_funds',
  'deal_upsell_unfunded',
  'deal_dispute_limit',
  'deal_dispute_not_open',
  'deal_dispute_not_opener',
  'deal_dispute_evidence_closed',
  'deal_dispute_evidence_limit',
  'deal_retention_closed',
  'deal_retention_case_open',
  'deal_retention_not_awaiting',
  'deal_rating_closed',
  'deal_rating_already_submitted',
  // Public Campaigns (`docs/public campaigns/public-campaigns.md` §8). `feature_disabled` = the flag is off (404).
  'feature_disabled',
  'creator_restricted',
  'campaign_invalid_transition',
  'campaign_not_draft',
  'campaign_not_editable',
  'campaign_draft_limit',
  'campaign_not_ready',
  'campaign_live_limit',
  'campaign_field_locked',
  'campaign_has_occupied_seats',
  'campaign_no_occupied_seats',
  'campaign_schedule_passed',
  'campaign_extension_unavailable',
  'campaign_no_freed_seat',
  'campaign_no_free_seat',
  'campaign_budget_exceeded',
  'campaign_application_expired',
  'campaign_applicant_unavailable',
  'campaign_drop_too_close',
  'campaign_no_drop',
  'campaign_no_shipping',
  'campaign_shipment_deal_unknown',
  'campaign_announcement_limit',
  'campaign_no_announcement_recipients',
  'campaign_not_accepting',
  'campaign_application_limit',
  'campaign_profile_incomplete',
  'campaign_not_eligible',
  'campaign_brief_window_open',
  'campaign_drop_not_open',
  'deal_brief_exit_closed',
  'deal_brief_exit_available',
  'deal_return_unavailable',
  // Markets (`docs/markets/mobile-contract.md`). Admin-only market codes never reach the app.
  'phone_market_unsupported',
  'market_inactive',
  'market_not_found',
  'channel_not_available',
  'courier_not_available',
  'governorate_not_in_market',
  'withdrawal_amount_out_of_range',
  'server_error',
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

/** 422 only: `{ "platforms.0.handle": ["…"] }`. `null` on every other error. */
export type ApiFieldErrors = Record<string, string[]>;

export interface ApiMeta {
  locale?: string;
  /** Seconds — set on 429 `too_many_requests` / `otp_cooldown`, 409 `slug_change_cooldown`. */
  retry_after?: number;
  /** ISO time the blocked action opens again (409 `slug_change_cooldown`). */
  available_at?: string;
  /** Machine sub-code of an error (`slug_unavailable`: `invalid_length` | `taken`…). */
  reason?: string;
  /** Success only: the slug an old media-kit slug resolved to (contract §17.4). */
  canonical_slug?: string;
  pagination?: PaginationMeta;
}

/** Response of an endpoint called with `extraOptions: { withMeta: true }`. */
export type WithMeta<TData> = {
  data: TData;
  meta: ApiMeta;
};

export interface ApiResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
  error_code?: string | null;
  errors?: ApiFieldErrors | null;
  pagination?: PaginatedMeta;
  meta?: ApiMeta;
}

export type ApiUnknownRecord = Record<string, unknown>;

export type LoadPhase = 'idle' | 'initial' | 'refreshing' | 'more';
