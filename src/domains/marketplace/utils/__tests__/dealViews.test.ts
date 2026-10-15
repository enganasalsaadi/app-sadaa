import { BRAND_DEAL_TAB_DEF, CREATOR_DEAL_TAB_DEF } from '../../constants/dealList';
import { DEAL_STATUS } from '../../types';
import type { Deal, DealItemStatus, DealStatus, DealTimelineRow } from '../../types';
import { dealNextStep, isDealOnYou } from '../dealNextStep';
import { dealStation, stationOfStatus } from '../dealStation';
import { groupTimelineByStation } from '../dealTimelineEvents';
import { dealTimer, formatRemaining, timerElapsedShare } from '../dealTimer';

const NOW = Date.UTC(2026, 9, 14, 12);
const HOUR = 3_600_000;
const usd = (amount: number) => ({ amount, currency: 'USD' }) as const;

type DealInput = Pick<
  Deal,
  | 'status'
  | 'stage'
  | 'items'
  | 'shippingMode'
  | 'shipping'
  | 'dispute'
  | 'rating'
  | 'dueAt'
  | 'deliveryHours'
  | 'extendedDeliveryHours'
>;

const item = (status: DealItemStatus): Deal['items'][number] => ({
  id: `item-${status}`,
  rateCardId: null,
  upsellId: null,
  title: 'Reel',
  platform: 'instagram',
  service: 'reel',
  packageValue: null,
  unitPrice: usd(10000),
  addons: [],
  total: usd(10000),
  deliveryDays: 5,
  deliveryHours: null,
  retention: '30d',
  revisionsAllowed: 2,
  revisionsUsed: 0,
  revisionsLeft: 2,
  approveAsIsAvailable: false,
  status: { key: status, label: status },
  dueAt: null,
  timerPaused: false,
  liveUrl: null,
  fixRequestsLeft: 2,
  verifiedAt: null,
});

const deal = (
  status: DealStatus | null,
  extra: Partial<DealInput> = {},
): DealInput => ({
  status: { key: status, label: status ?? 'new' },
  stage: null,
  items: [],
  shippingMode: { key: 'none', label: '' },
  shipping: null,
  dispute: null,
  rating: null,
  dueAt: null,
  deliveryHours: 120,
  extendedDeliveryHours: null,
  ...extra,
});

const withStage = (stage: DealItemStatus, items: DealItemStatus[] = [stage]) =>
  deal('in_progress', { stage: { key: stage, label: stage }, items: items.map(item) });

const shipment = (receivedAt: number | null) => ({
  id: 's1',
  sequence: 1,
  courier: 'DHL',
  trackingNo: '1',
  trackingUrl: null,
  shippedAt: NOW - HOUR,
  receivedAt,
  delayedReportFrom: NOW,
  issue: null,
});

const withProduct = (status: DealStatus, received: boolean | null) =>
  deal(status, {
    shippingMode: { key: 'gift', label: '' },
    shipping: {
      shipBy: null,
      reshipsLeft: 1,
      freeCancelFrom: null,
      shipments: received === null ? [] : [shipment(received ? NOW : null)],
    },
  });

