import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import type { DealFile } from '../../../types';
import { formatTimecode } from '../../../utils/dealDrafts';
import type { ReviewPin } from '../hooks/useDealDraftReviewScreen';

const CUE_MIN = moderateScale(56);

export interface ReviewNotesProps {
  pins: ReviewPin[];
  files: DealFile[];
  onRemove: (key: string) => void;
}

const Cue = memo<{ pin: ReviewPin; file: number; onRemove: (key: string) => void }>(({ pin, file, onRemove }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const remove = useCallback(() => onRemove(pin.key), [onRemove, pin.key]);
  const styles = useStyles(
    ({ radii, spacing, shadows, borderWidths }): Record<'cue' | 'stamp' | 'note', ViewStyle> => ({
      cue: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
        padding: spacing.md,
        minHeight: CUE_MIN,
        borderRadius: radii.lg,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.card,
        ...shadows.card,
      },
      stamp: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radii.sm,
        backgroundColor: colors.status.warning.soft,
      },
      note: { flex: 1 },
    }),
    [colors],
  );
  const where =
    pin.atSecond === null
      ? t('marketplace.deals.drafts.pin.file', { file })
      : t('marketplace.deals.drafts.pin.fileAt', { file, time: formatTimecode(pin.atSecond) });
  return (
    <Box style={styles.cue}>
      <Box style={styles.stamp}>
        <Text variant="caption" color={colors.status.warning.text}>
          {where}
        </Text>
      </Box>
      <Text variant="bodySmall" color={colors.text.primary} style={styles.note}>
        {pin.note}
      </Text>
      <Pressable
        onPress={remove}
        hitSlop={sizes.hitSlop.md}
        accessibilityRole="button"
        accessibilityLabel={t('marketplace.deals.drafts.review.removePin')}
      >
        <X size={sizes.icon.sm} color={colors.icon.secondary} />
      </Pressable>
    </Box>
  );
});

/** The notes pinned so far, one cue card each (file + moment, the note, remove). */
const ReviewNotesComponent: React.FC<ReviewNotesProps> = ({ pins, files, onRemove }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Box gap="sm">
      <Text variant="overline" color={colors.text.tertiary}>
        {t('marketplace.deals.drafts.review.notes')}
      </Text>
      {pins.length === 0 ? (
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t('marketplace.deals.drafts.review.notesEmpty')}
        </Text>
      ) : (
        pins.map(pin => (
          <Cue
            key={pin.key}
            pin={pin}
            file={files.findIndex(file => file.id === pin.fileId) + 1}
            onRemove={onRemove}
          />
        ))
      )}
    </Box>
  );
};

export const ReviewNotes = memo(ReviewNotesComponent);
