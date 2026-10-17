import type {
  ApplicantCardDto,
  ApplicantsPageDto,
  CampaignHistoryRowDto,
  CampaignQuoteDto,
  CampaignRecruitingDto,
  CreatorApplicationDto,
  CreatorCampaignDetailDto,
} from '../../types/campaignDto';
import { applicantDto, detailDto, fileDto, label, seatsDto, T0 } from '../__fixtures__/campaignDto';
import {
  mapApplicantCard,
  mapApplicantsPage,
  mapCampaignDetail,
  mapCampaignFile,
  mapCampaignFunding,
  mapCampaignHistoryRow,
  mapCampaignQuote,
  mapCampaignRecruiting,
  mapCampaignSelectResult,
  mapCampaignsPage,
  mapCreatorApplication,
  mapCreatorCampaignDetail,
} from '../campaignMappers';

const T0_MS = Date.UTC(2026, 9, 17, 6);
const HOUR = 3_600_000;
const usd = (amount: number) => ({ amount, currency: 'USD' });

describe('mapCampaignDetail', () => {
  it('parses money to USD minor units and timestamps to ms', () => {
    const c = mapCampaignDetail(detailDto());
    expect(c.pricing.seatPrice).toEqual(usd(10000));
    expect(c.pricing.budget).toEqual(usd(80000));
    expect(c.pricing.bidMax).toBeNull();
    expect(c.applyDeadlineAt).toBe(T0_MS);
    expect(c.publishedAt).toBe(T0_MS);
    expect(c.drop?.publishOpensAt).toBe(Date.UTC(2026, 10, 1, 16, 45));
    expect(c.drop?.minGapHours).toBe(240);
  });

  it('narrows enums and keeps server labels', () => {
    const c = mapCampaignDetail(detailDto());
    expect(c.status).toEqual({ key: 'open', label: 'L:open' });
    expect(c.activityType?.key).toBe('restaurant_cafe');
    expect(c.shippingMode.key).toBe('gift');
    expect(c.pricing.model.key).toBe('fixed');
  });

  it('turns an unknown status or activity type into a null key but keeps the label', () => {
    const c = mapCampaignDetail(
      detailDto({ status: label('paused'), activity_type: label('space_travel'), shipping_mode: label('drone') }),
    );
    expect(c.status).toEqual({ key: null, label: 'L:paused' });
    expect(c.activityType).toEqual({ key: null, label: 'L:space_travel' });
    expect(c.shippingMode.key).toBeNull();
  });

  it('drops unknown genders and seat-freed options instead of crashing', () => {
    const c = mapCampaignDetail(detailDto());
    expect(c.targeting.genders).toEqual(['female']);
    expect(c.seatFreed?.options).toEqual(['replace', 'reduce']);
  });

  it('maps the running clocks', () => {
    const { timers } = mapCampaignDetail(detailDto());
    expect(timers.ghost).toEqual({ warnsAt: T0_MS, suspendsAt: T0_MS + 3 * HOUR });
    expect(timers.suspension).toEqual({ endsAt: null, reopenNeedsDeadline: true });
    expect(timers.zeroApplicants?.options).toEqual(['edit', 'extend', 'cancel']);
    expect(timers.zeroApplicants?.extendTo).toBe(T0_MS + 96 * HOUR);
  });

  it('maps the private brief and attachments', () => {
    const c = mapCampaignDetail(detailDto());
    expect(c.privateBrief?.talkingPoints).toEqual(['hi']);
    expect(c.privateBrief?.promoCode).toBe('SADA10');
    expect(c.attachments[0]?.purpose).toBe('brief');
  });

  it('keeps null sections null', () => {
    const c = mapCampaignDetail(
      detailDto({
        teaser: null,
        cover: null,
        drop: null,
        drop_at: null,
        seat_freed: null,
        private_brief: null,
        apply_deadline_at: null,
        published_at: null,
        delivery_days: 7,
      }),
    );
    expect(c.teaserRequirements).toBeNull();
    expect(c.cover).toBeNull();
    expect(c.drop).toBeNull();
    expect(c.dropAt).toBeNull();
    expect(c.seatFreed).toBeNull();
    expect(c.privateBrief).toBeNull();
    expect(c.applyDeadlineAt).toBeNull();
    expect(c.deliveryDays).toBe(7);
  });

  it('throws on malformed money or a malformed required timestamp', () => {
    expect(() =>
      mapCampaignDetail(
        detailDto({ pricing: { ...detailDto().pricing, seat_price_usd: '12.345' } }),
      ),
    ).toThrow();
    expect(() => mapCampaignDetail(detailDto({ created_at: 'yesterday' }))).toThrow(TypeError);
  });
});

