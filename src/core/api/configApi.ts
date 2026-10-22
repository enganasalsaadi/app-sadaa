import type { CountryCode } from 'libphonenumber-js';
import type { MarketStatus, MarketSummary } from '@/core/market/marketTypes';
import { baseApi } from './baseApi';

const CONFIG_TIMEOUT_MS = 3000;

/** Public runtime config fetched on splash (GET /config). */
export interface AppConfig {
  /** Version gate. Optional: older backends omit it → no gate. */
  app?: {
    /** Minimum supported version; below this force an update. */
    min_version: string;
    /** Latest published version. */
    latest_version: string;
    /** Hard gate — block the app until updated. */
    force_update: boolean;
  };
  support: {
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
  };
  urls: {
    privacy: string | null;
    terms: string | null;
  };
  /** Market slug used when the device region matches none (`sy`). Absent on older backends / old caches. */
  defaultMarket?: string;
  /** Active and coming-soon markets. Absent on older backends / old caches. */
  markets?: MarketSummary[];
  /** Kill switches and staged rollout only — never used to hide features from anyone. */
  features?: Record<string, boolean>;
  maintenance_mode?: boolean;
  maintenance_message?: string | null;
  /** Deprecated, always neutral on the server; kept only for the text replacer's wiring. */
  test_mode?: boolean;
  test_replacements?: Array<{ from: string; to: string }>;
}

interface MarketSummaryDto {
  code: string;
  country_code: CountryCode;
  name: string;
  status: MarketStatus;
  calling_code: string;
  mobile_example: string;
  default_currency: string;
  timezone: string;
}

type AppConfigDto = Omit<AppConfig, 'defaultMarket' | 'markets'> & {
  default_market?: string;
  markets?: MarketSummaryDto[];
};

export const toMarketSummary = (dto: MarketSummaryDto): MarketSummary => ({
  code: dto.code,
  countryCode: dto.country_code,
  name: dto.name,
  status: dto.status,
  callingCode: dto.calling_code,
  mobileExample: dto.mobile_example,
  defaultCurrency: dto.default_currency,
  timezone: dto.timezone,
});

export const toAppConfig = ({ default_market, markets, ...rest }: AppConfigDto): AppConfig => ({
  ...rest,
  defaultMarket: default_market,
  markets: markets?.map(toMarketSummary),
});

export const configApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getConfig: builder.query<AppConfig, void>({
      // Boot blocks on this call, so keep it short; failure is handled by the boot pipeline (fail-open).
      query: () => ({ url: '/config', timeout: CONFIG_TIMEOUT_MS }),
      transformResponse: (dto: AppConfigDto) => toAppConfig(dto),
      extraOptions: { silent: true },
      providesTags: ['AppConfig'],
    }),
  }),
});

export const { useGetConfigQuery } = configApi;
