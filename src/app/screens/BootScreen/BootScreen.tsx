import React, { memo } from 'react';
import { ActivityIndicator, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStyles, useTheme } from '@/core/theme';
import type { Theme } from '@/core/theme';
import { Box, BrandLogo } from '@/shared/ui';

/** Same size as the native bootsplash symbol (scripts/logo/native.py SPLASH) so the hand-off is seamless. */
const SPLASH_SYMBOL = 112;

const styleFactory = ({ spacing }: Theme) => ({
  spinner: {
    position: 'absolute' as const,
    top: '50%' as const,
    marginTop: SPLASH_SYMBOL / 2 + spacing['3xl'],
  },
});

/**
 * Shown only when boot runs long: pixel-matches the native splash (navy + centred symbol)
 * and adds a spinner, so the user sees progress instead of a frozen splash.
 */
const BootScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);

  return (
    <Box flex={1} bg={colors.brand.main} align="center" justify="center">
      <StatusBar barStyle="light-content" />
      <BrandLogo variant="symbol" height={SPLASH_SYMBOL} surface="brand" />
      <ActivityIndicator
        style={styles.spinner}
        color={colors.text.onBrand}
        accessibilityLabel={t('common.loading')}
      />
    </Box>
  );
};

export const BootScreen = memo(BootScreenComponent);
