import type { HueTone } from '@/core/theme';
import type { CampaignInviteSkip } from '../types/campaign';

/** Invitations one campaign may ever send (contract §3.6); the server counts them, the app only says so. */
export const CAMPAIGN_INVITE_LIMIT = 50;

/** One request carries 1–100 creators; the shortlist can hold more than a batch takes. */
export const CAMPAIGN_INVITE_BATCH_MAX = 100;

/**
 * Tone of each skip reason (rule 08): a creator already invited or already in is not a problem
 * (info); one the brand can fix (not shortlisted, not eligible) is a warning; a full quota is danger.
 * Labels come from the server.
 */
export const CAMPAIGN_INVITE_SKIP_TONE = {
  not_shortlisted: 'warning',
  already_invited: 'info',
  already_applied: 'info',
  not_eligible: 'warning',
  limit_reached: 'danger',
} as const satisfies Record<CampaignInviteSkip, HueTone>;

/** A reason this build does not know yet. */
export const UNKNOWN_INVITE_SKIP_TONE: HueTone = 'neutral';
