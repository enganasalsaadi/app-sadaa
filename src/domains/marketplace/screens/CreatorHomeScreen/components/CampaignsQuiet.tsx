import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Inbox } from 'lucide-react-native';
import { iconStroke, moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';

const MARK = moderateScale(48);

interface CampaignsQuietProps {
  /** Opens the rate cards: the profile and prices are what the feed matches on. */
  onSetRates: () => void;
}

/** No campaign fits yet: a calm dashed card that points to what widens the match. */
const CampaignsQuietComponent: React.FC<CampaignsQuietProps> = ({ onSetRates }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ borderWidths }): Record<'card', ViewStyle> => ({
      card: { borderWidth: borderWidths.sm, borderStyle: 'dashed', borderColor: colors.border.strong },
    }),
    [colors.border.strong],
  );
  const title = t('marketplace.creatorHome.campaigns.quiet.title');
  const message = t('marketplace.creatorHome.campaigns.quiet.message');

  return (
    <Pressable
      row
      align="center"
      gap="lg"
      mx="xl"
      p="lg"
      borderRadius="xl"
      style={styles.card}
      onPress={onSetRates}
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${message}`}
    >
      <Box
        width={MARK}
        height={MARK}
        borderRadius="full"
        bg={colors.interactive.soft}
        align="center"
        justify="center"
      >
        <Inbox size={sizes.icon.md} color={colors.interactive.text} strokeWidth={iconStroke.bold} />
      </Box>
      <Box flex={1}>
        <Text variant="title" numberOfLines={2}>
          {title}
        </Text>
        <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={2}>
          {message}
        </Text>
      </Box>
    </Pressable>
  );
};

export const CampaignsQuiet = memo(CampaignsQuietComponent);
