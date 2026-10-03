import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, HeroSheet, Layout, LayoutFooter, Notice, Text } from '@/shared/ui';
import { AuthLogoHero } from '../../components/AuthLogoHero';
import { useSuspendedScreen } from './hooks/useSuspendedScreen';

const ICON_TILE_SIZE = moderateScale(56);

/** Blocking gate (AppStatus.SUSPENDED): support, re-check and logout are all that work. */
const SuspendedScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { onContactSupport, onCheckAgain, isChecking, onLogout, isLoggingOut } =
    useSuspendedScreen();

  return (
    <HeroSheet header={<AuthLogoHero />}>
      <Layout
        padding={{ y: '2xl' }}
        footer={
          <LayoutFooter
            primary={{ label: t('auth.suspended.contactSupport'), onPress: onContactSupport }}
            secondary={{
              label: t('auth.suspended.checkAgain'),
              onPress: onCheckAgain,
              loading: isChecking,
              disabled: isLoggingOut,
              variant: 'secondary',
            }}
            tertiary={{
              label: t('auth.suspended.logout'),
              onPress: onLogout,
              loading: isLoggingOut,
              disabled: isChecking,
            }}
          />
        }
      >
        <Box gap="2xl">
          <Box gap="lg">
            <Box
              width={ICON_TILE_SIZE}
              height={ICON_TILE_SIZE}
              borderRadius="lg"
              bg={colors.status.danger.soft}
              align="center"
              justify="center"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <ShieldAlert size={sizes.icon.lg} color={colors.status.danger.main} />
            </Box>
            <Box gap="xs">
              <Text variant="h2" color={colors.text.primary} accessibilityRole="header">
                {t('auth.suspended.title')}
              </Text>
              <Text variant="body" color={colors.text.secondary}>
                {t('auth.suspended.body')}
              </Text>
            </Box>
          </Box>
          <Notice tone="info" message={t('auth.suspended.notice')} />
        </Box>
      </Layout>
    </HeroSheet>
  );
};

export const SuspendedScreen = memo(SuspendedScreenComponent);
