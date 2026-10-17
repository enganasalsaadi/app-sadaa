import { toLabeled, toTimestampOrNull } from './dealMappers';
import type { Timestamp } from '../types/deal';
import { RESTRICTION_KIND, type CreatorRestriction, type CreatorRestrictions } from '../types/restriction';
import type { CreatorRestrictionDto, CreatorRestrictionsMetaDto } from '../types/restrictionDto';

export const mapCreatorRestrictions = (
  rows: CreatorRestrictionDto[],
  meta: CreatorRestrictionsMetaDto,
): CreatorRestrictions => ({
  items: rows.map(row => ({
    id: row.id,
    kind: toLabeled(RESTRICTION_KIND, row.kind),
    blocksPublicApplications: row.blocks_public_applications,
    blocksDirectOffers: row.blocks_direct_offers,
    dealId: row.deal_id,
    startsAt: toTimestampOrNull(row.starts_at),
    endsAt: toTimestampOrNull(row.ends_at),
  })),
  canApplyPublic: meta.can_apply_public,
  canAcceptDirect: meta.can_accept_direct,
});

/** What the banner and the dock say; every line of copy is the server's `kind.label` or ours by kind. */
export type RestrictionNotice =
  | { kind: 'return_pending'; dealId: string | null; label: string }
  | { kind: 'public_apply_ban'; endsAt: Timestamp | null; label: string }
  | { kind: 'other'; endsAt: Timestamp | null; label: string };

const isLive = (row: CreatorRestriction, now: number): boolean => row.endsAt === null || row.endsAt > now;

const noticeOf = (row: CreatorRestriction): RestrictionNotice => {
  const { key, label } = row.kind;
  if (key === 'return_pending') return { kind: key, dealId: row.dealId, label };
  if (key === 'public_apply_ban') return { kind: key, endsAt: row.endsAt, label };
  return { kind: 'other', endsAt: row.endsAt, label };
};

/** What a restriction stops: applying to public campaigns, or accepting direct offers. */
export type RestrictionScope = 'public' | 'direct';

const blocks = (row: CreatorRestriction, scope: RestrictionScope): boolean =>
  scope === 'public' ? row.blocksPublicApplications : row.blocksDirectOffers;

/**
 * The one restriction to show for what the creator is trying to do: the owed waybill first (the
 * creator can end it right now), then a ban, then anything unknown that still blocks. A row whose
 * date has passed drops out here, without waiting for a refetch. `null` = nothing in the way.
 */
export const restrictionNotice = (
  restrictions: Pick<CreatorRestrictions, 'items' | 'canApplyPublic' | 'canAcceptDirect'> | null,
  scope: RestrictionScope,
  now: number,
): RestrictionNotice | null => {
  if (!restrictions) return null;
  const live = restrictions.items.filter(row => blocks(row, scope) && isLive(row, now));
  const pick =
    live.find(row => row.kind.key === 'return_pending') ??
    live.find(row => row.kind.key === 'public_apply_ban') ??
    live[0];
  if (pick) return noticeOf(pick);
  // The server says no but names nothing: still a lock, in our words.
  const allowed = scope === 'public' ? restrictions.canApplyPublic : restrictions.canAcceptDirect;
  return allowed || restrictions.items.length > 0 ? null : { kind: 'other', endsAt: null, label: '' };
};
