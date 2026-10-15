import React, { memo, useCallback, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Diamond, MessageSquarePlus } from 'lucide-react-native';
import { formatDate } from '@/core/i18n';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import { DealItemFuse } from '../../../components/DealItemFuse';
import { DEAL_DRAFT_KIND_LABEL } from '../../../constants/dealDrafts';
import type { DealDraft, DealFile, DealItem } from '../../../types';
import { useDraftPlayer } from '../hooks/useDraftPlayer';
import type { ReviewPin } from '../hooks/useDealDraftReviewScreen';
import { ReviewFileStrip } from './ReviewFileStrip';
import { ReviewPlayer } from './ReviewPlayer';
import { ReviewScrubber } from './ReviewScrubber';

const SUBMITTED_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' };

export interface ReviewStageProps {
  /** «Yazan's draft · round 2»; the overlay header only shows it once the stage scrolls away. */
  title: string;
  item: DealItem;
  draft: DealDraft;
  files: DealFile[];
  file: DealFile;
  fileIndex: number;
  pins: ReviewPin[];
  /** Reviewing now: the review clock runs and notes can be pinned. */
  reviewing: boolean;
  onSelect: (index: number) => void;
  onPinAt: (seconds: number) => void;
  onPinWhole: () => void;
}

const WholeNoteButton = memo<{ onPress: () => void }>(({ onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'button', ViewStyle> => ({
      button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        minHeight: sizes.button.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radii.full,
        backgroundColor: colors.glass.fill,
        borderWidth: borderWidths.thin,
        borderColor: colors.glass.border,
      },
    }),
    [colors.glass.border, colors.glass.fill, sizes.button.sm],
  );
  return (
    <Pressable
      style={styles.button}
      onPress={onPress}
      scaleOnPress
      hitSlop={sizes.hitSlop.sm}
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.deals.drafts.review.addWhole')}
    >
      <MessageSquarePlus size={sizes.icon.xs} color={colors.glass.iconInteractive} />
      <Text variant="caption" color={colors.text.onBrand}>
        {t('marketplace.deals.drafts.review.addWhole')}
      </Text>
    </Pressable>
  );
});

/**
 * «طاولة المونتاج» (approved 2026-10-15): the navy stage the review happens on. When the round
 * came in and how long before it is approved by itself, the file playing, its timeline with the
 * pinned moments, and the other files of the round below. Pinning pauses the video.
 */
const ReviewStageComponent: React.FC<ReviewStageProps> = ({
  title,
  item,
  draft,
  files,
  file,
  fileIndex,
  pins,
  reviewing,
  onSelect,
  onPinAt,
  onPinWhole,
}) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes, spacing } = useTheme();
  const { top } = useSafeAreaInsets();
  const styles = useStyles(
    (): Record<'container' | 'titleRow', ViewStyle> => ({
      // The overlay header floats over the stage: start at its icon row, not under the status bar.
      container: { paddingTop: top + spacing.sm },
      // Clears the back button on one side and mirrors it on the other.
      titleRow: {
        minHeight: sizes.iconButton.md,
        paddingStart: sizes.iconButton.md + spacing.sm,
        paddingEnd: sizes.iconButton.md + spacing.sm,
      },
    }),
    [sizes.iconButton.md, spacing.sm, top],
  );
  // Playback lives here so its ticks re-render the stage only.
  const player = useDraftPlayer(file.id);
  const { pause } = player;
  const pinHere = useCallback(
    (seconds: number) => {
      pause();
      onPinAt(seconds);
    },
    [onPinAt, pause],
  );
  const isVideo = file.kind === 'video';
  const kind = isVideo ? 'video' : 'image';
  const filePins = useMemo(() => pins.filter(pin => pin.fileId === file.id), [file.id, pins]);
  const pinCounts = useMemo(
    () => pins.reduce<Record<string, number>>((acc, pin) => ({ ...acc, [pin.fileId]: (acc[pin.fileId] ?? 0) + 1 }), {}),
    [pins],
  );

  return (
    <Box style={styles.container} px="xl" pb="4xl" gap="md">
      <Box justify="center" style={styles.titleRow}>
        <Text variant="title" color={colors.text.onBrand} numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
        <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
          {item.title}
        </Text>
      </Box>
      <Box row align="center" justify="space-between" gap="sm">
        <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
          {t('marketplace.deals.drafts.review.submitted', {
            date: formatDate(draft.submittedAt, SUBMITTED_FORMAT, i18n.language),
          })}
        </Text>
        {reviewing ? (
          <DealItemFuse
            dueAt={item.dueAt}
            paused={item.timerPaused}
            surface="brand"
            caption={t('marketplace.deals.drafts.review.fuse')}
          />
        ) : null}
      </Box>
      <ReviewPlayer
        file={file}
        player={player}
        label={t('marketplace.deals.drafts.review.file', {
          index: fileIndex + 1,
          total: files.length,
          kind: t(DEAL_DRAFT_KIND_LABEL[kind]),
        })}
      />
      {isVideo && file.url ? (
        <ReviewScrubber
          fileId={file.id}
          time={player.time}
          duration={player.duration}
          pins={filePins}
          onSeek={player.seek}
          onPinAt={reviewing ? pinHere : player.seek}
        />
      ) : null}
      {reviewing ? (
        <Box row align="center" justify="space-between" gap="sm" wrap>
          {isVideo ? (
            <Box row align="center" gap="xs" flex={1}>
              <Diamond size={sizes.icon.xs} color={colors.draft.pin} />
              <Text variant="caption" color={colors.glass.iconInteractive} numberOfLines={2}>
                {t('marketplace.deals.drafts.review.hint')}
              </Text>
            </Box>
          ) : null}
          <WholeNoteButton onPress={onPinWhole} />
        </Box>
      ) : null}
      <ReviewFileStrip files={files} selected={fileIndex} pinCounts={pinCounts} onSelect={onSelect} />
    </Box>
  );
};

export const ReviewStage = memo(ReviewStageComponent);
