import type {
  CampaignDetailDto,
  CampaignFileDto,
  CampaignHistoryRowDto,
  CreatorApplicationDto,
  CreatorCampaignDetailDto,
} from '../../types/campaignDto';

export const T0 = '2026-10-17T09:00:00+03:00';

// The wire key is `left`; the RTL lint bans it as a plain object key, so build it computed.
export const seatsDto = (total: number, free: number) => ({ total, ['left']: free });
export const label = (key: string) => ({ key, label: `L:${key}` });

export const fileDto = (overrides: Partial<CampaignFileDto> = {}): CampaignFileDto => ({
  id: 'f1',
  purpose: 'cover',
  kind: 'image',
  name: 'cover.jpg',
  mime: 'image/jpeg',
  size: 1024,
  sha256: null,
  status: 'ready',
  url: 'https://cdn/x',
  ...overrides,
});

export const detailDto = (overrides: Partial<CampaignDetailDto> = {}): CampaignDetailDto => ({
  id: 'c1',
  status: label('open'),
  title: 'Ramadan launch',
  activity_type: label('restaurant_cafe'),
  teaser: { requirements: 'Post a reel' },
  cover: fileDto(),
  pricing: {
    model: label('fixed'),
    seat_price_usd: '100.00',
    bid_min_usd: null,
    bid_max_usd: null,
    budget_usd: '800.00',
  },
  seats_total: 5,
  shipping_mode: label('gift'),
  delivery_days: null,
  drop_at: '2026-11-01T20:00:00+03:00',
  drop: {
    draft_due_at: '2026-10-29T20:00:00+03:00',
    publish_opens_at: '2026-11-01T19:45:00+03:00',
    min_gap_hours: 240,
    latest_apply_deadline_at: '2026-10-22T20:00:00+03:00',
  },
  apply_deadline_at: T0,
  deliverables: [
    {
      id: 'd1',
      platform: label('instagram'),
      service: label('reel'),
      count: 2,
      revisions: 1,
      addons: ['link_in_bio'],
    },
  ],
  targeting: { genders: ['female', 'other'], min_followers: 5000, cities: ['damascus'], niches: ['food'] },
  budget_secured: true,
  counters: { applications_open: 3, seats_occupied: 1 },
  seat_freed: { free_seats: 1, reducible: 1, options: ['replace', 'reduce', 'bogus'], deadline_passed: false },
  review_note: null,
  duplicated_from_id: null,
  missing: [],
  published_at: T0,
  created_at: T0,
  updated_at: T0,
  timers: {
    accepting_applications: true,
    deadline_passed: false,
    ghost: { warns_at: T0, suspends_at: '2026-10-17T12:00:00+03:00' },
    suspension: { ends_at: null, reopen_needs_deadline: true },
    zero_applicants: {
      decide_by: T0,
      extend_available: true,
      extend_to: '2026-10-21T09:00:00+03:00',
      options: ['edit', 'extend', 'cancel'],
    },
  },
  private_brief: {
    hashtags: ['#a'],
    mentions: ['@b'],
    talking_points: ['hi'],
    donts: [],
    links: ['https://x.com'],
    promo_code: 'SADA10',
    tracking_link: null,
  },
  attachments: [fileDto({ id: 'f2', purpose: 'brief' })],
  ...overrides,
});

const breakdown = (gross: string, fee: string, net: string) => ({ gross_usd: gross, fee_usd: fee, net_usd: net });

export const creatorCampaignDto = (
  overrides: Partial<CreatorCampaignDetailDto> = {},
): CreatorCampaignDetailDto => ({
  id: 'c1',
  status: label('open'),
  accepting_applications: true,
  title: 'Ramadan launch',
  activity_type: null,
  brand: { name: 'Cafe', avatar_url: null, verified: true },
  cover: null,
  pricing: { model: label('fixed'), fee_bps: 1000, fixed: breakdown('100.00', '10.00', '90.00'), bid: null },
  seats: seatsDto(5, 3),
  apply_deadline_at: T0,
  drop_at: null,
  delivery_days: 7,
  shipping_mode: label('none'),
  deliverables: [{ platform: label('tiktok'), service: label('video'), count: 1, revisions: 0, addons: [] }],
  bookmarked: false,
  invited: false,
  budget_secured: true,
  eligibility: { eligible: true, reasons: [] },
  published_at: T0,
  teaser: null,
  requirements: { genders: [], min_followers: null, cities: [], niches: [] },
  ...overrides,
});

export const applicationDto = (overrides: Partial<CreatorApplicationDto> = {}): CreatorApplicationDto => ({
  id: 'p1',
  status: label('submitted'),
  state: { key: 'submitted', label: 'Submitted', source: 'application' },
  can_withdraw: true,
  pitch: null,
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

export const historyRowDto = (overrides: Partial<CampaignHistoryRowDto> = {}): CampaignHistoryRowDto => ({
  id: 'h1',
  subject: { type: 'campaign', id: 'c1' },
  from: label('pending_review'),
  to: label('open'),
  actor: label('admin'),
  reason: null,
  metadata: null,
  due_at: null,
  occurred_at: T0,
  ...overrides,
});
