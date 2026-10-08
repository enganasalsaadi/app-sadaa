import type { CatalogService } from '@/core/api';
import { DEFAULT_CURRENCY } from '@/core/config';
import type { Money } from '@/core/money';
import type { PickedFile } from '@/shared/ui';

/** Dev-only placeholder photos (network required); real screens use sized thumbnails from the API. */
export const MOCK_IMAGE_URIS = [
  'https://picsum.photos/seed/sada-1/800/600',
  'https://picsum.photos/seed/sada-2/800/600',
  'https://picsum.photos/seed/sada-3/800/600',
  'https://picsum.photos/seed/sada-4/800/600',
];

export const MOCK_AVATAR_URI = 'https://i.pravatar.cc/200?img=12';

/** Dev-only applicant stack; `u-4` has no photo to show the fallback. */
export const MOCK_AVATAR_GROUP = [
  { id: 'u-1', uri: 'https://i.pravatar.cc/120?img=5' },
  { id: 'u-2', uri: 'https://i.pravatar.cc/120?img=8' },
  { id: 'u-3', uri: 'https://i.pravatar.cc/120?img=15' },
  { id: 'u-4' },
  { id: 'u-5', uri: 'https://i.pravatar.cc/120?img=32' },
  { id: 'u-6', uri: 'https://i.pravatar.cc/120?img=47' },
  { id: 'u-7', uri: 'https://i.pravatar.cc/120?img=52' },
];

/** Dev-only deal summary in minor units (rule 06), not real `Deal` data. */
export const MOCK_DEAL_SUMMARY = {
  budget: { amount: 50000, currency: DEFAULT_CURRENCY },
  commission: { amount: 5000, currency: DEFAULT_CURRENCY },
  upfront: { amount: 15000, currency: DEFAULT_CURRENCY },
  payout: { amount: 45000, currency: DEFAULT_CURRENCY },
} as const satisfies Record<string, Money>;

export const MOCK_PICKED_FILE: PickedFile = {
  uri: 'file:///mock/commercial-register.pdf',
  name: 'commercial-register.pdf',
  type: 'application/pdf',
  sizeLabel: '2.4 MB',
};

/** Dev-only filler so layout screens have something to scroll. */
export const MOCK_SCROLL_ROWS = Array.from({ length: 16 }, (_, index) => index + 1);

const usd = (amount: number): Money => ({ amount, currency: DEFAULT_CURRENCY });

/** Dev-only ledger lines: a creator earning and a platform charge. */
export const MOCK_LEDGER = {
  earning: usd(45000),
  charge: usd(-5000),
} as const satisfies Record<string, Money>;

/** Dev-only wallet figures (minor units). */
export const MOCK_WALLET = {
  available: usd(125050),
  escrow: usd(30000),
  pending: usd(5000),
} as const satisfies Record<string, Money>;

/** Fixed dev-only dates (epoch ms) so timelines render the same on every run. */
export const MOCK_DEAL_DATES = {
  pending_approval: Date.UTC(2026, 8, 12),
  awaiting_payment: Date.UTC(2026, 8, 13),
  in_progress: Date.UTC(2026, 8, 14),
  under_review: Date.UTC(2026, 8, 20),
} as const;

export const MOCK_DRAFT_SUBMITTED_AT = Date.UTC(2026, 8, 20, 14, 20);

/** Dev-only creator metrics, pre-format. */
export const MOCK_STATS = {
  views: 12400,
  viewsChange: 0.08,
  engagement: 0.041,
  engagementChange: -0.012,
  followers: 120500,
  earnings: usd(185000),
  earningsChange: 0.15,
} as const;

/** Dev-only daily profile views (30 points), for the sparkline demo. */
export const MOCK_DAILY_VIEWS: readonly number[] = [
  12, 18, 9, 22, 31, 27, 19, 24, 40, 36, 28, 33, 45, 38, 30, 41, 52, 47, 39, 44, 58, 50, 43, 49,
  62, 55, 48, 57, 61, 66,
];

/** Dev-only daily earnings in whole dollars (14 points). */
export const MOCK_DAILY_EARNINGS: readonly number[] = [
  0, 0, 120, 0, 80, 0, 0, 250, 0, 90, 0, 0, 300, 150,
];

export const MOCK_CREATOR_PRICE = usd(8000);

export const MOCK_MEDIA_KIT_LINK = 'https://sada.app/c/anas';

const mockCriteria = (retention: boolean): CatalogService['criteria'] => ({
  delivery_days: { label: 'Delivery time', min: 1, max: 14, default: 5 },
  revisions: {
    label: 'Revision rounds',
    options: [
      { value: 0, label: 'No revisions' },
      { value: 1, label: '1 round' },
      { value: 2, label: '2 rounds' },
    ],
    default: 1,
  },
  retention: retention
    ? { label: 'Stays live for', options: [{ value: '24h', label: '24 hours' }], default: '24h', minimum: '24h' }
    : null,
});

/** Dev-only catalog services (server-localized labels in real data), not a real catalog. */
export const MOCK_RATE_SERVICES: Record<'reel' | 'story' | 'onSiteVisit', CatalogService> = {
  reel: {
    key: 'reel',
    label: 'Reel',
    package: {
      key: 'duration_sec',
      label: 'Length',
      type: 'options',
      options: [
        { value: 15, label: 'Up to 15 seconds' },
        { value: 30, label: 'Up to 30 seconds' },
        { value: 60, label: 'Up to 60 seconds' },
      ],
      default: 30,
      visible: true,
    },
    criteria: mockCriteria(true),
    attributes: [],
    addons: ['rush_delivery'],
  },
  story: {
    key: 'story',
    label: 'Story',
    package: null,
    criteria: mockCriteria(true),
    attributes: [],
    addons: [],
  },
  onSiteVisit: {
    key: 'on_site_visit',
    label: 'On-site visit',
    package: {
      key: 'hours',
      label: 'Visit length',
      type: 'options',
      options: [
        { value: 2, label: '2 hours' },
        { value: 4, label: '4 hours' },
      ],
      default: 2,
      visible: true,
    },
    criteria: mockCriteria(false),
    attributes: [],
    addons: [],
  },
};
