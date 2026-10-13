import type { ProfileStepKey } from '@/domains/auth';
import { PROFILE_STEP_META } from '../../constants/profileSteps';
import type { MissingStep } from '../profileCompletion';
import { buildProfileOrbit, buildProfileSteps, type ProfileStep } from '../profileOrbit';

jest.mock('@/domains/auth', () => jest.requireActual('@/domains/auth/store/authTypes'));
jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: (_target, name) => (name === '__esModule' ? undefined : name) }),
);

type StepWithMeta = Exclude<ProfileStepKey, 'account_created'>;

const missing = (key: StepWithMeta, points: number): MissingStep => ({
  key,
  points,
  meta: PROFILE_STEP_META[key],
});

const todo = (key: StepWithMeta, points = 10): ProfileStep => ({ ...missing(key, points), state: 'todo' });

describe('buildProfileSteps', () => {
  it('puts the most points first and keeps server order on a tie', () => {
    const steps = buildProfileSteps(
      [missing('avatar', 10), missing('rate_cards', 15), missing('email', 10)],
      'unverified',
      null,
    );
    expect(steps.map(s => s.key)).toEqual(['rate_cards', 'avatar', 'email']);
  });

  it('lets KYC lead on a tie', () => {
    const steps = buildProfileSteps([missing('avatar', 20), missing('kyc', 20)], 'unverified', null);
    expect(steps.map(s => s.key)).toEqual(['kyc', 'avatar']);
  });

  it('maps the KYC status to the step state', () => {
    expect(buildProfileSteps([missing('kyc', 20)], 'pending', null)[0]?.state).toBe('review');
    expect(buildProfileSteps([missing('kyc', 20)], 'rejected', null)[0]?.state).toBe('rejected');
    expect(buildProfileSteps([missing('kyc', 20)], 'unverified', null)[0]?.state).toBe('todo');
  });

  it('turns platforms under review into a review step with no target', () => {
    const [step] = buildProfileSteps([missing('platforms_verified', 10)], 'unverified', 'under_review');
    expect(step?.state).toBe('review');
    expect(step?.meta.target).toBeNull();
  });

  it('keeps platforms that need action as a todo step', () => {
    const [step] = buildProfileSteps([missing('platforms_verified', 10)], 'unverified', 'action_required');
    expect(step?.state).toBe('todo');
    expect(step?.meta.target).toBe('platforms');
  });
});

describe('buildProfileOrbit', () => {
  it('fills done arcs first and ends with the most important step', () => {
    const steps = [{ ...todo('kyc', 20), state: 'review' as const }, todo('avatar')];
    expect(buildProfileOrbit(5, steps).arcs).toEqual(['done', 'done', 'done', 'missing', 'review']);
  });

  it('draws nothing without steps', () => {
    expect(buildProfileOrbit(0, [])).toEqual({ arcs: [], satellites: [] });
  });

  it('puts up to three satellites at their arc centres, the first at the top', () => {
    const steps = [todo('kyc', 20), todo('rate_cards', 15), todo('avatar'), todo('email')];
    const { satellites } = buildProfileOrbit(8, steps);
    expect(satellites.map(s => [s.step.key, s.angle])).toEqual([
      ['kyc', 337.5],
      ['rate_cards', 292.5],
      ['avatar', 247.5],
    ]);
  });

  it('drops a satellite that would sit on the percentage pill', () => {
    const steps = [todo('kyc', 20), todo('rate_cards', 15), todo('avatar')];
    expect(buildProfileOrbit(5, steps).satellites.map(s => s.step.key)).toEqual(['kyc', 'rate_cards']);
  });
});
