import type { TFunction } from 'i18next';
import { createMediaKitSlugSchema } from '../mediaKitSlugSchema';

const t = ((key: string) => key) as unknown as TFunction;
const schema = createMediaKitSlugSchema(t);

const messageOf = (slug: string) => {
  try {
    schema.validateSync({ slug });
    return null;
  } catch (err) {
    return (err as Error).message;
  }
};

describe('createMediaKitSlugSchema', () => {
  it('accepts a valid slug', () => {
    expect(messageOf('anas.style')).toBeNull();
  });
  it('maps each local reason to its message', () => {
    expect(messageOf('')).toBe('account.mediaKit.settingsScreen.reasons.invalidLength');
    expect(messageOf('ab')).toBe('account.mediaKit.settingsScreen.reasons.invalidLength');
    expect(messageOf('an..as')).toBe('account.mediaKit.settingsScreen.reasons.invalidFormat');
  });
});