describe('dealStation', () => {
  it.each([
    ['draft', 'sign'],
    ['pending_influencer', 'reply'],
    ['negotiating_deadline', 'reply'],
    ['awaiting_payment', 'escrow'],
    ['escrow_locked', 'escrow'],
  ] as const)('%s sits at %s and is open', (status, station) => {
    expect(dealStation(deal(status))).toMatchObject({ current: station, state: 'open' });
  });

  it.each([
    ['pending', 'make'],
    ['revision_requested', 'make'],
    ['draft_submitted', 'review'],
    ['approved_to_publish', 'publish'],
    ['verifying_live', 'publish'],
  ] as const)('in_progress with stage %s sits at %s', (stage, station) => {
    expect(dealStation(withStage(stage)).current).toBe(station);
  });

  it('puts shipping statuses on the shipping station only when there is a product', () => {
    const view = dealStation(withProduct('shipping_issue', false));
    expect(view.current).toBe('ship');
    expect(view.stages.map(s => s.key)).toContain('ship');
    expect(dealStation(deal('escrow_locked')).stages.map(s => s.key)).not.toContain('ship');
  });

  it('freezes a dispute at the station of its prior status', () => {
    const view = dealStation({
      ...withStage('draft_submitted'),
      status: { key: 'disputed', label: '' },
      dispute: { priorStatus: 'in_progress' } as Deal['dispute'],
    });
    expect(view).toMatchObject({ current: 'review', state: 'disputed' });
  });

  it('marks finals: success → done, early ends → stopped where they ended', () => {
    expect(dealStation(deal('completed'))).toMatchObject({ current: 'done', state: 'done' });
    expect(dealStation(deal('resolved_payout')).state).toBe('done');
    expect(dealStation(deal('declined'))).toMatchObject({ current: 'reply', state: 'stopped' });
    expect(dealStation(deal('cancelled_payment_timeout')).current).toBe('escrow');
    expect(dealStation(withProduct('cancelled_by_brand', null)).current).toBe('ship');
    expect(dealStation(withProduct('cancelled_by_brand', true)).current).toBe('make');
  });

  it('never claims progress for an unknown status', () => {
    expect(dealStation(deal(null))).toMatchObject({ current: 'sign', state: 'open' });
  });

  it('places timeline targets, ignoring unknown keys', () => {
    expect(stationOfStatus('awaiting_payment', 'deal')).toBe('escrow');
    expect(stationOfStatus('verified', 'item')).toBe('publish');
    expect(stationOfStatus('teleported', 'deal')).toBeNull();
  });
});

describe('dealNextStep', () => {
  it.each([
    ['pending_influencer', 'brandWaitReply', 'other', 'creatorReply', 'you'],
    ['negotiating_deadline', 'brandAnswerExtension', 'you', 'creatorWaitExtension', 'other'],
    ['awaiting_payment', 'brandFund', 'you', 'creatorWaitFund', 'other'],
    ['shipping_issue', 'brandAnswerIssue', 'you', 'creatorWaitIssue', 'other'],
    ['disputed', 'dispute', 'sada', 'dispute', 'sada'],
    ['completed', 'done', 'sada', 'done', 'sada'],
  ] as const)('%s → brand %s (%s) · creator %s (%s)', (status, brandKey, brandActor, creatorKey, creatorActor) => {
    expect(dealNextStep(deal(status), 'brand')).toEqual({ key: brandKey, actor: brandActor });
    expect(dealNextStep(deal(status), 'creator')).toEqual({ key: creatorKey, actor: creatorActor });
  });

  it('follows the shipment: ship first, then confirm receipt', () => {
    expect(dealNextStep(withProduct('product_shipping', null), 'brand')?.key).toBe('brandShip');
    expect(dealNextStep(withProduct('product_shipping', false), 'brand')?.key).toBe('brandWaitReceipt');
    expect(dealNextStep(withProduct('product_shipping', false), 'creator')).toEqual({
      key: 'creatorReceive',
      actor: 'you',
    });
  });

  it('lets any item waiting on the viewer win over the slowest stage', () => {
    const mixed = withStage('pending', ['pending', 'draft_submitted']);
    expect(dealNextStep(mixed, 'brand')).toEqual({ key: 'brandReviewDraft', actor: 'you' });
    expect(dealNextStep(mixed, 'creator')).toEqual({ key: 'creatorSubmitDraft', actor: 'you' });
    expect(dealNextStep(withStage('verifying_live'), 'creator')?.key).toBe('creatorWaitVerify');
  });

  it('asks for a rating before anything else once the window opens', () => {
    const rating = {
      open: true,
      dueAt: null,
      revealedAt: null,
      brand: { answered: false, revealed: null },
      creator: { answered: true, revealed: null },
    };
    expect(dealNextStep(deal('completed', { rating }), 'brand')?.key).toBe('rate');
    expect(dealNextStep(deal('completed', { rating }), 'creator')?.key).toBe('done');
  });

  it('has nothing for drafts on the creator side or stopped deals', () => {
    expect(dealNextStep(deal('draft'), 'creator')).toBeNull();
    expect(dealNextStep(deal('expired'), 'brand')).toBeNull();
    expect(dealNextStep(deal(null), 'brand')).toBeNull();
    expect(isDealOnYou(deal('pending_influencer'), 'creator')).toBe(true);
    expect(isDealOnYou(deal('pending_influencer'), 'brand')).toBe(false);
  });
});

