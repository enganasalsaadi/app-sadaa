import { baseApi } from '@/core/api';
import type { DealStrikes, DealUpsellQuote, DealUpsellRequest } from '../types/deal';
import type { DealStrikeDto, DealStrikesMetaDto, DealUpsellQuoteDto } from '../types/dealDto';
import { mapDealStrikes, mapDealUpsellQuote } from '../utils/dealMappers';
import { buildDealUrl } from '../utils/dealQuery';

/**
 * `POST …/upsells/quote` and `…/upsells` body (M8). The only place that knows the upsell wire
 * shape, so a backend change lands here alone. `deviceId` signs the addendum on the real request.
 */
export const toUpsellBody = (request: DealUpsellRequest, deviceId?: string): Record<string, unknown> => {
  const signed = deviceId ? { device_id: deviceId } : {};
  switch (request.kind) {
    case 'deliverable':
      return {
        kind: 'deliverable',
        line: { rate_card_id: request.rateCardId, quantity: request.quantity, addons: [...request.addons] },
        ...signed,
      };
    case 'addon':
      return { kind: 'addon', item_id: request.itemId, addon: { type: request.addonType }, ...signed };
    case 'extra_revision':
      return { kind: 'extra_revision', item_id: request.itemId, ...signed };
    default: {
      const _exhaustive: never = request;
      return _exhaustive;
    }
  }
};

interface DealUpsellQuoteArgs {
  dealId: string;
  request: DealUpsellRequest;
}

/**
 * Mid-deal additions and the creator's strikes (handoff M8). Proposing, withdrawing, accepting
 * and declining answer the full deal, so they go through `runDealAction`.
 */
export const dealUpsellApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    /** Brand: what the addition costs, the new deal total and the wallet's shortfall, before signing. */
    getDealUpsellQuote: builder.query<DealUpsellQuote, DealUpsellQuoteArgs>({
      query: ({ dealId, request }) => ({
        url: buildDealUrl({ role: 'brand', id: dealId }, 'upsells/quote'),
        method: 'POST',
        body: toUpsellBody(request),
      }),
      transformResponse: (dto: DealUpsellQuoteDto) => mapDealUpsellQuote(dto),
      keepUnusedDataFor: 30,
    }),
    /** Creator only: active strikes (revoked ones drop out) and the window each one lasts. */
    getDealStrikes: builder.query<DealStrikes, void>({
      query: () => '/influencer/strikes',
      extraOptions: { withMeta: true },
      transformResponse: ({ data, meta }: { data: DealStrikeDto[]; meta: DealStrikesMetaDto }) =>
        mapDealStrikes(data, meta),
      providesTags: ['DealStrikes'],
    }),
  }),
});

export const { useGetDealUpsellQuoteQuery, useGetDealStrikesQuery } = dealUpsellApi;
