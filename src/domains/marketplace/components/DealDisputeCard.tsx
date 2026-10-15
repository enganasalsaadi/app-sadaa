import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Scale } from 'lucide-react-native';
import { formatDate } from '@/core/i18n';
import { useStyles, useTheme } from '@/core/theme';
import { Box, GradientSurface, MoneyText, Pressable, ProgressBar, Text } from '@/shared/ui';
import { useClock } from '../hooks/useClock';
import type { DealDisputeModel } from '../hooks/useDealDispute';
import type { DealRole } from '../types';
import { evidenceWindowShare, rulingForViewer } from '../utils/dealDispute';
import { DealDisputeClock } from './DealDisputeClock';

const MINUTE_MS = 60_000;
const TARGET_FORMAT: Intl.DateTimeFormatOptions = { weekday: 'long', hour: 'numeric', minute: '2-digit' };

export interface DealDisputeCardProps {
  dispute: DealDisputeModel;
  role: DealRole;
}

/**
 * The deal page's way into the dispute file (M9): a navy slip, the same night as the file's
 * scales. While evidence is open the window ticks down; then the team's target time; after the
 * ruling, the outcome and what it means for the viewer's wallet. The whole slip opens the file.
 */
const DealDisputeCardComponent: React.FC<DealDisputeCardProps> = ({ dispute: model, role }) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const now = useClock(MINUTE_MS);
  const styles = useStyles(
    ({ radii, spacing }): Record<'slip' | 'fill' | 'badge', ViewStyle> => ({
      slip: { borderRadius: radii.xl, overflow: 'hidden', padding: spacing.lg, gap: spacing.md },
      fill: { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0 },
      badge: {
        width: sizes.iconButton.md,
        height: sizes.iconButton.md,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.glass.badge,
      },
    }),
    [colors.glass.badge, sizes.iconButton.md],
  );
  const { dispute, phase } = model;
  if (!dispute || phase === null || phase === 'withdrawn') return null;

  const ruling = dispute.ruling;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const title =
    phase === 'ruled'
      ? ruling
        ? t('marketplace.deals.dispute.card.ruledTitle', { outcome: ruling.outcome.label })
        : dispute.status.label
      : t('marketplace.deals.dispute.card.title');
  const target = dispute.adminTargetAt ? formatDate(dispute.adminTargetAt, TARGET_FORMAT, i18n.language) : null;

  return (
    <Pressable
      onPress={model.openFile}
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.deals.dispute.card.open')}
    >
      <Box style={styles.slip}>
        <GradientSurface variant="live" style={styles.fill} />
        <Box row align="center" gap="md">
          <Box style={styles.badge}>
            <Scale size={sizes.icon.md} color={colors.glass.iconInteractive} />
          </Box>
          <Box flex={1} gap="xs">
            <Text variant="overline" color={colors.text.onBrandMuted}>
              {dispute.reason.label}
            </Text>
            <Text variant="title" color={colors.text.onBrand}>
              {title}
            </Text>
          </Box>
          <Chevron size={sizes.icon.md} color={colors.text.onBrandMuted} />
        </Box>
        {phase === 'evidence' && dispute.evidenceDueAt ? (
          <Box gap="sm">
            <Box row align="center" justify="space-between" gap="md">
              <Text variant="bodySmall" color={colors.text.onBrandMuted}>
                {t('marketplace.deals.dispute.card.evidenceOpen')}
              </Text>
              <DealDisputeClock endsAt={dispute.evidenceDueAt} variant="title" color={colors.text.onBrand} />
            </Box>
            <ProgressBar
              value={evidenceWindowShare(dispute.evidenceDueAt, now)}
              surface="brand"
              size="sm"
              accessibilityLabel={t('marketplace.deals.dispute.card.evidenceOpen')}
            />
          </Box>
        ) : null}
        {phase === 'review' ? (
          <Text variant="bodySmall" color={colors.text.onBrandMuted}>
            {target
              ? t('marketplace.deals.dispute.card.review', { date: target })
              : t('marketplace.deals.dispute.card.reviewPlain')}
          </Text>
        ) : null}
        {phase === 'ruled' && ruling ? (
          <Box row align="center" justify="space-between" gap="md">
            <Text variant="bodySmall" color={colors.text.onBrandMuted}>
              {t(role === 'brand' ? 'marketplace.deals.dispute.card.brandShare' : 'marketplace.deals.dispute.card.creatorShare')}
            </Text>
            <MoneyText value={rulingForViewer(ruling, role)} size="title" tone="onBrand" />
          </Box>
        ) : null}
      </Box>
    </Pressable>
  );
};

export const DealDisputeCard = memo(DealDisputeCardComponent);
