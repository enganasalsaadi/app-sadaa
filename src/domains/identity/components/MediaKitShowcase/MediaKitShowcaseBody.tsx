import React, { memo, useMemo } from 'react';
import { Box, StaggerIn } from '@/shared/ui';
import type { MediaKitServicesModel } from '../../hooks/useMediaKitServices';
import type { PublicMediaKit } from '../../types/mediaKit';
import { toShowcaseAudience, toWorkedWith, type ShowcaseMetric } from '../../utils/mediaKitShowcase';
import { MediaKitAudienceCard } from './MediaKitAudienceCard';
import { MediaKitHighlightsCard } from './MediaKitHighlightsCard';
import { MediaKitIdentity } from './MediaKitIdentity';
import { MediaKitPlatformsRail } from './MediaKitPlatformsRail';
import { MediaKitServicesSection } from './MediaKitServicesSection';
import { MediaKitTermsCard } from './MediaKitTermsCard';
import { MediaKitWorkedWithRail } from './MediaKitWorkedWithRail';
import { MediaKitWorkRail } from './MediaKitWorkRail';

export interface MediaKitShowcaseBodyProps {
  kit: PublicMediaKit;
  nicheLabels: readonly string[];
  /** Server highlights only (`buildShowcaseMetrics`); empty keeps the section out. */
  metrics: readonly ShowcaseMetric[];
  services: MediaKitServicesModel;
  /** Brand viewer with prices visible. */
  selectable: boolean;
  /** Under the identity (the creator's own "this is how brands see you" notice). */
  intro?: React.ReactNode;
}

/**
 * The pitch on the sheet under the cover: identity, then platforms, highlights, audience,
 * brands worked with, past work, services and contract terms, rising in one by one. A section
 * without data stays out entirely, so the stubbed v2 parts light up when the server fills them.
 */
const MediaKitShowcaseBodyComponent: React.FC<MediaKitShowcaseBodyProps> = ({
  kit,
  nicheLabels,
  metrics,
  services,
  selectable,
  intro,
}) => {
  const audience = useMemo(() => toShowcaseAudience(kit.audience), [kit.audience]);
  const workedWith = useMemo(() => toWorkedWith(kit.worked_with), [kit.worked_with]);
  const terms = kit.contract_terms?.items ?? [];

  return (
    <Box pb="5xl" gap="2xl">
      <MediaKitIdentity kit={kit} nicheLabels={nicheLabels} />
      <StaggerIn gap="2xl">
        {intro ? <Box px="xl">{intro}</Box> : null}
        <MediaKitPlatformsRail platforms={kit.platforms} />
        <MediaKitHighlightsCard metrics={metrics} />
        {audience ? <MediaKitAudienceCard audience={audience} /> : null}
        {workedWith ? <MediaKitWorkedWithRail workedWith={workedWith} /> : null}
        {kit.top_portfolio_items.length > 0 ? <MediaKitWorkRail items={kit.top_portfolio_items} /> : null}
        <MediaKitServicesSection services={services} selectable={selectable} />
        {terms.length > 0 ? <MediaKitTermsCard terms={terms} /> : null}
      </StaggerIn>
    </Box>
  );
};

export const MediaKitShowcaseBody = memo(MediaKitShowcaseBodyComponent);
