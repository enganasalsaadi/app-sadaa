import type { CurrencyCode } from '@/core/money';
import type { PaymentChannel } from './paymentChannel';

/** `details` as the server stores it; which keys exist depends on the channel (handoff §7). */
export interface PayoutDetailsDto {
  holder_name?: string | null;
  phone?: string | null;
  governorate?: string | null;
  city?: string | null;
  bank_name?: string | null;
  account_number?: string | null;
  iban?: string | null;
}

export interface PayoutMethodDto {
  id: string;
  channel: string;
  channel_label?: string | null;
  label?: string | null;
  is_default?: boolean | null;
  details?: PayoutDetailsDto | null;
  currencies?: string[] | null;
}

export interface DeletePayoutMethodDto {
  default_payout_method_id: string | null;
}

/** Only the keys the channel uses are set; phone is E.164, governorate a lookup value. */
export interface PayoutDetails {
  holder_name: string;
  phone?: string;
  governorate?: string;
  city?: string;
  bank_name?: string;
  account_number?: string;
  iban?: string;
}

/** A creator's saved destination for withdrawals; exactly one is primary once any exist. */
export interface PayoutMethod {
  id: string;
  channel: PaymentChannel;
  /** Server name of the channel; the app's own label is the fallback. */
  channel_label: string | null;
  /** The creator's own short name ("Home"). */
  label: string | null;
  is_default: boolean;
  details: PayoutDetails;
  currencies: CurrencyCode[];
}

export interface CreatePayoutMethodInput {
  channel: PaymentChannel;
  label?: string;
  details: PayoutDetails;
}

/** `label: null` clears it; `details` always goes whole (handoff §7). */
export interface PayoutMethodPatch {
  label?: string | null;
  details?: PayoutDetails;
}

export interface UpdatePayoutMethodArgs {
  id: string;
  patch: PayoutMethodPatch;
}
