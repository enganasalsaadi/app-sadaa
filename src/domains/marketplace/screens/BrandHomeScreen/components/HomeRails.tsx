import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react-native';
import { Box, EmptyState, Notice, StaggerIn } from '@/shared/ui';
import type { BrandHomeRail, ExploreCreator } from '../../../types/explore';
import type { BrandHomeScreenModel } from '../hooks/useBrandHomeScreen';
import { FastList } from './FastList';
import { HomeSkeleton } from './HomeSkeleton';
import { RailHeading } from './RailHeading';
import { RingsRail } from './RingsRail';
import { StoryDeck } from './StoryDeck';
import { VerifiedTiles } from './VerifiedTiles';

type HomeRailsProps = Pick<
  BrandHomeScreenModel,
  'status' | 'rails' | 'retry' | 'openCreator' | 'toggleShortlist' | 'openRail' | 'browseAll'
>;

interface RailProps {
  rail: BrandHomeRail;
  onOpen: (creator: ExploreCreator) => void;
  onToggleShortlist: (creator: ExploreCreator) => void;
  onSeeAll: (rail: BrandHomeRail) => void;
}

/** Every rail gets its own shape: deck, tall tiles, ruled list or story rings. */
const Rail = memo<RailProps>(({ rail, onOpen, onToggleShortlist, onSeeAll }) => {
  const { t } = useTranslation();
  const seeAll = useCallback(() => onSeeAll(rail), [onSeeAll, rail]);
  const onSeeAllOrNone = rail.seeAll ? seeAll : undefined;

  switch (rail.key) {
    case 'near_you':
      return (
        <Box gap="md">
          <RailHeading
            title={rail.title}
            subtitle={t('marketplace.brandHome.railCount', { count: rail.items.length })}
            onSeeAll={onSeeAllOrNone}
          />
          <StoryDeck creators={rail.items} onOpen={onOpen} onToggleShortlist={onToggleShortlist} />
        </Box>
      );
    case 'verified':
      return (
        <Box gap="md">
          <RailHeading
            title={rail.title}
            subtitle={t('marketplace.brandHome.verifiedSubtitle')}
            onSeeAll={onSeeAllOrNone}
          />
          <VerifiedTiles creators={rail.items} onOpen={onOpen} />
        </Box>
      );
    case 'fast_delivery':
      return (
        <Box gap="sm">
          <RailHeading
            title={rail.title}
            subtitle={t('marketplace.brandHome.fastSubtitle')}
            onSeeAll={onSeeAllOrNone}
          />
          <FastList creators={rail.items} onOpen={onOpen} />
        </Box>
      );
    case 'new':
    case 'recently_viewed':
      return (
        <Box gap="md">
          <RailHeading title={rail.title} onSeeAll={onSeeAllOrNone} />
          <RingsRail creators={rail.items} onOpen={onOpen} />
        </Box>
      );
    default: {
      const _exhaustive: never = rail.key;
      return _exhaustive;
    }
  }
});

/**
 * Home body: the server's rails in server order, each in its own shape, rising in once.
 * Skeleton while loading, a retry banner on failure, an Explore prompt when every rail is empty.
 */
const HomeRailsComponent: React.FC<HomeRailsProps> = ({
  status,
  rails,
  retry,
  openCreator,
  toggleShortlist,
  openRail,
  browseAll,
}) => {
  const { t } = useTranslation();

  if (status === 'loading') return <HomeSkeleton />;

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

  if (rails.length === 0) {
    return (
      <Box px="xl">
        <EmptyState
          icon={Users}
          title={t('marketplace.brandHome.empty.title')}
          message={t('marketplace.brandHome.empty.message')}
          action={{ label: t('marketplace.brandHome.empty.explore'), onPress: browseAll, variant: 'secondary' }}
        />
      </Box>
    );
  }

  return (
    <StaggerIn gap="4xl">
      {rails.map(rail => (
        <Rail
          key={rail.key}
          rail={rail}
          onOpen={openCreator}
          onToggleShortlist={toggleShortlist}
          onSeeAll={openRail}
        />
      ))}
    </StaggerIn>
  );
};

export const HomeRails = memo(HomeRailsComponent);
