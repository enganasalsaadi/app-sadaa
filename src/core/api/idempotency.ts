import 'react-native-get-random-values';
import { normalizeApiError } from './errorHandler';

/** Money POSTs (top-up, withdraw, cancel): handoff §3. */
export const IDEMPOTENCY_HEADER = 'Idempotency-Key';

/** `409 idempotency_request_in_progress`: the first request is still running, ask again after ~2s. */
export const IDEMPOTENCY_RETRY_DELAY_MS = 2000;
const IDEMPOTENCY_MAX_ATTEMPTS = 3;

const toHex = (byte: number) => byte.toString(16).padStart(2, '0');

const wait = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

/**
 * RFC 4122 v4 UUID for an idempotency header (rule 06). Create one per user
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

export interface IdempotentAction {
  /** Sends with this action's key: the same key on every call until one succeeds. */
  run<T>(send: (key: string) => Promise<T>): Promise<T>;
  /** The user started a different action (new amount or destination): next `run` gets a new key. */
  reset(): void;
}

/**
 * One user money action (handoff §3). A timeout, an app resume or a 4xx the user fixes
 * all resend with the same key, so the server charges once; a replay comes back as the
 * original success. Only `idempotency_request_in_progress` is retried automatically:
 * same key, same body, so it can never charge twice.
 */
export const createIdempotentAction = (
  newKey: () => string = createIdempotencyKey,
  delay: (ms: number) => Promise<void> = wait,
): IdempotentAction => {
  let key: string | null = null;

  const attempt = async <T>(
    send: (key: string) => Promise<T>,
    current: string,
    tries: number,
  ): Promise<T> => {
    try {
      return await send(current);
    } catch (err) {
      const inProgress = normalizeApiError(err).code === 'idempotency_request_in_progress';
      if (!inProgress || tries >= IDEMPOTENCY_MAX_ATTEMPTS) throw err;
      await delay(IDEMPOTENCY_RETRY_DELAY_MS);
      return attempt(send, current, tries + 1);
    }
  };

  return {
    async run(send) {
      key ??= newKey();
      try {
        const result = await attempt(send, key, 1);
        key = null;
        return result;
      } catch (err) {
        // Same key with a different body: a client bug the next tap must not repeat.
        if (normalizeApiError(err).code === 'idempotency_key_reused') key = null;
        throw err;
      }
    },
    reset() {
      key = null;
    },
  };
};
