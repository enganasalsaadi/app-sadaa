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

/** Home's profile-strength track groups the creator's completion steps into five stages. */
export type StrengthStageKey = 'info' | 'avatar' | 'platforms' | 'rates' | 'kyc';
export type StrengthStageState = 'done' | 'current' | 'upcoming';

export interface StrengthStage {
  key: StrengthStageKey;
  state: StrengthStageState;
}

const STRENGTH_STAGES: readonly { key: StrengthStageKey; steps: readonly ProfileStepKey[] }[] = [
  { key: 'info', steps: ['basic_info', 'email'] },
  { key: 'avatar', steps: ['avatar'] },
  { key: 'platforms', steps: ['platforms', 'platforms_verified'] },
  { key: 'rates', steps: ['rate_cards'] },
  { key: 'kyc', steps: ['kyc'] },
];

/**
 * Stages for the strength track, in a fixed order. A stage shows only when the server
 * sends at least one of its steps, and is done when every step it sent is complete.
 * The stage holding `nextStep` is current. Without one (e.g. KYC under review), the
 * first unfinished stage is current.
 */
export const buildStrengthStages = (
  steps: readonly ProfileCompletionStep[],
  nextStep: ProfileStepKey | null,
): StrengthStage[] => {
  const completed = new Map(steps.map(step => [step.key, step.completed]));
  const stages = STRENGTH_STAGES.filter(stage => stage.steps.some(key => completed.has(key))).map(
    stage => ({
      key: stage.key,
      done: stage.steps.every(key => completed.get(key) !== false),
      holdsNext: nextStep !== null && stage.steps.includes(nextStep),
    }),
  );
  const holding = stages.findIndex(stage => !stage.done && stage.holdsNext);
  const current = holding >= 0 ? holding : stages.findIndex(stage => !stage.done);
  return stages.map((stage, index) => ({
    key: stage.key,
    state: stage.done ? 'done' : index === current ? 'current' : 'upcoming',
  }));
};
