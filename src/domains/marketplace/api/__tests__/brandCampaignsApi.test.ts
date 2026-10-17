import { configureStore } from '@reduxjs/toolkit';
import { baseApi, IDEMPOTENCY_HEADER } from '@/core/api';
import { initSecureStorage } from '@/core/storage';
import { toastService } from '@/core/toast';
import { campaignFlagReducer } from '../../store/campaignFlagSlice';
import { applicantDto, detailDto, fileDto, historyRowDto, label } from '../../utils/__fixtures__/campaignDto';
import { brandCampaignsApi, campaignChangedTags } from '../brandCampaignsApi';

const makeStore = () =>
  configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer, campaignFlag: campaignFlagReducer },
    middleware: getDefault => getDefault({ serializableCheck: false }).concat(baseApi.middleware),
  });

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const ok = (data: unknown, meta: object = {}) => json(200, { success: true, message: 'ok', data, meta });

const fail = (status: number, code: string, message: string) =>
  json(status, { success: false, message, error_code: code, errors: null, meta: { locale: 'en' } });

/** GET detail answers `detailStatus` (changeable); the action answers `actionResponse()`. */
const mockServer = (actionResponse: () => Response) => {
  const state = { detailStatus: 'open' };
  const spy = jest.spyOn(global, 'fetch').mockImplementation(async input => {
    const request = input as Request;
    const { pathname } = new URL(request.url);
    if (request.method !== 'GET') return actionResponse();
    if (pathname.endsWith('/history')) return ok([historyRowDto()]);
    if (pathname.endsWith('/quote')) return ok(quoteDto);
    if (pathname.endsWith('/brand/campaigns')) {
      return ok({ items: [detailDto()], meta: { current_page: 1, last_page: 2, total: 21 } });
    }
    return ok(detailDto({ status: { key: state.detailStatus, label: state.detailStatus } }));
  });
  return { spy, state };
};

const quoteDto = {
  pricing_model: 'fixed',
  currency: 'USD',
  fee_bps: 1000,
  seats: 5,
  deliverables_per_creator: 2,
  seat: {
    min: { gross_usd: '100.00', fee_usd: '10.00', net_usd: '90.00' },
    max: { gross_usd: '100.00', fee_usd: '10.00', net_usd: '90.00' },
  },
  total_gross_usd: { min: '500.00', max: '500.00' },
  budget_usd: null,
  wallet: { balance_usd: '320.00', required_usd: '500.00', shortfall_usd: '180.00', is_sufficient: false },
};

const quoteReads = (spy: jest.SpyInstance) =>
  spy.mock.calls.filter(([input]) => {
    const request = input as Request;
    return request.method === 'GET' && new URL(request.url).pathname.endsWith('/brand/campaigns/c1/quote');
  }).length;

const detailReads = (spy: jest.SpyInstance) =>
  spy.mock.calls.filter(([input]) => {
    const request = input as Request;
    return request.method === 'GET' && new URL(request.url).pathname.endsWith('/brand/campaigns/c1');
  }).length;

const readCampaign = (store: ReturnType<typeof makeStore>) =>
  brandCampaignsApi.endpoints.getCampaign.select('c1')(store.getState()).data;

/** Lets the tag invalidation's refetch land. */
const settle = async () => {
  for (let i = 0; i < 5; i += 1) {
    await new Promise<void>(resolve => setImmediate(resolve));
  }
};

