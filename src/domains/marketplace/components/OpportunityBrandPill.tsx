import React, { memo } from 'react';
import { BadgeCheck } from 'lucide-react-native';
import type { TextStyle } from 'react-native';
import { iconStroke, moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Image, RatingMark, Text } from '@/shared/ui';
import type { CreatorCampaignBrand } from '../types/campaign';
import { monogramOf } from '../utils/creatorText';

const AVATAR = moderateScale(24);
const NAME_MAX_WIDTH = moderateScale(170);

export interface OpportunityBrandPillProps {
  brand: CreatorCampaignBrand;
}

/**
 * The brand over the cover: frosted pill with its avatar (or first letter), name, the verified tick
 * and its public ★ rating when the server has one.
 */
const OpportunityBrandPillComponent: React.FC<OpportunityBrandPillProps> = ({ brand }) => {
  const { colors, sizes } = useTheme();
  const styles = useStyles((): Record<'name', TextStyle> => ({ name: { maxWidth: NAME_MAX_WIDTH } }));
  return (
    <Box
      row
      align="center"
      gap="sm"
      ps="xs"
      pe="md"
      py="xs"
      borderRadius="full"
      bg={colors.media.glass}
      borderWidth="thin"
      borderColor={colors.media.glassBorder}
    >
      <Box
        width={AVATAR}
        height={AVATAR}
        borderRadius="full"
        overflow="hidden"
        align="center"
        justify="center"
        bg={colors.brand.soft}
      >
        {brand.avatarUrl ? (
          <Image uri={brand.avatarUrl} width="100%" height="100%" />
        ) : (
          <Text variant="label" color={colors.brand.text}>
            {monogramOf(brand.name)}
          </Text>
        )}
      </Box>
      <Text variant="bodySmall" color={colors.text.onBrand} numberOfLines={1} style={styles.name}>
        {brand.name}
      </Text>
      {brand.verified ? (
        <BadgeCheck size={sizes.icon.xs} color={colors.text.onBrand} strokeWidth={iconStroke.bold} />
      ) : null}
      {brand.rating ? (
        <RatingMark value={brand.rating.average} count={brand.rating.count} surface="onBrand" />
      ) : null}
    </Box>
  );
};

export const OpportunityBrandPill = memo(OpportunityBrandPillComponent);
