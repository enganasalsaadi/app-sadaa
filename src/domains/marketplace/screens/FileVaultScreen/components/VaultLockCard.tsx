import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react-native';
import { iconStroke, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

/** Creator before funding: the brief files exist but open once the brand funds the deal. */
const VaultLockCardComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Box mt="lg" p="lg" row align="center" gap="md" borderRadius="lg" bg={colors.brand.soft} accessible>
      <Box
        width={sizes.iconButton.md}
        height={sizes.iconButton.md}
        borderRadius="md"
        align="center"
        justify="center"
        bg={colors.brand.main}
      >
        <Lock size={sizes.icon.sm} color={colors.text.onBrand} strokeWidth={iconStroke.regular} />
      </Box>
      <Box flex={1} gap="xs">
        <Text variant="bodyMedium" color={colors.brand.text}>
          {t('marketplace.vault.lock.title')}
        </Text>
        <Text variant="caption" color={colors.text.secondary}>
          {t('marketplace.vault.lock.body')}
        </Text>
      </Box>
    </Box>
  );
};

export const VaultLockCard = memo(VaultLockCardComponent);
