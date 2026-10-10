import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, LayoutFooter, Text } from '@/shared/ui';
import type { PriceLockNotice } from '../../../utils/priceLock';

interface PriceLockFooterProps {
  notice: PriceLockNotice;
  onAction: () => void;
}

/** Why the kit's prices are hidden + the one step that unlocks them (none while in review). */
const PriceLockFooterComponent: React.FC<PriceLockFooterProps> = ({ notice, onAction }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <LayoutFooter
      top={
        <Box row align="center" gap="md">
          <Lock size={sizes.icon.md} color={colors.interactive.main} />
          <Box flex={1} gap="xs">
            <Text variant="bodyMedium">{t(notice.title)}</Text>
            <Text variant="caption" color={colors.text.secondary}>
              {t(notice.body)}
            </Text>
          </Box>
        </Box>
      }
      primary={notice.cta ? { label: t(notice.cta.label), onPress: onAction } : undefined}
    />
  );
};

export const PriceLockFooter = memo(PriceLockFooterComponent);
