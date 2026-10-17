import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Check, Lock } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Tag, Text } from '@/shared/ui';
import type { ReviewRow, ReviewRowKey } from '../hooks/useCampaignReviewSummary';

const MARK = moderateScale(28);

interface ReviewSummaryRowProps {
  row: ReviewRow;
  /** Hairline above every row but the first. */
  divided: boolean;
  onOpen: (key: ReviewRowKey) => void;
}

/**
 * One line of the review: a mark that says where the part stands (a check, a warning, or a lock for
 * the optional brief; never colour alone), its name, what it holds or lacks, and the way back to it.
 */
const ReviewSummaryRowComponent: React.FC<ReviewSummaryRowProps> = ({ row, divided, onOpen }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const missing = row.state === 'missing';

  let markBg = colors.surface.elevated;
  let markInk = colors.text.secondary;
  let Mark = Lock;
  if (row.state === 'done') {
    markBg = colors.status.success.soft;
    markInk = colors.status.success.main;
    Mark = Check;
  } else if (missing) {
    markBg = colors.status.warning.soft;
    markInk = colors.status.warning.main;
    Mark = AlertTriangle;
  }

  const styles = useStyles(
    ({ borderWidths, radii, spacing }): Record<'row' | 'mark' | 'edit', ViewStyle> => ({
      row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
        paddingStart: spacing.lg,
        paddingEnd: spacing.xs,
        paddingVertical: spacing.sm,
        borderTopWidth: divided ? borderWidths.hairline : 0,
        borderTopColor: colors.border.default,
      },
      mark: {
        width: MARK,
        height: MARK,
        marginTop: spacing.sm,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: markBg,
      },
      edit: {
        minWidth: sizes.button.md,
        minHeight: sizes.button.md,
        paddingHorizontal: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
    [colors.border.default, divided, markBg, sizes.button.md],
  );

  const onPress = useCallback(() => onOpen(row.key), [onOpen, row.key]);

  return (
    <Box style={styles.row}>
      <Box style={styles.mark}>
        <Mark size={sizes.icon.xs} color={markInk} />
      </Box>
      <Box flex={1} gap="xs" py="sm">
        <Box row align="center" gap="sm">
          <Text variant="label" color={colors.text.primary}>
            {row.title}
          </Text>
          {row.state === 'optional' ? (
            <Tag label={t('marketplace.campaign.wizard.requirements.brief.optional')} tone="neutral" />
          ) : null}
        </Box>
        <Text variant="bodySmall" color={missing ? colors.status.warning.text : colors.text.secondary}>
          {row.line}
        </Text>
      </Box>
      <Pressable
        style={styles.edit}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={row.a11yLabel}
      >
        <Text variant="buttonSmall" color={colors.interactive.text}>
          {row.actionLabel}
        </Text>
      </Pressable>
    </Box>
  );
};

export const ReviewSummaryRow = memo(ReviewSummaryRowComponent);
