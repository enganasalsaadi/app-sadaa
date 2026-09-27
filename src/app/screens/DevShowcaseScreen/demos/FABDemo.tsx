import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react-native';
import { Box, FAB, Text } from '@/shared/ui';
import { useTheme } from '@/core/theme';

const noop = () => {};

/** The FAB pins to its parent's bottom-end corner, so each sits on a stand-in screen. */
const FABDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <Box gap="md">
      <Text variant="caption" color={colors.text.secondary}>
        {t('devShowcase.fab.stageHint')}
      </Text>
      <Box height={sizes.illustration.lg} borderRadius="lg" bg={colors.layout.base}>
        <FAB icon={Plus} onPress={noop} accessibilityLabel={t('devShowcase.fab.newCampaign')} />
      </Box>
      <Box height={sizes.illustration.lg} borderRadius="lg" bg={colors.layout.base}>
        <FAB
          icon={Plus}
          label={t('devShowcase.fab.newCampaign')}
          onPress={noop}
          accessibilityLabel={t('devShowcase.fab.newCampaign')}
        />
      </Box>
    </Box>
  );
};

export const FABDemo = memo(FABDemoComponent);
