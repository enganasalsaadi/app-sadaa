import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ExploreCreator } from '@/domains/marketplace';
import { MOCK_AVATAR_GROUP, MOCK_CREATOR_PRICE } from '../mockData';

const BASE_BADGES: ExploreCreator['badges'] = {
  kycVerified: false,
  followersVerified: false,
  rush: false,
  onSite: false,
  isNew: false,
};

const toggleSlug = (set: ReadonlySet<string>, slug: string): ReadonlySet<string> => {
  const next = new Set(set);
  if (next.has(slug)) next.delete(slug);
  else next.add(slug);
  return next;
};

/**
 * Dev-only cards: a verified creator with a visible price, a new one whose price is
 * locked, one with no tier or platform. ❤️ toggles locally; pressing a row card toggles it
 * in the comparison set, like brand matching.
 */
export const useCreatorCardDemo = () => {
  const { t } = useTranslation();
  const [shortlisted, setShortlisted] = useState<ReadonlySet<string>>(new Set(['lina']));
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  const creators = useMemo<ExploreCreator[]>(
    () => [
      {
        slug: 'lina',
        displayName: t('devShowcase.sada.creatorName'),
        avatarUrl: MOCK_AVATAR_GROUP[4]?.uri ?? null,
        governorate: { value: 'damascus', label: t('devShowcase.sada.cityDamascus') },
        niches: [
          { value: 'food', label: t('devShowcase.chips.food') },
          { value: 'beauty', label: t('devShowcase.sada.nicheBeauty') },
        ],
        tier: 'MACRO',
        primaryPlatform: {
          platform: 'instagram',
          platformLabel: 'Instagram',
          followerCount: 120500,
          followerCountVerified: true,
        },
        platforms: ['instagram', 'tiktok'],
        badges: { ...BASE_BADGES, kycVerified: true, followersVerified: true, rush: true, onSite: true },
        fastestDeliveryDays: 2,
        price: {
          locked: false,
          from: MOCK_CREATOR_PRICE,
          fromSypApprox: { amount: 1200000, currency: 'SYP' },
        },
        isShortlisted: false,
      },
      {
        slug: 'omar',
        displayName: t('devShowcase.sada.creatorNameAlt'),
        avatarUrl: MOCK_AVATAR_GROUP[1]?.uri ?? null,
        governorate: { value: 'aleppo', label: t('devShowcase.sada.cityAleppo') },
        niches: [{ value: 'tech', label: t('devShowcase.sada.nicheTech') }],
        tier: 'MICRO',
        primaryPlatform: {
          platform: 'tiktok',
          platformLabel: 'TikTok',
          followerCount: 8400,
          followerCountVerified: false,
        },
        platforms: ['tiktok'],
        badges: { ...BASE_BADGES, isNew: true },
        fastestDeliveryDays: 5,
        price: { locked: true, lockReason: 'kyc_required' },
        isShortlisted: false,
      },
      {
        slug: 'sara',
        displayName: t('devShowcase.sada.creatorName'),
        avatarUrl: null,
        governorate: null,
        niches: [],
        tier: null,
        primaryPlatform: null,
        platforms: [],
        badges: BASE_BADGES,
        fastestDeliveryDays: null,
        price: { locked: true, lockReason: 'kyc_pending' },
        isShortlisted: false,
      },
    ],
    [t],
  );

  const cards = useMemo(
    () => creators.map(creator => ({ ...creator, isShortlisted: shortlisted.has(creator.slug) })),
    [creators, shortlisted],
  );

  const toggleShortlist = useCallback(
    (creator: ExploreCreator) => setShortlisted(prev => toggleSlug(prev, creator.slug)),
    [],
  );
  const toggleSelected = useCallback(
    (creator: ExploreCreator) => setSelected(prev => toggleSlug(prev, creator.slug)),
    [],
  );

  return { cards, selected, toggleShortlist, toggleSelected };
};
