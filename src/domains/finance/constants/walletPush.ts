import type { PushType } from '@/core/notification';

type WalletCacheTag =
  | 'Wallet'
  | 'WalletTransaction'
  | 'TopUp'
  | 'Withdrawal'
  | 'WalletEscrow'
  | 'WalletEarnings';

/** The tab's escrow card and chart move with any wallet event, and the server sends no push of their own. */
const WALLET_TAB = ['Wallet', 'WalletEscrow', 'WalletEarnings'] as const;
const TOP_UP_DONE = [...WALLET_TAB, 'WalletTransaction', 'TopUp'] as const;
const WITHDRAWAL_DONE = [...WALLET_TAB, 'WalletTransaction', 'Withdrawal'] as const;

/**
 * What each wallet push changed (handoff §9): the balance plus the list it belongs to,
 * so only those caches refetch. Freezes also change capabilities, which `/me` refetch covers.
 */
const WALLET_PUSH_TAGS = {
  wallet_top_up_completed: TOP_UP_DONE,
  wallet_top_up_rejected: [...WALLET_TAB, 'TopUp'],
  // The credit is taken back through its own ledger line (top-ups v2 §5.3).
  wallet_top_up_reversed: TOP_UP_DONE,
  wallet_withdrawal_completed: WITHDRAWAL_DONE,
  wallet_withdrawal_rejected: WITHDRAWAL_DONE,
  wallet_withdrawal_returned: WITHDRAWAL_DONE,
  wallet_wallet_frozen: WALLET_TAB,
  wallet_wallet_unfrozen: WALLET_TAB,
} as const satisfies Partial<Record<PushType, readonly WalletCacheTag[]>>;

const isWalletPush = (type: PushType): type is keyof typeof WALLET_PUSH_TAGS =>
  type in WALLET_PUSH_TAGS;

export const walletPushTags = (type: PushType | null): readonly WalletCacheTag[] =>
  type !== null && isWalletPush(type) ? WALLET_PUSH_TAGS[type] : [];