describe('brandCampaignsApi', () => {
  beforeAll(() => initSecureStorage());

  // Cache-lifetime and request-timeout timers would outlive the test.
  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'queueMicrotask', 'setImmediate'] });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('reads the list page by page with repeated status keys', async () => {
    const { spy } = mockServer(() => ok(null));
    const store = makeStore();

    const page = await store.dispatch(
      brandCampaignsApi.endpoints.getCampaigns.initiate({ statuses: ['open', 'suspended'] }),
    );

    const url = new URL((spy.mock.calls[0]?.[0] as Request).url);
    expect(url.pathname).toMatch(/\/brand\/campaigns$/);
    expect(url.searchParams.getAll('status[]')).toEqual(['open', 'suspended']);
    expect(url.searchParams.get('page')).toBe('1');
    expect(page.data?.pages[0]?.meta).toEqual({ currentPage: 1, lastPage: 2, total: 21 });
    expect(page.hasNextPage).toBe(true);
  });

  it('maps the detail and the history rows', async () => {
    mockServer(() => ok(null));
    const store = makeStore();

    await store.dispatch(brandCampaignsApi.endpoints.getCampaign.initiate('c1'));
    const history = await store.dispatch(brandCampaignsApi.endpoints.getCampaignHistory.initiate('c1'));

    expect(readCampaign(store)?.pricing.seatPrice).toEqual({ amount: 10000, currency: 'USD' });
    expect(history.data?.[0]?.to.key).toBe('open');
  });

  it('replaces the cached campaign with the action response and reads the submit wallet', async () => {
    const wallet = { balance_usd: '10.00', required_usd: '80.00', shortfall_usd: '70.00', is_sufficient: false };
    const { spy } = mockServer(() => ok(detailDto({ status: { key: 'pending_review', label: 'In review' } }), { wallet }));
    const store = makeStore();
    const detail = store.dispatch(brandCampaignsApi.endpoints.getCampaign.initiate('c1'));
    await detail;

    const result = await store
      .dispatch(
        brandCampaignsApi.endpoints.runCampaignAction.initiate({ id: 'c1', path: 'submit', idempotencyKey: 'key-1' }),
      )
      .unwrap();
    await settle();

    expect(result.campaign.status.key).toBe('pending_review');
    expect(result.wallet?.shortfall).toEqual({ amount: 7000, currency: 'USD' });
    expect(readCampaign(store)?.status.key).toBe('pending_review');
    const post = spy.mock.calls.map(([input]) => input as Request).find(r => r.method === 'POST');
    expect(new URL(post?.url ?? '').pathname).toMatch(/\/brand\/campaigns\/c1\/submit$/);
    expect(post?.headers.get(IDEMPOTENCY_HEADER)).toBe('key-1');
    expect(detailReads(spy)).toBe(1);
    detail.unsubscribe();
  });

  it('caches the duplicate under its own id', async () => {
    mockServer(() => json(201, { success: true, message: 'ok', data: detailDto({ id: 'c2', status: { key: 'draft', label: 'Draft' } }), meta: {} }));
    const store = makeStore();

    await store.dispatch(brandCampaignsApi.endpoints.runCampaignAction.initiate({ id: 'c1', path: 'duplicate' })).unwrap();
    await settle();

    expect(brandCampaignsApi.endpoints.getCampaign.select('c2')(store.getState()).data?.status.key).toBe('draft');
  });

  it('refetches the campaign after a campaign conflict', async () => {
    const { spy, state } = mockServer(() => fail(409, 'campaign_invalid_transition', 'It moved'));
    const store = makeStore();
    const detail = store.dispatch(brandCampaignsApi.endpoints.getCampaign.initiate('c1'));
    await detail;
    state.detailStatus = 'suspended';

    await expect(
      store.dispatch(brandCampaignsApi.endpoints.runCampaignAction.initiate({ id: 'c1', path: 'close' })).unwrap(),
    ).rejects.toMatchObject({ status: 409 });
    await settle();

    expect(detailReads(spy)).toBe(2);
    expect(readCampaign(store)?.status.key).toBe('suspended');
    detail.unsubscribe();
  });

  it('does not refetch on a validation failure and shows no toast itself', async () => {
    const { spy } = mockServer(() => fail(422, 'campaign_not_ready', 'Missing parts'));
    const toast = jest.spyOn(toastService, 'error');
    const store = makeStore();
    const detail = store.dispatch(brandCampaignsApi.endpoints.getCampaign.initiate('c1'));
    await detail;

    await expect(
      store.dispatch(brandCampaignsApi.endpoints.runCampaignAction.initiate({ id: 'c1', path: 'submit' })).unwrap(),
    ).rejects.toMatchObject({ status: 422 });
    await settle();

    expect(detailReads(spy)).toBe(1);
    expect(toast).not.toHaveBeenCalled();
    detail.unsubscribe();
  });

  it('passes the KYC gate 403 through without the forbidden screen', async () => {
    mockServer(() => fail(403, 'kyc_required', 'Verify first'));
    const toast = jest.spyOn(toastService, 'error');
    const store = makeStore();

    await expect(
      store.dispatch(brandCampaignsApi.endpoints.runCampaignAction.initiate({ id: 'c1', path: 'submit' })).unwrap(),
    ).rejects.toMatchObject({ status: 403 });

    expect(toast).not.toHaveBeenCalled();
  });

  it('creates a draft from the title and caches it without a read', async () => {
    const { spy } = mockServer(() => json(201, { success: true, message: 'ok', data: detailDto({ id: 'c9', status: { key: 'draft', label: 'Draft' } }), meta: {} }));
    const store = makeStore();

    const created = await store
      .dispatch(brandCampaignsApi.endpoints.createCampaign.initiate({ title: 'Ramadan' }))
      .unwrap();
    await settle();

    expect(created.id).toBe('c9');
    const post = spy.mock.calls.map(([input]) => input as Request).find(r => r.method === 'POST');
    expect(new URL(post?.url ?? '').pathname).toMatch(/\/brand\/campaigns$/);
    expect(await post?.clone().json()).toEqual({ title: 'Ramadan' });
    expect(brandCampaignsApi.endpoints.getCampaign.select('c9')(store.getState()).data?.status.key).toBe('draft');
  });

  it('autosaves a part with PUT and refreshes the cached campaign without a read', async () => {
    const { spy } = mockServer(() => ok(detailDto({ missing: ['schedule'], title: 'Renamed' })));
    const store = makeStore();
    const detail = store.dispatch(brandCampaignsApi.endpoints.getCampaign.initiate('c1'));
    await detail;

    await store
      .dispatch(brandCampaignsApi.endpoints.updateCampaign.initiate({ id: 'c1', body: { title: 'Renamed' } }))
      .unwrap();
    await settle();

    const put = spy.mock.calls.map(([input]) => input as Request).find(r => r.method === 'PUT');
    expect(new URL(put?.url ?? '').pathname).toMatch(/\/brand\/campaigns\/c1$/);
    expect(await put?.clone().json()).toEqual({ title: 'Renamed' });
    expect(readCampaign(store)?.missing).toEqual(['schedule']);
    expect(detailReads(spy)).toBe(1);
    detail.unsubscribe();
  });

  it('reads the quote in minor units', async () => {
    mockServer(() => ok(null));
    const store = makeStore();

    const quote = await store.dispatch(brandCampaignsApi.endpoints.getCampaignQuote.initiate('c1'));

    expect(quote.data?.totalGross.max).toEqual({ amount: 50000, currency: 'USD' });
    expect(quote.data?.wallet.shortfall).toEqual({ amount: 18000, currency: 'USD' });
    expect(quote.data?.seat.max?.net).toEqual({ amount: 9000, currency: 'USD' });
  });

  it('refreshes the quote after a pricing, seats or deliverables save only', async () => {
    const { spy } = mockServer(() => ok(detailDto()));
    const store = makeStore();
    const quote = store.dispatch(brandCampaignsApi.endpoints.getCampaignQuote.initiate('c1'));
    await quote;

    await store
      .dispatch(brandCampaignsApi.endpoints.updateCampaign.initiate({ id: 'c1', body: { title: 'Renamed' } }))
      .unwrap();
    await settle();
    expect(quoteReads(spy)).toBe(1);

    await store
      .dispatch(
        brandCampaignsApi.endpoints.updateCampaign.initiate({
          id: 'c1',
          body: { pricing_model: 'fixed', seat_price_usd: '120.00', budget_usd: null },
        }),
      )
      .unwrap();
    await settle();
    expect(quoteReads(spy)).toBe(2);

    await store
      .dispatch(brandCampaignsApi.endpoints.updateCampaign.initiate({ id: 'c1', body: { seats_total: 6 } }))
      .unwrap();
    await settle();
    expect(quoteReads(spy)).toBe(3);
    quote.unsubscribe();
  });

  it('refetches the campaign when an autosave finds it no longer editable', async () => {
    const { spy, state } = mockServer(() => fail(409, 'campaign_not_editable', 'Locked'));
    const store = makeStore();
    const detail = store.dispatch(brandCampaignsApi.endpoints.getCampaign.initiate('c1'));
    await detail;
    state.detailStatus = 'pending_review';

    await expect(
      store.dispatch(brandCampaignsApi.endpoints.updateCampaign.initiate({ id: 'c1', body: { title: 'x y z' } })).unwrap(),
    ).rejects.toMatchObject({ status: 409 });
    await settle();

    expect(detailReads(spy)).toBe(2);
    expect(readCampaign(store)?.status.key).toBe('pending_review');
    detail.unsubscribe();
  });

  it('deletes a draft and refreshes the list', async () => {
    const { spy } = mockServer(() => ok(null));
    const store = makeStore();
    const list = store.dispatch(brandCampaignsApi.endpoints.getCampaigns.initiate({}));
    await list;

    await store.dispatch(brandCampaignsApi.endpoints.deleteCampaign.initiate('c1')).unwrap();
    await settle();

    const del = spy.mock.calls.map(([input]) => input as Request).find(r => r.method === 'DELETE');
    expect(new URL(del?.url ?? '').pathname).toMatch(/\/brand\/campaigns\/c1$/);
    const listReads = spy.mock.calls.filter(([input]) => {
      const request = input as Request;
      return request.method === 'GET' && new URL(request.url).pathname.endsWith('/brand/campaigns');
    });
    expect(listReads).toHaveLength(2);
    list.unsubscribe();
  });

  it('asks for a cover slot with the purpose and the picked file, and maps the signed target', async () => {
    const { spy } = mockServer(() =>
      json(201, {
        success: true,
        message: 'ok',
        data: {
          file_id: 'f9',
          kind: 'image',
          upload: { method: 'PUT', url: 'https://s3/put', headers: { 'Content-Type': 'image/jpeg' }, expires_at: '2026-10-17T10:00:00+03:00' },
        },
        meta: {},
      }),
    );
    const store = makeStore();

    const slot = await store
      .dispatch(
        brandCampaignsApi.endpoints.requestCampaignFileSlot.initiate({
          id: 'c1',
          purpose: 'cover',
          request: { name: 'cover.jpg', mime: 'image/jpeg', size: 2048 },
        }),
      )
      .unwrap();

    expect(slot).toMatchObject({ fileId: 'f9', url: 'https://s3/put', headers: { 'Content-Type': 'image/jpeg' } });
    const post = spy.mock.calls.map(([input]) => input as Request).find(r => r.method === 'POST');
    expect(new URL(post?.url ?? '').pathname).toMatch(/\/brand\/campaigns\/c1\/files$/);
    expect(await post?.clone().json()).toEqual({ purpose: 'cover', name: 'cover.jpg', mime: 'image/jpeg', size: 2048 });
  });

  it('puts a confirmed cover into the cached campaign, replacing the old one', async () => {
    const { spy } = mockServer(() => ok(fileDto({ id: 'f2', url: 'https://cdn/new' })));
    const store = makeStore();
    const detail = store.dispatch(brandCampaignsApi.endpoints.getCampaign.initiate('c1'));
    await detail;
    expect(readCampaign(store)?.cover?.id).toBe('f1');

    await store.dispatch(brandCampaignsApi.endpoints.completeCampaignFile.initiate({ id: 'c1', fileId: 'f2' })).unwrap();

    const post = spy.mock.calls.map(([input]) => input as Request).find(r => r.method === 'POST');
    expect(new URL(post?.url ?? '').pathname).toMatch(/\/brand\/campaigns\/c1\/files\/f2\/complete$/);
    expect(readCampaign(store)?.cover).toMatchObject({ id: 'f2', url: 'https://cdn/new' });
    expect(detailReads(spy)).toBe(1);
    detail.unsubscribe();
  });

  it('adds a confirmed brief file to the attachments once', async () => {
    mockServer(() => ok(fileDto({ id: 'f7', purpose: 'brief' })));
    const store = makeStore();
    const detail = store.dispatch(brandCampaignsApi.endpoints.getCampaign.initiate('c1'));
    await detail;

    await store.dispatch(brandCampaignsApi.endpoints.completeCampaignFile.initiate({ id: 'c1', fileId: 'f7' })).unwrap();
    await store.dispatch(brandCampaignsApi.endpoints.completeCampaignFile.initiate({ id: 'c1', fileId: 'f7' })).unwrap();

    expect(readCampaign(store)?.attachments.filter(file => file.id === 'f7')).toHaveLength(1);
    expect(readCampaign(store)?.cover?.id).toBe('f1');
    detail.unsubscribe();
  });

  it('clears the cached cover once the server deleted it', async () => {
    const { spy } = mockServer(() => ok(null));
    const store = makeStore();
    const detail = store.dispatch(brandCampaignsApi.endpoints.getCampaign.initiate('c1'));
    await detail;

    await store.dispatch(brandCampaignsApi.endpoints.removeCampaignFile.initiate({ id: 'c1', fileId: 'f1' })).unwrap();

    const del = spy.mock.calls.map(([input]) => input as Request).find(r => r.method === 'DELETE');
    expect(new URL(del?.url ?? '').pathname).toMatch(/\/brand\/campaigns\/c1\/files\/f1$/);
    expect(readCampaign(store)?.cover).toBeNull();
    detail.unsubscribe();
  });

  it('flags the feature as off when a campaign call answers feature_disabled', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(async () => fail(404, 'feature_disabled', 'Off'));
    const store = makeStore();

    await store.dispatch(brandCampaignsApi.endpoints.getCampaign.initiate('c1'));

    expect(store.getState().campaignFlag.serverDisabled).toBe(true);
  });
});

