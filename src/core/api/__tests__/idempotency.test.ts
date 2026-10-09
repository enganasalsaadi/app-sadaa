import { createIdempotencyKey, createIdempotentAction, IDEMPOTENCY_RETRY_DELAY_MS } from '../idempotency';

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

const conflict = (code: string) => ({ status: 409, data: { success: false, error_code: code } });

describe('createIdempotentAction', () => {
  const setup = () => {
    let n = 0;
    const delay = jest.fn(() => Promise.resolve());
    const action = createIdempotentAction(() => `key-${(n += 1)}`, delay);
    return { action, delay };
  };

  it('keeps the key across failed attempts and drops it after success', async () => {
    const { action } = setup();
    const keys: string[] = [];
    const fail = (key: string) => {
      keys.push(key);
      return Promise.reject({ status: 422, data: { success: false, error_code: 'validation_failed' } });
    };
    await expect(action.run(fail)).rejects.toBeDefined();
    await expect(action.run(fail)).rejects.toBeDefined();
    await action.run(key => Promise.resolve(keys.push(key)));
    await action.run(key => Promise.resolve(keys.push(key)));
    expect(keys).toEqual(['key-1', 'key-1', 'key-1', 'key-2']);
  });

  it('retries a request still in progress with the same key after the delay', async () => {
    const { action, delay } = setup();
    const send = jest
      .fn<Promise<string>, [string]>()
      .mockRejectedValueOnce(conflict('idempotency_request_in_progress'))
      .mockResolvedValueOnce('done');
    await expect(action.run(send)).resolves.toBe('done');
    expect(send.mock.calls).toEqual([['key-1'], ['key-1']]);
    expect(delay).toHaveBeenCalledWith(IDEMPOTENCY_RETRY_DELAY_MS);
  });

  it('gives up after three in-progress answers and keeps the key', async () => {
    const { action } = setup();
    const send = jest.fn((_key: string) => Promise.reject(conflict('idempotency_request_in_progress')));
    await expect(action.run(send)).rejects.toEqual(conflict('idempotency_request_in_progress'));
    expect(send).toHaveBeenCalledTimes(3);
    const next = jest.fn((key: string) => Promise.resolve(key));
    await expect(action.run(next)).resolves.toBe('key-1');
  });

  it('never retries other errors', async () => {
    const { action, delay } = setup();
    const send = jest.fn((_key: string) => Promise.reject({ status: 500, data: null }));
    await expect(action.run(send)).rejects.toBeDefined();
    expect(send).toHaveBeenCalledTimes(1);
    expect(delay).not.toHaveBeenCalled();
  });

  it('mints a new key after a reused-key conflict or a reset', async () => {
    const { action } = setup();
    await expect(
      action.run(() => Promise.reject(conflict('idempotency_key_reused'))),
    ).rejects.toBeDefined();
    await expect(action.run(key => Promise.reject(key))).rejects.toBe('key-2');
    action.reset();
    await expect(action.run(key => Promise.resolve(key))).resolves.toBe('key-3');
  });
});
