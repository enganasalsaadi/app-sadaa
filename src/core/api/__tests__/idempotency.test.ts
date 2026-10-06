import { createIdempotencyKey } from '../idempotency';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('createIdempotencyKey', () => {
  it('returns an RFC 4122 v4 UUID', () => {
    expect(createIdempotencyKey()).toMatch(UUID_V4);
  });

  it('returns a new key per call', () => {
    const keys = new Set(Array.from({ length: 50 }, createIdempotencyKey));
    expect(keys.size).toBe(50);
  });
});
