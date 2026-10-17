import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  FadeInDown,
  useReducedMotion,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Clock, Wallet, X } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import { motion, useStyles, useTheme } from '@/core/theme';
import {
  Box,
  CustomButton,
  GlowOrbs,
  GradientSurface,
  IconButton,
  Layout,
  Text,
} from '@/shared/ui';
import { useCampaignInReview } from '../hooks/useCampaignInReview';
import { InReviewTicket } from './InReviewTicket';
import { InReviewTrack } from './InReviewTrack';

const enterAt = (order: number) =>
  FadeInDown.delay(motion.duration.fast * (order + 1)).springify();

/**
 * After sending: the wizard turns navy and quiet. The handed-in ticket, «we're reviewing it», where
 * it stands, and, when the wallet falls short of every seat, the top-up as a nudge. Nothing is
 * editable or cancellable while the team reviews.
 */
const CampaignInReviewComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const {
    campaign,
    coverUrl,
    shortfall,
    canTopUp,
    onTopUp,
    openCampaigns,
    onClose,
  } = useCampaignInReview();

  const styles = useStyles(
    ({
      borderWidths,
      radii,
      spacing,
    }): Record<'pill' | 'glass', ViewStyle> => ({
      pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radii.full,
        backgroundColor: colors.glass.badge,
        borderWidth: borderWidths.thin,
        borderColor: colors.glass.border,
      },
      glass: {
        flexDirection: 'row',
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radii.lg,
        backgroundColor: colors.glass.fill,
        borderWidth: borderWidths.thin,
        borderColor: colors.glass.border,
      },
    }),
    [colors.glass.badge, colors.glass.border, colors.glass.fill],
  );

  if (!campaign) return null;
  const enter = (order: number) => (reduceMotion ? undefined : enterAt(order));

  return (
    <GradientSurface variant="live" flex={1}>
      <GlowOrbs />
      <Layout
        mode="scroll"
        surface="transparent"
        statusBar="light"
        padding={{ x: 'xl' }}
      >
        <Box flex={1} pt="sm">
          <Box gap="2xl">
            <Box row align="center" gap="md">
              <IconButton
                icon={X}
                tone="onBrand"
                variant="soft"
                onPress={onClose}
                accessibilityLabel={t(
                  'marketplace.campaign.wizard.inReview.close',
                )}
              />
              <Box flex={1}>
                <Text
                  variant="title"
                  color={colors.text.onBrand}
                  numberOfLines={1}
                >
                  {campaign.title}
                </Text>
              </Box>
              <Box style={styles.pill}>
                <Clock size={sizes.icon.xs} color={colors.text.onBrand} />
                <Text variant="caption" color={colors.text.onBrand}>
                  {campaign.status.label}
                </Text>
              </Box>
            </Box>

            <InReviewTicket campaign={campaign} coverUrl={coverUrl} />

            <Animated.View entering={enter(1)}>
              <Box gap="sm">
                <Text
                  variant="h1"
                  color={colors.text.onBrand}
                  accessibilityRole="header"
                >
                  {t('marketplace.campaign.wizard.inReview.title')}
                </Text>
                <Text variant="body" color={colors.text.onBrandMuted}>
                  {t('marketplace.campaign.wizard.inReview.body')}
                </Text>
              </Box>
            </Animated.View>

            <Animated.View entering={enter(2)}>
              <InReviewTrack />
            </Animated.View>

            {shortfall ? (
              <Animated.View entering={enter(3)} style={styles.glass}>
                <Wallet size={sizes.icon.sm} color={colors.glass.iconWarning} />
                <Box flex={1}>
                  <Text variant="bodySmall" color={colors.text.onBrand}>
                    {t('marketplace.campaign.wizard.inReview.shortfall', {
                      amount: formatMoney(shortfall),
                    })}
                  </Text>
                </Box>
              </Animated.View>
            ) : null}
          </Box>

          {/* The actions sit at the bottom however short the page is. */}
          <Box flex={1} />
          <Box pt="2xl" pb="xl" gap="sm">
            {canTopUp ? (
              <CustomButton
                title={t('marketplace.campaign.wizard.inReview.topUp')}
                variant="onBrand"
                size="lg"
                fullWidth
                onPress={onTopUp}
              />
            ) : null}
            <CustomButton
              title={t('marketplace.campaign.wizard.inReview.myCampaigns')}
              variant={canTopUp ? 'glass' : 'onBrand'}
              size="lg"
              fullWidth
              onPress={openCampaigns}
            />
          </Box>
        </Box>
      </Layout>
    </GradientSurface>
  );
};

export const CampaignInReview = memo(CampaignInReviewComponent);
