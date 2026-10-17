import type { CampaignQuote } from '../../types/campaign';
import { pricingModelPatch, quoteSeatFor } from '../campaignPricing';

const usd = (amount: number) => ({ amount, currency: 'USD' as const });

const quote = (overrides: Partial<CampaignQuote> = {}): CampaignQuote => ({
  pricingModel: 'fixed',
  feeBps: 1000,
  seats: 5,
  deliverablesPerCreator: 2,
  seat: {
    min: { gross: usd(10000), fee: usd(1000), net: usd(9000) },
    max: { gross: usd(10000), fee: usd(1000), net: usd(9000) },
  },
  totalGross: { min: usd(50000), max: usd(50000) },
  budget: null,
  wallet: { balance: usd(0), required: usd(50000), shortfall: usd(50000), isSufficient: false },
  ...overrides,
});

describe('pricingModelPatch', () => {
  it('clears the bids and the budget when moving to a fixed price', () => {
    expect(pricingModelPatch('bidding', 'fixed')).toEqual({ pricingModel: 'fixed', bidMin: '', bidMax: '', budget: '' });
  });

  it('clears the seat price when moving to bidding', () => {
    expect(pricingModelPatch('fixed', 'bidding')).toEqual({ pricingModel: 'bidding', seatPrice: '' });
    expect(pricingModelPatch(null, 'bidding')).toEqual({ pricingModel: 'bidding', seatPrice: '' });
  });

  it('changes nothing when the model stays', () => {
    expect(pricingModelPatch('fixed', 'fixed')).toEqual({});
  });
});

describe('quoteSeatFor', () => {
  it('gives the split worked out for the price on screen', () => {
    expect(quoteSeatFor(quote(), { pricingModel: 'fixed', seatPrice: '100', bidMax: '' })?.net).toEqual(usd(9000));
  });

  it('hides a split from an older price still being saved', () => {
    expect(quoteSeatFor(quote(), { pricingModel: 'fixed', seatPrice: '120', bidMax: '' })).toBeNull();
  });

  it('reads the bid ceiling under bidding, and never a quote of the other model', () => {
    const bidding = quote({ pricingModel: 'bidding' });
    expect(quoteSeatFor(bidding, { pricingModel: 'bidding', seatPrice: '', bidMax: '100.00' })).not.toBeNull();
    expect(quoteSeatFor(bidding, { pricingModel: 'fixed', seatPrice: '100', bidMax: '' })).toBeNull();
  });

  it('is nothing before the pricing is set', () => {
    expect(quoteSeatFor(undefined, { pricingModel: null, seatPrice: '', bidMax: '' })).toBeNull();
    expect(
      quoteSeatFor(quote({ seat: { min: null, max: null } }), { pricingModel: 'fixed', seatPrice: '100', bidMax: '' }),
    ).toBeNull();
  });
});
