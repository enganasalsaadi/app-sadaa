import type { ProfileCompletionStep } from '@/domains/auth';
import { buildMissingSteps, buildStrengthStages, pickNextStep } from '../profileCompletion';

// The barrel pulls navigators and UI; only the enum is needed here.
jest.mock('@/domains/auth', () => jest.requireActual('@/domains/auth/store/authTypes'));
// Step icons are irrelevant to the rules under test (lucide ships ESM).
jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: (_target, name) => (name === '__esModule' ? undefined : name) }),
);

const step = (key: string, completed = false, points = 10): ProfileCompletionStep => ({
  key,
  points,
  completed,
  status: null,
});

describe('buildMissingSteps', () => {
  it('keeps incomplete known steps in server order', () => {
    const result = buildMissingSteps(
      [step('account_created'), step('avatar'), step('email', true), step('platforms')],
      'unverified',
      false,
    );
    expect(result.map(s => s.key)).toEqual(['avatar', 'platforms']);
  });

  it('skips unknown keys from a newer server', () => {
    expect(buildMissingSteps([step('future_step'), step('avatar')], 'unverified', false)).toHaveLength(1);
  });

  it('uses the brand wording when one exists', () => {
    const [avatar] = buildMissingSteps([step('avatar')], 'unverified', true);
    expect(avatar?.meta.titleKey).toBe('account.profile.steps.logo');
  });

  it('turns a pending KYC into a review row without a target', () => {
    const [kyc] = buildMissingSteps([step('kyc')], 'pending', false);
    expect(kyc?.meta.titleKey).toBe('account.profile.steps.kycPending');
    expect(kyc?.meta.target).toBeNull();
  });

  it('asks for a re-upload after a KYC rejection', () => {
    const [kyc] = buildMissingSteps([step('kyc')], 'rejected', false);
    expect(kyc?.meta.titleKey).toBe('account.profile.steps.kycRejected');
    expect(kyc?.meta.target).toBe('kyc');
  });
});

describe('pickNextStep', () => {
  it('skips steps the user cannot act on', () => {
    const steps = buildMissingSteps([step('kyc'), step('rate_cards')], 'pending', false);
    expect(pickNextStep(steps)?.key).toBe('rate_cards');
  });

  it('returns null when nothing is actionable', () => {
    expect(pickNextStep(buildMissingSteps([step('kyc')], 'pending', false))).toBeNull();
    expect(pickNextStep([])).toBeNull();
  });
});

describe('buildStrengthStages', () => {
  const creatorSteps = (done: readonly string[]) =>
    ['account_created', 'basic_info', 'avatar', 'email', 'platforms', 'platforms_verified', 'rate_cards', 'kyc'].map(
      key => step(key, done.includes(key)),
    );

  it('groups steps into the five stages and marks the next step current', () => {
    const stages = buildStrengthStages(
      creatorSteps(['account_created', 'basic_info', 'email', 'avatar', 'platforms', 'platforms_verified']),
      'rate_cards',
    );
    expect(stages).toEqual([
      { key: 'info', state: 'done' },
      { key: 'avatar', state: 'done' },
      { key: 'platforms', state: 'done' },
      { key: 'rates', state: 'current' },
      { key: 'kyc', state: 'upcoming' },
    ]);
  });

  it('keeps a stage open until every step in it is complete', () => {
    const stages = buildStrengthStages(creatorSteps(['basic_info', 'avatar', 'platforms']), 'email');
    expect(stages[0]).toEqual({ key: 'info', state: 'current' });
    expect(stages[2]).toEqual({ key: 'platforms', state: 'upcoming' });
  });

  it('falls back to the first unfinished stage without a next step (KYC under review)', () => {
    const stages = buildStrengthStages(
      creatorSteps(['basic_info', 'email', 'avatar', 'platforms', 'platforms_verified', 'rate_cards']),
      null,
    );
    expect(stages.at(-1)).toEqual({ key: 'kyc', state: 'current' });
  });

  it('drops stages the server does not send', () => {
    const stages = buildStrengthStages([step('basic_info', true), step('kyc')], 'kyc');
    expect(stages.map(s => s.key)).toEqual(['info', 'kyc']);
  });
});
