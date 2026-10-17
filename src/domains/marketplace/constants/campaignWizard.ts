import type { ParseKeys } from 'i18next';
import { Clock, Layers, ListChecks, Send, ShieldCheck, Sparkles, Wallet, type LucideIcon } from 'lucide-react-native';
import type { CampaignMissingKey, CampaignWizardStep } from '../types/campaignDraft';
import type { CampaignSubmitBlock } from '../utils/campaignReview';

/** The wizard rail's names (PC1.0). */
export const CAMPAIGN_STEP_LABEL = {
  idea: 'marketplace.campaign.wizard.steps.idea',
  requirements: 'marketplace.campaign.wizard.steps.requirements',
  money: 'marketplace.campaign.wizard.steps.money',
  review: 'marketplace.campaign.wizard.steps.review',
} as const satisfies Record<CampaignWizardStep, ParseKeys>;

export const CAMPAIGN_STEP_ICON = {
  idea: Sparkles,
  requirements: ListChecks,
  money: Wallet,
  review: Send,
} as const satisfies Record<CampaignWizardStep, LucideIcon>;

/** The review's «missing: …» names for each reason `missing[]` can give. */
export const CAMPAIGN_MISSING_LABEL = {
  title: 'marketplace.campaign.wizard.review.missingKey.title',
  activity_type: 'marketplace.campaign.wizard.review.missingKey.activity_type',
  teaser: 'marketplace.campaign.wizard.review.missingKey.teaser',
  deliverables: 'marketplace.campaign.wizard.review.missingKey.deliverables',
  pricing: 'marketplace.campaign.wizard.review.missingKey.pricing',
  apply_deadline_at: 'marketplace.campaign.wizard.review.missingKey.apply_deadline_at',
  schedule: 'marketplace.campaign.wizard.review.missingKey.schedule',
} as const satisfies Record<CampaignMissingKey, ParseKeys>;

/** The sheet a refused Submit opens: its copy, and whether it leads somewhere (verify, my campaigns). */
export const CAMPAIGN_SUBMIT_BLOCK = {
  kyc: {
    title: 'marketplace.campaign.wizard.review.blocked.kycTitle',
    body: 'marketplace.campaign.wizard.review.blocked.kycBody',
    confirm: 'marketplace.campaign.wizard.review.blocked.kycConfirm',
    icon: ShieldCheck,
    leads: true,
  },
  kycPending: {
    title: 'marketplace.campaign.wizard.review.blocked.pendingTitle',
    body: 'marketplace.campaign.wizard.review.blocked.pendingBody',
    confirm: 'marketplace.campaign.wizard.review.blocked.ok',
    icon: Clock,
    leads: false,
  },
  liveLimit: {
    title: 'marketplace.campaign.wizard.review.blocked.liveTitle',
    body: 'marketplace.campaign.wizard.review.blocked.liveBody',
    confirm: 'marketplace.campaign.wizard.review.blocked.liveConfirm',
    icon: Layers,
    leads: true,
  },
} as const satisfies Record<
  CampaignSubmitBlock,
  { title: ParseKeys; body: ParseKeys; confirm: ParseKeys; icon: LucideIcon; leads: boolean }
>;
