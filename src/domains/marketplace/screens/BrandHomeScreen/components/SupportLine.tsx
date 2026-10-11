import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';

/** Closing line of the page: a quiet question and the WhatsApp link to the Sada team. */
const SupportLineComponent: React.FC<{ onContact: () => void }> = ({ onContact }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Box align="center" px="xl">
      <Text variant="bodySmall" color={colors.text.tertiary} align="center">
        {t('marketplace.brandHome.support.title')} {t('marketplace.brandHome.support.body')}
      </Text>
      <Pressable
        minHeight={sizes.button.md}
        justify="center"
        px="md"
        onPress={onContact}
        accessibilityRole="link"
        accessibilityLabel={t('marketplace.brandHome.support.action')}
      >
        <Text variant="buttonSmall" color={colors.interactive.text}>
          {t('marketplace.brandHome.support.action')}
        </Text>
      </Pressable>
    </Box>
  );
};

export const SupportLine = memo(SupportLineComponent);
