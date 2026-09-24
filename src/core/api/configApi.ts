import { baseApi } from './baseApi';

/** Public runtime config fetched on splash (GET /config). */
export interface AppConfig {
  app: {
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
    privacy: string;
    terms: string;
  };
  // --- legacy fields (older backend) kept optional for back-compat ---
  maintenance_mode?: boolean;
  maintenance_message?: string | null;
  test_mode?: boolean;
  test_replacements?: Array<{ from: string; to: string }>;
}

export const configApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getConfig: builder.query<AppConfig, void>({
      query: () => '/config',
      providesTags: ['AppConfig'],
    }),
  }),
});

export const { useGetConfigQuery } = configApi;
