import type { TFunction } from 'i18next';
import { createDealRatingSchema } from '../dealRatingSchema';

const t = ((key: string) => key) as unknown as TFunction;

describe('createDealRatingSchema', () => {
  const schema = createDealRatingSchema(t);

  it('takes no note at all', () => {
    expect(schema.validateSync({ comment: '' })).toEqual({ comment: '' });
  });

  it('caps the note at the server limit', () => {
    expect(schema.isValidSync({ comment: 'x'.repeat(1000) })).toBe(true);
    expect(() => schema.validateSync({ comment: 'x'.repeat(1001) })).toThrow('validation.maxLength');
  });
});
