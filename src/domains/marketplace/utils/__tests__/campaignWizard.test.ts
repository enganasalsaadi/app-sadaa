import { CAMPAIGN_WIZARD_STEP } from '../../types/campaignDraft';
import { campaignWizardProgress } from '../campaignDraft';
import type { CampaignDraftRefusal } from '../campaignDraftSync';
import {
  isValidCampaignTitle,
  nextWizardStep,
  previousWizardStep,
  refusalFieldMessage,
  refusalLeftover,
  refusalMessage,
  wizardRailState,
} from '../campaignWizard';

describe('wizard step order', () => {
  it('walks forward and back, and stops at both ends', () => {
    expect(nextWizardStep('idea')).toBe('requirements');
    expect(nextWizardStep('money')).toBe('review');
    expect(nextWizardStep('review')).toBeNull();
    expect(previousWizardStep('review')).toBe('money');
    expect(previousWizardStep('idea')).toBeNull();
  });
});

describe('wizardRailState', () => {
  const stateOf = (missing: string[], current: (typeof CAMPAIGN_WIZARD_STEP)[number]) =>
    CAMPAIGN_WIZARD_STEP.map(step => wizardRailState(step, current, campaignWizardProgress(missing)));

  it('marks the open step «now»', () => {
    expect(stateOf([], 'money')[2]).toBe('now');
  });

  it('checks the steps behind that the server is satisfied with', () => {
    expect(stateOf(['pricing'], 'review')).toEqual(['done', 'done', 'missing', 'now']);
  });

  it('warns on a step left behind that still lacks something', () => {
    expect(stateOf(['activity_type', 'deliverables'], 'money')).toEqual(['missing', 'missing', 'now', 'todo']);
  });

  it('keeps every step ahead plain, even complete ones, so a fresh draft is not a rail of warnings', () => {
    expect(stateOf(['title', 'pricing'], 'idea')).toEqual(['now', 'todo', 'todo', 'todo']);
    expect(stateOf([], 'idea')).toEqual(['now', 'todo', 'todo', 'todo']);
  });
});

describe('isValidCampaignTitle', () => {
  it('takes 3 to 120 characters after trimming', () => {
    expect(isValidCampaignTitle('ab')).toBe(false);
    expect(isValidCampaignTitle('  ab  ')).toBe(false);
    expect(isValidCampaignTitle(' abc ')).toBe(true);
    expect(isValidCampaignTitle('a'.repeat(120))).toBe(true);
    expect(isValidCampaignTitle('a'.repeat(121))).toBe(false);
  });
});

describe('refusalMessage', () => {
  const refusal = (fields: Record<string, string>): CampaignDraftRefusal => ({
    error: { message: 'general words' } as CampaignDraftRefusal['error'],
    fields,
  });

  it('is nothing when the part was not refused', () => {
    expect(refusalMessage(undefined, ['title'])).toBeUndefined();
  });

  it('prefers the first named field the server answered for', () => {
    expect(refusalMessage(refusal({ 'teaser.requirements': 'too long' }), ['teaser', 'teaser.requirements'])).toBe('too long');
  });

  it('falls back to the general message', () => {
    expect(refusalMessage(refusal({ other: 'x' }), ['title'])).toBe('general words');
  });
});

describe('refusal split over several inputs', () => {
  const refusal = (fields: Record<string, string>): CampaignDraftRefusal => ({
    error: { message: 'general words' } as CampaignDraftRefusal['error'],
    fields,
  });
  const PRICE = ['seat_price_usd', 'budget_usd'];

  it('gives a field only its own message', () => {
    expect(refusalFieldMessage(refusal({ budget_usd: 'too high' }), ['budget_usd'])).toBe('too high');
    expect(refusalFieldMessage(refusal({ budget_usd: 'too high' }), ['seat_price_usd'])).toBeUndefined();
    expect(refusalFieldMessage(undefined, ['budget_usd'])).toBeUndefined();
  });

  it('shows the general message once, only when no input shows its own', () => {
    expect(refusalLeftover(refusal({ budget_usd: 'too high' }), PRICE)).toBeUndefined();
    expect(refusalLeftover(refusal({ pricing_model: 'conflict' }), PRICE)).toBe('general words');
    expect(refusalLeftover(refusal({}), PRICE)).toBe('general words');
    expect(refusalLeftover(undefined, PRICE)).toBeUndefined();
  });
});
