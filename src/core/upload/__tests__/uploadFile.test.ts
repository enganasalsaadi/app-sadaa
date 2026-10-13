import { uploadFile } from '../uploadFile';
import { UploadError } from '../uploadError';
import type { UploadPolicy, UploadSlot, UploadSource } from '../uploadTypes';
import type { FakePut } from '../../../../__mocks__/react-native-blob-util';

jest.mock('react-native-blob-util');
const blobUtil: { fakePuts: FakePut[]; fakeStat: jest.Mock } = jest.requireMock('react-native-blob-util');
const mockPuts = blobUtil.fakePuts;
const mockStat = blobUtil.fakeStat;
const flush = () => new Promise<void>(resolve => setImmediate(resolve));

const MB = 1024 * 1024;
const policy: UploadPolicy = {
  rules: [
    { mimes: ['video/mp4'], maxBytes: 300 * MB },
    { mimes: ['image/jpeg'], maxBytes: 20 * MB },
  ],
};
const slot: UploadSlot = {
  fileId: 'file-1',
  kind: 'video',
  url: 'https://storage.example/signed',
  headers: { 'Content-Type': 'video/mp4' },
  expiresAt: '2026-10-13T12:30:00+00:00',
};
const video: UploadSource = {
  uri: 'file:///var/mobile/My%20Clip.mp4',
  name: 'My Clip.mp4',
  mime: 'video/mp4',
  size: 10 * MB,
};

const lastPut = () => {
  const put = mockPuts[mockPuts.length - 1];
  if (!put) throw new Error('no PUT started');
  return put;
};

const failureOf = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    if (error instanceof UploadError) return error;
  }
  throw new Error('expected an UploadError');
};

beforeEach(() => {
  mockPuts.length = 0;
  mockStat.mockReset();
});

it('requests a slot, PUTs the file with the slot headers and resolves the file id', async () => {
  const requestSlot = jest.fn().mockResolvedValue(slot);
  const onProgress = jest.fn();
  const result = uploadFile({ source: video, policy, requestSlot, onProgress });
  await flush();

  expect(requestSlot).toHaveBeenCalledWith({ name: 'My Clip.mp4', mime: 'video/mp4', size: 10 * MB });
  expect(lastPut().args).toEqual([
    'PUT',
    'https://storage.example/signed',
    { 'Content-Type': 'video/mp4' },
    'wrap:/var/mobile/My Clip.mp4',
  ]);

  lastPut().progress(5 * MB, 10 * MB);
  lastPut().succeed(200);
  await expect(result).resolves.toBe('file-1');
  expect(onProgress.mock.calls.map(([p]) => p)).toEqual([0, 0.5, 1]);
});

it('normalises the MIME and reads a missing size from disk', async () => {
  mockStat.mockResolvedValue({ size: 1234 });
  const requestSlot = jest.fn().mockResolvedValue(slot);
  const result = uploadFile({
    source: { uri: 'content://media/42', name: 'photo.JPG', mime: 'image/jpg', size: null },
    policy,
    requestSlot,
  });
  await flush();

  expect(mockStat).toHaveBeenCalledWith('content://media/42');
  expect(requestSlot).toHaveBeenCalledWith({ name: 'photo.JPG', mime: 'image/jpeg', size: 1234 });
  lastPut().succeed(201);
  await expect(result).resolves.toBe('file-1');
});

it('rejects a disallowed type before any request', async () => {
  const requestSlot = jest.fn();
  const error = await failureOf(
    uploadFile({ source: { ...video, name: 'a.pdf', mime: 'application/pdf' }, policy, requestSlot }),
  );
  expect(error.failure).toBe('type');
  expect(requestSlot).not.toHaveBeenCalled();
});

it('rejects an oversized file with the cap', async () => {
  const requestSlot = jest.fn();
  const error = await failureOf(
    uploadFile({ source: { ...video, name: 'p.jpg', mime: 'image/jpeg', size: 21 * MB }, policy, requestSlot }),
  );
  expect(error.failure).toBe('size');
  expect(error.maxBytes).toBe(20 * MB);
  expect(requestSlot).not.toHaveBeenCalled();
});

it('reports an unreadable file as a transfer failure', async () => {
  mockStat.mockRejectedValue(new Error('ENOENT'));
  const error = await failureOf(uploadFile({ source: { ...video, size: null }, policy, requestSlot: jest.fn() }));
  expect(error.failure).toBe('transfer');
});

it('wraps a slot request error, keeping the API error as cause', async () => {
  const apiError = { status: 409, data: { error_code: 'deal_upload_limit' } };
  const error = await failureOf(
    uploadFile({ source: video, policy, requestSlot: jest.fn().mockRejectedValue(apiError) }),
  );
  expect(error.failure).toBe('slot');
  expect(error.cause).toBe(apiError);
  expect(mockPuts).toHaveLength(0);
});

it('fails the transfer on a non-2xx storage response', async () => {
  const result = uploadFile({ source: video, policy, requestSlot: jest.fn().mockResolvedValue(slot) });
  await flush();
  lastPut().succeed(403);
  const error = await failureOf(result);
  expect(error.failure).toBe('transfer');
  expect(error.cause).toBe(403);
});

it('fails the transfer on a network error', async () => {
  const result = uploadFile({ source: video, policy, requestSlot: jest.fn().mockResolvedValue(slot) });
  await flush();
  lastPut().fail(new Error('offline'));
  expect((await failureOf(result)).failure).toBe('transfer');
});

it('cancels the PUT when aborted mid-transfer', async () => {
  const controller = new AbortController();
  const result = uploadFile({
    source: video,
    policy,
    requestSlot: jest.fn().mockResolvedValue(slot),
    signal: controller.signal,
  });
  await flush();
  controller.abort();
  expect(lastPut().cancel).toHaveBeenCalled();
  expect((await failureOf(result)).failure).toBe('canceled');
});

it('skips the PUT when aborted while the slot is requested', async () => {
  const controller = new AbortController();
  let grant: (value: UploadSlot) => void = () => undefined;
  const requestSlot = jest.fn(() => new Promise<UploadSlot>(resolve => (grant = resolve)));
  const result = uploadFile({ source: video, policy, requestSlot, signal: controller.signal });
  await flush();
  controller.abort();
  grant(slot);
  expect((await failureOf(result)).failure).toBe('canceled');
  expect(mockPuts).toHaveLength(0);
});