describe('mapCampaignFile', () => {
  it('narrows the purpose and tolerates unknown ones', () => {
    expect(mapCampaignFile(fileDto()).purpose).toBe('cover');
    expect(mapCampaignFile(fileDto({ purpose: 'banner' })).purpose).toBeNull();
    expect(mapCampaignFile(fileDto({ url: null })).url).toBeNull();
  });
});

describe('mapCampaignsPage', () => {
  it('maps list rows (detail-only sections are not carried over) and the page meta', () => {
    const page = mapCampaignsPage({ items: [detailDto()], meta: { current_page: 2, last_page: 3, total: 41 } });
    expect(page.meta).toEqual({ currentPage: 2, lastPage: 3, total: 41 });
    expect(page.items[0]?.id).toBe('c1');
    expect(page.items[0]).not.toHaveProperty('timers');
  });
});

describe('mapCampaignQuote', () => {
  const breakdown = { gross_usd: '100.00', fee_usd: '10.00', net_usd: '90.00' };
  const quote = (overrides: Partial<CampaignQuoteDto> = {}): CampaignQuoteDto => ({
    pricing_model: 'fixed',
    currency: 'USD',
    fee_bps: 1000,
    seats: 5,
    deliverables_per_creator: 2,
    seat: { min: breakdown, max: breakdown },
    total_gross_usd: { min: '500.00', max: '500.00' },
    budget_usd: null,
    wallet: { balance_usd: '300.00', required_usd: '500.00', shortfall_usd: '200.00', is_sufficient: false },
    ...overrides,
  });

  it('takes every figure from the server and parses it to minor units', () => {
    const q = mapCampaignQuote(quote());
    expect(q.seat.max).toEqual({ gross: usd(10000), fee: usd(1000), net: usd(9000) });
    expect(q.totalGross.min).toEqual(usd(50000));
    expect(q.wallet).toEqual({
      balance: usd(30000),
      required: usd(50000),
      shortfall: usd(20000),
      isSufficient: false,
    });
    expect(q.budget).toBeNull();
    expect(q.feeBps).toBe(1000);
  });

  it('keeps nulls until the pricing is set', () => {
    const q = mapCampaignQuote(
      quote({ pricing_model: null, seat: { min: null, max: null }, total_gross_usd: { min: null, max: null } }),
    );
    expect(q.pricingModel).toBeNull();
    expect(q.seat).toEqual({ min: null, max: null });
    expect(q.totalGross).toEqual({ min: null, max: null });
  });
});

describe('mapCampaignRecruiting', () => {
  const recruiting = (overrides: Partial<CampaignRecruitingDto> = {}): CampaignRecruitingDto => ({
    status: 'open',
    seats_total: 5,
    seats_occupied: 2,
    seats_left: 3,
    wallet: { balance_usd: '10.00', required_usd: '300.00', shortfall_usd: '290.00', covers_open_seats: false },
    budget_secured: false,
    prompt_close: true,
    ...overrides,
  });

  it('maps the wallet check and the close prompt', () => {
    const r = mapCampaignRecruiting(recruiting());
    expect(r.status).toBe('open');
    expect(r.seatsLeft).toBe(3);
    expect(r.wallet.shortfall).toEqual(usd(29000));
    expect(r.wallet.coversOpenSeats).toBe(false);
    expect(r.promptClose).toBe(true);
  });

  it('accepts the status as a bare key or a labelled object, and tolerates unknown ones', () => {
    expect(mapCampaignRecruiting(recruiting({ status: label('filled') })).status).toBe('filled');
    expect(mapCampaignRecruiting(recruiting({ status: 'paused' })).status).toBeNull();
  });
});