describe('applicant decisions', () => {
  beforeAll(() => initSecureStorage());

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'queueMicrotask', 'setImmediate'] });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const args = { id: 'c1', applicationId: 'a1' };
  const cardReads = (spy: jest.SpyInstance) =>
    spy.mock.calls.filter(([input]) => {
      const request = input as Request;
      return request.method === 'GET' && new URL(request.url).pathname.endsWith('/brand/campaigns/c1/applications/a1');
    }).length;

  it('posts the decision and replaces the cached card with the answer, without reading it again', async () => {
    const spy = jest.spyOn(global, 'fetch').mockImplementation(async input => {
      const request = input as Request;
      const { pathname } = new URL(request.url);
      if (request.method === 'POST') return ok(applicantDto({ status: label('shortlisted'), actions: { can_shortlist: false, can_reject: true, can_select: true } }));
      return pathname.endsWith('/applications/a1') ? ok(applicantDto()) : ok(detailDto());
    });
    const store = makeStore();
    const card = store.dispatch(brandCampaignsApi.endpoints.getCampaignApplicant.initiate(args));
    await card;

    await store.dispatch(brandCampaignsApi.endpoints.decideCampaignApplicant.initiate({ ...args, decision: 'shortlist' })).unwrap();
    await settle();

    const post = spy.mock.calls.map(([input]) => input as Request).find(request => request.method === 'POST');
    expect(new URL(post?.url ?? '').pathname).toMatch(/\/brand\/campaigns\/c1\/applications\/a1\/shortlist$/);
    const cached = brandCampaignsApi.endpoints.getCampaignApplicant.select(args)(store.getState()).data;
    expect(cached?.status.key).toBe('shortlisted');
    expect(cached?.actions.canShortlist).toBe(false);
    expect(cardReads(spy)).toBe(1);
    card.unsubscribe();
  });

  it('refetches the card when the 72 hours ran out under the brand', async () => {
    let status = 'submitted';
    const spy = jest.spyOn(global, 'fetch').mockImplementation(async input => {
      const request = input as Request;
      if (request.method === 'POST') return fail(409, 'campaign_application_expired', 'Window closed');
      return ok(applicantDto({ status: label(status) }));
    });
    const store = makeStore();
    const card = store.dispatch(brandCampaignsApi.endpoints.getCampaignApplicant.initiate(args));
    await card;
    status = 'expired';

    await expect(
      store.dispatch(brandCampaignsApi.endpoints.decideCampaignApplicant.initiate({ ...args, decision: 'reject' })).unwrap(),
    ).rejects.toMatchObject({ status: 409 });
    await settle();

    expect(cardReads(spy)).toBe(2);
    expect(brandCampaignsApi.endpoints.getCampaignApplicant.select(args)(store.getState()).data?.status.key).toBe('expired');
    card.unsubscribe();
  });
});

