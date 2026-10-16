import { CAMPAIGN_WIZARD_STEP } from '../../types/campaignDraft';
import type { CampaignDraftValues } from '../../types/campaignDraft';
import {
  campaignWizardProgress,
  dirtyDraftSections,
  draftEntryStep,
  draftSectionKey,
  draftSectionsOf,
  draftValuesFromCampaign,
  emptyDraftValues,
  missingStep,
} from '../campaignDraft';
import { mapCampaignDetail } from '../campaignMappers';
import { detailDto } from '../__fixtures__/campaignDto';

const values = (patch: Partial<CampaignDraftValues> = {}): CampaignDraftValues => ({
  ...emptyDraftValues(),
  ...patch,
});

const server = (overrides = {}) => mapCampaignDetail(detailDto(overrides));

describe('draftSectionsOf', () => {
  it('leaves the title out until it is 3–120 characters', () => {
    expect(draftSectionsOf(values({ title: 'ab' })).title).toBeUndefined();
    expect(draftSectionsOf(values({ title: '  ab  ' })).title).toBeUndefined();
    expect(draftSectionsOf(values({ title: ' Ramadan ' })).title).toEqual({ title: 'Ramadan' });
    expect(draftSectionsOf(values({ title: 'x'.repeat(121) })).title).toBeUndefined();
  });

  it('clears an empty teaser and holds back one over 1000 characters', () => {
    expect(draftSectionsOf(values({ teaser: '  ' })).teaser).toEqual({ teaser: null });
    expect(draftSectionsOf(values({ teaser: 'Post a reel' })).teaser).toEqual({
      teaser: { requirements: 'Post a reel' },
    });
    expect(draftSectionsOf(values({ teaser: 'x'.repeat(1001) })).teaser).toBeUndefined();
  });

  it('sends only the chosen pricing model, amounts as two-decimal strings', () => {
    const fixed = draftSectionsOf(
      values({ pricingModel: 'fixed', seatPrice: '100', bidMin: '5', bidMax: '9', budget: '' }),
    );
    expect(fixed.pricing).toEqual({ pricing_model: 'fixed', seat_price_usd: '100.00', budget_usd: null });

    const bidding = draftSectionsOf(
      values({ pricingModel: 'bidding', seatPrice: '100', bidMin: '20.5', bidMax: '60', budget: '300' }),
    );
    expect(bidding.pricing).toEqual({
      pricing_model: 'bidding',
      bid_min_usd: '20.50',
      bid_max_usd: '60.00',
      budget_usd: '300.00',
    });
    expect(draftSectionsOf(values()).pricing).toBeUndefined();
  });

  it('sends the drop and clears delivery days, or the reverse', () => {
    const dropAt = Date.parse('2026-11-01T17:00:00Z');
    const deadline = Date.parse('2026-10-20T17:00:00Z');
    expect(draftSectionsOf(values({ dropAt, deliveryDays: 7, applyDeadlineAt: deadline })).schedule).toEqual({
      apply_deadline_at: '2026-10-20T17:00:00.000Z',
      delivery_days: null,
      drop_at: '2026-11-01T17:00:00.000Z',
    });
    expect(draftSectionsOf(values({ deliveryDays: 7 })).schedule).toEqual({
      apply_deadline_at: null,
      delivery_days: 7,
      drop_at: null,
    });
  });

  it('drops blank brief entries and sends a blank brief as null', () => {
    expect(draftSectionsOf(values()).private_brief).toEqual({ private_brief: null });
    const brief = { ...emptyDraftValues().privateBrief, hashtags: [' #a ', ' '], promoCode: ' SADA10 ' };
    expect(draftSectionsOf(values({ privateBrief: brief })).private_brief).toEqual({
      private_brief: {
        hashtags: ['#a'],
        mentions: [],
        talking_points: [],
        donts: [],
        links: [],
        promo_code: 'SADA10',
        tracking_link: null,
      },
    });
  });

  it('keeps genders in contract order', () => {
    expect(draftSectionsOf(values({ genders: ['female', 'male'] })).targeting?.targeting?.genders).toEqual([
      'male',
      'female',
    ]);
  });
});

