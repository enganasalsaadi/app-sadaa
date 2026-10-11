import React, { memo, useMemo } from 'react';
import { Box, StaggerIn } from '@/shared/ui';
import type { MediaKitServicesModel } from '../../hooks/useMediaKitServices';
import type { PublicMediaKit } from '../../types/mediaKit';
import { toShowcaseAudience, toWorkedWith } from '../../utils/mediaKitShowcase';
import { MediaKitAudienceCard } from './MediaKitAudienceCard';
import { MediaKitPlatformsRail } from './MediaKitPlatformsRail';
import { MediaKitServicesSection } from './MediaKitServicesSection';
import { MediaKitTermsCard } from './MediaKitTermsCard';
import { MediaKitWorkedWithRail } from './MediaKitWorkedWithRail';
import { MediaKitWorkRail } from './MediaKitWorkRail';

export interface MediaKitShowcaseBodyProps {
  kit: PublicMediaKit;
  services: MediaKitServicesModel;
  /** Brand viewer with prices visible. */
  selectable: boolean;
  /** Above the sections (the creator's own "this is how brands see you" notice). */
  intro?: React.ReactNode;
}

/**
 * The kit below the hero, rising in section by section: platforms, audience, brands worked
 * with, past work, services, contract terms. A section without data stays out entirely.
 */
const MediaKitShowcaseBodyComponent: React.FC<MediaKitShowcaseBodyProps> = ({
  kit,
  services,
  selectable,
  intro,
}) => {
  const audience = useMemo(() => toShowcaseAudience(kit.audience), [kit.audience]);
  const workedWith = useMemo(() => toWorkedWith(kit.worked_with), [kit.worked_with]);
  const terms = kit.contract_terms?.items ?? [];

  return (
    <Box pt="2xl" pb="5xl">
      <StaggerIn gap="2xl">
        {intro ? <Box px="xl">{intro}</Box> : null}
        <MediaKitPlatformsRail platforms={kit.platforms} />
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
