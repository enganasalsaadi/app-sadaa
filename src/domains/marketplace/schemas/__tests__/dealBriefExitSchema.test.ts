import type { TFunction } from 'i18next';
import { DEAL_RESPOND_LIMITS } from '../../constants/dealOffer';
import { createDealBriefExitSchema } from '../dealBriefExitSchema';

const t = ((key: string) => key) as unknown as TFunction;
const schema = createDealBriefExitSchema(t);

describe('createDealBriefExitSchema', () => {
  it('asks for nothing: the note is optional', () => {
    expect(schema.isValidSync({ note: '' })).toBe(true);
    expect(schema.isValidSync({ note: 'ملاحظة' })).toBe(true);
  });

  it('stops at the length the server takes', () => {
    expect(schema.isValidSync({ note: 'ا'.repeat(DEAL_RESPOND_LIMITS.maxNoteLength) })).toBe(true);
    expect(schema.isValidSync({ note: 'ا'.repeat(DEAL_RESPOND_LIMITS.maxNoteLength + 1) })).toBe(false);
  });
});