describe('dealTimer', () => {
  it('reads paused from a frozen open deal, not from finals', () => {
    expect(dealTimer(deal('shipping_issue')).paused).toBe(true);
    expect(dealTimer(deal('disputed')).paused).toBe(true);
    expect(dealTimer(deal('in_progress')).paused).toBe(false);
    expect(dealTimer(deal('completed', { dueAt: NOW }))).toEqual({ dueAt: null, paused: false, windowHours: null });
  });

  it('measures the window gone only when its length is known', () => {
    const reply = dealTimer(deal('pending_influencer', { dueAt: NOW + 12 * HOUR }));
    expect(reply.windowHours).toBe(48);
    expect(timerElapsedShare(reply, NOW)).toBeCloseTo(0.75);
    const making = dealTimer({ ...withStage('pending'), dueAt: NOW + 60 * HOUR, extendedDeliveryHours: 240 });
    expect(making.windowHours).toBe(240);
    expect(timerElapsedShare(dealTimer(deal('escrow_locked', { dueAt: NOW })), NOW)).toBeNull();
    expect(timerElapsedShare(reply, NOW + 100 * HOUR)).toBe(1);
  });

  it('words what is left in minutes, hours or days', () => {
    const t = jest.fn((key: string, options?: { count?: number }) => `${key}:${options?.count}`);
    const tf = t as unknown as Parameters<typeof formatRemaining>[0];
    expect(formatRemaining(tf, 25 * 60)).toBe('marketplace.deals.timer.minutes:25');
    expect(formatRemaining(tf, 41 * 3600 + 120)).toBe('marketplace.offer.units.hours:41');
    expect(formatRemaining(tf, 72 * 3600)).toBe('marketplace.offer.units.days:3');
  });
});

describe('groupTimelineByStation', () => {
  const row = (
    id: string,
    key: string,
    extra: Partial<DealTimelineRow> = {},
  ): DealTimelineRow => ({
    id,
    subject: { type: 'deal', id: 'd1' },
    from: null,
    to: { key, label: key },
    actor: { key: 'brand', label: 'Brand' },
    reason: null,
    metadata: null,
    dueAt: null,
    occurredAt: Number(id),
    isNote: false,
    ...extra,
  });

  it('sorts rows into stations, newest first, notes worded when known', () => {
    const grouped = groupTimelineByStation([
      row('1', 'pending_influencer'),
      row('2', 'awaiting_payment'),
      row('3', 'in_progress'),
      row('4', 'draft_submitted', { subject: { type: 'item', id: 'i1' } }),
      row('5', 'in_progress', { isNote: true, reason: 'upsell_proposed' }),
      row('6', 'in_progress', { isNote: true, reason: 'mystery' }),
      row('7', 'disputed'),
    ]);
    expect(grouped.reply.map(e => e.id)).toEqual(['1']);
    expect(grouped.escrow.map(e => e.id)).toEqual(['2']);
    expect(grouped.make.map(e => e.id)).toEqual(['3']);
    expect(grouped.review.map(e => e.id)).toEqual(['7', '6', '5', '4']);
    expect(grouped.review[2]?.note).toBe('upsell_proposed');
    expect(grouped.review[1]?.note).toBeNull();
  });
});

describe('deal list tabs', () => {
  it('splits every status into exactly one tab per role (drafts brand only)', () => {
    const brand = Object.values(BRAND_DEAL_TAB_DEF).flatMap(tab => tab.statuses);
    const creator = Object.values(CREATOR_DEAL_TAB_DEF).flatMap(tab => tab.statuses);
    expect([...brand].sort()).toEqual([...DEAL_STATUS].sort());
    expect([...creator].sort()).toEqual(DEAL_STATUS.filter(s => s !== 'draft').sort());
    expect(new Set(brand).size).toBe(brand.length);
    expect(new Set(creator).size).toBe(creator.length);
    expect(CREATOR_DEAL_TAB_DEF.new.statuses).toEqual(['pending_influencer', 'negotiating_deadline']);
  });
});
