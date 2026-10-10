import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, EmptyState, Notice, Skeleton, StaggerIn } from '@/shared/ui';
import { CREATOR_RAIL_CARD_WIDTH, CREATOR_RAIL_PHOTO_HEIGHT } from '../../../components/CreatorCard';
import type { BrandHomeScreenModel } from '../hooks/useBrandHomeScreen';
import { CreatorRail } from './CreatorRail';
import { SupportCard } from './SupportCard';

/** Placeholder ≈ a loaded rail card: the 4:5 photo, then name, city and the price block. */
const CARD_SKELETON_HEIGHT = CREATOR_RAIL_PHOTO_HEIGHT + moderateScale(128);
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
> & {
  /** Wallet card: after the first rail, or above the placeholder / error / empty state. */
  wallet: React.ReactNode;
};

/** The wallet follows this many rails, so the first creators stay on top. */
const WALLET_AFTER_RAILS = 1;
const WALLET_KEY = 'wallet';

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
 * Home body: the server's rails rising in one by one with the wallet card after the first,
 * then the help card. Skeleton rails while Home loads, a retry banner when it fails, an Explore prompt when every rail is empty.
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
  wallet,
}) => {
  const { t } = useTranslation();
  const walletCard = <Box px="xl">{wallet}</Box>;

  if (status === 'loading') {
    return (
      <Box gap="2xl">
        {walletCard}
        <RailsSkeleton />
      </Box>
    );
  }

  if (status === 'error') {
    return (
      <Box px="xl" gap="2xl">
        {wallet}
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
      {rails.length === 0 ? walletCard : null}
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
      {/* Flat siblings, so the wallet gets its own stagger slot and gap. */}
      {rails.flatMap((rail, index) => {
        const card = (
          <CreatorRail
            key={rail.key}
            rail={rail}
            onOpenCreator={openCreator}
            onToggleShortlist={toggleShortlist}
            onSeeAll={openRail}
          />
        );
        return index === Math.min(WALLET_AFTER_RAILS, rails.length) - 1
          ? [card, <Box key={WALLET_KEY} px="xl">{wallet}</Box>]
          : [card];
      })}
      {hasSupport ? (
        <Box px="xl">
          <SupportCard onContact={contactSupport} />
        </Box>
      ) : null}
    </StaggerIn>
  );
};

export const BrandHomeRails = memo(BrandHomeRailsComponent);