describe('mapCampaignFunding', () => {
  it('parses the missing amount like a deal funding block', () => {
    expect(mapCampaignFunding({ funded: false, reason: 'insufficient_funds', missing_usd: '25.50' })).toEqual({
      funded: false,
      reason: 'insufficient_funds',
      missing: usd(2550),
    });
  });
});

describe('mapCampaignSelectResult', () => {
  it('maps the card, the deal it started, the escrow answer and the seats after', () => {
    const result = mapCampaignSelectResult({
      application: applicantDto({ id: 'a7', status: label('selected'), deal: { id: 'd9', status: label('awaiting_payment') } }),
      deal: { id: 'd9', status: label('awaiting_payment') },
      funding: { funded: false, reason: 'insufficient_funds', missing_usd: '20.00' },
      recruiting: {
        status: 'open',
        seats_total: 3,
        seats_occupied: 2,
        seats_left: 1,
        wallet: { balance_usd: '180.00', required_usd: '200.00', shortfall_usd: '20.00', covers_open_seats: false },
        budget_secured: true,
        prompt_close: true,
      },
    });
    expect(result.application.id).toBe('a7');
    expect(result.deal).toEqual({ id: 'd9', status: { key: 'awaiting_payment', label: 'L:awaiting_payment' } });
    expect(result.funding).toEqual({ funded: false, reason: 'insufficient_funds', missing: usd(2000) });
    expect(result.recruiting.seatsOccupied).toBe(2);
    expect(result.recruiting.promptClose).toBe(true);
  });
});

describe('mapCampaignHistoryRow', () => {
  const row = (overrides: Partial<CampaignHistoryRowDto> = {}): CampaignHistoryRowDto => ({
    id: 'h1',
    subject: { type: 'campaign', id: 'c1' },
    from: label('open'),
    to: label('open'),
    actor: label('brand'),
    reason: 'campaign_edited',
    metadata: { fields: ['title'] },
    due_at: null,
    occurred_at: T0,
    ...overrides,
  });

  it('maps a note row (from == to) with its metadata', () => {
    const r = mapCampaignHistoryRow(row());
    expect(r.from?.key).toBe(r.to.key);
    expect(r.metadata).toEqual({ fields: ['title'] });
    expect(r.occurredAt).toBe(T0_MS);
    expect(r.subject.type).toBe('campaign');
  });

  it('survives a missing from, null metadata and an unknown subject type', () => {
    const r = mapCampaignHistoryRow(row({ from: null, metadata: null, subject: { type: 'deal', id: 'x' } }));
    expect(r.from).toBeNull();
    expect(r.metadata).toEqual({});
    expect(r.subject.type).toBeNull();
  });
});

