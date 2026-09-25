import type { TFunction } from 'i18next';
import type { SlideCard, SlideCardDefinition, SlideData, SlideDefinition } from '../types';

const resolveCard = (card: SlideCardDefinition, t: TFunction): SlideCard => ({
  icon: card.icon,
  tone: card.tone,
  title: t(card.titleKey),
  description: t(card.descriptionKey),
});

export const resolveSlides = (slides: SlideDefinition[], t: TFunction): SlideData[] =>
  slides.map(slide => ({
    id: slide.id,
    audience: t(slide.audienceKey),
    title: t(slide.titleKey),
    subtitle: slide.subtitleKey ? t(slide.subtitleKey) : undefined,
    cardTop: resolveCard(slide.cardTop, t),
    cardBottom: resolveCard(slide.cardBottom, t),
  }));
