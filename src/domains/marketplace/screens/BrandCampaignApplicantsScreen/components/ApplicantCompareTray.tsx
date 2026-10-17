import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ViewStyle } from 'react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, Text } from '@/shared/ui';
import { ApplicantFace } from '../../../components/ApplicantFace';
import type { SeatFace } from '../../../utils/applicants';

const SLOT = moderateScale(46);
const OVERLAP = moderateScale(14);
const TRAY_HEIGHT = moderateScale(76);

export interface ApplicantCompareTrayProps {
  picks: readonly SeatFace[];
  min: number;
  max: number;
  onCompare: () => void;
}

/**
 * Compare mode's floating tray: a slot per place that fills with the picked face (dashed while
 * free), what to do next, and «Compare», which wakes once there are enough to set side by side.
 */
const ApplicantCompareTrayComponent: React.FC<ApplicantCompareTrayProps> = ({ picks, min, max, onCompare }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const { bg, text } = colors.button.primary;
  const styles = useStyles(
    ({ spacing, radii, borderWidths, shadows }): Record<'tray' | 'slot' | 'free' | 'overlap', ViewStyle> => ({
      tray: {
        position: 'absolute',
        start: spacing.xl,
        end: spacing.xl,
        bottom: Math.max(bottom, spacing.md) + spacing.sm,
        minHeight: TRAY_HEIGHT,
        borderRadius: radii.xl,
        paddingHorizontal: spacing.md,
        backgroundColor: bg,
        ...shadows.lg,
      },
      slot: { width: SLOT, height: SLOT, borderRadius: SLOT / 2, alignItems: 'center', justifyContent: 'center' },
      free: { borderWidth: borderWidths.md, borderStyle: 'dashed', borderColor: text },
      overlap: { marginStart: -OVERLAP },
    }),
    [bottom, bg, text],
  );
  const ready = picks.length >= min;
  const hint =
    picks.length < min
      ? t('marketplace.campaign.applicants.compare.tray.needMore', { min })
      : picks.length < max
        ? t('marketplace.campaign.applicants.compare.tray.addOrGo')
        : null;

  return (
    <Box row align="center" gap="md" style={styles.tray}>
      <Box row align="center" accessible={false}>
        {Array.from({ length: max }, (_, index) => {
          const pick = picks[index];
          return (
            <Box key={pick?.id ?? `free-${index}`} style={index > 0 ? styles.overlap : undefined}>
              {pick ? (
                <Box style={styles.slot} accessible accessibilityLabel={t('marketplace.campaign.applicants.compare.tray.slot', { name: pick.name })}>
                  <ApplicantFace name={pick.name} avatarUrl={pick.avatarUrl} size={SLOT} />
                </Box>
              ) : (
                <Box style={[styles.slot, styles.free]} accessible accessibilityLabel={t('marketplace.campaign.applicants.compare.tray.freeSlot')} />
              )}
            </Box>
          );
        })}
      </Box>
      <Box flex={1}>
        <Text variant="bodyMedium" color={text} numberOfLines={1}>
          {t('marketplace.campaign.applicants.compare.tray.picked', { count: picks.length })}
        </Text>
        {hint ? (
          <Text variant="caption" color={text} numberOfLines={2}>
            {hint}
          </Text>
        ) : null}
      </Box>
      <CustomButton
        title={t('marketplace.campaign.applicants.compare.tray.go')}
        variant="onBrand"
        size="md"
        disabled={!ready}
        haptic
        onPress={onCompare}
      />
    </Box>
  );
};

export const ApplicantCompareTray = memo(ApplicantCompareTrayComponent);
