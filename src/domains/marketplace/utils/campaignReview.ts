import type { AppApiError } from '@/core/api';
import { CAMPAIGN_MISSING_KEY } from '../types/campaignDraft';
import type { CampaignDraftBrief, CampaignMissingKey, CampaignWizardStep } from '../types/campaignDraft';
import { missingStep } from './campaignDraft';

// The review step and Submit (contract §3.3): what still blocks sending, and why a send was refused.

/** Where the brand's company verification stands for Submit (`kyc_required` on the server). */
export type CampaignKycGate = 'verified' | 'pending' | 'required' | 'unknown';

/** A refused Submit the wizard answers with a sheet, not a field. */
export type CampaignSubmitBlock = 'kyc' | 'kycPending' | 'liveLimit';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isMissingKey = (key: string): key is CampaignMissingKey =>
  (CAMPAIGN_MISSING_KEY as readonly string[]).includes(key);

/** `meta.missing` of a `campaign_not_ready` refusal; `null` when the server sent none. */
export const readCampaignMissing = (details: unknown): string[] | null => {
  if (!isRecord(details) || !isRecord(details.meta) || !Array.isArray(details.meta.missing)) return null;
  return details.meta.missing.filter((key): key is string => typeof key === 'string');
};

/** The known reasons each step still lacks, in the server's order. Unknown reasons are left out. */
export const missingByStep = (missing: readonly string[]): Record<CampaignWizardStep, CampaignMissingKey[]> => {
  const byStep: Record<CampaignWizardStep, CampaignMissingKey[]> = {
    idea: [],
    requirements: [],
    money: [],
    review: [],
  };
  missing.forEach(key => {
    if (isMissingKey(key)) byStep[missingStep(key)].push(key);
  });
  return byStep;
};

/**
 * The brand's KYC from `/me`. Unknown (no field yet, a status this build doesn't know) lets the
 * server decide: Submit answers `kyc_required` if it must.
 */
export const campaignKycGate = (status: string | null | undefined): CampaignKycGate => {
  switch (status) {
    case 'verified':
      return 'verified';
    case 'pending':
      return 'pending';
    case 'unverified':
    case 'rejected':
      return 'required';
    default:
      return 'unknown';
  }
};

/** Refusals that open a sheet; the rest (conflict, not ready, other) are handled where they land. */
export const submitBlockOf = ({ code }: Pick<AppApiError, 'code'>): CampaignSubmitBlock | null => {
  if (code === 'kyc_required') return 'kyc';
  if (code === 'campaign_live_limit') return 'liveLimit';
  return null;
};

/** A few distinct lines of the brief for the locked preview (blurred on screen; never read out). */
export const briefPreviewLines = (brief: CampaignDraftBrief, max = 3): string[] =>
  [
    ...new Set(
      [brief.hashtags.join(' '), ...brief.talkingPoints, ...brief.mentions, brief.promoCode, ...brief.donts]
        .map(line => line.trim())
        .filter(line => line.length > 0),
    ),
  ].slice(0, max);