describe('campaignChangedTags', () => {
  it('refetches the list, the history and the brand home rail', () => {
    expect(campaignChangedTags('c1')).toEqual([
      { type: 'CampaignList', id: 'LIST' },
      { type: 'CampaignHistory', id: 'c1' },
      'BrandHome',
    ]);
  });
});

describe('applicants compare', () => {
  beforeAll(() => initSecureStorage());

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'queueMicrotask', 'setImmediate'] });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('asks for the picked ids and maps the plain array of cards', async () => {
    const spy = jest
      .spyOn(global, 'fetch')
      .mockImplementation(async () => ok([applicantDto({ id: 'a1' }), applicantDto({ id: 'a2', pitch: null })]));
    const store = makeStore();
    const request = store.dispatch(
      brandCampaignsApi.endpoints.getCampaignApplicantsCompare.initiate({ id: 'c1', ids: ['a1', 'a2'] }),
    );
    const { data } = await request;
    request.unsubscribe();

    const url = new URL((spy.mock.calls[0]?.[0] as Request).url);
    expect(url.pathname).toMatch(/\/brand\/campaigns\/c1\/applications\/compare$/);
    expect(url.searchParams.getAll('ids[]')).toEqual(['a1', 'a2']);
    expect(data?.map(card => card.id)).toEqual(['a1', 'a2']);
    expect(data?.[1]?.pitch).toBeNull();
  });
});

