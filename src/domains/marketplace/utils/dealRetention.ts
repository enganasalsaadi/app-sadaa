import type {
  Deal,
  DealRetentionCase,
  DealRetentionTerm,
  DealRole,
} from '../types/deal';

/** One verified post's agreed time online, as the deal page draws it. */
export interface DealRetentionLife {
  itemId: string;
  title: string;
  platform: string | null;
  term: DealRetentionTerm | null;
  running: boolean;
  /** Share of the period still to run (0–1). A permanent post stays full: its end is only the report cap. */
  share: number;
  secondsLeft: number;
  endsAt: number;
  reportAvailable: boolean;
  /** A report on this post is still open. */
  reported: boolean;
}

/** Every post with a retention window, in the deal's item order; the brand reports from here. */
export const retentionLives = (
  deal: Pick<Deal, 'items' | 'retention'>,
  now: number,
): DealRetentionLife[] =>
  deal.retention.flatMap(window => {
    const item = deal.items.find(entry => entry.id === window.itemId);
    if (!item || window.endsAt === null) return [];
    const running = window.endsAt > now;
    const span = item.verifiedAt === null ? 0 : window.endsAt - item.verifiedAt;
    const share = !running
      ? 0
      : item.retention === 'permanent' || span <= 0
      ? 1
      : Math.min(1, (window.endsAt - now) / span);
    return [
      {
        itemId: item.id,
        title: item.title,
        platform: item.platform,
        term: item.retention,
        running,
        share,
        secondsLeft: running ? Math.floor((window.endsAt - now) / 1000) : 0,
        endsAt: window.endsAt,
        reportAvailable: window.reportAvailable,
        reported: window.openCaseId !== null,
      },
    ];
  });

/** Where a report stands; a closed one by how it closed (server `closed_reason`). */
export type DealRetentionPhase =
  | 'awaitingCreator'
  | 'awaitingBrand'
  | 'escalated'
  | 'restored'
  | 'upheld'
  | 'dismissed'
  | 'closed';

export const retentionPhase = (
  retentionCase: Pick<DealRetentionCase, 'status' | 'closedReason'>,
): DealRetentionPhase => {
  const key = retentionCase.status.key;
  switch (key) {
    case 'awaiting_influencer':
      return 'awaitingCreator';
    case 'awaiting_brand':
      return 'awaitingBrand';
    case 'escalated':
      return 'escalated';
    case 'closed':
    case null:
      break;
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
  switch (retentionCase.closedReason) {
    case 'confirmed':
    case 'auto_confirmed':
      return 'restored';
    case 'upheld':
      return 'upheld';
    case 'dismissed':
      return 'dismissed';
    default:
      // An unknown status or close code still renders, under the server's label.
      return 'closed';
  }
};

export const isRetentionOpen = (phase: DealRetentionPhase): boolean =>
  phase === 'awaitingCreator' ||
  phase === 'awaitingBrand' ||
  phase === 'escalated';

/** What the viewer can do on a case: only the side the case waits on acts. */
export type DealRetentionCaseAction =
  | 'restore'
  | 'contest'
  | 'confirm'
  | 'reject';

export const retentionCaseActions = (
  phase: DealRetentionPhase,
  role: DealRole,
): DealRetentionCaseAction[] => {
  if (role === 'creator' && phase === 'awaitingCreator')
    return ['restore', 'contest'];
  if (role === 'brand' && phase === 'awaitingBrand')
    return ['confirm', 'reject'];
  return [];
};

/** Open cases first (the one waiting on someone), then the closed ones, newest report first in each. */
export const sortRetentionCases = (
  cases: readonly DealRetentionCase[],
): DealRetentionCase[] =>
  [...cases].sort((a, b) => {
    const open =
      Number(isRetentionOpen(retentionPhase(b))) -
      Number(isRetentionOpen(retentionPhase(a)));
    return open !== 0 ? open : (b.reportedAt ?? 0) - (a.reportedAt ?? 0);
  });

/** Viewable screenshots of a case (purged files have no URL). */
export const retentionShots = (
  files: DealRetentionCase['reportFiles'],
): string[] =>
  files.flatMap(file => (file.kind === 'image' && file.url ? [file.url] : []));

/** `{reason, note?, file_ids}`; an empty note goes as `null` (the server needs one only for `other`). */
export const toRetentionReportBody = (
  { reason, note }: { reason: string | null; note: string },
  fileIds: readonly string[],
) => ({
  reason,
  note: note.trim() || null,
  file_ids: [...fileIds],
});

/** `{url?, file_ids}`; no link is left out rather than sent empty. */
export const toRetentionRestoreBody = (
  url: string,
  fileIds: readonly string[],
) => {
  const link = url.trim();
  return link
    ? { url: link, file_ids: [...fileIds] }
    : { file_ids: [...fileIds] };
};

export const toRetentionNoteBody = (note: string) => ({ note: note.trim() });
