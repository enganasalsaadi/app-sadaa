import React, { memo, useCallback } from 'react';
import { Vibration, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Check, ChevronLeft, ChevronRight, Send } from 'lucide-react-native';
import { HAPTIC_TAP_MS } from '@/core/config';
import { formatMoney } from '@/core/i18n';
import { opacity, useStyles, useTheme } from '@/core/theme';
import { Box, IconButton, Pressable, Text } from '@/shared/ui';
import { useCampaignWizard } from '../CampaignWizardContext';

/**
 * A floating navy bar over the steps: back (from the second step on), from the money step on the
 * most that could be held (the server's estimate), and the step's one action, which waits for the
 * pending save before moving on. On the review the action sends the campaign (again, after changes
 * were requested). Editing a live campaign the bar holds one «save» on every step: the rail moves
 * between them.
 */
const CampaignWizardDockComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const { step, isFirst, goNext, goBack, advancing, money, changesRequested, live } = useCampaignWizard();
  const total = !live && (step === 'money' || step === 'review') ? (money.quote?.totalGross.max ?? null) : null;
  const sending = !live && step === 'review';
  const Icon = live ? Check : sending ? Send : isRTL ? ChevronLeft : ChevronRight;

  const styles = useStyles(
    ({ borderWidths, radii, spacing, shadows }): Record<'wrap' | 'bar' | 'go' | 'goBusy' | 'pill' | 'flip', ViewStyle> => {
      const go: ViewStyle = {
        // Beside a total the action takes its own width; alone it fills the bar.
        flex: total ? undefined : 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        minHeight: sizes.button.lg,
        paddingHorizontal: spacing.xl,
        borderRadius: radii.md,
        backgroundColor: colors.button.onBrand.bg,
      };
      return {
        wrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
        bar: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          padding: spacing.sm,
          borderRadius: radii.lg,
          backgroundColor: colors.brand.main,
          borderWidth: borderWidths.thin,
          borderColor: colors.glass.border,
          ...shadows.lg,
        },
        go,
        goBusy: { ...go, opacity: opacity.disabled },
        pill: { paddingHorizontal: spacing.xs, borderRadius: radii.full, backgroundColor: colors.glass.badge },
        // The paper plane points the way reading goes.
        flip: { transform: [{ scaleX: -1 }] },
      };
    },
    [colors.brand.main, colors.button.onBrand.bg, colors.glass.badge, colors.glass.border, sizes.button.lg, total],
  );

  const onGo = useCallback(() => {
    Vibration.vibrate(HAPTIC_TAP_MS);
    goNext().catch(() => undefined);
  }, [goNext]);

  let label = t('marketplace.campaign.wizard.dock.next');
  if (step === 'money') label = t('marketplace.campaign.wizard.dock.review');
  if (sending) {
    label = t(changesRequested ? 'marketplace.campaign.wizard.dock.resend' : 'marketplace.campaign.wizard.dock.send');
  }
  if (live) label = t('marketplace.campaign.wizard.live.save');

  return (
    <Box style={styles.wrap}>
      <Box style={styles.bar}>
        {isFirst || live ? null : (
          <IconButton
            icon={isRTL ? ChevronRight : ChevronLeft}
            tone="onBrand"
            variant="soft"
            onPress={goBack}
            accessibilityLabel={t('marketplace.campaign.wizard.dock.back')}
          />
        )}
        {total ? (
          <Box flex={1} ps="sm" accessible accessibilityLabel={`${t('marketplace.campaign.wizard.dock.total')} ${t('marketplace.campaign.wizard.dock.estimate')} ${formatMoney(total)}`}>
            <Box row align="center" gap="xs">
              <Text variant="caption" color={colors.text.onBrandMuted}>
                {t('marketplace.campaign.wizard.dock.total')}
              </Text>
              <Box style={styles.pill}>
                <Text variant="caption" color={colors.text.onBrand}>
                  {t('marketplace.campaign.wizard.dock.estimate')}
                </Text>
              </Box>
            </Box>
            <Text variant="amountTitle" color={colors.glass.iconMoney} numberOfLines={1}>
              {formatMoney(total)}
            </Text>
          </Box>
        ) : null}
        <Pressable
          style={advancing ? styles.goBusy : styles.go}
          scaleOnPress={!advancing}
          onPress={onGo}
          disabled={advancing}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ busy: advancing }}
        >
          <Text variant="button" color={colors.button.onBrand.text}>
            {label}
          </Text>
          <Icon
            size={sizes.icon.sm}
            color={colors.button.onBrand.text}
            style={sending && isRTL ? styles.flip : undefined}
          />
        </Pressable>
      </Box>
    </Box>
  );
};

export const CampaignWizardDock = memo(CampaignWizardDockComponent);
