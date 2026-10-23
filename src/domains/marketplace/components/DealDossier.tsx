import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import { useDealCopy } from '../hooks/useDealCopy';
import type { Deal, DealRole } from '../types';
import { CampaignBriefLock } from './CampaignBriefLock';
import { DealDossierBlock } from './DealDossierBlock';
import { DealDossierFiles } from './DealDossierFiles';
import { DealDossierItem } from './DealDossierItem';
import { DealDossierLogistics } from './DealDossierLogistics';
import { DealDossierScript } from './DealDossierScript';
import { DealDossierTags } from './DealDossierTags';

type DossierBlockKey = 'items' | 'brief' | 'script' | 'tags' | 'files' | 'logistics';

const BLOCK_TITLE = {
  items: {
    brand: 'marketplace.deals.dossier.blocks.itemsBrand',
    creator: 'marketplace.deals.dossier.blocks.itemsCreator',
  },
  brief: {
    brand: 'marketplace.deals.dossier.blocks.brief',
    creator: 'marketplace.deals.dossier.blocks.brief',
  },
  script: {
    brand: 'marketplace.deals.dossier.blocks.script',
    creator: 'marketplace.deals.dossier.blocks.script',
  },
  tags: {
    brand: 'marketplace.deals.dossier.blocks.tags',
    creator: 'marketplace.deals.dossier.blocks.tags',
  },
  files: {
    brand: 'marketplace.deals.dossier.blocks.files',
    creator: 'marketplace.deals.dossier.blocks.files',
  },
  logistics: {
    brand: 'marketplace.deals.dossier.blocks.logistics',
    creator: 'marketplace.deals.dossier.blocks.logistics',
  },
} as const satisfies Record<DossierBlockKey, Record<DealRole, ParseKeys>>;

export interface DealDossierProps {
  deal: Deal;
  role: DealRole;
}

/**
 * «ملف العرض» (approved 2026-10-15): the whole offer in one place for both roles, in numbered
 * chapters: what was ordered (add-ons, windows, revisions, retention, status), what the ad says
 * and avoids, the tags/code/link to paste, the attached files, and delivery/shipping. Chapters
 * without data are left out and the numbers close up.
 */
const DealDossierComponent: React.FC<DealDossierProps> = ({ deal, role }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const copy = useDealCopy();
  const { brief, briefAttachments: files, items } = deal;

  const hasScript =
    brief !== null && brief.talkingPoints.length + brief.donts.length > 0;
  const hasTags =
    brief !== null &&
    (brief.hashtags.length + brief.mentions.length > 0 ||
      brief.promoCode !== null ||
      brief.trackingLink !== null);
  const blocks: DossierBlockKey[] = [
    ...(items.length > 0 ? (['items'] as const) : []),
    // Linked deal, not funded yet: the private brief is sealed from the creator (PC6.2).
    ...(deal.briefHidden ? (['brief'] as const) : []),
    ...(hasScript ? (['script'] as const) : []),
    ...(hasTags ? (['tags'] as const) : []),
    ...(files.length > 0 ? (['files'] as const) : []),
    'logistics',
  ];

  const body = (key: DossierBlockKey): React.ReactNode => {
    switch (key) {
      case 'items':
        return (
          <Box gap="md">
            {items.map(item => (
              <DealDossierItem key={item.id} item={item} role={role} />
            ))}
          </Box>
        );
      case 'brief':
        return <CampaignBriefLock body={t('marketplace.deals.dossier.briefLocked')} />;
      case 'script':
        return brief ? (
          <DealDossierScript
            talkingPoints={brief.talkingPoints}
            donts={brief.donts}
          />
        ) : null;
      case 'tags':
        return brief ? (
          <DealDossierTags
            hashtags={brief.hashtags}
            mentions={brief.mentions}
            promoCode={brief.promoCode}
            trackingLink={brief.trackingLink}
            role={role}
            onCopy={copy}
          />
        ) : null;
      case 'files':
        return <DealDossierFiles files={files} dealRef={{ role, id: deal.id }} />;
      case 'logistics':
        return <DealDossierLogistics deal={deal} role={role} />;
      default: {
        const _exhaustive: never = key;
        return _exhaustive;
      }
    }
  };

  return (
    <Box gap="xl">
      <Box row align="flex-end" justify="space-between" gap="md">
        <Text
          variant="h3"
          color={colors.text.primary}
          accessibilityRole="header"
        >
          {t('marketplace.deals.dossier.title')}
        </Text>
        <Box flex={1} align="flex-end">
          <Text
            variant="caption"
            color={colors.text.tertiary}
            numberOfLines={1}
          >
            {t('marketplace.deals.dossier.summary', {
              items: t('marketplace.deals.dossier.items', {
                count: items.length,
              }),
              mode: deal.shippingMode.label,
            })}
          </Text>
        </Box>
      </Box>
      {blocks.map((key, index) => (
        <DealDossierBlock
          key={key}
          number={index + 1}
          title={t(BLOCK_TITLE[key][role], { count: files.length })}
        >
          {body(key)}
        </DealDossierBlock>
      ))}
    </Box>
  );
};

export const DealDossier = memo(DealDossierComponent);
