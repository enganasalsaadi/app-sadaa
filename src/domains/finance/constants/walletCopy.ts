import type { ParseKeys } from 'i18next';
import type { WalletRole } from '../types';

/** Where a hero tile's figure comes from: `/wallet` itself or its v4 `summary`. */
export type WalletTileSource = 'pending' | 'summaryEscrow' | 'pendingTopUps';
/** Clock = waiting on a transfer or review · lock = held in escrow. */
export type WalletTileKind = 'waiting' | 'escrow';
/** Screen a tile opens on tap (only where that screen exists). */
export type WalletTileTarget = 'topUpsInReview' | 'withdrawalsPending';

export interface WalletTileDef {
  key: string;
  labelKey: ParseKeys;
  kind: WalletTileKind;
  source: WalletTileSource;
  opens?: WalletTileTarget;
}

interface WalletRoleCopy {
  availableLabel: ParseKeys;
  monthIn: ParseKeys;
  tiles: readonly [WalletTileDef, WalletTileDef];
  escrowTitle: ParseKeys;
  explainerTitle: ParseKeys;
  explainerBody: ParseKeys;
  releaseMany: ParseKeys;
  counterpartyNode: ParseKeys;
  earningsTitle: ParseKeys;
  earningsA11y: ParseKeys;
  emptyMessage: ParseKeys;
  staleRate: ParseKeys;
}

/**
 * Same layout, the role's own words (memory: brand and creator screens are separate
 * variants). Creator `pending` = withdrawals on their way out; brand `pending` = escrow.
 */
export const WALLET_ROLE_COPY = {
  creator: {
    availableLabel: 'finance.wallet.hero.availableCreator',
    monthIn: 'finance.wallet.hero.monthInCreator',
    tiles: [
      {
        key: 'inTransfer',
        labelKey: 'finance.wallet.tiles.inTransfer',
        kind: 'waiting',
        source: 'pending',
        opens: 'withdrawalsPending',
      },
      { key: 'inEscrow', labelKey: 'finance.wallet.tiles.inEscrow', kind: 'escrow', source: 'summaryEscrow' },
    ],
    escrowTitle: 'finance.wallet.escrowCard.titleCreator',
    explainerTitle: 'finance.wallet.escrowCard.explainerTitleCreator',
    explainerBody: 'finance.wallet.escrowCard.explainerBodyCreator',
    releaseMany: 'finance.wallet.escrowCard.releaseManyCreator',
    counterpartyNode: 'finance.wallet.escrowCard.brandNode',
    earningsTitle: 'finance.wallet.earnings.titleCreator',
    earningsA11y: 'finance.wallet.earnings.a11yCreator',
    emptyMessage: 'finance.wallet.activity.emptyCreator',
    staleRate: 'finance.wallet.rate.staleCreator',
  },
  brand: {
    availableLabel: 'finance.wallet.hero.availableBrand',
    monthIn: 'finance.wallet.hero.monthInBrand',
    tiles: [
      { key: 'inEscrow', labelKey: 'finance.wallet.tiles.inEscrow', kind: 'escrow', source: 'pending' },
      {
        key: 'topUpsInReview',
        labelKey: 'finance.wallet.tiles.topUpsInReview',
        kind: 'waiting',
        source: 'pendingTopUps',
        opens: 'topUpsInReview',
      },
    ],
    escrowTitle: 'finance.wallet.escrowCard.titleBrand',
    explainerTitle: 'finance.wallet.escrowCard.explainerTitleBrand',
    explainerBody: 'finance.wallet.escrowCard.explainerBodyBrand',
    releaseMany: 'finance.wallet.escrowCard.releaseManyBrand',
    counterpartyNode: 'finance.wallet.escrowCard.creatorNode',
    earningsTitle: 'finance.wallet.earnings.titleBrand',
    earningsA11y: 'finance.wallet.earnings.a11yBrand',
    emptyMessage: 'finance.wallet.activity.emptyBrand',
    staleRate: 'finance.wallet.rate.staleBrand',
  },
} as const satisfies Record<WalletRole, WalletRoleCopy>;
