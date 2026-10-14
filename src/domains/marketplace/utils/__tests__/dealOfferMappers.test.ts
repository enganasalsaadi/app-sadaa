import { DEFAULT_DEAL_WINDOWS } from '../../constants/dealOffer';
import type { DealOfferPreflightDto, DealQuoteDto, DealQuoteItemDto } from '../../types/dealOfferDto';
import {
  mapDealBlocker,
  mapDealOfferPreflight,
  mapDealQuote,
  readBlockerDealId,
  readErrorFields,
  readPriceChangedQuote,
  readUnavailableLines,
  toDealOfferBody,
  toPreflightParams,
} from '../dealOfferMappers';

const usd = (amount: number) => ({ amount, currency: 'USD' as const });

const item = (overrides: Partial<DealQuoteItemDto> = {}): DealQuoteItemDto => ({
  rate_card_id: 'rc_reel',
  title: 'Reel',
  platform: 'instagram',
  service: 'reel',
  package_value: null,
  unit_price_usd: '180.00',
  addons: [{ type: 'rush_delivery', label: 'Rush', price_usd: '40.00', options: { delivery_hours: 48 } }],
  total_usd: '220.00',
  delivery_days: 4,
  delivery_hours: 48,
  revisions: 2,
  retention: 'permanent',
  ...overrides,
});

const quote = (overrides: Partial<DealQuoteDto> = {}): DealQuoteDto => ({
  items: [item(), item(), item({ rate_card_id: 'rc_story', title: 'Story', total_usd: '60.00', unit_price_usd: '60.00', addons: [], retention: '24h' })],
  total_usd: '500.00',
  currency: 'USD',
  min_delivery_hours: 48,
  min_delivery_days: 2,
  requested_delivery_days: null,
  wallet: { balance_usd: '120.00', shortfall_usd: '380.00', is_sufficient: false },
  contract_terms: { version: 'v1', items: [{ key: 'price', text: 'Fixed price' }] },
  ...overrides,
});

describe('mapDealBlocker', () => {
  it('keeps known codes and the open deal id', () => {
    expect(mapDealBlocker({ code: 'deal_offer_exists', label: 'Open offer', deal_id: '01J' })).toEqual({
      code: 'deal_offer_exists',
      label: 'Open offer',
      dealId: '01J',
    });
  });

  it('turns an unknown code into null and keeps the server label', () => {
    expect(mapDealBlocker({ code: 'deal_new_rule', label: 'New rule' })).toEqual({
      code: null,
      label: 'New rule',
      dealId: null,
    });
  });
});

describe('mapDealOfferPreflight', () => {
  it('maps blockers in server order with usage and the draft to resume', () => {
    const dto: DealOfferPreflightDto = {
      can_offer: false,
      blockers: [
        { code: 'kyc_required', label: 'Verify' },
        { code: 'deal_offer_exists', label: 'Open offer', deal_id: '01J' },
      ],
      resume_draft_id: 'draft_1',
      open_offers: { used: 7, limit: 20 },
      drafts: { used: 3, limit: 50 },
    };
    const result = mapDealOfferPreflight(dto);
    expect(result.canOffer).toBe(false);
    expect(result.blockers.map(b => b.code)).toEqual(['kyc_required', 'deal_offer_exists']);
    expect(result.resumeDraftId).toBe('draft_1');
    expect(result.openOffers).toEqual({ used: 7, limit: 20 });
    expect(result.drafts).toEqual({ used: 3, limit: 50 });
  });
});

