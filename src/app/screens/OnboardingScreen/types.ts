import type { ParseKeys } from 'i18next';
import type { OnboardingIconName } from './icons';

/** Rule 08 color role of a card icon: teal = interaction, mint = money. */
export type SlideIconTone = 'interactive' | 'money';

export interface SlideCard {
  icon: OnboardingIconName;
  tone: SlideIconTone;
  title: string;
  description: string;
}

export interface SlideData {
  id: string;
  audience: string;
  title: string;
  subtitle?: string;
  cardTop: SlideCard;
  cardBottom: SlideCard;
}

/** Static definition: i18n keys, resolved into `SlideData` by the screen hook. */
export interface SlideCardDefinition extends Omit<SlideCard, 'title' | 'description'> {
  titleKey: ParseKeys;
  descriptionKey: ParseKeys;
}

export interface SlideDefinition {
  id: string;
  audienceKey: ParseKeys;
  titleKey: ParseKeys;
  subtitleKey?: ParseKeys;
  cardTop: SlideCardDefinition;
  cardBottom: SlideCardDefinition;
}
