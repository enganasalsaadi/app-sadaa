import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, RotateCw, Share2 } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import {
  AnimatedNumber,
  Box,
  CustomButton,
  LiveDot,
  Pressable,
  SectionHeader,
  Skeleton,
  Sparkline,
  Text,
} from '@/shared/ui';
import { MediaKitShareNotice, type MediaKitCardModel } from '@/domains/identity';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';

const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };
/** A missing number, never shown as 0 (failed load). */
const NO_VALUE = '—';
const PULSE_HEIGHT = moderateScale(54);
const PULSE_MIN_WIDTH = moderateScale(120);

interface StorefrontCardProps {
  kpis: CreatorHomeScreenModel['kpis'];
  mediaKit: MediaKitCardModel;
  onOpenInsights: () => void;
  onOpenPreview: () => void;
}

/**
 * «Your storefront to brands»: the last 30 days' views with their daily pulse (→ Insights), the
 * link with preview and share (or «make public»), whether brands can find the kit, and a nudge
 * when nobody opened it yet. A failed share explains itself here too.
 */
const StorefrontCardComponent: React.FC<StorefrontCardProps> = ({
  kpis,
  mediaKit,
  onOpenInsights,
  onOpenPreview,
}) => {
  const { t } = useTranslation();
  const { colors, sizes, typography } = useTheme();
  const { share, isPublic, linkLabel, noActivity } = mediaKit;
  const failed = kpis.status === 'error';
  const loading = kpis.status === 'loading';
  const views = !failed && kpis.views ? formatNumber(kpis.views.value, COMPACT) : NO_VALUE;
  const brands = kpis.brandViews?.value ?? 0;
  const isPrivate = isPublic === false;
  const showPulse = !failed && kpis.viewsSeries.length > 1;

  return (
    <Box px="xl" gap="md">
      <SectionHeader
        title={t('marketplace.creatorHome.look.title')}
        emphasis="strong"
        action={{ label: t('marketplace.creatorHome.look.preview'), onPress: onOpenPreview }}
      />
      <Box p="lg" gap="lg" borderRadius="xl" bg={colors.surface.main} shadow="card">
        <Pressable
          row
          align="flex-end"
          gap="lg"
          onPress={failed ? kpis.retry : onOpenInsights}
          accessibilityRole="button"
          accessibilityLabel={
            failed ? t('marketplace.creatorHome.kpi.retry') : t('marketplace.creatorHome.look.a11y', { views })
          }
        >
          <Box gap="xs">
            {loading ? (
              <Skeleton width={PULSE_MIN_WIDTH / 2} height={typography.h1.lineHeight} borderRadius="xs" />
            ) : views === NO_VALUE ? (
              <Text variant="h1" color={colors.text.tertiary}>
                {views}
              </Text>
            ) : (
              <AnimatedNumber value={views} variant="h1" />
            )}
            <Box row align="center" gap="xs">
              {failed ? <RotateCw size={sizes.icon.xs} color={colors.text.secondary} /> : null}
              <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
                {failed
                  ? t('marketplace.creatorHome.kpi.failed')
                  : t('marketplace.creatorHome.look.brands', { count: brands })}
              </Text>
            </Box>
          </Box>
          {showPulse ? (
            <Box flex={1} minWidth={PULSE_MIN_WIDTH}>
              <Sparkline
                values={kpis.viewsSeries}
                tone="interactive"
                height={PULSE_HEIGHT}
                accessibilityLabel={t('marketplace.creatorHome.look.pulseA11y')}
              />
            </Box>
          ) : null}
        </Pressable>

        <Box row align="center" gap="sm" p="xs" ps="md" borderRadius="lg" bg={colors.layout.base}>
          <Box flex={1}>
            <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={1}>
              {linkLabel ?? NO_VALUE}
            </Text>
          </Box>
          <CustomButton
            title={t('marketplace.creatorHome.look.preview')}
            variant="outline"
            size="md"
            px="md"
            leftIcon={<Eye />}
            onPress={onOpenPreview}
          />
          {isPrivate ? (
            <CustomButton
              title={t('account.mediaKit.share.makePublic')}
              size="md"
              px="md"
              onPress={share.onMakePublic}
              loading={share.isMakingPublic}
            />
          ) : (
            <CustomButton
              title={t('marketplace.creatorHome.hero.share')}
              size="md"
              px="md"
              leftIcon={<Share2 />}
              onPress={share.onShare}
              loading={share.isSharing}
              disabled={!share.isReady || share.isMakingPublic}
              accessibilityLabel={t('marketplace.creatorHome.hero.shareA11y')}
            />
          )}
        </Box>

        {isPublic === null ? null : (
          <Box row align="center" gap="sm">
            {isPublic ? <LiveDot color={colors.status.success.main} /> : null}
            <Text variant="caption" color={isPublic ? colors.status.success.text : colors.text.secondary}>
              {t(isPublic ? 'marketplace.creatorHome.look.public' : 'marketplace.creatorHome.look.private')}
            </Text>
          </Box>
        )}
        {share.error ? (
          <MediaKitShareNotice
            error={share.error}
            canRetry={share.canRetry}
            onMakePublic={share.onMakePublic}
            onRetry={share.onRetry}
            onDismiss={share.onDismissError}
          />
        ) : noActivity ? (
          <Text variant="caption" color={colors.text.secondary}>
            {t('account.mediaKit.noActivity')}
          </Text>
        ) : null}
      </Box>
    </Box>
  );
};

export const StorefrontCard = memo(StorefrontCardComponent);
