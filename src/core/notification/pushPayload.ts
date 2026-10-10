/** FCM `data.type` values (contract §11.2, wallet handoff §9, top-ups v2 §4, company verification). */
export const PUSH_TYPES = [
  'kyc_approved',
  'kyc_rejected',
  'brand_social_proof_approved',
  'brand_social_proof_rejected',
  'brand_domain_verified',
  'platform_approved',
  'platform_rejected',
  'wallet_top_up_completed',
  'wallet_top_up_rejected',
  'wallet_top_up_reversed',
  'wallet_withdrawal_completed',
  'wallet_withdrawal_rejected',
  'wallet_withdrawal_returned',
  'wallet_wallet_frozen',
  'wallet_wallet_unfrozen',
  'wallet_payout_method_added',
  'wallet_payout_method_changed',
  'test',
] as const;
export type PushType = (typeof PUSH_TYPES)[number];

/** Company verification route results (social proof, domain email); they refetch the routes' state. */
export const VERIFICATION_PUSH_TYPES = [
  'brand_social_proof_approved',
  'brand_social_proof_rejected',
  'brand_domain_verified',
] as const satisfies readonly PushType[];

/** Where a tapped push leads, parsed from `data.deep_link`. */
export type PushTarget =
  | { kind: 'kyc' }
  | { kind: 'verification' }
  | { kind: 'platform'; platformId: string }
  | { kind: 'notifications' }
  | { kind: 'wallet' }
  | { kind: 'payoutMethods' }
  | { kind: 'topUp'; topUpId: string }
  | { kind: 'withdrawal'; withdrawalId: string };

export interface ParsedPush {
  /** `null` for a type this build doesn't know yet. */
  type: PushType | null;
  /** `null` when the link is missing, foreign or malformed: just open the app. */
  target: PushTarget | null;
}

const DEEP_LINK_SCHEME = 'sada://';
// ULIDs and numeric ids only: nothing that could smuggle a path or a query.
const ENTITY_ID = /^[A-Za-z0-9]{1,64}$/;

const isPushType = (value: unknown): value is PushType =>
  typeof value === 'string' && (PUSH_TYPES as readonly string[]).includes(value);

const parseDeepLink = (link: unknown): PushTarget | null => {
  if (typeof link !== 'string' || !link.startsWith(DEEP_LINK_SCHEME)) return null;
  const segments = link.slice(DEEP_LINK_SCHEME.length).split('/');
  // `wallet/top-ups/{id}` and `wallet/withdrawals/{id}` are the only three-segment routes.
  if (segments.length === 3) {
    const [route, sub, id = ''] = segments;
    if (route !== 'wallet' || !ENTITY_ID.test(id)) return null;
    if (sub === 'top-ups') return { kind: 'topUp', topUpId: id };
    if (sub === 'withdrawals') return { kind: 'withdrawal', withdrawalId: id };
    return null;
  }
  const [route, id, ...rest] = segments;
  if (rest.length > 0) return null;

  if (route === 'kyc' && id === undefined) return { kind: 'kyc' };
  if (route === 'verification' && id === undefined) return { kind: 'verification' };
  if (route === 'notifications' && id === undefined) return { kind: 'notifications' };
  if (route === 'wallet' && id === undefined) return { kind: 'wallet' };
  if (route === 'wallet' && id === 'payout-methods') return { kind: 'payoutMethods' };
  if (route === 'platforms' && id !== undefined && ENTITY_ID.test(id)) {
    return { kind: 'platform', platformId: id };
  }
  return null;
};

/**
 * Typed view of an FCM `data` payload (rule 07): only known types and
 * allow-listed `sada://` links survive; screen names are never read from it.
 */
export const parsePushPayload = (
  data: Readonly<Record<string, unknown>> | undefined,
): ParsedPush => {
  const type = data?.type;
  return {
    type: isPushType(type) ? type : null,
    target: parseDeepLink(data?.deep_link),
  };
};
