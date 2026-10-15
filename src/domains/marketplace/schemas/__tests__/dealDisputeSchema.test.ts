import type { TFunction } from 'i18next';
import { DEAL_DISPUTE_REASONS } from '../../constants/dealDispute';
import { createDealDisputeOpenSchema, createDealEvidenceSchema } from '../dealDisputeSchema';

jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: (_target, name) => (name === '__esModule' ? undefined : name) }),
);

const t = ((key: string) => key) as unknown as TFunction;

const messageOf = (fn: () => unknown): string | null => {
  try {
    fn();
    return null;
  } catch (err) {
    return (err as { message: string }).message;
  }
};

describe('createDealDisputeOpenSchema', () => {
  const schema = createDealDisputeOpenSchema(t, DEAL_DISPUTE_REASONS.brand);
  const statement = 'The video skipped every point of the brief.';

  it('needs one of the side’s reasons', () => {
    expect(messageOf(() => schema.validateSync({ reason: null, statement }))).toBe(
      'marketplace.deals.changes.reasonError',
    );
    // A creator-side reason is refused on the brand side.
    expect(messageOf(() => schema.validateSync({ reason: 'unfair_rejection', statement }))).toBe(
      'marketplace.deals.changes.reasonError',
    );
  });

  it('needs a statement of 20–2000 characters, trimmed', () => {
    expect(messageOf(() => schema.validateSync({ reason: 'poor_quality', statement: '   ' }))).toBe(
      'marketplace.deals.dispute.open.statementRequired',
    );
    expect(messageOf(() => schema.validateSync({ reason: 'poor_quality', statement: ` ${'x'.repeat(19)} ` }))).toBe(
      'validation.minLength',
    );
    expect(messageOf(() => schema.validateSync({ reason: 'poor_quality', statement: 'x'.repeat(2001) }))).toBe(
      'validation.maxLength',
    );
    expect(schema.validateSync({ reason: 'poor_quality', statement: ` ${statement} ` })).toEqual({
      reason: 'poor_quality',
      statement,
    });
  });
});

describe('createDealEvidenceSchema', () => {
  const schema = createDealEvidenceSchema(t);

  it('needs a note, capped at the server limit', () => {
    expect(messageOf(() => schema.validateSync({ note: ' ', link: '' }))).toBe(
      'marketplace.deals.dispute.evidence.noteRequired',
    );
    expect(messageOf(() => schema.validateSync({ note: 'x'.repeat(2001), link: '' }))).toBe('validation.maxLength');
  });

  it('leaves the link optional but checks it when typed', () => {
    expect(schema.validateSync({ note: 'see', link: '' })).toEqual({ note: 'see', link: '' });
    expect(messageOf(() => schema.validateSync({ note: 'see', link: 'http://x.co' }))).toBe('validation.invalidUrl');
    expect(schema.validateSync({ note: 'see', link: ' https://x.co/a ' }).link).toBe('https://x.co/a');
  });
});
