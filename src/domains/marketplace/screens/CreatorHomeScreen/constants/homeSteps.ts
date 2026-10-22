import type { ParseKeys } from 'i18next';
import { Camera, IdCard, Layers, ShieldCheck, Tag, type LucideIcon } from 'lucide-react-native';
import type { ProfileStepTarget, StrengthStageKey } from '@/domains/identity';

export interface HomeStepDef {
  titleKey: ParseKeys;
  bodyKey: ParseKeys;
  ctaKey: ParseKeys;
  icon: LucideIcon;
  /** The screen that completes the stage. */
  target: ProfileStepTarget;
}

/** One storefront stage as a «get ready» card in the deck and a node on the readiness track. */
export const HOME_STEP_DEF = {
  info: {
    titleKey: 'marketplace.creatorHome.tasks.step.info.title',
    bodyKey: 'marketplace.creatorHome.tasks.step.info.body',
    ctaKey: 'marketplace.creatorHome.tasks.step.info.cta',
    icon: IdCard,
    target: 'editInfo',
  },
  avatar: {
    titleKey: 'marketplace.creatorHome.tasks.step.avatar.title',
    bodyKey: 'marketplace.creatorHome.tasks.step.avatar.body',
    ctaKey: 'marketplace.creatorHome.tasks.step.avatar.cta',
    icon: Camera,
    target: 'avatar',
  },
  platforms: {
    titleKey: 'marketplace.creatorHome.tasks.step.platforms.title',
    bodyKey: 'marketplace.creatorHome.tasks.step.platforms.body',
    ctaKey: 'marketplace.creatorHome.tasks.step.platforms.cta',
    icon: Layers,
    target: 'platforms',
  },
  rates: {
    titleKey: 'marketplace.creatorHome.tasks.step.rates.title',
    bodyKey: 'marketplace.creatorHome.tasks.step.rates.body',
    ctaKey: 'marketplace.creatorHome.tasks.step.rates.cta',
    icon: Tag,
    target: 'rates',
  },
  kyc: {
    titleKey: 'marketplace.creatorHome.tasks.step.kyc.title',
    bodyKey: 'marketplace.creatorHome.tasks.step.kyc.body',
    ctaKey: 'marketplace.creatorHome.tasks.step.kyc.cta',
    icon: ShieldCheck,
    target: 'kyc',
  },
} as const satisfies Record<StrengthStageKey, HomeStepDef>;
