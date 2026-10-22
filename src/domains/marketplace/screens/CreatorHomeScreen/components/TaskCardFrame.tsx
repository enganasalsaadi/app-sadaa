import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, Pressable, Text } from '@/shared/ui';
import type { HomeNoticeTone } from '../utils/resolveHomeNotice';

/** Every card is at least this tall, so the deck doesn't jump from one task to the next. */
const CARD_MIN_HEIGHT = moderateScale(212);
const DOT = moderateScale(6);
const DOT_ON = moderateScale(18);
/** Dots beyond this would crowd the row; the «1 of 9» text still counts them all. */
const MAX_DOTS = 6;

/** `interactive` for deals and setup steps; a blocker wears its notice tone. */
export type TaskTone = 'interactive' | HomeNoticeTone;

export interface TaskCardCta {
  label: string;
  onPress: () => void;
  loading?: boolean;
  accessibilityLabel?: string;
}

interface TaskCardFrameProps {
  icon: LucideIcon;
  kicker: string;
  index: number;
  count: number;
  tone: TaskTone;
  children: React.ReactNode;
  /** Absent: the card only informs (a review in progress). */
  cta?: TaskCardCta;
  onNext: () => void;
}

/**
 * One task card: what kind of task and where it sits in the deck (kicker + dots), the body,
 * then the one button that does it and «next». A blocker is ringed in its tone.
 */
const TaskCardFrameComponent: React.FC<TaskCardFrameProps> = ({
  icon: Icon,
  kicker,
  index,
  count,
  tone,
  children,
  cta,
  onNext,
}) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const accent = tone === 'interactive' ? colors.interactive : colors.status[tone];
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const many = count > 1;

  const styles = useStyles(
    ({ radii, borderWidths }): Record<'card' | 'cta', ViewStyle> => ({
      card: {
        minHeight: CARD_MIN_HEIGHT,
        borderRadius: radii.xl,
        borderWidth: tone === 'interactive' ? 0 : borderWidths.md,
        borderColor: accent.main,
      },
      cta: { flex: 1 },
    }),
    [accent.main, tone],
  );

  return (
    <Box style={styles.card} p="lg" gap="md">
      <Box row align="center" justify="space-between" gap="sm">
        <Box row align="center" gap="xs" flex={1}>
          <Icon size={sizes.icon.xs} color={accent.text} />
          <Text variant="buttonSmall" color={accent.text} numberOfLines={1}>
            {many ? `${kicker} · ${t('marketplace.creatorHome.tasks.position', { index: index + 1, count })}` : kicker}
          </Text>
        </Box>
        {many ? (
          <Box row align="center" gap="xs" importantForAccessibility="no-hide-descendants">
            {Array.from({ length: Math.min(count, MAX_DOTS) }, (_, dot) => (
              <Box
                key={dot}
                width={dot === index % MAX_DOTS ? DOT_ON : DOT}
                height={DOT}
                borderRadius="full"
                bg={dot === index % MAX_DOTS ? accent.main : colors.border.default}
              />
            ))}
          </Box>
        ) : null}
      </Box>

      <Box flex={1} gap="md">
        {children}
      </Box>

      {cta || many ? (
        <Box row align="center" gap="md">
          {cta ? (
            <CustomButton
              title={cta.label}
              onPress={cta.onPress}
              loading={cta.loading}
              variant={tone === 'danger' ? 'danger' : 'primary'}
              accessibilityLabel={cta.accessibilityLabel}
              style={styles.cta}
            />
          ) : (
            <Box flex={1} />
          )}
          {many ? (
            <Pressable
              onPress={onNext}
              scaleOnPress
              width={sizes.button.lg}
              height={sizes.button.lg}
              borderRadius="md"
              borderWidth="thin"
              borderColor={colors.border.strong}
              bg={colors.surface.main}
              align="center"
              justify="center"
              accessibilityRole="button"
              accessibilityLabel={t('marketplace.creatorHome.tasks.next')}
            >
              <Chevron size={sizes.icon.md} color={colors.icon.primary} />
            </Pressable>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
};

export const TaskCardFrame = memo(TaskCardFrameComponent);
