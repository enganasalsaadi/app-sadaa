import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react-native';
import { openAppStore } from '@/core/config';
import { useTheme, moderateScale } from '@/core/theme';
import { Box, Text, Layout } from '@/shared/ui';

/** Blocking gate (AppStatus.UPDATE_REQUIRED): no way past it except updating. */
const ForceUpdateScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const onUpdate = useCallback(() => {
    openAppStore().catch(() => undefined);
  }, []);

  return (
    <Layout
      withScroll={false}
      ctaButton={{ label: t('appUpdate.cta'), onPress: onUpdate, alwaysSolid: true }}
    >
      <Box flex={1} align="center" justify="center" px="xl">
        <Box
          width={moderateScale(80)}
          height={moderateScale(80)}
          borderRadius="lg"
          bg={colors.interactive.soft}
          align="center"
          justify="center"
          mb="2xl"
        >
          <Download size={moderateScale(36)} color={colors.interactive.main} />
        </Box>
        <Text variant="h2" color={colors.text.primary} align="center" mb="md">
          {t('appUpdate.title')}
        </Text>
        <Text variant="body" color={colors.text.secondary} align="center">
          {t('appUpdate.subtitle')}
        </Text>
      </Box>
    </Layout>
  );
};

export const ForceUpdateScreen = memo(ForceUpdateScreenComponent);
