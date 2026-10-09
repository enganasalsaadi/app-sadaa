import React, { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import {
  Avatar,
  Box,
  Card,
  Layout,
  Notice,
  ProgressBar,
  SectionHeader,
  Text,
  useHeroCompact,
} from '@/shared/ui';
import { DemoScrollRows } from '../components';
import { MOCK_IMAGE_URIS } from '../demos/mockData';

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

  // Transparent: Layout paints the navy gradient behind it (`heroBackdrop="brandGlow"`).
  return (
    <Box style={styles.container} px="xl" pb="4xl" gap="xs">
      <Text variant={compact ? 'h4' : 'h3'} color={colors.text.onBrand}>
        {t('devShowcase.layoutGallery.dashboardGreeting')}
      </Text>
      <Text variant="bodySmall" color={colors.text.onBrandMuted}>
        {t('devShowcase.layoutGallery.dashboardDescription')}
      </Text>
    </Box>
  );
});

/** What stays pinned once the hero scrolls away: identity, not a generic title. */
const DashboardBarIdentity = memo(() => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Box row align="center" gap="sm">
      <Avatar uri={MOCK_IMAGE_URIS[0]} size={sizes.avatar.sm} />
      <Text variant="title" color={colors.text.onBrand} numberOfLines={1}>
        {t('devShowcase.layoutGallery.dashboardGreeting')}
      </Text>
    </Box>
  );
});

/**
 * Layout gallery variant: the Dashboard archetype (creator Home). Compact greeting band
 * as `hero` over the brand backdrop (parallax, stretches on pull-down, body slides over
 * it as a rounded sheet) under an overlay header whose `leading` identity fades in once
 * the hero scrolls away, one notice, then stacked sections.
 */
const LayoutDashboardScreenComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layout
      padding="none"
      statusBar="light"
      headerBehavior="overlay"
      heroBackdrop="brandGlow"
      heroBehavior="parallax"
      header={{
        title: t('devShowcase.layoutGallery.dashboardTitle'),
        variant: 'brand',
        leading: <DashboardBarIdentity />,
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
        <Card p="lg">
          <ProgressBar
            value={DEMO_PROGRESS}
            label={t('devShowcase.layoutGallery.dashboardSection')}
            accessibilityLabel={t('devShowcase.layoutGallery.dashboardSection')}
          />
        </Card>
        <Box gap="md">
          <SectionHeader
            title={t('devShowcase.layoutGallery.dashboardSection')}
            emphasis="strong"
            action={{ label: t('devShowcase.layoutGallery.dashboardManage'), onPress: noop }}
          />
          <DemoScrollRows />
        </Box>
      </Box>
    </Layout>
  );
};

export const LayoutDashboardScreen = memo(LayoutDashboardScreenComponent);
