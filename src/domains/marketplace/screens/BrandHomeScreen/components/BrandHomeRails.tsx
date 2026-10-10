import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, EmptyState, Notice, Skeleton, StaggerIn } from '@/shared/ui';
import { CREATOR_RAIL_CARD_WIDTH } from '../../../components/CreatorCard';
import type { BrandHomeScreenModel } from '../hooks/useBrandHomeScreen';
import { CreatorRail } from './CreatorRail';
import { SupportCard } from './SupportCard';

/** Placeholder ≈ a loaded rail card (avatar, name, followers, price). */
const CARD_SKELETON_HEIGHT = moderateScale(188);
const TITLE_SKELETON_WIDTH = '40%';
const SKELETON_RAILS = ['a', 'b'] as const;
const SKELETON_CARDS = ['a', 'b', 'c'] as const;

type BrandHomeRailsProps = Pick<
  BrandHomeScreenModel,
  | 'status'
  | 'rails'
  | 'hasSupport'
  | 'retry'
  | 'openCreator'
  | 'toggleShortlist'
  | 'contactSupport'
  | 'openRail'
  | 'browseAll'
>;

const RailsSkeleton = memo(() => {
  const { typography } = useTheme();
  return (
    <Box gap="2xl">
      {SKELETON_RAILS.map(rail => (
        <Box key={rail} gap="md">
          <Box px="xl">
            <Skeleton
              width={TITLE_SKELETON_WIDTH}
              height={typography.title.lineHeight}
              borderRadius="xs"
            />
          </Box>
          {/* Clipped at the screen edge like a real rail, so it reads as swipeable. */}
          <Box row gap="md" ps="xl" overflow="hidden">
            {SKELETON_CARDS.map(card => (
              <Skeleton
                key={card}
                width={CREATOR_RAIL_CARD_WIDTH}
                height={CARD_SKELETON_HEIGHT}
                borderRadius="lg"
              />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
});

/**
 * Home body: the server's rails rising in one by one, then the help card. Skeleton rails
 * while Home loads, a retry banner when it fails, an Explore prompt when every rail is empty.
 */
const BrandHomeRailsComponent: React.FC<BrandHomeRailsProps> = ({
  status,
  rails,
  hasSupport,
  retry,
  openCreator,
  toggleShortlist,
  contactSupport,
  openRail,
  browseAll,
}) => {
  const { t } = useTranslation();

  if (status === 'loading') return <RailsSkeleton />;

  if (status === 'error') {
    return (
      <Box px="xl">
        <Notice
          tone="danger"
          message={t('marketplace.brandHome.loadFailed')}
          action={{ label: t('common.retry'), onPress: retry }}
        />
      </Box>
    );
  }

  return (
    <StaggerIn gap="2xl">
      {rails.length === 0 ? (
        <Box px="xl">
          <EmptyState
            icon={Users}
            title={t('marketplace.brandHome.empty.title')}
            message={t('marketplace.brandHome.empty.message')}
            action={{ label: t('marketplace.brandHome.empty.explore'), onPress: browseAll, variant: 'secondary' }}
          />
        </Box>
      ) : null}
      {rails.map(rail => (
        <CreatorRail
          key={rail.key}
          rail={rail}
          onOpenCreator={openCreator}
          onToggleShortlist={toggleShortlist}
          onSeeAll={openRail}
        />
      ))}
      {hasSupport ? (
        <Box px="xl">
          <SupportCard onContact={contactSupport} />
        </Box>
      ) : null}
    </StaggerIn>
  );
};

export const BrandHomeRails = memo(BrandHomeRailsComponent);
