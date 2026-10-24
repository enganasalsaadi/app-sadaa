import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/core/api';
import { initSecureStorage } from '@/core/storage';
import type { DealDto, DealVaultFileDto } from '../../types/dealDto';
import { dealFilesApi } from '../dealFilesApi';

const T0 = '2026-10-23T09:00:00+03:00';
const REF = { role: 'creator', id: '01J' } as const;

const makeStore = () =>
  configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer },
    middleware: getDefault => getDefault({ serializableCheck: false }).concat(baseApi.middleware),
  });

const dealDto = (): DealDto => ({
  id: '01J',
  origin: 'direct',
  status: { key: 'in_progress', label: 'In progress' },
  stage: null,
  brand: { name: 'Cafe Sham', avatar_url: null },
  creator: { slug: 'reem', name: 'Reem', avatar_url: null },
  items: [],
  items_count: 0,
  total_usd: '150.00',
  currency: 'USD',
  shipping_mode: { key: 'none', label: 'None' },
  shipping: null,
  cancellation: null,
  delivery_hours: 120,
  requested_delivery_days: 5,
  extended_delivery_hours: null,
  extension: null,
  decline_reason: null,
  deadline_at: null,
  upsells: [],
  upsell_window: { open: false, closed_reason: null, pending_upsell_id: null },
  dispute: null,
  dispute_window: { open: false, closed_reason: null, disputes_left: 1 },
  retention: [],
  retention_cases: [],
  rating: null,
  brief: null,
  brief_attachments: [],
  due_at: T0,
  sent_at: T0,
  funded_at: T0,
  contract: null,
  created_at: T0,
  updated_at: T0,
});

const fileDto: DealVaultFileDto = {
  id: 'f1',
  kind: 'image',
  name: 'brief.jpg',
  mime: 'image/jpeg',
  size: 10,
  status: 'ready',
  url: 'https://files.test/f1',
  url_expires_at: T0,
  source: 'brief',
  item_id: null,
  round: null,
  uploaded_by: 'brand',
  created_at: T0,
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const ok = (data: unknown) => json(200, { success: true, message: 'ok', data, meta: {} });

const mockServer = (files: () => Response) =>
  jest.spyOn(global, 'fetch').mockImplementation(async input => {
    const { pathname } = new URL((input as Request).url);
    return pathname.endsWith('/files') ? files() : ok(dealDto());
  });

describe('dealFilesApi', () => {
  beforeAll(() => initSecureStorage());

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'queueMicrotask', 'setImmediate'] });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('reads the deal and its file list on the role route, nothing else', async () => {
    const spy = mockServer(() => ok({ items: [fileDto] }));
    const store = makeStore();

    const result = await store.dispatch(dealFilesApi.endpoints.getDealFiles.initiate(REF));

    const paths = spy.mock.calls.map(([input]) => new URL((input as Request).url).pathname).sort();
    expect(paths).toHaveLength(2);
    expect(paths[0]).toMatch(/\/influencer\/deals\/01J$/);
    expect(paths[1]).toMatch(/\/influencer\/deals\/01J\/files$/);
    expect(result.data?.deal.id).toBe('01J');
    expect(result.data?.files).toEqual([
      expect.objectContaining({ id: 'f1', source: 'brief', url: 'https://files.test/f1' }),
    ]);
  });

  it('fails the vault when the file list fails, never shows it partly', async () => {
    mockServer(() => json(404, { success: false, message: 'gone', data: null, error_code: 'not_found' }));
    const store = makeStore();

    const result = await store.dispatch(dealFilesApi.endpoints.getDealFiles.initiate(REF));

    expect(result.data).toBeUndefined();
    expect(result.error).toMatchObject({ status: 404 });
  });
});
