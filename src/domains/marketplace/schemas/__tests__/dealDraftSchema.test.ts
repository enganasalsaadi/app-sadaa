import type { TFunction } from 'i18next';
import { createDealDraftSchema, createDealPinSchema, createDealRevisionSchema } from '../dealDraftSchema';

const t = ((key: string) => key) as unknown as TFunction;

const messageOf = (fn: () => unknown): string | null => {
  try {
    fn();
    return null;
  } catch (err) {
    return (err as { message: string }).message;
  }
};

describe('createDealDraftSchema', () => {
  const schema = createDealDraftSchema(t);

  it('needs a caption', () => {
    expect(messageOf(() => schema.validateSync({ caption: '   ' }))).toBe(
      'marketplace.deals.drafts.upload.captionError',
    );
  });

  it('caps the caption at 2200 characters', () => {
    expect(messageOf(() => schema.validateSync({ caption: 'x'.repeat(2200) }))).toBeNull();
    expect(messageOf(() => schema.validateSync({ caption: 'x'.repeat(2201) }))).toBe('validation.maxLength');
  });
});

describe('createDealRevisionSchema', () => {
  const schema = createDealRevisionSchema(t);

  it('needs a note up to 2000 characters', () => {
    expect(messageOf(() => schema.validateSync({ note: '' }))).toBe('marketplace.deals.drafts.review.noteError');
    expect(messageOf(() => schema.validateSync({ note: 'x'.repeat(2000) }))).toBeNull();
    expect(messageOf(() => schema.validateSync({ note: 'x'.repeat(2001) }))).toBe('validation.maxLength');
  });
});

describe('createDealPinSchema', () => {
  const schema = createDealPinSchema(t);

  it('needs a note up to 500 characters', () => {
    expect(messageOf(() => schema.validateSync({ note: ' ' }))).toBe('marketplace.deals.drafts.review.pinError');
    expect(messageOf(() => schema.validateSync({ note: 'x'.repeat(501) }))).toBe('validation.maxLength');
  });
});
