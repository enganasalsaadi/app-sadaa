import type { SlideDefinition } from './types';

export const ONBOARDING_SLIDES: SlideDefinition[] = [
  {
    id: 'brands',
    audienceKey: 'onboarding.slides.brands.audience',
    titleKey: 'onboarding.slides.brands.title',
    subtitleKey: 'onboarding.slides.brands.subtitle',
    cardTop: {
      icon: 'mapPin',
      tone: 'interactive',
      titleKey: 'onboarding.slides.brands.cardTop.title',
      descriptionKey: 'onboarding.slides.brands.cardTop.description',
    },
    cardBottom: {
      icon: 'chartColumn',
      tone: 'interactive',
      titleKey: 'onboarding.slides.brands.cardBottom.title',
      descriptionKey: 'onboarding.slides.brands.cardBottom.description',
    },
  },
  {
    id: 'creators',
    audienceKey: 'onboarding.slides.creators.audience',
    titleKey: 'onboarding.slides.creators.title',
    subtitleKey: 'onboarding.slides.creators.subtitle',
    cardTop: {
      icon: 'megaphone',
      tone: 'interactive',
      titleKey: 'onboarding.slides.creators.cardTop.title',
      descriptionKey: 'onboarding.slides.creators.cardTop.description',
    },
    cardBottom: {
      icon: 'upload',
      tone: 'interactive',
      titleKey: 'onboarding.slides.creators.cardBottom.title',
      descriptionKey: 'onboarding.slides.creators.cardBottom.description',
    },
  },
  {
    id: 'trust',
    audienceKey: 'onboarding.slides.trust.audience',
    titleKey: 'onboarding.slides.trust.title',
    subtitleKey: 'onboarding.slides.trust.subtitle',
    cardTop: {
      icon: 'shieldCheck',
      tone: 'interactive',
      titleKey: 'onboarding.slides.trust.cardTop.title',
      descriptionKey: 'onboarding.slides.trust.cardTop.description',
    },
    cardBottom: {
      icon: 'wallet',
      tone: 'money',
      titleKey: 'onboarding.slides.trust.cardBottom.title',
      descriptionKey: 'onboarding.slides.trust.cardBottom.description',
    },
  },
];
