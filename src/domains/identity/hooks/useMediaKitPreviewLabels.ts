import { useMemo } from 'react';
import { useLookupItems } from '@/core/api';
import type { PublicMediaKit } from '../types/mediaKit';
import { labelNiches } from '../utils/mediaKitCard';
import { buildRateRows } from '../utils/rateRows';

/** Localised niches (from `/lookups`) + rate rows (labels come with the cards) for `MediaKitPreview`. */
export const useMediaKitPreviewLabels = (preview: PublicMediaKit | undefined) => {
  const { items: nicheOptions } = useLookupItems('niches');

  const nicheLabels = useMemo(
    () => (preview ? labelNiches(preview.niches, nicheOptions, preview.niches.length) : []),
    [nicheOptions, preview],
  );

  const rateRows = useMemo(
    () => (preview ? buildRateRows(preview.rate_cards, preview.platforms) : []),
    [preview],
  );

  return { nicheLabels, rateRows };
};
