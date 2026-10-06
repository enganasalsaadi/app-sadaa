import 'react-native-get-random-values';

export const IDEMPOTENCY_HEADER = 'X-Idempotency-Key';

const toHex = (byte: number) => byte.toString(16).padStart(2, '0');

/**
 * RFC 4122 v4 UUID for `X-Idempotency-Key` (rule 06). Create one per user
 * intent and reuse it on retry, so the server dedups double taps.
 */
export const createIdempotencyKey = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  // Version nibble 4 (0100xxxx) + RFC 4122 variant (10xxxxxx), arithmetic
  // instead of bit ops (`no-bitwise`); `?? 0` for `noUncheckedIndexedAccess`.
  bytes[6] = ((bytes[6] ?? 0) % 16) + 0x40;
  bytes[8] = ((bytes[8] ?? 0) % 64) + 0x80;
  const hex = Array.from(bytes, toHex).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
