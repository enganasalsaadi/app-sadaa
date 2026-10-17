import type { TFunction } from 'i18next';
import { createDealReturnIssueSchema, createDealReturnWaiveSchema } from '../dealReturnAnswerSchema';

const t = ((key: string) => key) as unknown as TFunction;

const messageOf = (fn: () => unknown): string | null => {
  try {
    fn();
    return null;
  } catch (err) {
    return (err as { message: string }).message;
  }
};

describe('createDealReturnIssueSchema', () => {
  const schema = createDealReturnIssueSchema(t);

  it('asks for a note of 5 to 1000 characters', () => {
    expect(messageOf(() => schema.validateSync({ note: 'تالف تماماً' }))).toBeNull();
    expect(messageOf(() => schema.validateSync({ note: '   ' }))).toBe('validation.required');
    expect(messageOf(() => schema.validateSync({ note: ' abc ' }))).toBe('validation.minLength');
    expect(messageOf(() => schema.validateSync({ note: 'a'.repeat(1000) }))).toBeNull();
    expect(messageOf(() => schema.validateSync({ note: 'a'.repeat(1001) }))).toBe('validation.maxLength');
  });
});

describe('createDealReturnWaiveSchema', () => {
  const schema = createDealReturnWaiveSchema(t);

  it('lets the reason stay empty and caps it at 500', () => {
    expect(messageOf(() => schema.validateSync({ note: '' }))).toBeNull();
    expect(messageOf(() => schema.validateSync({ note: 'a'.repeat(500) }))).toBeNull();
    expect(messageOf(() => schema.validateSync({ note: 'a'.repeat(501) }))).toBe('validation.maxLength');
  });
});
