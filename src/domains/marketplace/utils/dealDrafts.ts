import { DEAL_DRAFT_LIMITS } from '../constants/dealDrafts';
import type { DealBrief, DealDraft, DealDraftPin, DealItem, DealRole } from '../types';
import { getDealItemActions } from './dealStatus';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * What a deliverable asks of the viewer (P6): the creator hands in a round, the brand reviews it
 * (or takes the last round as it is when the creator ran past the revision window), or there is
 * a round to look at. `null` = nothing handed in yet and nothing to do.
 */
export type DealDeliverableAction = 'submit' | 'review' | 'approveAsIs' | 'view';

export const dealDeliverableAction = (
  item: Pick<DealItem, 'status' | 'approveAsIsAvailable'>,
  role: DealRole,
): DealDeliverableAction | null => {
  const actions = getDealItemActions(item, role);
  if (actions.includes('submitDraft')) return 'submit';
  if (actions.includes('reviewDraft')) return 'review';
  if (actions.includes('approveAsIs')) return 'approveAsIs';
  return item.status.key === null || item.status.key === 'pending' ? null : 'view';
};

/** One bar per possible round: the first hand-in plus each allowed revision. */
export type DealRoundState = 'revised' | 'current' | 'open';

export interface DealRoundBar {
  /** 1-based. */
  round: number;
  state: DealRoundState;
}

export interface DealRounds {
  /** The round being worked on or reviewed now (1-based). */
  current: number;
  bars: DealRoundBar[];
  remaining: number;
  allowed: number;
}

export const dealRounds = (
  item: Pick<DealItem, 'revisionsAllowed' | 'revisionsUsed' | 'revisionsLeft'>,
): DealRounds => {
  const total = Math.max(item.revisionsAllowed, item.revisionsUsed) + 1;
  return {
    current: item.revisionsUsed + 1,
    bars: Array.from({ length: total }, (_, index) => {
      const state: DealRoundState =
        index < item.revisionsUsed ? 'revised' : index === item.revisionsUsed ? 'current' : 'open';
      return { round: index + 1, state };
    }),
    remaining: item.revisionsLeft,
    allowed: item.revisionsAllowed,
  };
};

/** `0:12`, `4:05`, `1:02:03`: a video moment, always Western digits. */
export const formatTimecode = (seconds: number): string => {
  const whole = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const secs = String(whole % 60).padStart(2, '0');
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${secs}`
    : `${minutes}:${secs}`;
};

/** The brief words a caption should carry, as the creator would type them. */
export interface CaptionToken {
  kind: 'hashtag' | 'mention' | 'promo';
  text: string;
}

const withPrefix = (value: string, prefix: string) => {
  const trimmed = value.trim();
  return trimmed.startsWith(prefix) ? trimmed : `${prefix}${trimmed}`;
};

export const captionTokens = (brief: DealBrief | null): CaptionToken[] => {
  if (!brief) return [];
  const tokens: CaptionToken[] = [
    ...brief.mentions.map(text => ({ kind: 'mention' as const, text: withPrefix(text, '@') })),
    ...brief.hashtags.map(text => ({ kind: 'hashtag' as const, text: withPrefix(text, '#') })),
    ...(brief.promoCode?.trim() ? [{ kind: 'promo' as const, text: brief.promoCode.trim() }] : []),
  ];
  const seen = new Set<string>();
  return tokens.filter(({ text }) => {
    const key = text.toLocaleLowerCase();
    if (text.length <= 1 || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const isTokenInCaption = (caption: string, token: string): boolean =>
  caption.toLocaleLowerCase().includes(token.toLocaleLowerCase());

/** The caption with the token appended after a space; `null` when it would pass the cap. */
export const insertCaptionToken = (caption: string, token: string): string | null => {
  const base = caption.replace(/\s+$/, '');
  const next = base ? `${base} ${token} ` : `${token} `;
  return next.length > DEAL_DRAFT_LIMITS.caption ? null : next;
};

/**
 * The round the creator answers now: the last one, once the brand asked for changes on it.
 * `null` before any review or after an approval.
 */
export const dealRevisionAsk = (drafts: readonly DealDraft[]): DealDraft | null => {
  const latest = drafts[0];
  return latest?.review?.decision.key === 'revision_requested' ? latest : null;
};

/** 1-based position of a pinned file in its round («file 2»); 0 if it is no longer there. */
export const pinFileNumber = (draft: Pick<DealDraft, 'files'>, pin: Pick<DealDraftPin, 'fileId'>) =>
  draft.files.findIndex(file => file.id === pin.fileId) + 1;

/** `POST …/revision` body. `at_second` only for video moments. */
export const toRevisionBody = (note: string, pins: readonly DealDraftPin[]) => ({
  note: note.trim(),
  pins: pins.map(pin => ({
    file_id: pin.fileId,
    at_second: pin.atSecond,
    note: pin.note.trim(),
  })),
});

/** `409 deal_revisions_exhausted`: whether the creator's rate card sells one more round. */
export const readExtraRevisionAvailable = (details: unknown): boolean =>
  isRecord(details) && isRecord(details.meta) && details.meta.extra_revision_available === true;