describe('mapDealQuote', () => {
  it('parses money and groups deliverables back into lines', () => {
    const result = mapDealQuote(quote());
    expect(result.total).toEqual(usd(50000));
    expect(result.items).toHaveLength(3);
    expect(result.lines).toEqual([
      expect.objectContaining({ rateCardId: 'rc_reel', quantity: 2, total: usd(44000), unitPrice: usd(18000) }),
      expect.objectContaining({ rateCardId: 'rc_story', quantity: 1, total: usd(6000), retention: '24h' }),
    ]);
    expect(result.lines[0]?.addons).toEqual([{ type: 'rush_delivery', label: 'Rush', price: usd(4000) }]);
    expect(result.wallet).toEqual({ balance: usd(12000), shortfall: usd(38000), isSufficient: false });
  });

  it('falls back to default windows and no blockers on an older server', () => {
    const result = mapDealQuote(quote());
    expect(result.windows).toEqual(DEFAULT_DEAL_WINDOWS);
    expect(result.blockers).toEqual([]);
  });

  it('reads server windows, keeping defaults only for broken fields', () => {
    const result = mapDealQuote(
      quote({
        windows: {
          influencer_response_hours: 72,
          payment_top_up_hours: 0,
          brand_ship_hours: 96,
          brand_review_hours: 24,
          publish_window_hours: 36,
        },
        blockers: [{ code: 'deal_offer_limit', label: 'Limit' }],
      }),
    );
    expect(result.windows).toEqual({
      influencerResponseHours: 72,
      paymentTopUpHours: DEFAULT_DEAL_WINDOWS.paymentTopUpHours,
      brandShipHours: 96,
      brandReviewHours: 24,
      publishWindowHours: 36,
    });
    expect(result.blockers[0]?.code).toBe('deal_offer_limit');
  });

  it('throws on malformed money instead of showing a wrong amount', () => {
    expect(() => mapDealQuote(quote({ total_usd: 'abc' }))).toThrow();
  });
});

describe('readPriceChangedQuote', () => {
  it('reads meta.quote from the 409 body', () => {
    const result = readPriceChangedQuote({ error_code: 'deal_price_changed', meta: { quote: quote() } });
    expect(result?.total).toEqual(usd(50000));
  });

  it('returns null when the quote is missing or unreadable', () => {
    expect(readPriceChangedQuote(null)).toBeNull();
    expect(readPriceChangedQuote({ meta: {} })).toBeNull();
    expect(readPriceChangedQuote({ meta: { quote: { total_usd: 'x' } } })).toBeNull();
  });
});

describe('toDealOfferBody', () => {
  it('writes the snake_case body the server validates', () => {
    expect(
      toDealOfferBody({
        lines: [{ rateCardId: 'rc_reel', quantity: 2, addons: ['rush_delivery'] }],
        shippingMode: 'gift',
        requestedDeliveryDays: 14,
        brief: {
          hashtags: ['#a'],
          mentions: ['@b'],
          talkingPoints: ['tp'],
          donts: ['no'],
          promoCode: 'LEEN15',
          trackingLink: null,
        },
      }),
    ).toEqual({
      lines: [{ rate_card_id: 'rc_reel', quantity: 2, addons: ['rush_delivery'] }],
      shipping_mode: 'gift',
      requested_delivery_days: 14,
      brief: {
        hashtags: ['#a'],
        mentions: ['@b'],
        talking_points: ['tp'],
        donts: ['no'],
        promo_code: 'LEEN15',
        tracking_link: null,
      },
    });
  });
});

describe('toPreflightParams', () => {
  it('sends the slug or the profile id', () => {
    expect(toPreflightParams({ creatorSlug: 'leen' })).toEqual({ creator_slug: 'leen' });
    expect(toPreflightParams({ influencerProfileId: '01J' })).toEqual({ influencer_profile_id: '01J' });
  });
});

describe('error details readers', () => {
  const unprocessable = {
    errors: { 'lines.0.rate_card_id': ['gone'], 'lines.2.rate_card_id': ['hidden'], requested_delivery_days: ['x'] },
  };

  it('lists the 422 field keys, or none', () => {
    expect(readErrorFields(unprocessable)).toEqual([
      'lines.0.rate_card_id',
      'lines.2.rate_card_id',
      'requested_delivery_days',
    ]);
    expect(readErrorFields({ errors: null })).toEqual([]);
    expect(readErrorFields(undefined)).toEqual([]);
  });

  it('finds the lines whose rate card can no longer be offered', () => {
    expect(readUnavailableLines(unprocessable)).toEqual([0, 2]);
    expect(readUnavailableLines({ errors: { 'lines.0.quantity': ['max'] } })).toEqual([]);
  });

  it('reads the open offer id of deal_offer_exists', () => {
    expect(readBlockerDealId({ meta: { deal_id: 'd-9' } })).toBe('d-9');
    expect(readBlockerDealId({ meta: { deal_id: 9 } })).toBeNull();
    expect(readBlockerDealId('nope')).toBeNull();
  });
});
