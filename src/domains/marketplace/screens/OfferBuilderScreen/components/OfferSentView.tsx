import React, { memo, useEffect } from 'react';
import { Vibration, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, useReducedMotion, ZoomIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Send, Wallet } from 'lucide-react-native';
import { HAPTIC_TAP_MS } from '@/core/config';
import { formatMoney } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, Text } from '@/shared/ui';
import { DealGuideButton, DealJourney } from '../../../components';
import { DEFAULT_DEAL_WINDOWS } from '../../../constants/dealOffer';
import { quotePaceHours } from '../../../utils/offerDuration';
import { useOfferBuilder } from '../OfferBuilderContext';

const STAMP = moderateScale(112);
const STAMP_TILT = '-8deg';

/**
 * After the signature: the ticket is stamped «sent», the journey moves to the creator's reply with
 * its live countdown, and when the wallet is short the top-up is one tap away (prefilled).
 */
const OfferSentViewComponent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const { sent, creatorName, onTopUp, onOpenDeal, onDone, onOpenGuide } = useOfferBuilder();
  const styles = useStyles(
    ({ radii, borderWidths, spacing, shadows }): Record<'stamp' | 'topUp' | 'mark', ViewStyle> => ({
      stamp: {
        width: STAMP,
        height: STAMP,
        borderRadius: radii.full,
        borderWidth: borderWidths.xl,
        borderColor: colors.status.success.main,
        backgroundColor: colors.status.success.soft,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        transform: [{ rotate: STAMP_TILT }],
      },
      topUp: {
        borderRadius: radii.xl,
        padding: spacing.lg,
        gap: spacing.md,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.sm,
        borderColor: colors.status.warning.main,
        ...shadows.card,
      },
      mark: {
        width: sizes.icon.xl,
        height: sizes.icon.xl,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.status.warning.soft,
      },
    }),
    [colors.status.success, colors.status.warning, colors.surface.main, sizes.icon.xl],
  );

  useEffect(() => {
    Vibration.vibrate(HAPTIC_TAP_MS);
  }, []);

  if (!sent) return null;
  const { deal, shortfall, quote } = sent;
  const amount = shortfall ? formatMoney(shortfall, i18n.language) : null;

  return (
    <Box gap="2xl">
      <Box align="center" gap="lg" pt="lg">
        <Animated.View entering={reduceMotion ? undefined : ZoomIn.springify().damping(12)} style={styles.stamp}>
          <Send size={sizes.icon.lg} color={colors.status.success.main} />
          <Text variant="overline" color={colors.status.success.text}>
            {t('marketplace.offer.sent.stamp')}
          </Text>
        </Animated.View>
        <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(160)}>
          <Box align="center" gap="sm">
            <Text variant="h3" color={colors.text.primary} align="center">
              {t('marketplace.offer.sent.title', { name: creatorName })}
            </Text>
            <Text variant="body" color={colors.text.secondary} align="center">
              {t('marketplace.offer.sent.body')}
            </Text>
          </Box>
        </Animated.View>
      </Box>
      {amount ? (
        <Box style={styles.topUp}>
          <Box row gap="md">
            <Box style={styles.mark}>
              <Wallet size={sizes.icon.sm} color={colors.status.warning.main} />
            </Box>
            <Box flex={1} gap="xs">
              <Text variant="bodyMedium" color={colors.text.primary}>
                {t('marketplace.offer.sent.topUpTitle', { amount })}
              </Text>
              <Text variant="bodySmall" color={colors.text.secondary}>
                {t('marketplace.offer.sent.topUpBody')}
              </Text>
            </Box>
          </Box>
          <CustomButton title={t('marketplace.offer.sent.topUpCta', { amount })} fullWidth onPress={onTopUp} />
        </Box>
      ) : null}
      <DealJourney
        mode="live"
        current="reply"
        creatorName={creatorName}
        shippingMode={deal.shippingMode.key ?? 'none'}
        windows={quote?.windows ?? DEFAULT_DEAL_WINDOWS}
        total={deal.total}
        shortfall={shortfall}
        deliverables={deal.itemsCount}
        paceHours={quote ? quotePaceHours(quote) : 0}
        signedAt={deal.sentAt}
        replyDueAt={deal.dueAt}
      />
      <DealGuideButton onPress={onOpenGuide} />
      <Box gap="sm">
        <CustomButton
          title={t('marketplace.offer.sent.openDeal')}
          variant={amount ? 'secondary' : 'primary'}
          size="lg"
          fullWidth
          onPress={onOpenDeal}
        />
        <CustomButton title={t('marketplace.offer.sent.done')} variant="ghost" fullWidth onPress={onDone} />
      </Box>
    </Box>
  );
};

export const OfferSentView = memo(OfferSentViewComponent);
