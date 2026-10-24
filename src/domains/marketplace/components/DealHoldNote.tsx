import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Pause } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

/**
 * Account hold, in place of a countdown (rating window, retention answer, return waybill): the
 * clock is stopped while Sada reviews an account. Never says whose (the API doesn't either).
 */
const DealHoldNoteComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, spacing }): Record<'note', ViewStyle> => ({
      note: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        borderRadius: radii.md,
        backgroundColor: colors.surface.elevated,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
      },
    }),
    [colors.surface.elevated],
  );
  return (
    <Box style={styles.note} accessible>
      <Pause size={sizes.icon.sm} color={colors.icon.secondary} />
      <Box flex={1}>
        <Text variant="caption" color={colors.text.secondary}>
          {t('marketplace.deals.hold.paused')}
        </Text>
      </Box>
    </Box>
  );
};

export const DealHoldNote = memo(DealHoldNoteComponent);