describe('draftValuesFromCampaign', () => {
  it('round-trips a server campaign into no pending changes', () => {
    const campaign = server();
    const saved = draftSectionsOf(draftValuesFromCampaign(campaign));
    expect(dirtyDraftSections(saved, draftSectionsOf(draftValuesFromCampaign(campaign)))).toEqual([]);
  });

  it('shows server amounts as editable text', () => {
    const loaded = draftValuesFromCampaign(server());
    expect(loaded).toMatchObject({
      title: 'Ramadan launch',
      activityType: 'restaurant_cafe',
      pricingModel: 'fixed',
      seatPrice: '100.00',
      budget: '800.00',
      seatsTotal: 5,
      shippingMode: 'gift',
    });
    expect(loaded.deliverables).toEqual([
      { platform: 'instagram', service: 'reel', count: 2, revisions: 1, addons: ['link_in_bio'] },
    ]);
  });

  it('opens a campaign without a brief or targeting as empty fields', () => {
    const loaded = draftValuesFromCampaign(server({ private_brief: null, activity_type: null }));
    expect(loaded.privateBrief).toEqual(emptyDraftValues().privateBrief);
    expect(loaded.activityType).toBeNull();
  });
});

describe('dirtyDraftSections', () => {
  const saved = draftSectionsOf(draftValuesFromCampaign(server()));
  const edited = (patch: Partial<CampaignDraftValues>) =>
    draftSectionsOf({ ...draftValuesFromCampaign(server()), ...patch });

  it('lists only the changed parts, in send order', () => {
    expect(dirtyDraftSections(saved, edited({ budget: '900', shippingMode: 'none', title: 'New name' }))).toEqual([
      'title',
      'shipping_mode',
      'pricing',
    ]);
  });

  it('treats a typed amount the same as the saved one', () => {
    expect(dirtyDraftSections(saved, edited({ seatPrice: '100' }))).toEqual([]);
  });

  it('skips a part the server already refused until it changes', () => {
    const wanted = edited({ budget: '1' });
    const refused = { pricing: draftSectionKey(wanted.pricing) };
    expect(dirtyDraftSections(saved, wanted, refused)).toEqual([]);
    expect(dirtyDraftSections(saved, edited({ budget: '2' }), refused)).toEqual(['pricing']);
  });

  it('ignores a part that cannot be sent yet', () => {
    expect(dirtyDraftSections(saved, edited({ title: 'ab' }))).toEqual([]);
  });
});

describe('campaignWizardProgress', () => {
  it('marks the step that owns each missing reason', () => {
    expect(missingStep('title')).toBe('idea');
    expect(missingStep('deliverables')).toBe('requirements');
    expect(missingStep('schedule')).toBe('money');
    expect(missingStep('something_new')).toBe('review');
  });

  it('reads complete steps and the first one left', () => {
    const progress = campaignWizardProgress(['teaser', 'schedule']);
    expect(progress.steps).toEqual({
      idea: 'incomplete',
      requirements: 'complete',
      money: 'incomplete',
      review: 'incomplete',
    });
    expect(progress).toMatchObject({ completed: 1, firstIncomplete: 'idea', ready: false });
  });

  it('is ready, with every step complete, when nothing is missing', () => {
    const progress = campaignWizardProgress([]);
    expect(progress.completed).toBe(CAMPAIGN_WIZARD_STEP.length);
    expect(progress).toMatchObject({ firstIncomplete: null, ready: true });
  });

  it('blocks on a reason this build does not know', () => {
    expect(campaignWizardProgress(['future_thing'])).toMatchObject({
      firstIncomplete: 'review',
      ready: false,
      completed: 3,
    });
  });
});

describe('draftEntryStep', () => {
  it('starts a duplicate from the first step', () => {
    expect(draftEntryStep({ missing: ['schedule'] }, 'duplicate')).toBe('idea');
  });

  it('resumes at the first incomplete step, else the review', () => {
    expect(draftEntryStep({ missing: ['deliverables', 'pricing'] }, 'resume')).toBe('requirements');
    expect(draftEntryStep({ missing: [] }, 'resume')).toBe('review');
  });
});
