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

export const MOCK_CREATOR_PRICE = usd(8000);
