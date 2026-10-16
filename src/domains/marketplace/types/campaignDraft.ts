import type {
  CampaignActivityType,
  CampaignGender,
  CampaignPricingModel,
} from './campaign';
import type { DealShippingMode, Timestamp } from './deal';

// The brand wizard's local form state and the wire bodies it autosaves (contract §3.2).

/** Wizard steps, in order (PC1.0): the idea, what is asked, money + seats + dates, review + send. */
export const CAMPAIGN_WIZARD_STEP = ['idea', 'requirements', 'money', 'review'] as const;
export type CampaignWizardStep = (typeof CAMPAIGN_WIZARD_STEP)[number];

/** What `missing[]` can list (contract §3.1). Anything else the server adds is unknown to this build. */
export const CAMPAIGN_MISSING_KEY = [
  'title',
  'activity_type',
  'teaser',
  'deliverables',
  'pricing',
  'apply_deadline_at',
  'schedule',
] as const;
export type CampaignMissingKey = (typeof CAMPAIGN_MISSING_KEY)[number];

/**
 * Independently saved parts of a draft. The order is the send order: validations read the stored
 * state, so shipping goes before the schedule (drop gap) and seats before pricing (budget cap).
 * `schedule` carries the deadline with the delivery / drop pair, which validate against each other.
 */
export const CAMPAIGN_DRAFT_SECTION = [
  'title',
  'activity_type',
  'teaser',
  'deliverables',
  'targeting',
  'shipping_mode',
  'seats_total',
  'pricing',
  'schedule',
  'private_brief',
] as const;
export type CampaignDraftSection = (typeof CAMPAIGN_DRAFT_SECTION)[number];

export interface CampaignDraftDeliverable {
  platform: string;
  service: string;
  count: number;
  revisions: number;
  addons: string[];
}

export interface CampaignDraftBrief {
  hashtags: string[];
  mentions: string[];
  talkingPoints: string[];
  donts: string[];
  links: string[];
  promoCode: string;
  trackingLink: string;
}

/** What the steps edit. Amounts are the text typed (`"150.5"`); dates are epoch milliseconds. */
export interface CampaignDraftValues {
  title: string;
  activityType: CampaignActivityType | null;
  teaser: string;
  deliverables: CampaignDraftDeliverable[];
  genders: CampaignGender[];
  minFollowers: number | null;
  cities: string[];
  niches: string[];
  pricingModel: CampaignPricingModel | null;
  seatPrice: string;
  bidMin: string;
  bidMax: string;
  budget: string;
  seatsTotal: number;
  shippingMode: DealShippingMode;
  applyDeadlineAt: Timestamp | null;
  /** A drop and delivery days exclude each other; the drop wins when both are set. */
  deliveryDays: number | null;
  dropAt: Timestamp | null;
  privateBrief: CampaignDraftBrief;
}

export interface CampaignDraftBriefWire {
  hashtags: string[];
  mentions: string[];
  talking_points: string[];
  donts: string[];
  links: string[];
  promo_code: string | null;
  tracking_link: string | null;
}

/** `POST` / `PUT /brand/campaigns` body; every key optional, `null` clears a nullable one. */
export interface CampaignDraftRequest {
  title?: string;
  activity_type?: CampaignActivityType | null;
  teaser?: { requirements: string } | null;
  deliverables?: {
    platform: string;
    service: string;
    count: number;
    revisions: number;
    addons: string[];
  }[];
  targeting?: {
    genders: CampaignGender[];
    min_followers: number | null;
    cities: string[];
    niches: string[];
  };
  shipping_mode?: DealShippingMode;
  seats_total?: number;
  pricing_model?: CampaignPricingModel;
  seat_price_usd?: string | null;
  bid_min_usd?: string | null;
  bid_max_usd?: string | null;
  budget_usd?: string | null;
  apply_deadline_at?: string | null;
  delivery_days?: number | null;
  drop_at?: string | null;
  private_brief?: CampaignDraftBriefWire | null;
}

/** The wire fragment of each section the draft can send right now. */
export type CampaignDraftSections = Partial<Record<CampaignDraftSection, CampaignDraftRequest>>;

export type CampaignWizardStepState = 'incomplete' | 'complete';

/** The wizard's progress from the server's `missing[]`. */
export interface CampaignWizardProgress {
  steps: Record<CampaignWizardStep, CampaignWizardStepState>;
  completed: number;
  firstIncomplete: CampaignWizardStep | null;
  /** Nothing blocks Submit. */
  ready: boolean;
}
