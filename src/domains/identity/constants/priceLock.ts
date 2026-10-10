import type { ParseKeys } from 'i18next';
import type { PriceLockReason } from '../types/priceLock';

/** Account screens a lock CTA opens (both take no params, so one `navigate` fits all). */
export type PriceLockScreen = 'CompanyVerification' | 'CompanyInfoScreen';

export interface PriceLockAction<TScreen extends string = PriceLockScreen> {
  title: ParseKeys;
  body: ParseKeys;
  /** `null` = nothing the viewer can do from here (in review, or another gate owns it). */
  cta: { label: ParseKeys; screen: TScreen } | null;
}

/**
 * Lock sheet / banner / Media Kit footer per reason. The picker shows the active attempt,
 * so both "verify" states open it; a suspended account is already behind its own gate
 * (plain text here). Lives in identity, which owns the screens it opens.
 */
export const PRICE_LOCK_ACTION = {
  kyc_required: {
    title: 'marketplace.priceLock.verify.title',
    body: 'marketplace.priceLock.verify.body',
    cta: { label: 'marketplace.priceLock.verify.cta', screen: 'CompanyVerification' },
  },
  kyc_rejected: {
    title: 'marketplace.priceLock.rejected.title',
    body: 'marketplace.priceLock.rejected.body',
    cta: { label: 'marketplace.priceLock.rejected.cta', screen: 'CompanyVerification' },
  },
  kyc_pending: {
    title: 'marketplace.priceLock.pending.title',
    body: 'marketplace.priceLock.pending.body',
    cta: null,
  },
  onboarding_incomplete: {
    title: 'marketplace.priceLock.completeProfile.title',
    body: 'marketplace.priceLock.completeProfile.body',
    cta: { label: 'marketplace.priceLock.completeProfile.cta', screen: 'CompanyInfoScreen' },
  },
  account_suspended: {
    title: 'marketplace.priceLock.unavailable.title',
    body: 'marketplace.priceLock.unavailable.body',
    cta: null,
  },
  brand_only: {
    title: 'marketplace.priceLock.unavailable.title',
    body: 'marketplace.priceLock.unavailable.body',
    cta: null,
  },
} as const satisfies Record<PriceLockReason, PriceLockAction>;

export const PRICE_LOCK_ACTION_FALLBACK = PRICE_LOCK_ACTION.kyc_required;

/** Signed-out viewer of a public kit (opened from a link, over Login): sign in first. */
export const PRICE_LOCK_GUEST = {
  title: 'account.mediaKit.publicScreen.guestLock.title',
  body: 'account.mediaKit.publicScreen.guestLock.body',
  cta: { label: 'account.mediaKit.publicScreen.guestLock.cta', screen: 'Login' },
} as const satisfies PriceLockAction<'Login'>;
