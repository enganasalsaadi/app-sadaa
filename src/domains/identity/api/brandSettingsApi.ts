import { baseApi } from '@/core/api';
import type { BrandSettings } from '../types/brandSettings';

/** Brand-only privacy settings (contract §8.3). */
export const brandSettingsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getBrandSettings: builder.query<BrandSettings, void>({
      query: () => '/brand/settings',
    }),
    updateBrandSettings: builder.mutation<BrandSettings, Partial<BrandSettings>>({
      query: body => ({ url: '/brand/settings', method: 'PATCH', body }),
      // Flip the switch instantly; the server's answer is the truth, a failure puts it back.
      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        const optimistic = dispatch(
          brandSettingsApi.util.updateQueryData('getBrandSettings', undefined, draft => {
            Object.assign(draft, patch);
          }),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(brandSettingsApi.util.upsertQueryData('getBrandSettings', undefined, data));
        } catch {
          optimistic.undo();
        }
      },
    }),
  }),
});

export const { useGetBrandSettingsQuery, useUpdateBrandSettingsMutation } = brandSettingsApi;
