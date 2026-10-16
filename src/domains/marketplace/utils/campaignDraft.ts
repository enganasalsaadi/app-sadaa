import { parseAmountText, toAmountText } from '@/core/money';
import type { Money } from '@/core/money';
import {
  CAMPAIGN_DRAFT_LIMITS,
  CAMPAIGN_MISSING_STEP,
  CAMPAIGN_UNKNOWN_MISSING_STEP,
} from '../constants/campaignDraft';
import { CAMPAIGN_GENDER } from '../types/campaign';
import type { CampaignDetail } from '../types/campaign';
import { CAMPAIGN_DRAFT_SECTION, CAMPAIGN_WIZARD_STEP } from '../types/campaignDraft';
import type {
  CampaignDraftBrief,
  CampaignDraftRequest,
  CampaignDraftSection,
  CampaignDraftSections,
  CampaignDraftValues,
  CampaignMissingKey,
  CampaignWizardProgress,
  CampaignWizardStep,
} from '../types/campaignDraft';

const EMPTY_BRIEF: CampaignDraftBrief = {
  hashtags: [],
  mentions: [],
  talkingPoints: [],
  donts: [],
  links: [],
  promoCode: '',
  trackingLink: '',
};

/** A fresh wizard: nothing chosen, one seat, no shipping (the defaults the server starts a draft with). */
export const emptyDraftValues = (): CampaignDraftValues => ({
  title: '',
  activityType: null,
  teaser: '',
  deliverables: [],
  genders: [],
  minFollowers: null,
  cities: [],
  niches: [],
  pricingModel: null,
  seatPrice: '',
  bidMin: '',
  bidMax: '',
  budget: '',
  seatsTotal: 1,
  shippingMode: 'none',
  applyDeadlineAt: null,
  deliveryDays: null,
  dropAt: null,
  privateBrief: EMPTY_BRIEF,
});

const amountText = (money: Money | null): string => (money ? toAmountText(money) : '');

/** What the wizard shows when a saved draft is resumed or duplicated. */
export const draftValuesFromCampaign = (campaign: CampaignDetail): CampaignDraftValues => {
  const { privateBrief } = campaign;
  return {
    title: campaign.title,
    activityType: campaign.activityType?.key ?? null,
    teaser: campaign.teaserRequirements ?? '',
    deliverables: campaign.deliverables.map(line => ({
      platform: line.platform.key,
      service: line.service.key,
      count: line.count,
      revisions: line.revisions,
      addons: line.addons,
    })),
    genders: campaign.targeting.genders,
    minFollowers: campaign.targeting.minFollowers,
    cities: campaign.targeting.cities,
    niches: campaign.targeting.niches,
    pricingModel: campaign.pricing.model.key,
    seatPrice: amountText(campaign.pricing.seatPrice),
    bidMin: amountText(campaign.pricing.bidMin),
    bidMax: amountText(campaign.pricing.bidMax),
    budget: amountText(campaign.pricing.budget),
    seatsTotal: campaign.seatsTotal,
    shippingMode: campaign.shippingMode.key ?? 'none',
    applyDeadlineAt: campaign.applyDeadlineAt,
    deliveryDays: campaign.deliveryDays,
    dropAt: campaign.dropAt,
    privateBrief: privateBrief
      ? {
          hashtags: privateBrief.hashtags,
          mentions: privateBrief.mentions,
          talkingPoints: privateBrief.talkingPoints,
          donts: privateBrief.donts,
          links: privateBrief.links,
          promoCode: privateBrief.promoCode ?? '',
          trackingLink: privateBrief.trackingLink ?? '',
        }
      : EMPTY_BRIEF,
  };
};

/** Typed amount → the API's `"150.00"`; `null` when empty (the server clears the field). */
const usdWire = (text: string): string | null => {
  const money = parseAmountText(text, 'USD');
  return money ? toAmountText(money) : null;
};

const cleanList = (items: readonly string[]): string[] =>
  items.map(item => item.trim()).filter(item => item !== '');

const isBlankBrief = (brief: CampaignDraftBrief): boolean =>
  cleanList(brief.hashtags).length === 0 &&
  cleanList(brief.mentions).length === 0 &&
  cleanList(brief.talkingPoints).length === 0 &&
  cleanList(brief.donts).length === 0 &&
  cleanList(brief.links).length === 0 &&
  brief.promoCode.trim() === '' &&
  brief.trackingLink.trim() === '';

const pricingBody = (values: CampaignDraftValues): CampaignDraftRequest | undefined => {
  // Sending only the chosen model's fields: the server clears the other model's (it refuses both).
  switch (values.pricingModel) {
    case null:
      return undefined;
    case 'fixed':
      return {
        pricing_model: 'fixed',
        seat_price_usd: usdWire(values.seatPrice),
        budget_usd: usdWire(values.budget),
      };
    case 'bidding':
      return {
        pricing_model: 'bidding',
        bid_min_usd: usdWire(values.bidMin),
        bid_max_usd: usdWire(values.bidMax),
        budget_usd: usdWire(values.budget),
      };
    default: {
      const _exhaustive: never = values.pricingModel;
      return _exhaustive;
    }
  }
};

