import type { ParseKeys } from 'i18next';
import type { PaymentChannel, PaymentChannelGroup } from '../types';

/** Most methods a creator can save (handoff §7, `422 payout_method_limit`). */
export const PAYOUT_METHODS_MAX = 10;

/** The server sends no limits yet: agreed fallbacks (2026-10-09), mirrored by the form. */
export const PAYOUT_FIELD_LIMITS = {
  holderName: { min: 3, max: 100 },
  bankName: { min: 2, max: 100 },
  accountNumber: { min: 6, max: 30 },
  iban: { min: 15, max: 34 },
  accountCode: { min: 4, max: 64 },
  city: { max: 100 },
  label: { max: 40 },
} as const;

export type PayoutField =
  | 'holderName'
  | 'phone'
  | 'governorate'
  | 'city'
  | 'bankName'
  | 'accountNumber'
  | 'iban'
  | 'accountCode';

interface PayoutGroupDef {
  /** In form order; `city` and `iban` are optional, the rest required. */
  fields: readonly PayoutField[];
  sectionKey: ParseKeys;
  /** Under the channel name in the picker: how the money arrives. */
  captionKey: ParseKeys;
  holderHintKey: ParseKeys;
}

/** Which details each kind of channel needs (handoff §7). */
export const PAYOUT_GROUP_DEF = {
  exchange_office: {
    fields: ['holderName', 'phone', 'governorate', 'city'],
    sectionKey: 'finance.payouts.form.recipientSection',
    captionKey: 'finance.payouts.channelSheet.captions.exchangeOffice',
    holderHintKey: 'finance.payouts.form.holderHint.exchangeOffice',
  },
  e_wallet: {
    fields: ['holderName', 'phone'],
    sectionKey: 'finance.payouts.form.recipientSection',
    captionKey: 'finance.payouts.channelSheet.captions.eWallet',
    holderHintKey: 'finance.payouts.form.holderHint.eWallet',
  },
  bank: {
    fields: ['holderName', 'bankName', 'accountNumber', 'iban'],
    sectionKey: 'finance.payouts.form.accountSection',
    captionKey: 'finance.payouts.channelSheet.captions.bank',
    holderHintKey: 'finance.payouts.form.holderHint.bank',
  },
} as const satisfies Record<PaymentChannelGroup, PayoutGroupDef>;

/** Fields one channel needs on top of its group's, after them (handoff §7). */
export const PAYOUT_CHANNEL_EXTRA_FIELDS: Partial<Record<PaymentChannel, readonly PayoutField[]>> = {
  sham_cash: ['accountCode'],
};

/** 422 `errors` keys → form fields. */
export const PAYOUT_SERVER_FIELDS = {
  label: 'label',
  'details.holder_name': 'holderName',
  'details.phone': 'phone',
  'details.governorate': 'governorate',
  'details.city': 'city',
  'details.bank_name': 'bankName',
  'details.account_number': 'accountNumber',
  'details.iban': 'iban',
  'details.account_code': 'accountCode',
} as const;
