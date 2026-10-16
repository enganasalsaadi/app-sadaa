import type { CampaignDetail } from '../../types/campaign';
import type { CampaignDraftRequest, CampaignDraftValues } from '../../types/campaignDraft';
import { draftSectionsOf, draftValuesFromCampaign, emptyDraftValues } from '../campaignDraft';
import { createCampaignDraftSyncer } from '../campaignDraftSync';
import type { CampaignDraftSyncState } from '../campaignDraftSync';
import { mapCampaignDetail } from '../campaignMappers';
import { detailDto } from '../__fixtures__/campaignDto';

const DELAY = 500;

const values = (patch: Partial<CampaignDraftValues>): CampaignDraftValues => ({
  ...emptyDraftValues(),
  ...patch,
});
const sections = (patch: Partial<CampaignDraftValues>) => draftSectionsOf(values(patch));

const campaign = (overrides = {}): CampaignDetail => mapCampaignDetail(detailDto(overrides));

const apiError = (status: number, code: string | null, errors?: Record<string, string[]>) => ({
  status,
  data: { success: false, message: 'server words', error_code: code, errors: errors ?? null },
});

/** A draft the server created with its own defaults (what `values({})` already says). */
const blankDraft = (): CampaignDetail =>
  campaign({
    id: 'new1',
    status: { key: 'draft', label: 'Draft' },
    title: 'Ramadan',
    activity_type: null,
    teaser: null,
    cover: null,
    pricing: { model: { key: 'fixed', label: 'Fixed' }, seat_price_usd: null, bid_min_usd: null, bid_max_usd: null, budget_usd: null },
    seats_total: 1,
    shipping_mode: { key: 'none', label: 'None' },
    drop_at: null,
    drop: null,
    apply_deadline_at: null,
    deliverables: [],
    targeting: { genders: [], min_followers: null, cities: [], niches: [] },
    private_brief: null,
  });

