import React, { memo, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Clock, ShieldCheck, TriangleAlert } from 'lucide-react-native';
import { formatDate, formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, FileViewer, Image, Pressable, Text, useFileViewer } from '@/shared/ui';
import { isolateText } from '@/shared/utils';
import { useDealFileRefresh } from '../hooks/useDealFileRefresh';
import type { DealRole, DealShipment } from '../types';
import { isSaveable, photoViewerFiles } from '../utils/dealVault';

const ICON_BOX = moderateScale(42);
const THUMB = moderateScale(64);
const WHEN_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  hour: 'numeric',
  minute: '2-digit',
};

export interface DealShipmentIssueCardProps {
  shipment: DealShipment;
  role: DealRole;
  dealId: string;
  /** The other side: the creator for the brand, the brand for the creator. */
  partyName: string;
  /** Creator: the brand missed its answer window and the free cancel is open. */
  freeCancel: boolean;
  reshipsLeft: number;
}

/**
 * The reported problem (M5): what the creator said, the photos (they open full screen and become
 * dispute evidence), and the answer window, which freezes every other timer. The brand also sees
 * how many re-ships are left; the creator, once the brand stays silent, that a free cancel is open.
 */
const DealShipmentIssueCardComponent: React.FC<DealShipmentIssueCardProps> = ({
  shipment,
  role,
  dealId,
  partyName,
  freeCancel,
  reshipsLeft,
}) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const issue = shipment.issue;
  const photos = useMemo(
    () =>
      photoViewerFiles(issue?.photos ?? [], `shipment:${shipment.id}`, n =>
        t('marketplace.vault.photoName', { n }),
      ).filter(isSaveable),
    [issue?.photos, shipment.id, t],
  );
  const viewer = useFileViewer(photos);
  const refreshUrl = useDealFileRefresh(role, dealId);
  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'card' | 'icon' | 'quote' | 'clock', ViewStyle> => ({
      card: {
        padding: spacing.lg,
        gap: spacing.md,
        borderRadius: radii.lg,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.sm,
        borderColor: colors.status.warning.main,
      },
      icon: {
        width: ICON_BOX,
        height: ICON_BOX,
        borderRadius: radii.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.status.warning.soft,
      },
      quote: {
        padding: spacing.md,
        borderRadius: radii.md,
        backgroundColor: colors.surface.elevated,
      },
      clock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radii.md,
        backgroundColor: colors.status.warning.soft,
      },
    }),
    [colors],
  );
  if (!issue) return null;

  const name = isolateText(partyName);
  const reported = issue.reportedAt
    ? formatDate(issue.reportedAt, WHEN_FORMAT, i18n.language)
    : null;
  const answerBy = issue.answerBy ? formatDate(issue.answerBy, WHEN_FORMAT, i18n.language) : null;

  return (
    <Box style={styles.card}>
      <Box row align="center" gap="md">
        <Box style={styles.icon}>
          <TriangleAlert size={sizes.icon.sm} color={colors.status.warning.main} />
        </Box>
        <Box flex={1}>
          <Text variant="title" color={colors.text.primary}>
            {issue.reason.label}
          </Text>
          <Text variant="caption" color={colors.text.tertiary}>
            {reported
              ? role === 'brand'
                ? t('marketplace.deals.shipping.issue.reportedBy', { name, date: reported })
                : t('marketplace.deals.shipping.issue.reportedByYou', { date: reported })
              : t('marketplace.deals.shipping.issue.paused')}
          </Text>
        </Box>
      </Box>

      {issue.note ? (
        <Box style={styles.quote}>
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('marketplace.deals.shipping.issue.quote', { note: issue.note })}
          </Text>
        </Box>
      ) : null}

      {photos.length > 0 ? (
        <Box row gap="sm" wrap>
          {photos.map((photo, at) => (
            <Pressable
              key={photo.id}
              scaleOnPress
              onPress={() => viewer.openAt(at)}
              accessibilityRole="imagebutton"
              accessibilityLabel={t('marketplace.deals.shipping.issue.photoA11y', {
                number: formatNumber(at + 1, {}, i18n.language),
              })}
            >
              <Image uri={photo.url ?? undefined} width={THUMB} height={THUMB} borderRadius="md" resizeMode="cover" />
            </Pressable>
          ))}
        </Box>
      ) : null}

      {freeCancel ? (
        <Box row gap="sm" align="flex-start">
          <ShieldCheck size={sizes.icon.sm} color={colors.interactive.main} />
          <Box flex={1}>
            <Text variant="bodySmall" color={colors.text.secondary}>
              {t('marketplace.deals.shipping.issue.missed', { name })}
            </Text>
          </Box>
        </Box>
      ) : answerBy ? (
        <Box style={styles.clock}>
          <Clock size={sizes.icon.sm} color={colors.status.warning.main} />
          <Box flex={1}>
            <Text variant="buttonSmall" color={colors.status.warning.text}>
              {role === 'brand'
                ? t('marketplace.deals.shipping.issue.answerBy', { date: answerBy })
                : t('marketplace.deals.shipping.issue.waitAnswer', { name, date: answerBy })}
            </Text>
          </Box>
        </Box>
      ) : null}

      {role === 'brand' ? (
        <Text variant="caption" color={colors.text.tertiary}>
          {reshipsLeft > 0
            ? t('marketplace.deals.shipping.issue.reshipsLeft', { count: reshipsLeft })
            : t('marketplace.deals.shipping.issue.noReships')}
        </Text>
      ) : null}

      <FileViewer {...viewer.props} refreshUrl={refreshUrl} />
    </Box>
  );
};

export const DealShipmentIssueCard = memo(DealShipmentIssueCardComponent);
