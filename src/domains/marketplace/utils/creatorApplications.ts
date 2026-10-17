import type { HueTone } from '@/core/theme';
import { APPLICANT_URGENT_HOURS } from '../constants/applicants';
import { isDealStatus } from '../types';
import type { CreatorApplication } from '../types/campaign';
import { getApplicationStatusMeta } from './campaignStatus';
import { getDealStatusMeta } from './dealStatus';

const HOUR = 3_600_000;
/** An application is a binding offer for 72 h from signing (contract §4.2). */
export const APPLICATION_WINDOW_MS = 72 * HOUR;

export interface ApplicationWindow {
  /** 1 at signing, 0 when the brand's time is up: how much of the ring is left. */
  progress: number;
  /** Whole hours still to run, rounded up so «0س» is never shown before the end. */
  hoursLeft: number;
  /** The last hours: the ring turns warm. */
  urgent: boolean;
  expired: boolean;
}

/** The brand's 72 h to answer, from the server's `expires_at`. */
export const applicationWindow = (expiresAt: number, now: number): ApplicationWindow => {
  const left = expiresAt - now;
  if (left <= 0) return { progress: 0, hoursLeft: 0, urgent: false, expired: true };
  return {
    progress: Math.min(1, left / APPLICATION_WINDOW_MS),
    hoursLeft: Math.ceil(left / HOUR),
    urgent: left < APPLICANT_URGENT_HOURS * HOUR,
    expired: false,
  };
};

/** Submitted / shortlisted: the only ones still waiting on the brand, so the only ones with a clock and a withdraw. */
export const isPendingApplication = ({ status }: Pick<CreatorApplication, 'status'>): boolean =>
  getApplicationStatusMeta(status.key).pending;

/**
 * The tone of what the card says (contract §4.3 `state`): the application's own status while it
 * waits, the linked deal's stage once it is one. A stage the app has no meta for (an item stage)
 * is work in progress. «Not selected» and the other closed ones stay neutral — never a danger tone.
 */
export const applicationTone = ({ state, status }: Pick<CreatorApplication, 'state' | 'status'>): HueTone => {
  if (state.source === 'deal') {
    return isDealStatus(state.key) ? getDealStatusMeta(state.key).tone : 'interactive';
  }
  return getApplicationStatusMeta(status.key).tone;
};

export type ApplicationTarget = { kind: 'deal' | 'campaign'; id: string };

/** Where a tap on the card goes: the deal once there is one, else the campaign's page. */
export const applicationTarget = ({ deal, campaign }: Pick<CreatorApplication, 'deal' | 'campaign'>): ApplicationTarget =>
  deal ? { kind: 'deal', id: deal.id } : { kind: 'campaign', id: campaign.id };
