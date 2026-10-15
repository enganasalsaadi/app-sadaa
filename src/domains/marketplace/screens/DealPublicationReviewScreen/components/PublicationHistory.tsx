import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDate, formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { DealPublication } from '../../../types';

const SEQ = moderateScale(32);
const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' };

export interface PublicationHistoryProps {
  /** Newest first. */
  publications: DealPublication[];
  /** The newest one is waiting on the brand. */
  waiting: boolean;
}

const Row = memo<{ publication: DealPublication; current: boolean; waiting: boolean; first: boolean }>(
  ({ publication, current, waiting, first }) => {
    const { t, i18n } = useTranslation();
    const { colors } = useTheme();
    const styles = useStyles(
      ({ radii, spacing, borderWidths }): Record<'row' | 'seq' | 'chip', ViewStyle> => ({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderTopWidth: first ? 0 : borderWidths.hairline,
          borderColor: colors.border.default,
        },
        seq: {
          width: SEQ,
          height: SEQ,
          borderRadius: radii.sm,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surface.elevated,
        },
        chip: {
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: radii.sm,
          backgroundColor: colors.status.info.soft,
        },
      }),
      [colors.border.default, colors.status.info.soft, colors.surface.elevated, first],
    );
    // The server's own label once answered («Fix requested»); the one under review is «current».
    const title = publication.review?.decision.label ?? t('marketplace.deals.publish.brand.history.current');
    const meta = publication.review?.note
      ? `«${publication.review.note}»`
      : `${formatDate(publication.submittedAt, DATE_FORMAT, i18n.language)} · ${t(
          'marketplace.deals.publish.brand.history.proofs',
          { count: publication.proofs.length },
        )}`;
    return (
      <Box style={styles.row}>
        <Box style={styles.seq}>
          <Text variant="label" color={colors.text.secondary}>
            {formatNumber(publication.sequence)}
          </Text>
        </Box>
        <Box flex={1} gap="xs">
          <Text variant="bodyMedium" color={colors.text.primary} numberOfLines={1}>
            {title}
          </Text>
          <Text variant="caption" color={colors.text.secondary} numberOfLines={2}>
            {meta}
          </Text>
        </Box>
        {current && waiting ? (
          <Box style={styles.chip}>
            <Text variant="caption" color={colors.status.info.text}>
              {t('marketplace.deals.publish.brand.history.waiting')}
            </Text>
          </Box>
        ) : null}
      </Box>
    );
  },
);

/** Every link handed in for this deliverable and what came of it (the dispute record), newest first. */
const PublicationHistoryComponent: React.FC<PublicationHistoryProps> = ({ publications, waiting }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(
    ({ radii, shadows, borderWidths }): Record<'list', ViewStyle> => ({
      list: {
        borderRadius: radii.lg,
        overflow: 'hidden',
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.card,
        ...shadows.card,
      },
    }),
    [colors.border.card, colors.surface.main],
  );
  if (publications.length < 2) return null;
  return (
    <Box gap="sm">
      <Text variant="overline" color={colors.text.tertiary}>
        {t('marketplace.deals.publish.brand.history.title')}
      </Text>
      <Box style={styles.list}>
        {publications.map((publication, index) => (
          <Row
            key={publication.id}
            publication={publication}
            current={index === 0}
            waiting={waiting}
            first={index === 0}
          />
        ))}
      </Box>
    </Box>
  );
};

export const PublicationHistory = memo(PublicationHistoryComponent);
