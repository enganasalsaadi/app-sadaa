import type { WizardRailState } from '../components/WizardRailStop';
import { CAMPAIGN_DRAFT_LIMITS } from '../constants/campaignDraft';
import { CAMPAIGN_WIZARD_STEP } from '../types/campaignDraft';
import type { CampaignWizardProgress, CampaignWizardStep } from '../types/campaignDraft';
import type { CampaignDraftRefusal } from './campaignDraftSync';

/** The step after `step`, or `null` on the last one. */
export const nextWizardStep = (step: CampaignWizardStep): CampaignWizardStep | null =>
  CAMPAIGN_WIZARD_STEP[CAMPAIGN_WIZARD_STEP.indexOf(step) + 1] ?? null;

/** The step before `step`, or `null` on the first one. */
export const previousWizardStep = (step: CampaignWizardStep): CampaignWizardStep | null =>
  CAMPAIGN_WIZARD_STEP[CAMPAIGN_WIZARD_STEP.indexOf(step) - 1] ?? null;

/**
 * How one stop of the rail reads. Behind the current step: a check when the server has nothing
 * left to ask of it, a warning when it still does. Ahead: plain, even when already complete (a
 * resumed draft), so a fresh draft isn't a rail of warnings.
 */
export const wizardRailState = (
  step: CampaignWizardStep,
  current: CampaignWizardStep,
  progress: CampaignWizardProgress,
): WizardRailState => {
  if (step === current) return 'now';
  if (CAMPAIGN_WIZARD_STEP.indexOf(step) > CAMPAIGN_WIZARD_STEP.indexOf(current)) return 'todo';
  return progress.steps[step] === 'complete' ? 'done' : 'missing';
};

/** The campaign's title is the one field with a client rule: it creates the draft (3–120 characters). */
export const isValidCampaignTitle = (title: string): boolean => {
  const length = title.trim().length;
  return length >= CAMPAIGN_DRAFT_LIMITS.titleMin && length <= CAMPAIGN_DRAFT_LIMITS.titleMax;
};

/**
 * What the server said about a refused part, for the field it belongs to: the message of the first
 * of `fieldNames` it named, else its general one.
 */
export const refusalMessage = (
  refusal: CampaignDraftRefusal | undefined,
  fieldNames: readonly string[],
): string | undefined => {
  if (!refusal) return undefined;
  const field = fieldNames.find(name => refusal.fields[name]);
  return field ? refusal.fields[field] : refusal.error.message;
};
