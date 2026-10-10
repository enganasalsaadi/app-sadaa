/** Why prices are hidden from the viewer (`CapabilityBlockReasonEnum`, brand-explore handoff §1). */
export const PRICE_LOCK_REASONS = [
  'kyc_required',
  'kyc_pending',
  'kyc_rejected',
  'onboarding_incomplete',
  'account_suspended',
  'brand_only',
] as const;
export type PriceLockReason = (typeof PRICE_LOCK_REASONS)[number];