const setup = () => {
  const create = jest.fn<Promise<CampaignDetail>, [CampaignDraftRequest]>(async () => blankDraft());
  const update = jest.fn<Promise<CampaignDetail>, [string, CampaignDraftRequest]>(async () => blankDraft());
  const states: CampaignDraftSyncState[] = [];
  const onCreated = jest.fn();
  const syncer = createCampaignDraftSyncer({
    create,
    update,
    onChange: state => states.push(state),
    onCreated,
    delayMs: DELAY,
  });
  return { create, update, states, onCreated, syncer, last: () => states[states.length - 1] };
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('draft syncer: creating', () => {
  it('waits for the quiet time, then creates from the title only', async () => {
    const { create, update, syncer, onCreated } = setup();
    syncer.want(sections({ title: 'Ramadan' }));
    jest.advanceTimersByTime(DELAY - 1);
    expect(create).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(create).toHaveBeenCalledWith({ title: 'Ramadan' });
    expect(onCreated).toHaveBeenCalledWith('new1');
    expect(update).not.toHaveBeenCalled();
  });

  it('does not create before the title is long enough', async () => {
    const { create, syncer } = setup();
    syncer.want(sections({ title: 'ab' }));
    await syncer.flush();
    expect(create).not.toHaveBeenCalled();
  });

  it('collapses a burst of edits into one save of the latest', async () => {
    const { create, syncer } = setup();
    syncer.want(sections({ title: 'Ram' }));
    syncer.want(sections({ title: 'Rama' }));
    syncer.want(sections({ title: 'Ramadan' }));
    await jest.advanceTimersByTimeAsync(DELAY);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({ title: 'Ramadan' });
  });

  it('does not re-send the parts the server already has by default', async () => {
    const { update, syncer } = setup();
    syncer.want(sections({ title: 'Ramadan' }));
    await syncer.flush();
    expect(update).not.toHaveBeenCalled();
  });

  it('saves the other parts after the title, one request each, in order', async () => {
    const { update, syncer } = setup();
    syncer.want(sections({ title: 'Ramadan', seatsTotal: 4, shippingMode: 'gift', teaser: 'Post a reel' }));
    await syncer.flush();
    expect(update.mock.calls).toEqual([
      ['new1', { teaser: { requirements: 'Post a reel' } }],
      ['new1', { shipping_mode: 'gift' }],
      ['new1', { seats_total: 4 }],
    ]);
  });
});

describe('draft syncer: editing', () => {
  it('sends only the changed part of an opened draft', async () => {
    const { update, create, syncer } = setup();
    const opened = campaign();
    syncer.seed(opened);
    syncer.want(draftSectionsOf({ ...draftValuesFromCampaign(opened), teaser: 'New ask' }));
    await syncer.flush();
    expect(create).not.toHaveBeenCalled();
    expect(update.mock.calls).toEqual([['c1', { teaser: { requirements: 'New ask' } }]]);
  });

  it('sends nothing when the form still equals the opened draft', async () => {
    const { update, syncer } = setup();
    const opened = campaign();
    syncer.seed(opened);
    syncer.want(draftSectionsOf(draftValuesFromCampaign(opened)));
    await syncer.flush();
    expect(update).not.toHaveBeenCalled();
  });

  it('picks up an edit made while a save is in flight, with a single request out at a time', async () => {
    const { update, syncer } = setup();
    let inFlight = 0;
    let peak = 0;
    update.mockImplementation(async () => {
      inFlight += 1;
      peak = Math.max(peak, inFlight);
      await Promise.resolve();
      inFlight -= 1;
      return blankDraft();
    });
    syncer.want(sections({ title: 'Ramadan', seatsTotal: 2 }));
    const done = syncer.flush();
    syncer.want(sections({ title: 'Ramadan', seatsTotal: 3 }));
    await done;
    await syncer.flush();
    expect(update.mock.calls.map(([, body]) => body)).toContainEqual({ seats_total: 3 });
    expect(peak).toBe(1);
  });
});

describe('draft syncer: failures', () => {
  it('blocks at the 20-draft limit until retry', async () => {
    const { create, syncer, last } = setup();
    create.mockRejectedValueOnce(apiError(422, 'campaign_draft_limit'));
    syncer.want(sections({ title: 'Ramadan' }));
    await syncer.flush();
    expect(last()?.failure?.kind).toBe('limit');
    expect(create).toHaveBeenCalledTimes(1);

    syncer.want(sections({ title: 'Ramadan 2' }));
    await jest.advanceTimersByTimeAsync(DELAY);
    expect(create).toHaveBeenCalledTimes(1);

    await syncer.retry();
    expect(create).toHaveBeenCalledTimes(2);
    expect(last()?.failure).toBeNull();
  });

  it('skips a refused part, saves the others, and retries it only after a change', async () => {
    const { update, syncer, last } = setup();
    update.mockImplementation(async (_id, body) => {
      if ('seats_total' in body) throw apiError(422, null, { seats_total: ['too many'] });
      return blankDraft();
    });
    syncer.want(sections({ title: 'Ramadan', seatsTotal: 30, shippingMode: 'gift' }));
    await syncer.flush();
    expect(update.mock.calls.map(([, body]) => body)).toEqual([{ shipping_mode: 'gift' }, { seats_total: 30 }]);
    expect(last()?.refused.seats_total?.fields).toEqual({ seats_total: 'too many' });
    expect(last()?.failure).toBeNull();

    await syncer.flush();
    expect(update).toHaveBeenCalledTimes(2);

    update.mockImplementation(async () => blankDraft());
    syncer.want(sections({ title: 'Ramadan', seatsTotal: 20, shippingMode: 'gift' }));
    await syncer.flush();
    expect(update).toHaveBeenLastCalledWith('new1', { seats_total: 20 });
    expect(last()?.refused).toEqual({});
  });

  it('treats a 409 campaign conflict as blocking', async () => {
    const { update, syncer, last } = setup();
    update.mockRejectedValueOnce(apiError(409, 'campaign_not_editable'));
    syncer.want(sections({ title: 'Ramadan', seatsTotal: 3, shippingMode: 'gift' }));
    await syncer.flush();
    expect(last()?.failure?.kind).toBe('conflict');
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('retries a network failure on the next edit', async () => {
    const { update, syncer, last } = setup();
    update.mockRejectedValueOnce({ status: 'FETCH_ERROR', error: 'offline' });
    syncer.want(sections({ title: 'Ramadan', seatsTotal: 3 }));
    await syncer.flush();
    expect(last()?.failure?.kind).toBe('network');

    syncer.want(sections({ title: 'Ramadan', seatsTotal: 4 }));
    await syncer.flush();
    expect(last()?.failure).toBeNull();
    expect(update).toHaveBeenLastCalledWith('new1', { seats_total: 4 });
  });

  it('reports saving and pending around a save', async () => {
    const { syncer, states } = setup();
    syncer.want(sections({ title: 'Ramadan' }));
    expect(states[states.length - 1]).toMatchObject({ pending: true, saving: false });
    await syncer.flush();
    expect(states.some(state => state.saving)).toBe(true);
    expect(states[states.length - 1]).toMatchObject({ pending: false, saving: false });
  });
});

describe('draft syncer: canContinue', () => {
  it('is false before the draft exists and true once it is saved', async () => {
    const { syncer } = setup();
    expect(syncer.canContinue()).toBe(false);
    syncer.want(sections({ title: 'Ramadan' }));
    await syncer.flush();
    expect(syncer.canContinue()).toBe(true);
  });

  it('stays false when creating hit the draft limit, and again true after a retry', async () => {
    const { create, syncer } = setup();
    create.mockRejectedValueOnce(apiError(422, 'campaign_draft_limit'));
    syncer.want(sections({ title: 'Ramadan' }));
    await syncer.flush();
    expect(syncer.canContinue()).toBe(false);

    await syncer.retry();
    expect(syncer.canContinue()).toBe(true);
  });

  it('is false while a conflict blocks the queue', async () => {
    const { update, syncer } = setup();
    syncer.want(sections({ title: 'Ramadan' }));
    await syncer.flush();
    update.mockRejectedValueOnce(apiError(409, 'campaign_not_editable'));
    syncer.want(sections({ title: 'Ramadan', seatsTotal: 3 }));
    await syncer.flush();
    expect(syncer.canContinue()).toBe(false);
  });
});