describe('select applicant', () => {
  beforeAll(() => initSecureStorage());

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'queueMicrotask', 'setImmediate'] });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const selectDto = {
    application: applicantDto({ id: 'a1', status: label('selected'), deal: { id: 'd1', status: label('escrow_locked') } }),
    deal: { id: 'd1', status: label('escrow_locked') },
    funding: { funded: true, reason: null, missing_usd: '0.00' },
    recruiting: {
      status: 'open',
      seats_total: 3,
      seats_occupied: 1,
      seats_left: 2,
      wallet: { balance_usd: '300.00', required_usd: '200.00', shortfall_usd: '0.00', covers_open_seats: true },
      budget_secured: true,
      prompt_close: false,
    },
  };
  const args = { id: 'c1', applicationId: 'a1', deviceId: 'dev-1', idempotencyKey: 'key-1' };
  const selectCalls = (spy: jest.SpyInstance) =>
    spy.mock.calls.filter(([input]) => (input as Request).method === 'POST');

  it('signs with the device id and the idempotency key, then caches the answer as the card', async () => {
    const spy = jest.spyOn(global, 'fetch').mockImplementation(async input => {
      const request = input as Request;
      if (request.method === 'POST') return json(201, { success: true, message: 'ok', data: selectDto, meta: {} });
      return ok(applicantDto({ id: 'a1' }));
    });
    const store = makeStore();

    const result = await store.dispatch(brandCampaignsApi.endpoints.selectCampaignApplicant.initiate(args)).unwrap();
    await settle();

    const post = selectCalls(spy)[0]?.[0] as Request;
    expect(new URL(post.url).pathname).toMatch(/\/brand\/campaigns\/c1\/applications\/a1\/select$/);
    expect(post.headers.get(IDEMPOTENCY_HEADER)).toBe('key-1');
    expect(await post.clone().json()).toEqual({ device_id: 'dev-1' });
    expect(result.funding.funded).toBe(true);
    expect(result.deal.id).toBe('d1');
    expect(
      brandCampaignsApi.endpoints.getCampaignApplicant.select({ id: 'c1', applicationId: 'a1' })(store.getState()).data?.status.key,
    ).toBe('selected');
  });

  it('refetches the card, the table and the campaign after a refusal, and rejects with the status', async () => {
    const spy = jest.spyOn(global, 'fetch').mockImplementation(async input => {
      const request = input as Request;
      if (request.method === 'POST') return fail(409, 'campaign_no_free_seat', 'No seat left');
      return request.url.includes('/applications/a1') ? ok(applicantDto({ id: 'a1' })) : ok(detailDto());
    });
    const store = makeStore();
    const card = store.dispatch(brandCampaignsApi.endpoints.getCampaignApplicant.initiate({ id: 'c1', applicationId: 'a1' }));
    await card;
    const before = spy.mock.calls.length;

    await expect(
      store.dispatch(brandCampaignsApi.endpoints.selectCampaignApplicant.initiate(args)).unwrap(),
    ).rejects.toMatchObject({ status: 409 });
    await settle();

    const refetched = spy.mock.calls.slice(before).filter(([input]) => (input as Request).method === 'GET');
    expect(refetched.some(([input]) => new URL((input as Request).url).pathname.endsWith('/applications/a1'))).toBe(true);
    card.unsubscribe();
  });

  it('leaves the KYC gate to the screen: no refetch', async () => {
    const spy = jest.spyOn(global, 'fetch').mockImplementation(async input => {
      const request = input as Request;
      if (request.method === 'POST') return fail(403, 'kyc_required', 'Verify first');
      return ok(applicantDto({ id: 'a1' }));
    });
    const store = makeStore();
    const card = store.dispatch(brandCampaignsApi.endpoints.getCampaignApplicant.initiate({ id: 'c1', applicationId: 'a1' }));
    await card;
    const before = spy.mock.calls.length;

    await expect(
      store.dispatch(brandCampaignsApi.endpoints.selectCampaignApplicant.initiate(args)).unwrap(),
    ).rejects.toMatchObject({ status: 403 });
    await settle();

    expect(spy.mock.calls.length - before).toBe(1);
    card.unsubscribe();
  });
});

