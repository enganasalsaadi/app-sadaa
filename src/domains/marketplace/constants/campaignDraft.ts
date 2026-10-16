import type { CampaignMissingKey, CampaignWizardStep } from '../types/campaignDraft';

/** Server caps for a draft (contract §3.2); the step forms validate against the same numbers. */
export const CAMPAIGN_DRAFT_LIMITS = {
  titleMin: 3,
  titleMax: 120,
  teaserMax: 1000,
  drafts: 20,
} as const;

/** Quiet time after the last edit before the draft is saved. */
export const CAMPAIGN_AUTOSAVE_DELAY_MS = 800;

/** Which wizard step owns each reason `missing[]` can give (PC1.0 step grouping). */
export const CAMPAIGN_MISSING_STEP = {
  title: 'idea',
  activity_type: 'idea',
  teaser: 'idea',
  deliverables: 'requirements',
  pricing: 'money',
  apply_deadline_at: 'money',
  schedule: 'money',
} as const satisfies Record<CampaignMissingKey, CampaignWizardStep>;

/** A reason this build doesn't know still blocks Submit, so it is shown where the brand sends. */
export const CAMPAIGN_UNKNOWN_MISSING_STEP: CampaignWizardStep = 'review';