/**
 * Each part of the wizard as the wire fragment it would save (contract §3.2). A part that can't be
 * sent yet is left out, so a half-typed title never reaches the server: only `title` has a client
 * floor, since it creates the draft; other fields are checked by the server and come back as 422.
 */
export const draftSectionsOf = (values: CampaignDraftValues): CampaignDraftSections => {
  const sections: CampaignDraftSections = {};
  const title = values.title.trim();
  if (title.length >= CAMPAIGN_DRAFT_LIMITS.titleMin && title.length <= CAMPAIGN_DRAFT_LIMITS.titleMax) {
    sections.title = { title };
  }
  sections.activity_type = { activity_type: values.activityType };
  const teaser = values.teaser.trim();
  if (teaser.length <= CAMPAIGN_DRAFT_LIMITS.teaserMax) {
    sections.teaser = { teaser: teaser === '' ? null : { requirements: teaser } };
  }
  sections.deliverables = {
    deliverables: values.deliverables.map(line => ({
      platform: line.platform,
      service: line.service,
      count: line.count,
      revisions: line.revisions,
      addons: line.addons,
    })),
  };
  sections.targeting = {
    targeting: {
      genders: CAMPAIGN_GENDER.filter(gender => values.genders.includes(gender)),
      min_followers: values.minFollowers,
      cities: values.cities,
      niches: values.niches,
    },
  };
  sections.shipping_mode = { shipping_mode: values.shippingMode };
  sections.seats_total = { seats_total: values.seatsTotal };
  const pricing = pricingBody(values);
  if (pricing) sections.pricing = pricing;
  sections.schedule = {
    apply_deadline_at:
      values.applyDeadlineAt === null ? null : new Date(values.applyDeadlineAt).toISOString(),
    // Exclusive on the server: the chosen side is sent, the other cleared.
    delivery_days: values.dropAt === null ? values.deliveryDays : null,
    drop_at: values.dropAt === null ? null : new Date(values.dropAt).toISOString(),
  };
  sections.private_brief = {
    private_brief: isBlankBrief(values.privateBrief)
      ? null
      : {
          hashtags: cleanList(values.privateBrief.hashtags),
          mentions: cleanList(values.privateBrief.mentions),
          talking_points: cleanList(values.privateBrief.talkingPoints),
          donts: cleanList(values.privateBrief.donts),
          links: cleanList(values.privateBrief.links),
          promo_code: values.privateBrief.promoCode.trim() || null,
          tracking_link: values.privateBrief.trackingLink.trim() || null,
        },
  };
  return sections;
};

/** Comparable form of one section; builders emit keys in a fixed order, so equal parts match. */
export const draftSectionKey = (fragment: CampaignDraftRequest | undefined): string =>
  fragment === undefined ? '' : JSON.stringify(fragment);

/**
 * Sections whose value differs from what is saved (and was not already refused by the server),
 * in send order. Empty = nothing to save.
 */
export const dirtyDraftSections = (
  saved: CampaignDraftSections,
  desired: CampaignDraftSections,
  refused: Partial<Record<CampaignDraftSection, string>> = {},
): CampaignDraftSection[] =>
  CAMPAIGN_DRAFT_SECTION.filter(section => {
    const wanted = desired[section];
    if (wanted === undefined) return false;
    const key = draftSectionKey(wanted);
    return key !== draftSectionKey(saved[section]) && key !== refused[section];
  });

const isMissingKey = (key: string): key is CampaignMissingKey =>
  Object.prototype.hasOwnProperty.call(CAMPAIGN_MISSING_STEP, key);

/** Step owning one `missing[]` reason. */
export const missingStep = (key: string): CampaignWizardStep =>
  isMissingKey(key) ? CAMPAIGN_MISSING_STEP[key] : CAMPAIGN_UNKNOWN_MISSING_STEP;

/**
 * Wizard progress from `missing[]`. «Review» counts as complete only when nothing at all blocks
 * Submit, so the progress ring reads 4/4 exactly when the campaign can be sent.
 */
export const campaignWizardProgress = (missing: readonly string[]): CampaignWizardProgress => {
  const incomplete = new Set(missing.map(missingStep));
  if (missing.length > 0) incomplete.add('review');
  const steps = Object.fromEntries(
    CAMPAIGN_WIZARD_STEP.map(step => [step, incomplete.has(step) ? 'incomplete' : 'complete']),
  ) as CampaignWizardProgress['steps'];
  return {
    steps,
    completed: CAMPAIGN_WIZARD_STEP.filter(step => steps[step] === 'complete').length,
    firstIncomplete: CAMPAIGN_WIZARD_STEP.find(step => steps[step] === 'incomplete') ?? null,
    ready: missing.length === 0,
  };
};

/**
 * Where the wizard opens: a duplicate starts from the top (its dates and files are blank, so the
 * brand walks through); a resumed draft jumps to the first step that still needs something, or
 * the review when only sending is left (also where a «changes requested» note is read).
 */
export const draftEntryStep = (
  campaign: Pick<CampaignDetail, 'missing'>,
  source: 'resume' | 'duplicate',
): CampaignWizardStep =>
  source === 'duplicate'
    ? 'idea'
    : (campaignWizardProgress(campaign.missing).firstIncomplete ?? 'review');
