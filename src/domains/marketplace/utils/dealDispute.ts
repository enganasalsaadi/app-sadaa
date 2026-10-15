import type { Money } from '@/core/money';
import { DEAL_DISPUTE_LIMITS } from '../constants/dealDispute';
import type {
  DealActor,
  DealDispute,
  DealDisputeDetail,
  DealDisputeEntry,
  DealDisputeRefInput,
  DealDisputeRuling,
  DealEvidenceInput,
  DealRole,
  DealShipment,
} from '../types/deal';
import { safeTrackingUrl } from './dealShipping';

const HOUR_MS = 3_600_000;

/** The server names the creator's side `influencer`. */
export const isOwnParty = (party: DealActor | null, role: DealRole): boolean =>
  party === (role === 'brand' ? 'brand' : 'influencer');

/**
 * The dispute the deal shows (`deal.dispute` is the latest); `GET …/disputes` lists every one,
 * oldest first, so the last one stands in when the ids don't meet.
 */
export const pickDispute = (
  list: readonly DealDisputeDetail[],
  id: string | null,
): DealDisputeDetail | null => list.find(dispute => dispute.id === id) ?? list[list.length - 1] ?? null;

/** Where a dispute stands for the screen: evidence open, the team reviewing, ruled, or withdrawn. */
type DealDisputePhase = 'evidence' | 'review' | 'ruled' | 'withdrawn';

export const disputePhase = (dispute: Pick<DealDispute, 'status' | 'ruling' | 'evidenceOpen'>): DealDisputePhase => {
  if (dispute.status.key === 'withdrawn') return 'withdrawn';
  if (dispute.ruling !== null || dispute.status.key === 'resolved') return 'ruled';
  return dispute.evidenceOpen ? 'evidence' : 'review';
};

/**
 * The thread under the statement card. Opening writes the statement as the opener's first entry;
 * that entry is dropped when it carries nothing else, so the statement shows once.
 */
export const evidenceThread = (dispute: DealDisputeDetail): DealDisputeEntry[] => {
  const [first, ...rest] = dispute.entries;
  const statementOnly =
    first !== undefined &&
    first.party === dispute.openedBy &&
    first.note === dispute.statement &&
    first.files.length === 0 &&
    first.links.length === 0 &&
    first.refs.length === 0;
  return statementOnly ? rest : dispute.entries;
};

/** What one side has handed in; the server caps each side across the whole dispute. */
export interface DealEvidenceTally {
  entries: number;
  files: number;
  links: number;
}

const tallyOf = (entries: readonly DealDisputeEntry[]): DealEvidenceTally => ({
  entries: entries.length,
  files: entries.reduce((sum, entry) => sum + entry.files.length, 0),
  links: entries.reduce((sum, entry) => sum + entry.links.length, 0),
});

/** The viewer's side and the other party's; admin or system entries count for neither. */
export const evidenceTally = (
  entries: readonly DealDisputeEntry[],
  role: DealRole,
): { mine: DealEvidenceTally; theirs: DealEvidenceTally } => {
  const other: DealActor = role === 'brand' ? 'influencer' : 'brand';
  return {
    mine: tallyOf(entries.filter(entry => isOwnParty(entry.party, role))),
    theirs: tallyOf(entries.filter(entry => entry.party === other)),
  };
};

/** Room left for the viewer's next entry under the per-side caps. */
export const evidenceRoom = (mine: DealEvidenceTally): DealEvidenceTally => ({
  entries: Math.max(0, DEAL_DISPUTE_LIMITS.maxEntries - mine.entries),
  files: Math.max(0, DEAL_DISPUTE_LIMITS.maxFiles - mine.files),
  links: Math.max(0, DEAL_DISPUTE_LIMITS.maxLinks - mine.links),
});

/** How much of the evidence window is left (1 → 0), against its usual 24 hours. */
export const evidenceWindowShare = (dueAt: number | null, now: number): number => {
  if (dueAt === null) return 0;
  const span = DEAL_DISPUTE_LIMITS.evidenceHours * HOUR_MS;
  return Math.min(1, Math.max(0, (dueAt - now) / span));
};

/** A link the server takes: https, a real host, no spaces, within the length cap. */
export const isEvidenceLink = (text: string): boolean => {
  const value = text.trim();
  // Same well-formed https rule as courier links; the server re-validates.
  return value.length > 0 && value.length <= DEAL_DISPUTE_LIMITS.maxUrl && safeTrackingUrl(value) !== null;
};

/** `{reason, statement}`; the statement goes trimmed, as the server counts its length. */
export const toDisputeOpenBody = ({ reason, statement }: { reason: string | null; statement: string }) => ({
  reason,
  statement: statement.trim(),
});

const toRefBody = (ref: DealDisputeRefInput) =>
  ref.type === 'file'
    ? { type: 'file', id: ref.id }
    : { type: 'shipment_photo', shipment_id: ref.shipmentId, index: ref.index };

/** `{note, links?, file_ids?, refs?}`: empty lists stay out of the body. */
export const toEvidenceBody = ({ note, links, fileIds, refs }: DealEvidenceInput) => ({
  note: note.trim(),
  ...(links.length > 0 ? { links: [...links] } : {}),
  ...(fileIds.length > 0 ? { file_ids: [...fileIds] } : {}),
  ...(refs.length > 0 ? { refs: refs.map(toRefBody) } : {}),
});

/** A courier-issue photo the viewer may point at: the shipment and the photo's place in its report. */
export interface DealShipmentPhotoRef {
  key: string;
  shipmentId: string;
  index: number;
  url: string;
}

export const shipmentPhotoRefs = (shipments: readonly DealShipment[]): DealShipmentPhotoRef[] =>
  shipments.flatMap(shipment =>
    (shipment.issue?.photos ?? []).flatMap((photo, index) =>
      photo.url ? [{ key: `${shipment.id}:${index}`, shipmentId: shipment.id, index, url: photo.url }] : [],
    ),
  );

/** One share of the ruled money: back to the brand, the creator's net, the platform's commission. */
export interface DealRulingShare {
  key: 'refund' | 'creator' | 'commission';
  amount: Money;
}

/** The ruling's split bar, in the server's figures only; empty shares drop out. */
export const rulingShares = (ruling: DealDisputeRuling): DealRulingShare[] =>
  (
    [
      { key: 'refund', amount: ruling.brandAmount },
      { key: 'creator', amount: ruling.creatorNet },
      { key: 'commission', amount: ruling.commission },
    ] as const
  ).filter(share => share.amount.amount > 0);

/** The side the ruling weighed toward, by gross amount; `even` when both got the same. */
export const rulingLean = (ruling: DealDisputeRuling): 'brand' | 'creator' | 'even' => {
  const brand = ruling.brandAmount.amount;
  const creator = ruling.creatorAmount.amount;
  if (brand === creator) return 'even';
  return brand > creator ? 'brand' : 'creator';
};

/** What the ruling means for the viewer: the brand's refund, or what reaches the creator's wallet. */
export const rulingForViewer = (ruling: DealDisputeRuling, role: DealRole): Money =>
  role === 'brand' ? ruling.brandAmount : ruling.creatorNet;