describe('mapCreatorCampaignDetail', () => {
  const breakdown = (gross: string, fee: string, net: string) => ({ gross_usd: gross, fee_usd: fee, net_usd: net });
  const dto = (overrides: Partial<CreatorCampaignDetailDto> = {}): CreatorCampaignDetailDto => ({
    id: 'c1',
    status: label('open'),
    accepting_applications: true,
    title: 'Ramadan launch',
    activity_type: null,
    brand: { name: 'Cafe', avatar_url: null, verified: true },
    cover: null,
    pricing: {
      model: label('bidding'),
      fee_bps: 1000,
      fixed: null,
      bid: { min: breakdown('50.00', '5.00', '45.00'), max: breakdown('120.00', '12.00', '108.00') },
    },
    seats: seatsDto(5, 3),
    apply_deadline_at: T0,
    drop_at: null,
    delivery_days: 7,
    shipping_mode: label('none'),
    deliverables: [{ platform: label('tiktok'), service: label('video'), count: 1, revisions: 0, addons: [] }],
    bookmarked: false,
    invited: true,
    budget_secured: true,
    eligibility: {
      eligible: false,
      reasons: [
        { key: 'min_followers', label: 'Too few followers', meta: { min_followers: 5000 } },
        { key: 'brand_new_rule', label: 'Something new' },
      ],
    },
    published_at: T0,
    teaser: { requirements: 'Be funny' },
    requirements: { genders: ['male', 'x'], min_followers: 5000, cities: [], niches: ['food'] },
    ...overrides,
  });

  it('keeps the creator take-home next to the gross for a bid range', () => {
    const c = mapCreatorCampaignDetail(dto());
    expect(c.pricing.bid?.min.net).toEqual(usd(4500));
    expect(c.pricing.bid?.max.gross).toEqual(usd(12000));
    expect(c.pricing.fixed).toBeNull();
    expect(c.seats).toEqual(seatsDto(5, 3));
  });

  it('exposes eligibility reasons, tolerating unknown ones and missing meta', () => {
    const { eligibility } = mapCreatorCampaignDetail(dto());
    expect(eligibility.eligible).toBe(false);
    expect(eligibility.reasons[0]).toEqual({
      key: 'min_followers',
      label: 'Too few followers',
      meta: { min_followers: 5000 },
    });
    expect(eligibility.reasons[1]).toEqual({ key: null, label: 'Something new', meta: {} });
  });

  it('maps the public requirements only', () => {
    const c = mapCreatorCampaignDetail(dto());
    expect(c.teaserRequirements).toBe('Be funny');
    expect(c.requirements.genders).toEqual(['male']);
    expect(c).not.toHaveProperty('privateBrief');
    expect(c.invited).toBe(true);
  });
});

describe('mapApplicantCard', () => {
  const card = (overrides: Partial<ApplicantCardDto> = {}): ApplicantCardDto => ({
    id: 'a1',
    status: label('shortlisted'),
    invited: false,
    pitch: null,
    price: { is_bid: true, gross_usd: '90.00', net_to_creator_usd: '81.00' },
    accounts: [
      {
        platform: label('instagram'),
        username: 'sara',
        follower_count: 12000,
        follower_tier: null,
        verification_status: 'approved',
        available: true,
      },
    ],
    creator: {
      slug: 'sara',
      display_name: 'Sara',
      avatar_url: null,
      governorate: { value: 'damascus', label: 'Damascus' },
      niches: [{ value: 'food', label: 'Food' }],
      tier: 'mid',
      tier_label: 'Mid',
    },
    track_record: { completed_deals: 4, rating: { average: 4.6, count: 3 } },
    terms_hash: 'abc',
    applied_at: T0,
    expires_at: '2026-10-20T09:00:00+03:00',
    decided_at: null,
    deal: null,
    actions: { can_shortlist: false, can_reject: true, can_select: true },
    ...overrides,
  });

  it('shows the bid and the net the creator keeps', () => {
    const a = mapApplicantCard(card());
    expect(a.price).toEqual({ isBid: true, gross: usd(9000), netToCreator: usd(8100) });
    expect(a.expiresAt).toBe(T0_MS + 72 * HOUR);
    expect(a.actions).toEqual({ canShortlist: false, canReject: true, canSelect: true });
    expect(a.creator.governorate).toEqual({ value: 'damascus', label: 'Damascus' });
    expect(a.trackRecord.rating).toEqual({ average: 4.6, count: 3 });
  });

  it('links a selected applicant to the deal and narrows its status', () => {
    const a = mapApplicantCard(card({ status: label('selected'), deal: { id: 'd1', status: label('awaiting_payment') } }));
    expect(a.deal).toEqual({ id: 'd1', status: { key: 'awaiting_payment', label: 'L:awaiting_payment' } });
    expect(mapApplicantCard(card({ status: label('weird') })).status.key).toBeNull();
  });
});

