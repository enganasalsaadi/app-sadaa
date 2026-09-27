import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, MapPin } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import type { Money } from '@/core/money';
import { useTheme } from '@/core/theme';
import { Avatar, Box, Card, MoneyText, RatingStars, Tag, Text } from '@/shared/ui';

const MAX_NICHES = 3;

export interface CreatorCardProps {
  name: string;
  avatarUri?: string;
  city?: string;
  /** Localised niche names; the first three show. */
  niches: readonly string[];
  followers: number;
  rating?: number;
  ratingCount?: number;
  /** Lowest rate card price. */
  priceFrom?: Money;
  /** Verified / top creator (mustard, rule 08). */
  verified?: boolean;
  /** Picked for comparison (up to 3). */
  selected?: boolean;
  onPress: () => void;
}

/** Creator result in matching and search lists (`SuperList` item — keep it memoised). */
const CreatorCardComponent: React.FC<CreatorCardProps> = ({
  name,
  avatarUri,
  city,
  niches,
  followers,
  rating,
  ratingCount,
  priceFrom,
  verified = false,
  selected,
  onPress,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <Card onPress={onPress} selected={selected} accessibilityLabel={name}>
      <Box gap="md">
        <Box row align="center" gap="md">
          <Avatar uri={avatarUri} size={sizes.avatar.md} />
          <Box flex={1} gap="xs">
            <Box row align="center" gap="xs">
              <Text variant="title" numberOfLines={1}>
                {name}
              </Text>
              {verified ? (
                <BadgeCheck
                  size={sizes.icon.sm}
                  color={colors.premium.main}
                  accessibilityLabel={t('marketplace.creator.verified')}
                />
              ) : null}
            </Box>
            {city ? (
              <Box row align="center" gap="xs">
                <MapPin size={sizes.icon.xs} color={colors.icon.secondary} />
                <Text variant="caption" color={colors.text.secondary}>
                  {city}
                </Text>
              </Box>
            ) : null}
          </Box>
        </Box>

        {niches.length > 0 ? (
          <Box row wrap gap="xs">
            {niches.slice(0, MAX_NICHES).map(niche => (
              <Tag key={niche} label={niche} />
            ))}
          </Box>
        ) : null}

        <Box row align="center" justify="space-between" gap="md">
          <Box gap="xs">
            <Text variant="caption" color={colors.text.secondary}>
              {t('marketplace.creator.followers', {
                count: formatNumber(followers, { notation: 'compact', maximumFractionDigits: 1 }),
              })}
            </Text>
            {rating !== undefined ? <RatingStars value={rating} count={ratingCount} /> : null}
          </Box>
          {priceFrom ? (
            <Box align="flex-end" gap="xs">
              <Text variant="caption" color={colors.text.secondary}>
                {t('marketplace.creator.priceFrom')}
              </Text>
              <MoneyText value={priceFrom} />
            </Box>
          ) : null}
        </Box>
      </Box>
    </Card>
  );
};

export const CreatorCard = memo(CreatorCardComponent);
