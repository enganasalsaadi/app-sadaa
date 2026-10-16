import React, { memo, useCallback } from 'react';
import { Vibration, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { HAPTIC_TAP_MS } from '@/core/config';
import { opacity, useStyles, useTheme } from '@/core/theme';
import { Box, IconButton, Pressable, Text } from '@/shared/ui';
import { useCampaignWizard } from '../CampaignWizardContext';

/**
 * A floating navy bar over the steps: back (from the second step on) and the step's one action,
 * which waits for the pending save before moving on.
 */
const CampaignWizardDockComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const { step, isFirst, goNext, goBack, advancing } = useCampaignWizard();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const styles = useStyles(
    ({ borderWidths, radii, spacing, shadows }): Record<'wrap' | 'bar' | 'go' | 'goBusy', ViewStyle> => {
      const go: ViewStyle = {
        flex: 1,
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
      };
    },
    [colors.brand.main, colors.button.onBrand.bg, colors.glass.border, sizes.button.lg],
  );

  const onGo = useCallback(() => {
    Vibration.vibrate(HAPTIC_TAP_MS);
    goNext().catch(() => undefined);
  }, [goNext]);

  const label = t(step === 'money' ? 'marketplace.campaign.wizard.dock.review' : 'marketplace.campaign.wizard.dock.next');

  return (
    <Box style={styles.wrap}>
      <Box style={styles.bar}>
        {isFirst ? null : (
          <IconButton
            icon={isRTL ? ChevronRight : ChevronLeft}
            tone="onBrand"
            variant="soft"
            onPress={goBack}
            accessibilityLabel={t('marketplace.campaign.wizard.dock.back')}
          />
        )}
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
          <Chevron size={sizes.icon.sm} color={colors.button.onBrand.text} />
        </Pressable>
      </Box>
    </Box>
  );
};

export const CampaignWizardDock = memo(CampaignWizardDockComponent);
