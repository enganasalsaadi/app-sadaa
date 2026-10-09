import type { ParseKeys } from 'i18next';
import type { LiveIslandTone } from '@/shared/ui';
import type { WalletRole } from '../types';

/** Why the role's money action is off, highest priority first in `resolveWalletBlocker`. */
export const WALLET_BLOCKERS = [
  'closed',
  'frozen',
  'unknownStatus',
  'withdrawalsPaused',
  'kycRequired',
  'kycPending',
  'kycRejected',
  'onboardingIncomplete',
] as const;
export type WalletBlocker = (typeof WALLET_BLOCKERS)[number];

/** `support`: WhatsApp support · `kyc`: the ID screen · `null`: nothing to do but wait. */
export type WalletBlockerAction = 'support' | 'kyc';

interface WalletBlockerDef {
  tone: LiveIslandTone;
  /** `null` = the server's wallet `status_label` is the title. */
  titleKey: Record<WalletRole, ParseKeys> | null;
  messageKey: Record<WalletRole, ParseKeys>;
  action: WalletBlockerAction | null;
}

const same = (key: ParseKeys): Record<WalletRole, ParseKeys> => ({ creator: key, brand: key });

/** The hero's live island per blocker (rule 09 §3.1: the one blocker in a navy hero). */
export const WALLET_BLOCKER_DEF = {
  closed: {
    tone: 'danger',
    titleKey: same('finance.wallet.blocker.closed.title'),
    messageKey: same('finance.wallet.blocker.closed.message'),
    action: 'support',
  },
  frozen: {
    tone: 'warning',
    titleKey: same('finance.wallet.blocker.frozen.title'),
    messageKey: {
      creator: 'finance.wallet.blocker.frozen.messageCreator',
      brand: 'finance.wallet.blocker.frozen.messageBrand',
    },
    action: 'support',
  },
  unknownStatus: {
    tone: 'warning',
    titleKey: null,
    messageKey: same('finance.wallet.blocker.unknownStatus.message'),
    action: 'support',
  },
  withdrawalsPaused: {
    tone: 'warning',
    titleKey: same('finance.wallet.blocker.withdrawalsPaused.title'),
    messageKey: same('finance.wallet.blocker.withdrawalsPaused.message'),
    action: null,
  },
  kycRequired: {
    tone: 'live',
    titleKey: {
      creator: 'finance.wallet.blocker.kycRequired.titleCreator',
      brand: 'finance.wallet.blocker.kycRequired.titleBrand',
    },
    messageKey: same('finance.wallet.blocker.kycRequired.message'),
    action: 'kyc',
  },
  kycPending: {
    tone: 'live',
    titleKey: same('finance.wallet.blocker.kycPending.title'),
    messageKey: {
      creator: 'finance.wallet.blocker.kycPending.messageCreator',
      brand: 'finance.wallet.blocker.kycPending.messageBrand',
    },
    action: null,
  },
  kycRejected: {
    tone: 'danger',
    titleKey: same('finance.wallet.blocker.kycRejected.title'),
    messageKey: {
      creator: 'finance.wallet.blocker.kycRejected.messageCreator',
      brand: 'finance.wallet.blocker.kycRejected.messageBrand',
    },
    action: 'kyc',
  },
  onboardingIncomplete: {
    tone: 'warning',
    titleKey: same('finance.wallet.blocker.onboardingIncomplete.title'),
    messageKey: {
      creator: 'finance.wallet.blocker.onboardingIncomplete.messageCreator',
      brand: 'finance.wallet.blocker.onboardingIncomplete.messageBrand',
    },
    action: null,
  },
} as const satisfies Record<WalletBlocker, WalletBlockerDef>;
