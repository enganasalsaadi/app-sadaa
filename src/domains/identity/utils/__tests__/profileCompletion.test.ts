import type { ProfileCompletionStep } from '@/domains/auth';
import { buildMissingSteps, pickNextStep } from '../profileCompletion';

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