describe('invite creators', () => {
  beforeAll(() => initSecureStorage());

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'queueMicrotask', 'setImmediate'] });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const reportDto = {
    results: [
      { creator: 'reem', invited: true, reason: null, eligibility: null },
      { creator: 'omar', invited: false, reason: label('already_invited'), eligibility: null },
    ],
    invited: 1,
    skipped: 1,
    limit: 50,
    used: 1,
  };

  it('posts the slugs to the campaign and answers the per-creator report', async () => {
    const spy = jest.spyOn(global, 'fetch').mockImplementation(async () => ok(reportDto));
    const store = makeStore();

    const report = await store.dispatch(brandCampaignsApi.endpoints.inviteCreators.initiate({ id: 'c1', slugs: ['reem', 'omar'] })).unwrap();

    const post = spy.mock.calls[0]?.[0] as Request;
    expect(post.method).toBe('POST');
    expect(new URL(post.url).pathname).toMatch(/\/brand\/campaigns\/c1\/invitations$/);
    expect(await post.clone().json()).toEqual({ creators: ['reem', 'omar'] });
    expect(post.headers.get(IDEMPOTENCY_HEADER)).toBeNull();
    expect(report.rows.map(row => row.invited)).toEqual([true, false]);
    expect(report.used).toBe(1);
  });

  it('refetches the campaigns list when the campaign stopped accepting, and rejects with the status', async () => {
    const spy = jest.spyOn(global, 'fetch').mockImplementation(async input => {
      const request = input as Request;
      if (request.method === 'POST') return fail(409, 'campaign_not_accepting', 'Closed');
      return ok({ items: [detailDto()], meta: { current_page: 1, last_page: 1, total: 1 } });
    });
    const store = makeStore();
    const list = store.dispatch(brandCampaignsApi.endpoints.getCampaigns.initiate({ statuses: ['open'] }));
    await list;
    const before = spy.mock.calls.length;

    await expect(
      store.dispatch(brandCampaignsApi.endpoints.inviteCreators.initiate({ id: 'c1', slugs: ['reem'] })).unwrap(),
    ).rejects.toMatchObject({ status: 409 });
    await settle();

    const refetched = spy.mock.calls.slice(before).filter(([input]) => (input as Request).method === 'GET');
    expect(refetched.length).toBeGreaterThan(0);
    list.unsubscribe();
  });
});
