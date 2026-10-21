import type { CountryCode } from 'libphonenumber-js';
import type { CurrencyCode } from '@/core/money';

/** `GET /config` → `markets[]`: only `active` and `coming_soon` ever reach the app. */
export type MarketStatus = 'active' | 'coming_soon';

export interface MarketSummary {
  /** Lower-case slug used in URLs (`sy`). */
  code: string;
  countryCode: CountryCode;
  name: string;
  status: MarketStatus;
  /** With the plus sign: `+963`. */
  callingCode: string;
  mobileExample: string;
  defaultCurrency: string;
  timezone: string;
}

/** `null` = no limit on that side. Minor units of the currency. */
export interface MarketAmountLimit {
  min: number | null;
  max: number | null;
}

export interface MarketCurrency {
  code: CurrencyCode;
  minorUnitDigits: number;
  name: string;
  topUp: MarketAmountLimit;
  withdraw: MarketAmountLimit;
}

export interface MarketGovernorate {
  id: string;
  name: string;
}

export type MarketChannelGroup = 'exchange_office' | 'e_wallet' | 'bank';
export type MarketChannelIcon = 'store' | 'smartphone' | 'landmark';

export interface MarketPaymentChannel {
  code: string;
  group: MarketChannelGroup;
  icon: MarketChannelIcon;
  name: string;
  currencies: CurrencyCode[];
  supportsTopUp: boolean;
  supportsPayout: boolean;
  payoutPhoneRequired: boolean;
  instructions: string | null;
}

export interface MarketCourier {
  code: string;
  name: string;
}

export interface MarketSupport {
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
}

/** `GET /markets/{code}`: everything a market-specific form or limit reads. */
export interface MarketRules extends MarketSummary {
  /** PCRE over the E.164 number: a client-side hint only, the server is the authority. */
  mobilePattern: string;
  currencies: MarketCurrency[];
  governorates: MarketGovernorate[];
  paymentChannels: MarketPaymentChannel[];
  couriers: MarketCourier[];
  support: MarketSupport;
}
