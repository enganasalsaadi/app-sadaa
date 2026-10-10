import type { KycDetails } from '../types/kyc';
import type { DomainVerification, SocialProof } from '../types/verification';

/**
 * A verification attempt the brand still has to act on or wait for. The routes run in parallel
 * (contract §Resolved), so several can be open at once; a closed one (approved, verified) never is.
 */
export type ActiveVerificationAttempt =
  | { kind: 'document'; state: 'pending' | 'rejected'; kyc: KycDetails }
  | { kind: 'social'; state: 'pending' | 'rejected'; proof: SocialProof }
  | { kind: 'domain'; state: 'pending' | 'expired'; attempt: DomainVerification };

const isFailed = (attempt: ActiveVerificationAttempt): boolean => attempt.state !== 'pending';

const documentAttempt = (kyc: KycDetails): ActiveVerificationAttempt | null =>
  // Only a document submission moves `kyc_status` before approval (contract §Resolved).
  kyc.status === 'pending' || kyc.status === 'rejected'
    ? { kind: 'document', state: kyc.status, kyc }
    : null;

const socialAttempt = (proof: SocialProof | null): ActiveVerificationAttempt | null =>
  proof?.status === 'pending' || proof?.status === 'rejected'
    ? { kind: 'social', state: proof.status, proof }
    : null;

const domainAttempt = (
  attempt: DomainVerification | null,
  now: number,
): ActiveVerificationAttempt | null => {
  if (attempt?.status === 'expired') return { kind: 'domain', state: 'expired', attempt };
  if (attempt?.status !== 'pending') return null;
  // The server flips the status lazily; a link past its expiry can't be opened any more.
  const expired = Date.parse(attempt.expiresAt) <= now;
  return { kind: 'domain', state: expired ? 'expired' : 'pending', attempt };
};

/**
 * Open attempts for the picker, waiting ones first (document → social → domain inside each half).
 * None once the brand is verified: the verified card replaces them.
 */
export const selectActiveAttempts = (
  kyc: KycDetails,
  social: SocialProof | null,
  domain: DomainVerification | null,
  now: number,
): ActiveVerificationAttempt[] => {
  if (kyc.status === 'verified') return [];
  const open = [documentAttempt(kyc), socialAttempt(social), domainAttempt(domain, now)].filter(
    (attempt): attempt is ActiveVerificationAttempt => attempt !== null,
  );
  return [...open.filter(attempt => !isFailed(attempt)), ...open.filter(isFailed)];
};
