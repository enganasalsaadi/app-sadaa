import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { DEFAULT_PHONE_COUNTRY } from '@/core/config';

// Unicode "left-to-right isolate": keeps "0944 …" in order inside Arabic sentences.
const LTR_ISOLATE = '⁦';
const POP_ISOLATE = '⁩';

/**
 * E.164 → "0944 123 456" (local numbers are shown the way people type them, no dial code)
 * or "+971 50 123 4567" for any other country; bidi-isolated so it never reorders in RTL text.
 */
export const formatPhoneForDisplay = (e164: string): string => {
  const parsed = parsePhoneNumberFromString(e164);
  const formatted = !parsed
    ? e164
    : parsed.country === DEFAULT_PHONE_COUNTRY
      ? parsed.formatNational()
      : parsed.formatInternational();
  return `${LTR_ISOLATE}${formatted}${POP_ISOLATE}`;
};
