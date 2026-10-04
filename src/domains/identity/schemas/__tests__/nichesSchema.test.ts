import type { TFunction } from 'i18next';
import { createNichesSchema } from '../nichesSchema';

jest.mock('@/domains/auth', () => ({ INFLUENCER_MAX_NICHES: 3 }));

const t = ((key: string) => key) as unknown as TFunction;
const schema = createNichesSchema(t);

const messageOf = (niches: string[]) => {
  try {
    schema.validateSync({ niches });
    return null;
  } catch (err) {
    return (err as Error).message;
  }
};

describe('createNichesSchema', () => {
  it('accepts one to three niches', () => {
    expect(messageOf(['fashion'])).toBeNull();
    expect(messageOf(['fashion', 'food', 'tech'])).toBeNull();
  });

  it('rejects an empty pick', () => {
    expect(messageOf([])).toBe('account.niches.errors.min');
  });

  it('rejects more than three', () => {
    expect(messageOf(['a', 'b', 'c', 'd'])).toBe('account.niches.errors.max');
  });
});
