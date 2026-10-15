import type { TFunction } from 'i18next';
import {
  createDealDeclineSchema,
  createDealExtensionSchema,
  createDealReasonSchema,
} from '../dealRespondSchema';

const t = ((key: string) => key) as unknown as TFunction;
const long = 'x'.repeat(501);

const messageOf = (fn: () => unknown): string | null => {
  try {
    fn();
    return null;
  } catch (err) {
    return (err as { message: string }).message;
  }
};

describe('createDealDeclineSchema', () => {
  const schema = createDealDeclineSchema(t);

  it('needs a reason', () => {
    expect(messageOf(() => schema.validateSync({ reason: null, note: '' }))).toBe(
      'marketplace.deals.respond.decline.pickError',
    );
  });

  it('takes a listed reason without a note', () => {
    expect(schema.validateSync({ reason: 'schedule_full', note: '' })).toEqual({ reason: 'schedule_full', note: '' });
  });

  it('needs a note for «other», blanks included', () => {
    expect(messageOf(() => schema.validateSync({ reason: 'other', note: '   ' }))).toBe(
      'marketplace.deals.respond.decline.noteError',
    );
    expect(schema.validateSync({ reason: 'other', note: ' Brand clash ' }).note).toBe('Brand clash');
  });

  it('caps the note at the server limit', () => {
    expect(messageOf(() => schema.validateSync({ reason: 'not_a_fit', note: long }))).toBe('validation.maxLength');
  });
});

describe('createDealExtensionSchema', () => {
  const schema = createDealExtensionSchema(t, { current: 7, min: 8, max: 21 });

  it('accepts a day inside the range with a reason', () => {
    expect(schema.validateSync({ days: 12, reason: 'Closed day needed' })).toEqual({
      days: 12,
      reason: 'Closed day needed',
    });
  });

  it('keeps the days inside today + 1 … + 14', () => {
    expect(schema.isValidSync({ days: 7, reason: 'abc' })).toBe(false);
    expect(schema.isValidSync({ days: 22, reason: 'abc' })).toBe(false);
    expect(schema.isValidSync({ days: 21, reason: 'abc' })).toBe(true);
  });

  it('needs 3–500 characters of reason', () => {
    expect(messageOf(() => schema.validateSync({ days: 12, reason: ' ' }))).toBe(
      'marketplace.deals.respond.extension.reasonError',
    );
    expect(messageOf(() => schema.validateSync({ days: 12, reason: 'ok' }))).toBe('validation.minLength');
    expect(messageOf(() => schema.validateSync({ days: 12, reason: long }))).toBe('validation.maxLength');
  });
});

describe('createDealReasonSchema', () => {
  const schema = createDealReasonSchema(t);

  it('lets the reason be empty', () => {
    expect(schema.validateSync({ reason: '' })).toEqual({ reason: '' });
  });

  it('caps it at the server limit', () => {
    expect(messageOf(() => schema.validateSync({ reason: long }))).toBe('validation.maxLength');
  });
});
