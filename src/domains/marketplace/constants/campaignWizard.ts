import type { ParseKeys } from 'i18next';
import { ListChecks, Send, Sparkles, Wallet, type LucideIcon } from 'lucide-react-native';
import type { CampaignWizardStep } from '../types/campaignDraft';

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
