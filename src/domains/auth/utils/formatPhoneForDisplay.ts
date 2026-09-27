import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Unicode "left-to-right isolate": keeps "+963 944 …" in order inside Arabic sentences.
const LTR_ISOLATE = '⁦';
const POP_ISOLATE = '⁩';

/** E.164 → "+963 944 123 456", bidi-isolated so it never reorders in RTL text. */
export const formatPhoneForDisplay = (e164: string): string => {
  const formatted = parsePhoneNumberFromString(e164)?.formatInternational() ?? e164;
  return `${LTR_ISOLATE}${formatted}${POP_ISOLATE}`;
};
