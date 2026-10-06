import React, { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import {
  Box,
  Card,
  GradientSurface,
  Layout,
  Notice,
  ProgressBar,
  SectionHeader,
  Text,
  useHeroCompact,
} from '@/shared/ui';
import { DemoScrollRows } from '../components';

const noop = () => {};
const UNREAD_COUNT = 3;
const DEMO_PROGRESS = 0.65;

const DashboardHero = memo(() => {
  const { t } = useTranslation();
  const { colors, sizes, spacing } = useTheme();
  const { top } = useSafeAreaInsets();
  const compact = useHeroCompact();
  const styles = useStyles(
    () => ({ container: { paddingTop: top + spacing.sm * 2 + sizes.iconButton.md } }),
    [top, spacing.sm, sizes.iconButton.md],
  );

  return (
    <GradientSurface variant="brand" style={styles.container} px="xl" pb="xl" gap="xs">
      <Text variant={compact ? 'h4' : 'h3'} color={colors.text.onBrand}>
        {t('devShowcase.layoutGallery.dashboardGreeting')}
      </Text>
      <Text variant="bodySmall" color={colors.text.onBrandMuted}>
        {t('devShowcase.layoutGallery.dashboardDescription')}
      </Text>
    </GradientSurface>
  );
});

/**
 * Layout gallery variant: the Dashboard archetype (creator Home). Compact navy greeting
 * band as `hero` under an overlay header, one notice, then stacked card sections.
 */
const LayoutDashboardScreenComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layout
      padding="none"
      statusBar="light"
      headerBehavior="overlay"
      header={{
        title: t('devShowcase.layoutGallery.dashboardTitle'),
        variant: 'brand',
        actions: [
          {
            icon: Bell,
            accessibilityLabel: t('devShowcase.iconButton.notifications'),
            onPress: noop,
            badge: UNREAD_COUNT,
          },
        ],
      }}
      hero={<DashboardHero />}
    >
      <Box gap="2xl" pt="xl" pb="5xl" px="xl">
        <Notice tone="info" message={t('devShowcase.layoutGallery.dashboardNotice')} />
        <Card shadow="none" p="lg">
          <ProgressBar
            value={DEMO_PROGRESS}
            label={t('devShowcase.layoutGallery.dashboardSection')}
            accessibilityLabel={t('devShowcase.layoutGallery.dashboardSection')}
          />
        </Card>
        <Box gap="md">
          <SectionHeader
            title={t('devShowcase.layoutGallery.dashboardSection')}
            action={{ label: t('devShowcase.layoutGallery.dashboardManage'), onPress: noop }}
          />
          <DemoScrollRows />
        </Box>
      </Box>
    </Layout>
  );
};

export const LayoutDashboardScreen = memo(LayoutDashboardScreenComponent);
