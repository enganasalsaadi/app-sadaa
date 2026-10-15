import type { TFunction } from 'i18next';
import { DEAL_BRAND_CANCEL_REASON } from '../../types/deal';
import { createDealReasonNoteSchema } from '../dealCancelSchema';

const t = ((key: string) => key) as unknown as TFunction;

const messageOf = (fn: () => unknown): string | null => {
  try {
    fn();
    return null;
  } catch (err) {
    return (err as { message: string }).message;
  }
};

describe('createDealReasonNoteSchema', () => {
  const schema = createDealReasonNoteSchema(t, DEAL_BRAND_CANCEL_REASON);

  it('needs a reason', () => {
    expect(messageOf(() => schema.validateSync({ reason: null, note: '' }))).toBe(
      'marketplace.deals.changes.reasonError',
    );
  });

  it('refuses a code from another list', () => {
    expect(messageOf(() => schema.validateSync({ reason: 'schedule_full', note: '' }))).toBe(
      'marketplace.deals.changes.reasonError',
    );
  });

  it('keeps the note optional, «other» included, and trims it', () => {
    expect(schema.validateSync({ reason: 'other', note: '' })).toEqual({ reason: 'other', note: '' });
    expect(schema.validateSync({ reason: 'budget_changed', note: ' Q4 cut ' }).note).toBe('Q4 cut');
  });

  it('caps the note at the server limit', () => {
    expect(messageOf(() => schema.validateSync({ reason: 'other', note: 'x'.repeat(501) }))).toBe(
      'validation.maxLength',
    );
  });
});
