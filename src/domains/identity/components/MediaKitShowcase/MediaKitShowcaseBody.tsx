import React, { memo, useMemo } from 'react';
import { Box } from '@/shared/ui';
import type { MediaKitServicesModel } from '../../hooks/useMediaKitServices';
import type { PublicMediaKit } from '../../types/mediaKit';
import { toShowcaseAudience, toWorkedWith, type ShowcaseMetric } from '../../utils/mediaKitShowcase';
import { MediaKitAudience } from './MediaKitAudience';
import { MediaKitBrands } from './MediaKitBrands';
import { MediaKitEscrow } from './MediaKitEscrow';
import { MediaKitHighlights } from './MediaKitHighlights';
import { MediaKitJoinCard } from './MediaKitJoinCard';
import { MediaKitRates } from './MediaKitRates';
import { MediaKitWorkMasonry } from './MediaKitWorkMasonry';

export interface MediaKitShowcaseBodyProps {
  kit: PublicMediaKit;
  /** Server highlights only (`buildShowcaseMetrics`); empty keeps the section out. */
  metrics: readonly ShowcaseMetric[];
  services: MediaKitServicesModel;
  /** Brand viewer with prices visible. */
  selectable: boolean;
  /** Above the first section (the creator's own "this is how brands see you" notice). */
  intro?: React.ReactNode;
  /** Visitors without an account get the join card at the end. */
  join?: { onCreator: () => void; onBrand: () => void };
}

/**
 * The pitch under the stage: numbers, audience, past work, brands, rates with the escrow
 * promise right under them, then (for visitors) the join card. Every section rises in as it
 * scrolls into view; a section without data stays out, so the stubbed v2 parts light up when
 * the server fills them.
 */
const MediaKitShowcaseBodyComponent: React.FC<MediaKitShowcaseBodyProps> = ({
  kit,
  metrics,
  services,
  selectable,
  intro,
  join,
}) => {
  const audience = useMemo(() => toShowcaseAudience(kit.audience), [kit.audience]);
  const workedWith = useMemo(() => toWorkedWith(kit.worked_with), [kit.worked_with]);
  const terms = kit.contract_terms?.items ?? [];

  return (
    <Box px="xl" pt="sm" pb="5xl" gap="4xl">
      {intro}
      <MediaKitHighlights metrics={metrics} highlights={kit.highlights} brands={workedWith?.items ?? []} />
      {audience ? <MediaKitAudience audience={audience} /> : null}
      <MediaKitWorkMasonry items={kit.top_portfolio_items} />
      {workedWith ? <MediaKitBrands workedWith={workedWith} /> : null}
      <MediaKitRates services={services} selectable={selectable} />
      <MediaKitEscrow terms={terms} />
      {join ? <MediaKitJoinCard onCreator={join.onCreator} onBrand={join.onBrand} /> : null}
    </Box>
  );
};

export const MediaKitShowcaseBody = memo(MediaKitShowcaseBodyComponent);
