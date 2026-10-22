import { formatPhoneForDisplay } from '../formatPhoneForDisplay';

describe('formatPhoneForDisplay', () => {
  it('shows a local number the way it is typed, bidi-isolated', () => {
    expect(formatPhoneForDisplay('+963944123456')).toBe('⁦0944 123 456⁩');
  });

  it('keeps the dial code for any other country', () => {
    expect(formatPhoneForDisplay('+971501234567')).toBe('⁦+971 50 123 4567⁩');
  });

  it('falls back to the raw value when unparsable', () => {
    expect(formatPhoneForDisplay('abc')).toBe('⁦abc⁩');
  });
});
