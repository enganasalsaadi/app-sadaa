import {
  PRICE_LOCK_ACTION,
  PRICE_LOCK_ACTION_FALLBACK,
  PRICE_LOCK_GUEST,
  type PriceLockAction,
  type PriceLockScreen,
} from '../constants/priceLock';
import { PRICE_LOCK_REASONS, type PriceLockReason } from '../types/priceLock';

const isPriceLockReason = (value: unknown): value is PriceLockReason =>
  typeof value === 'string' && (PRICE_LOCK_REASONS as readonly string[]).includes(value);

/** Unknown reason → `null`: the lock still shows, with the generic "verify" copy. */
export const toPriceLockReason = (value: string | null | undefined): PriceLockReason | null =>
  isPriceLockReason(value) ? value : null;

/** Who is looking at a locked public kit decides which step can unlock it. */
export type PriceLockViewer = 'brand' | 'creator' | 'guest';

export const toPriceLockViewer = (signedIn: boolean, userType: string | null): PriceLockViewer => {
  if (!signedIn) return 'guest';
  return userType === 'brand' ? 'brand' : 'creator';
};

/** What the public kit's lock footer says, and the screen its CTA opens. */
export type PriceLockNotice = PriceLockAction<PriceLockScreen | 'Login'>;

/**
 * Guest → sign in. Brand → the reason's own step (verify, finish company info, or wait).
 * Creator → plain text: company verification is a brand flow, whatever reason came back.
 */
export const resolvePriceLockNotice = (
  reason: PriceLockReason | null,
  viewer: PriceLockViewer,
): PriceLockNotice => {
  switch (viewer) {
    case 'guest':
      return PRICE_LOCK_GUEST;
    case 'creator':
      return PRICE_LOCK_ACTION.brand_only;
    case 'brand':
      return reason ? PRICE_LOCK_ACTION[reason] : PRICE_LOCK_ACTION_FALLBACK;
    default: {
      const _exhaustive: never = viewer;
      return _exhaustive;
    }
  }
};
