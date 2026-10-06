import { useCallback, useMemo } from 'react';
import { useLookupItems } from '@/core/api';
import type { ServiceType } from '@/domains/auth';
import type { PublicMediaKit } from '../types/mediaKit';
import { labelNiches } from '../utils/mediaKitCard';
import { buildRateRows } from '../utils/rateRows';

/** Localised niches + rate rows for `MediaKitPreview` (keys labelled from `/lookups`). */
export const useMediaKitPreviewLabels = (preview: PublicMediaKit | undefined) => {
  const { items: nicheOptions } = useLookupItems('niches');
  const { items: serviceOptions } = useLookupItems('service_types');

  const nicheLabels = useMemo(
    () => (preview ? labelNiches(preview.niches, nicheOptions, preview.niches.length) : []),
    [nicheOptions, preview],
  );

  const serviceLabel = useCallback(
    (service: ServiceType) => serviceOptions.find(item => item.value === service)?.label ?? service,
    [serviceOptions],
  );
  const rateRows = useMemo(
    () => (preview ? buildRateRows(preview.rate_cards, preview.platforms, serviceLabel) : []),
    [preview, serviceLabel],
  );

  return { nicheLabels, rateRows };
};
