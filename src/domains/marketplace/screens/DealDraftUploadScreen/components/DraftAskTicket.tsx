import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PenLine } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { DealDraft, DealDraftPin } from '../../../types';
import { formatTimecode, pinFileNumber } from '../../../utils/dealDrafts';

const NOTCH = moderateScale(10);
/** Stable ids for the torn edge's notches. */
const NOTCHES = Array.from({ length: 14 }, (_, notch) => `notch-${notch}`);

export interface DraftAskTicketProps {
  /** The round the brand sent back, with its review. */
  draft: DealDraft;
}

const PinRow = memo<{ draft: DealDraft; pin: DealDraftPin }>(({ draft, pin }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'row' | 'chip' | 'note', ViewStyle> => ({
      row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: borderWidths.thin,
        borderStyle: 'dashed',
        borderColor: colors.status.warning.main,
      },
      chip: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radii.sm,
        backgroundColor: colors.surface.main,
      },
      note: { flex: 1 },
    }),
    [colors.status.warning.main, colors.surface.main],
  );
  const file = pinFileNumber(draft, pin);
  const where =
    pin.atSecond === null
      ? t('marketplace.deals.drafts.pin.file', { file })
      : t('marketplace.deals.drafts.pin.fileAt', { file, time: formatTimecode(pin.atSecond) });
  return (
    <Box style={styles.row}>
      <Box style={styles.chip}>
        <Text variant="caption" color={colors.status.warning.text}>
          {where}
        </Text>
      </Box>
      <Text variant="bodySmall" color={colors.text.primary} style={styles.note}>
        {pin.note}
      </Text>
    </Box>
  );
});

/**
 * What the brand asked on the last round, as a torn-off ticket (amber = changes requested): the
 * overall note, then each pinned note with its file and moment.
 */
const DraftAskTicketComponent: React.FC<DraftAskTicketProps> = ({ draft }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, spacing }): Record<'ticket' | 'edge' | 'notch', ViewStyle> => ({
      ticket: {
        borderRadius: radii.lg,
        padding: spacing.lg,
        paddingBottom: spacing.xl,
        gap: spacing.sm,
        backgroundColor: colors.status.warning.soft,
        overflow: 'hidden',
      },
      edge: {
        position: 'absolute',
        start: spacing.lg,
        end: spacing.lg,
        bottom: -NOTCH / 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      notch: {
        width: NOTCH,
        height: NOTCH,
        borderRadius: radii.full,
        backgroundColor: colors.layout.base,
      },
    }),
    [colors.layout.base, colors.status.warning.soft],
  );
  const review = draft.review;
  if (!review) return null;
  return (
    <Box style={styles.ticket}>
      <Box row align="center" gap="xs">
        <PenLine size={sizes.icon.xs} color={colors.status.warning.main} />
        <Text variant="label" color={colors.status.warning.text}>
          {t('marketplace.deals.drafts.upload.ask.title', { round: draft.round })}
        </Text>
      </Box>
      {review.note ? (
        <Text variant="body" color={colors.text.primary}>
          {review.note}
        </Text>
      ) : null}
      {review.pins.map(pin => (
        <PinRow key={`${pin.fileId}:${pin.atSecond ?? 'file'}:${pin.note}`} draft={draft} pin={pin} />
      ))}
      <Box style={styles.edge} pointerEvents="none">
        {NOTCHES.map(notch => (
          <Box key={notch} style={styles.notch} />
        ))}
      </Box>
    </Box>
  );
};

export const DraftAskTicket = memo(DraftAskTicketComponent);
