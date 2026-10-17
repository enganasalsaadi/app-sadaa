import { DEAL_STATUS_META } from '../constants/dealStatus';
import { isDealStatus } from '../types';
import type { DealActor, DealTimelineRow, Labeled } from '../types';
import type { DealJourneyStageKey } from './dealJourney';
import { stationOfStatus } from './dealStation';

/** Note reasons this build words itself; any other note shows the server's status label. */
export const DEAL_NOTE_REASONS = [
  'shipped',
  'shipment_updated',
  'upsell_proposed',
  'upsell_accepted',
  'upsell_voided',
  'upsell_unfunded',
  'retention_reported',
  'retention_restored',
  'retention_contested',
  'retention_confirmed',
  'retention_rejected',
  'retention_escalated',
  'retention_auto_confirmed',
  'retention_clawback',
  'rating_window_opened',
  'rating_submitted',
  'ratings_revealed',
  'dispute_evidence_added',
  'dispute_evidence_reopened',
] as const;
export type DealNoteReason = (typeof DEAL_NOTE_REASONS)[number];

const isNoteReason = (value: string | null): value is DealNoteReason =>
  value !== null && (DEAL_NOTE_REASONS as readonly string[]).includes(value);

/** A campaign announcement the brand sent to every creator on the campaign (contract §5.6). */
export interface DealAnnouncement {
  body: string;
  /** https address as the brand typed it; shown, never opened (rule 07). */
  link: string | null;
}

const ANNOUNCEMENT_REASON = 'campaign_announcement';

const readText = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() !== '' ? value : null;

/** The announcement a note row carries, `null` for any other row or a row without a readable body. */
export const readAnnouncement = (row: Pick<DealTimelineRow, 'reason' | 'metadata'>): DealAnnouncement | null => {
  if (row.reason !== ANNOUNCEMENT_REASON || row.metadata === null) return null;
  const body = readText(row.metadata.body);
  return body === null ? null : { body, link: readText(row.metadata.link) };
};

export interface DealTimelineEvent {
  id: string;
  /** Server status label; shown when `note` is `null`. */
  label: string;
  note: DealNoteReason | null;
  announcement: DealAnnouncement | null;
  actor: Labeled<DealActor>;
  at: number;
  isNote: boolean;
}

export type DealStationEvents = Record<
  DealJourneyStageKey,
  DealTimelineEvent[]
>;

const emptyStations = (): DealStationEvents => ({
  sign: [],
  reply: [],
  escrow: [],
  ship: [],
  make: [],
  review: [],
  publish: [],
  done: [],
});

/**
 * A dispute or an early end happens wherever the deal was, and a note on a deal `in_progress`
 * belongs to whichever item station it is at: none of them has a station of its own.
 */
const staysWhereItWas = (row: DealTimelineRow): boolean =>
  row.subject.type === 'deal' &&
  isDealStatus(row.to.key) &&
  (row.to.key === 'disputed' ||
    DEAL_STATUS_META[row.to.key].outcome === 'stopped' ||
    (row.isNote && row.to.key === 'in_progress'));

/**
 * The history (oldest first) sorted into the journey's stations, newest first inside each, so a
 * station card can say what happened there and when. Note rows (`from == to`) land in the
 * station of their status. A dispute, an early end or a row this build can't place stays at the
 * station before it.
 */
export const groupTimelineByStation = (
  rows: readonly DealTimelineRow[],
): DealStationEvents => {
  const grouped = emptyStations();
  let last: DealJourneyStageKey = 'sign';
  rows.forEach(row => {
    const station = staysWhereItWas(row)
      ? last
      : stationOfStatus(row.to.key, row.subject.type) ?? last;
    last = station;
    grouped[station].unshift({
      id: row.id,
      label: row.to.label,
      note: row.isNote && isNoteReason(row.reason) ? row.reason : null,
      announcement: row.isNote ? readAnnouncement(row) : null,
      actor: row.actor,
      at: row.occurredAt,
      isNote: row.isNote,
    });
  });
  return grouped;
};
