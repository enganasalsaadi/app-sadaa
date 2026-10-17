import type { Deal, Timestamp } from '../types';

/**
 * The creator's clean exit on a linked deal (contract §5.2): the server flag, and the window's end
 * (`null` = no end given) still ahead of the clock. Past the end the flag may lag a refetch, so the
 * clock closes it first; the server has the last word either way.
 */
export const briefExitWindow = (
  { cancellation }: Pick<Deal, 'cancellation'>,
  now: number,
): { until: Timestamp | null } | null => {
  const creator = cancellation?.creator;
  if (!creator?.briefExitAvailable) return null;
  if (creator.briefExitUntil !== null && creator.briefExitUntil <= now) return null;
  return { until: creator.briefExitUntil };
};

/** `{ note? }`: a blank note is left out. */
export const toBriefExitBody = (note: string): { note?: string } => {
  const trimmed = note.trim();
  return trimmed ? { note: trimmed } : {};
};
