import type { Labeled, Timestamp } from './deal';

/** What holds a creator back (contract §5.5): the sample's waybill, or the ban after a severe strike. */
export const RESTRICTION_KIND = ['return_pending', 'public_apply_ban'] as const;
export type RestrictionKind = (typeof RESTRICTION_KIND)[number];

export interface CreatorRestriction {
  id: string;
  kind: Labeled<RestrictionKind>;
  blocksPublicApplications: boolean;
  blocksDirectOffers: boolean;
  /** The deal whose sample is still owed (`return_pending`). */
  dealId: string | null;
  startsAt: Timestamp | null;
  /** `null` = until the creator acts (the waybill), not until a date. */
  endsAt: Timestamp | null;
}

export interface CreatorRestrictions {
  items: CreatorRestriction[];
  canApplyPublic: boolean;
  canAcceptDirect: boolean;
}
