import type { KycStatus, PlatformsReviewStatus } from '@/domains/auth';
import type { MissingStep } from './profileCompletion';

/** `todo`: the user can act now · `review`: waiting on us · `rejected`: KYC to send again. */
export type ProfileStepState = 'todo' | 'review' | 'rejected';

export interface ProfileStep extends MissingStep {
  state: ProfileStepState;
}

export type OrbitArcState = 'done' | 'missing' | 'review' | 'rejected';

export interface OrbitSatellite {
  step: ProfileStep;
  /** Degrees from the top, toward the reading start (the way the arcs fill). */
  angle: number;
}

export interface ProfileOrbit {
  /** One arc per server step, from the top: done ones first, the most important last. */
  arcs: OrbitArcState[];
  satellites: OrbitSatellite[];
}

/** The ring holds at most three satellites; the tickets below list every step. */
export const MAX_SATELLITES = 3;
/** Below this angle a satellite would sit on the percentage pill at the bottom. */
const SATELLITE_MIN_ANGLE = 205;
const FULL_TURN = 360;

const ARC_FOR_STATE = {
  todo: 'missing',
  review: 'review',
  rejected: 'rejected',
} as const satisfies Record<ProfileStepState, OrbitArcState>;

const kycState = (status: KycStatus): ProfileStepState =>
  status === 'pending' ? 'review' : status === 'rejected' ? 'rejected' : 'todo';

/**
 * Missing steps for the Profile orbit and tickets: most points first, KYC first on a tie,
 * then server order. Platforms waiting on review become a review step with no target.
 */
export const buildProfileSteps = (
  missing: readonly MissingStep[],
  kycStatus: KycStatus,
  platformsReview: PlatformsReviewStatus | null,
): ProfileStep[] =>
  missing
    .map((step, index) => ({ step, index }))
    .sort(
      (a, b) =>
        b.step.points - a.step.points ||
        Number(b.step.key === 'kyc') - Number(a.step.key === 'kyc') ||
        a.index - b.index,
    )
    .map(({ step }): ProfileStep => {
      if (step.key === 'kyc') return { ...step, state: kycState(kycStatus) };
      if (step.key === 'platforms_verified' && platformsReview === 'under_review') {
        return { ...step, meta: { ...step.meta, target: null }, state: 'review' };
      }
      return { ...step, state: 'todo' };
    });

/**
 * Arcs and satellites for `total` server steps. Missing steps fill the ring's last arcs, the
 * most important one ending at the top, and the first `MAX_SATELLITES` of them sit on their
 * arc unless that spot is too close to the bottom.
 */
export const buildProfileOrbit = (total: number, steps: readonly ProfileStep[]): ProfileOrbit => {
  const count = Math.max(total, steps.length);
  if (count === 0) return { arcs: [], satellites: [] };
  const slot = FULL_TURN / count;
  const missing = [...steps].reverse().map(step => ARC_FOR_STATE[step.state]);
  const arcs: OrbitArcState[] = [
    ...Array.from({ length: count - steps.length }, (): OrbitArcState => 'done'),
    ...missing,
  ];
  const satellites = steps
    .slice(0, MAX_SATELLITES)
    .map((step, index) => ({ step, angle: (count - index - 0.5) * slot }))
    .filter(satellite => satellite.angle >= SATELLITE_MIN_ANGLE);
  return { arcs, satellites };
};
