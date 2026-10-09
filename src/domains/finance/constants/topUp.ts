import {
  CircleCheck,
  CircleX,
  Clock,
  Undo2,
  type LucideIcon,
} from 'lucide-react-native';
import type { ParseKeys } from 'i18next';
import type { CurrencyCode } from '@/core/money';
import type { TopUpStackParamList } from '@/core/navigation';
import type { HueTone } from '@/core/theme';
import type {
  PaymentChannelGroup,
  TopUpAccount,
  TopUpDisabledReason,
  TopUpStatus,
} from '../types';

/** USD-equivalent range of one top-up in cents (handoff §6), until the server sends limits. */
export const TOP_UP_USD_LIMITS = { min: 1_000, max: 1_000_000 } as const;

/** Receipt upload rules (handoff §6): image or PDF, 10 MB. `image/jpg` = some Android galleries. */
export const TOP_UP_RECEIPT_MIME_TYPES: readonly string[] = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];
export const TOP_UP_RECEIPT_MAX_BYTES = 10 * 1024 * 1024;
export const TOP_UP_REFERENCE_MAX_LENGTH = 100;

/** History page size (same as the statement). */
export const TOP_UPS_PER_PAGE = 20;

export const TOP_UP_DISABLED_LABEL = {
  channel_paused: 'finance.topUp.disabled.channelPaused',
  fx_rate_stale: 'finance.topUp.disabled.rateStale',
  fx_rate_unavailable: 'finance.topUp.disabled.rateUnavailable',
} as const satisfies Record<TopUpDisabledReason, ParseKeys>;

/** "Dollar" / "Syrian pound" for the currency switch and channel captions. */
export const TOP_UP_CURRENCY_LABEL = {
  USD: 'finance.topUp.currency.usd',
  SYP: 'finance.topUp.currency.syp',
} as const satisfies Record<CurrencyCode, ParseKeys>;

export type TopUpStepKey = 'channel' | 'amount' | 'transfer' | 'review';

interface TopUpStepDef {
  route: keyof TopUpStackParamList;
  index: number;
  titleKey: ParseKeys;
}

/** Wizard order and titles (rule 09 §6: one typed config, no scattered literals). */
export const TOP_UP_STEPS = {
  channel: { route: 'TopUpChannel', index: 1, titleKey: 'finance.topUp.steps.channel' },
  amount: { route: 'TopUpAmount', index: 2, titleKey: 'finance.topUp.steps.amount' },
  transfer: { route: 'TopUpTransfer', index: 3, titleKey: 'finance.topUp.steps.transfer' },
  review: { route: 'TopUpReview', index: 4, titleKey: 'finance.topUp.steps.review' },
} as const satisfies Record<TopUpStepKey, TopUpStepDef>;

export const TOP_UP_STEP_COUNT = 4;

interface TopUpStatusLook {
  tone: HueTone;
  icon: LucideIcon;
  /** Filter chip / fallback label. */
  labelKey: ParseKeys;
}

/**
 * Pill and badge per status (rule 08 status colors; status never by color alone).
 * The credited amount is mint only once `completed`: before that nothing has moved.
 */
export const TOP_UP_STATUS_LOOK = {
  pending_review: { tone: 'warning', icon: Clock, labelKey: 'finance.topUp.status.pendingReview' },
  completed: { tone: 'success', icon: CircleCheck, labelKey: 'finance.topUp.status.completed' },
  rejected: { tone: 'danger', icon: CircleX, labelKey: 'finance.topUp.status.rejected' },
  // Money was taken back out of the wallet (top-ups v2 §5.3).
  reversed: { tone: 'danger', icon: Undo2, labelKey: 'finance.topUp.status.reversed' },
} as const satisfies Record<TopUpStatus, TopUpStatusLook>;

/**
 * DEV ONLY (`ENABLE_MOCK_DATA`): sample receiving accounts while the server has no
 * channels endpoint. Never shipped as real details: without the flag the brand is sent
 * to support instead, so no one can transfer money to an invented account.
 */
export const TOP_UP_MOCK_ACCOUNTS = {
  exchange_office: [
    {
      id: 'mock-office',
      fields: [
        { key: 'recipient_name', label: 'finance.topUp.mock.recipientName', value: 'Sada Marketing (DEV)', copyable: true },
        { key: 'phone', label: 'finance.topUp.mock.phone', value: '+963 900 000 000', copyable: true },
        { key: 'city', label: 'finance.topUp.mock.city', value: 'Damascus (DEV)', copyable: false },
      ],
    },
  ],
  e_wallet: [
    {
      id: 'mock-wallet',
      fields: [
        { key: 'wallet_number', label: 'finance.topUp.mock.walletNumber', value: '0900 000 000', copyable: true },
        { key: 'account_name', label: 'finance.topUp.mock.accountName', value: 'Sada Marketing (DEV)', copyable: true },
      ],
    },
  ],
  bank: [
    {
      id: 'mock-bank',
      fields: [
        { key: 'bank_name', label: 'finance.topUp.mock.bankName', value: 'DEV Bank', copyable: false },
        { key: 'account_holder', label: 'finance.topUp.mock.accountHolder', value: 'Sada Marketing (DEV)', copyable: true },
        { key: 'iban', label: 'finance.topUp.mock.iban', value: 'SY00 0000 0000 0000 0000 0000', copyable: true },
      ],
    },
  ],
} as const satisfies Record<
  PaymentChannelGroup,
  readonly (Omit<TopUpAccount, 'fields'> & {
    fields: readonly { key: string; label: ParseKeys; value: string; copyable: boolean }[];
  })[]
>;
