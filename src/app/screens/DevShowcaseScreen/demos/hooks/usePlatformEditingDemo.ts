import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useFollowerTierOptions,
  type InfluencerPlatform,
  type InfluencerRatesFormValues,
} from '@/domains/auth';
import { MOCK_RATE_SERVICES } from '../mockData';

const DEMO_PLATFORMS: readonly InfluencerPlatform[] = ['instagram', 'tiktok', 'telegram'];
const PLATFORM_ROWS = [
  { index: 0, service: MOCK_RATE_SERVICES.reel },
  { index: 1, service: MOCK_RATE_SERVICES.story },
];
const IN_PERSON_ROWS = [{ index: 2, service: MOCK_RATE_SERVICES.onSiteVisit }];

/** Dev-only: one price form shared by a platform card and the in-person card, plus the add sheet. */
export const usePlatformEditingDemo = () => {
  const { control } = useForm<InfluencerRatesFormValues>({
    defaultValues: {
      rates: [
        {
          platform: 'instagram',
          service: 'reel',
          hasPackage: true,
          enabled: true,
          packageValue: '30',
          price: { amount: 5000, currency: 'USD' },
        },
        { platform: 'instagram', service: 'story', hasPackage: false, enabled: false, packageValue: null, price: null },
        { platform: null, service: 'on_site_visit', hasPackage: true, enabled: false, packageValue: '2', price: null },
      ],
    },
  });
  const tiers = useFollowerTierOptions();
  const [sheetVisible, setSheetVisible] = useState(false);
  const openSheet = useCallback(() => setSheetVisible(true), []);
  const closeSheet = useCallback(() => setSheetVisible(false), []);
  const supportsLookup = useCallback(() => false, []);
  const [instagramLink, setInstagramLink] = useState('https://instagram.com/sada');
  const [websiteLink, setWebsiteLink] = useState('not a link');

  return {
    control,
    platformRows: PLATFORM_ROWS,
    inPersonRows: IN_PERSON_ROWS,
    openSheet,
    links: {
      instagram: instagramLink,
      onInstagramChange: setInstagramLink,
      website: websiteLink,
      onWebsiteChange: setWebsiteLink,
    },
    sheet: {
      visible: sheetVisible,
      onClose: closeSheet,
      initial: null,
      platforms: DEMO_PLATFORMS,
      supportsLookup,
      tiers: tiers.options,
      tiersLoading: tiers.isLoading,
      onSave: closeSheet,
    },
  };
};
