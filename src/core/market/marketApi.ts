import { isCurrencyCode } from '@/core/money';
import type { CurrencyCode } from '@/core/money';
import { baseApi } from '@/core/api/baseApi';
import type {
  MarketAmountLimit,
  MarketChannelGroup,
  MarketChannelIcon,
  MarketRules,
  MarketStatus,
} from './marketTypes';
import type { CountryCode } from 'libphonenumber-js';

interface AmountLimitDto {
  min: number | null;
  max: number | null;
}

interface MarketRulesDto {
  code: string;
  country_code: CountryCode;
  name: string;
  status: MarketStatus;
  calling_code: string;
  mobile_pattern: string;
  mobile_example: string;
  timezone: string;
  default_currency: string;
  currencies: {
    code: string;
    minor_unit_digits: number;
    name: string;
    top_up: AmountLimitDto;
    withdraw: AmountLimitDto;
  }[];
  governorates: { id: string; name: string }[];
  payment_channels: {
    code: string;
    group: MarketChannelGroup;
    icon: MarketChannelIcon;
    name: string;
    currencies: string[];
    supports_top_up: boolean;
    supports_payout: boolean;
    payout_phone_required: boolean;
    instructions: string | null;
  }[];
  couriers: { code: string; name: string }[];
  support: { email: string | null; phone: string | null; whatsapp: string | null };
}

const toLimit = (dto: AmountLimitDto | undefined): MarketAmountLimit => ({
  min: dto?.min ?? null,
  max: dto?.max ?? null,
});

/** A currency this build has no labels or rules for is dropped, never crashed on. */
const toCurrencies = (codes: readonly string[]): CurrencyCode[] => codes.filter(isCurrencyCode);

export const toMarketRules = (dto: MarketRulesDto): MarketRules => ({
  code: dto.code,
  countryCode: dto.country_code,
  name: dto.name,
  status: dto.status,
  callingCode: dto.calling_code,
  mobilePattern: dto.mobile_pattern,
  mobileExample: dto.mobile_example,
  timezone: dto.timezone,
  defaultCurrency: dto.default_currency,
  currencies: dto.currencies.flatMap(currency =>
    isCurrencyCode(currency.code)
      ? [
          {
            code: currency.code,
            minorUnitDigits: currency.minor_unit_digits,
            name: currency.name,
            topUp: toLimit(currency.top_up),
            withdraw: toLimit(currency.withdraw),
          },
        ]
      : [],
  ),
  governorates: dto.governorates,
  paymentChannels: dto.payment_channels.map(channel => ({
    code: channel.code,
    group: channel.group,
    icon: channel.icon,
    name: channel.name,
    currencies: toCurrencies(channel.currencies),
    supportsTopUp: channel.supports_top_up,
    supportsPayout: channel.supports_payout,
    payoutPhoneRequired: channel.payout_phone_required,
    instructions: channel.instructions,
  })),
  couriers: dto.couriers,
  support: dto.support,
});

/** The market's rules change rarely; the server caches by ETag, the app keeps them for the session. */
const MARKET_RULES_KEEP_SECONDS = 60 * 60;

export const marketApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getMarket: builder.query<MarketRules, string>({
      query: code => `/markets/${encodeURIComponent(code)}`,
      transformResponse: (dto: MarketRulesDto) => toMarketRules(dto),
      keepUnusedDataFor: MARKET_RULES_KEEP_SECONDS,
      providesTags: (_result, _error, code) => [{ type: 'Market' as const, id: code }],
    }),
  }),
});

export const { useGetMarketQuery } = marketApi;
