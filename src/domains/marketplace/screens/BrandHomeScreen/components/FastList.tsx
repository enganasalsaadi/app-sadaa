import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, MoneyText, Pressable, Text } from '@/shared/ui';
import type { ExploreCreator } from '../../../types/explore';
import { nicheCityOf } from '../../../utils/creatorText';
import { CreatorMedia } from './CreatorMedia';
import { VerifiedMark } from './VerifiedMark';

const PHOTO_SIZE = moderateScale(84);
const DAYS_WIDTH = moderateScale(60);

interface FastListProps {
  creators: ExploreCreator[];
  onOpen: (creator: ExploreCreator) => void;
}

/** "Starts at $80" on its own line; 🔒 when prices are hidden. */
const RowPrice = memo<{ creator: ExploreCreator }>(({ creator }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { price } = creator;
  if (price.locked) return <Lock size={sizes.icon.xs} color={colors.icon.secondary} />;
  if (!price.from) return null;
  return (
    <Box row align="center" gap="xs">
      <Text variant="caption" color={colors.text.tertiary}>
        {t('marketplace.creator.priceFrom')}
      </Text>
      <MoneyText value={price.from} size="md" precision="currency" />
    </Box>
  );
});

/** The day count as the row's anchor: a big teal figure on a soft tile. */
const DaysTile = memo<{ days: number }>(({ days }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Box
      width={DAYS_WIDTH}
      height={PHOTO_SIZE}
      borderRadius="lg"
      align="center"
      justify="center"
      bg={colors.interactive.soft}
    >
      <Text variant="h2" color={colors.interactive.text}>
        {days}
      </Text>
      <Text variant="caption" color={colors.interactive.text}>
        {t('marketplace.brandHome.dayUnit', { count: days })}
      </Text>
    </Box>
  );
});

const FastRow = memo<{ creator: ExploreCreator; first: boolean; onOpen: (creator: ExploreCreator) => void }>(
  ({ creator, first, onOpen }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const styles = useStyles(() => ({ name: { flexShrink: 1 } }), []);
    const open = useCallback(() => onOpen(creator), [creator, onOpen]);
    const meta = nicheCityOf(creator);
    const days = creator.fastestDeliveryDays;
    return (
      <Pressable
        row
        align="center"
        gap="md"
        py="lg"
        borderTopWidth={first ? undefined : 'thin'}
        borderColor={colors.border.default}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={
          days !== null
            ? t('marketplace.brandHome.fastRowLabel', {
                name: creator.displayName,
                delivery: t('marketplace.creator.deliveryDays', { count: days }),
              })
            : creator.displayName
        }
      >
        <Box width={PHOTO_SIZE} height={PHOTO_SIZE} borderRadius="lg" overflow="hidden">
          <CreatorMedia creator={creator} monogram="h3" />
        </Box>
        <Box flex={1} gap="sm">
          <Box gap="xs">
            <Box row align="center" gap="xs">
              <Box style={styles.name}>
                <Text variant="title" numberOfLines={1}>
                  {creator.displayName}
                </Text>
              </Box>
              {creator.badges.kycVerified ? <VerifiedMark size="sm" /> : null}
            </Box>
            {meta ? (
              <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
                {meta}
              </Text>
            ) : null}
          </Box>
          <RowPrice creator={creator} />
        </Box>
        {days !== null ? <DaysTile days={days} /> : null}
      </Pressable>
    );
  },
);

/**
 * Fast delivery rail as a ruled list: photo, then four quiet lines (name + ✓, niche · city,
 * tier + followers, starting price), and the delivery days as the big figure at the reading end.
 */
const FastListComponent: React.FC<FastListProps> = ({ creators, onOpen }) => (
  <Box px="xl">
    {creators.map((creator, index) => (
      <FastRow key={creator.slug} creator={creator} first={index === 0} onOpen={onOpen} />
    ))}
  </Box>
);

export const FastList = memo(FastListComponent);
