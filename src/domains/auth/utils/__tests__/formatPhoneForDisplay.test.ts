import { formatPhoneForDisplay } from '../formatPhoneForDisplay';

describe('formatPhoneForDisplay', () => {
  it('formats and bidi-isolates an E.164 number', () => {
    expect(formatPhoneForDisplay('+963944123456')).toBe('⁦+963 944 123 456⁩');
  });

  it('falls back to the raw value when unparsable', () => {
    expect(formatPhoneForDisplay('abc')).toBe('⁦abc⁩');
  });
});
