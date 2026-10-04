import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLookupItems } from '@/core/api';
import {
  SERVICE_TYPES,
  useFollowerTierOptions,
  type InfluencerPlatform,
  type InfluencerRatesFormValues,
  type ServiceType,
} from '@/domains/auth';

const DEMO_PLATFORMS: readonly InfluencerPlatform[] = ['instagram', 'tiktok', 'telegram'];
const ROWS = SERVICE_TYPES.map((service, index) => ({ index, service }));

/** Dev-only: one price form shared by both card variants, plus the add sheet (no lookup). */
export const usePlatformEditingDemo = () => {
  const { control } = useForm<InfluencerRatesFormValues>({
    defaultValues: {
      rates: SERVICE_TYPES.map(service => ({
        platform: 'instagram',
        service,
        enabled: service === 'reels',
        price: service === 'reels' ? { amount: 5000, currency: 'USD' } : null,
      })),
    },
  });
  const services = useLookupItems('service_types');
  const serviceLabel = useCallback(
    (service: ServiceType) =>
      services.items.find(item => item.value === service)?.label ?? service,
    [services.items],
  );
  const tiers = useFollowerTierOptions();
  const [sheetVisible, setSheetVisible] = useState(false);
  const openSheet = useCallback(() => setSheetVisible(true), []);
  const closeSheet = useCallback(() => setSheetVisible(false), []);
  const supportsLookup = useCallback(() => false, []);
  const [instagramLink, setInstagramLink] = useState('https://instagram.com/sada');
  const [websiteLink, setWebsiteLink] = useState('not a link');

  return {
    control,
    rows: ROWS,
    serviceLabel,
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