describe('mapApplicantsPage', () => {
  const page = (meta: Partial<ApplicantsPageDto['meta']> = {}): ApplicantsPageDto => ({
    items: [],
    meta: { current_page: 1, last_page: 1, total: 0, ...meta },
  });

  it('reads the tab badges and the recruiting summary from meta', () => {
    const p = mapApplicantsPage(
      page({
        counts: { submitted: 2, shortlisted: 1, selected: 3 },
        recruiting: {
          status: 'open',
          seats_total: 5,
          seats_occupied: 3,
          seats_left: 2,
          wallet: { balance_usd: '1.00', required_usd: '2.00', shortfall_usd: '1.00', covers_open_seats: false },
          budget_secured: false,
          prompt_close: false,
        },
      }),
    );
    expect(p.counts).toEqual({
      submitted: 2,
      shortlisted: 1,
      selected: 3,
      expired: 0,
      rejected: 0,
      not_selected: 0,
      cancelled: 0,
    });
    expect(p.recruiting?.seatsLeft).toBe(2);
  });

  it('zero-fills the counts and tolerates a missing recruiting block', () => {
    const p = mapApplicantsPage(page());
    expect(Object.values(p.counts).every(count => count === 0)).toBe(true);
    expect(p.recruiting).toBeNull();
  });
});

describe('mapCreatorApplication', () => {
  const app = (overrides: Partial<CreatorApplicationDto> = {}): CreatorApplicationDto => ({
    id: 'p1',
    status: label('submitted'),
    state: { key: 'submitted', label: 'Submitted', source: 'application' },
    can_withdraw: true,
    pitch: 'Pick me',
    price: { is_bid: false, gross_usd: '100.00', fee_usd: '10.00', net_usd: '90.00' },
    accounts: [{ platform: label('instagram'), username: 'sara' }],
    terms_hash: 'abc',
    signed_at: T0,
    expires_at: '2026-10-20T09:00:00+03:00',
    decided_at: null,
    campaign: {
      id: 'c1',
      title: 'Ramadan launch',
      status: label('open'),
      pricing_model: 'fixed',
      cover: null,
      brand: { name: 'Cafe', avatar_url: null },
      apply_deadline_at: T0,
      drop_at: null,
    },
    deal: null,
    created_at: T0,
    ...overrides,
  });

  it('maps the creator net, the 72h expiry and the campaign summary', () => {
    const a = mapCreatorApplication(app());
    expect(a.price.net).toEqual(usd(9000));
    expect(a.expiresAt).toBe(T0_MS + 72 * HOUR);
    expect(a.state.source).toBe('application');
    expect(a.campaign.pricingModel).toBe('fixed');
    expect(a.campaign.status.key).toBe('open');
    expect(a.canWithdraw).toBe(true);
  });

  it('shows the linked deal stage once selected', () => {
    const a = mapCreatorApplication(
      app({
        status: label('selected'),
        state: { key: 'awaiting_payment', label: 'Waiting for funding', source: 'deal' },
        can_withdraw: false,
        deal: { id: 'd1', status: label('awaiting_payment') },
      }),
    );
    expect(a.state).toEqual({ key: 'awaiting_payment', label: 'Waiting for funding', source: 'deal' });
    expect(a.deal?.id).toBe('d1');
  });

  it('tolerates an unknown state source and application status', () => {
    const a = mapCreatorApplication(
      app({ status: label('parked'), state: { key: 'x', label: 'X', source: 'moon' } }),
    );
    expect(a.status.key).toBeNull();
    expect(a.state.source).toBeNull();
  });
});
