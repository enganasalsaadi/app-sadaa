import {
  PROFILE_STEP_KEYS,
  type KycStatus,
  type ProfileCompletionStep,
  type ProfileStepKey,
} from '@/domains/auth';
import { PROFILE_STEP_META, type ProfileStepMeta } from '../constants/profileSteps';

export interface MissingStep {
  key: ProfileStepKey;
  points: number;
  meta: ProfileStepMeta;
}

const isProfileStepKey = (key: string): key is ProfileStepKey =>
  (PROFILE_STEP_KEYS as readonly string[]).includes(key);

/** Contract §3.1: `pending` = under review, no CTA; `rejected` = re-upload. */
const kycStepMeta = (meta: ProfileStepMeta, status: KycStatus, isBrand: boolean): ProfileStepMeta => {
  switch (status) {
    case 'pending':
      return { ...meta, titleKey: 'account.profile.steps.kycPending', target: null };
    case 'rejected':
      return { ...meta, titleKey: 'account.profile.steps.kycRejected' };
    default:
      return { ...meta, titleKey: isBrand && meta.brandTitleKey ? meta.brandTitleKey : meta.titleKey };
  }
};

/**
 * Incomplete `profile_completion` steps in server order, with the role's wording.
 * Unknown keys from a newer server are skipped, never shown raw.
 */
export const buildMissingSteps = (
  steps: readonly ProfileCompletionStep[],
  kycStatus: KycStatus,
  isBrand: boolean,
): MissingStep[] => {
  const result: MissingStep[] = [];
  for (const step of steps) {
    if (step.completed || !isProfileStepKey(step.key)) continue;
    const meta: ProfileStepMeta | null = PROFILE_STEP_META[step.key];
    if (!meta) continue;
    if (step.key === 'kyc') {
      result.push({ key: step.key, points: step.points, meta: kycStepMeta(meta, kycStatus, isBrand) });
      continue;
    }
    const titleKey = isBrand && meta.brandTitleKey ? meta.brandTitleKey : meta.titleKey;
    result.push({ key: step.key, points: step.points, meta: { ...meta, titleKey } });
  }
  return result;
};

/** The step Home suggests next: the first one the user can act on now. */
export const pickNextStep = (steps: readonly MissingStep[]): MissingStep | null =>
  steps.find(step => step.meta.target !== null) ?? null;
