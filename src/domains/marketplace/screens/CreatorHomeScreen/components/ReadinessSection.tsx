import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { iconStroke, moderateScale, useTheme } from '@/core/theme';
import { AnimatedNumber, Box, Card, Pressable, Skeleton, Text } from '@/shared/ui';
import type { ProfileStepTarget, StrengthStage, StrengthStageKey } from '@/domains/identity';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';

type Completion = CreatorHomeScreenModel['completion'];

const STAGE_LABEL = {
  info: 'marketplace.creatorHome.strength.stage.info',
  avatar: 'marketplace.creatorHome.strength.stage.avatar',
  platforms: 'marketplace.creatorHome.strength.stage.platforms',
  rates: 'marketplace.creatorHome.strength.stage.rates',
  kyc: 'marketplace.creatorHome.strength.stage.kyc',
} as const satisfies Record<StrengthStageKey, ParseKeys>;

const PIECE_HEIGHT = moderateScale(8);
const SKELETON_HEIGHT = moderateScale(132);

const percent = (value: number) => formatNumber(value / 100, { style: 'percent' });

/** One piece of the storefront per stage: lit when done, outlined teal while it's next. */
const Pieces = memo<{ stages: readonly StrengthStage[] }>(({ stages }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const done = stages.filter(stage => stage.state === 'done').length;

  return (
    <Box
      gap="sm"
      accessible
      accessibilityLabel={t('marketplace.creatorHome.strength.progressA11y', { done, total: stages.length })}
    >
      <Box row gap="xs">
        {stages.map(stage => (
          <Box
            key={stage.key}
            flex={1}
            height={PIECE_HEIGHT}
            borderRadius="full"
            bg={
              stage.state === 'done'
                ? colors.interactive.main
                : stage.state === 'current'
                  ? colors.interactive.soft
                  : colors.surface.elevated
            }
            borderWidth={stage.state === 'current' ? 'thin' : undefined}
            borderColor={stage.state === 'current' ? colors.interactive.main : undefined}
          />
        ))}
      </Box>
      <Box row gap="xs">
        {stages.map(stage => (
          <Box key={stage.key} flex={1}>
            <Text
              variant="caption"
              align="center"
              numberOfLines={1}
              color={stage.state === 'upcoming' ? colors.text.tertiary : colors.interactive.text}
            >
              {t(STAGE_LABEL[stage.key])}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
});

/** The one next step as a raised row: tapping it opens the screen that completes it. */
const NextStepRow = memo<{ step: NonNullable<Completion['nextStep']>; onPress: () => void }>(
  ({ step, onPress }) => {
    const { t } = useTranslation();
    const { colors, sizes, isRTL } = useTheme();
    const Chevron = isRTL ? ChevronLeft : ChevronRight;
    const Icon = step.meta.icon;
    const title = t(step.meta.titleKey);
    const points = `+${percent(step.points)}`;

    return (
      <Pressable
        row
        align="center"
        gap="md"
        p="md"
        minHeight={sizes.button.xl}
        borderRadius="lg"
        bg={colors.layout.base}
        onPress={onPress}
        scaleOnPress
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${points}`}
        accessibilityHint={t('marketplace.creatorHome.strength.nextStep')}
      >
        <Box
          width={sizes.iconButton.md}
          height={sizes.iconButton.md}
          borderRadius="md"
          bg={colors.interactive.soft}
          align="center"
          justify="center"
        >
          <Icon size={sizes.icon.md} color={colors.interactive.main} strokeWidth={iconStroke.regular} />
        </Box>
        <Box flex={1} gap="xs">
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.creatorHome.strength.nextStep')}
          </Text>
          <Text variant="bodyMedium" numberOfLines={1}>
            {title}
          </Text>
        </Box>
        <Text variant="bodySmall" color={colors.interactive.text}>
          {points}
        </Text>
        <Box
          width={sizes.iconButton.sm}
          height={sizes.iconButton.sm}
          borderRadius="full"
          bg={colors.button.primary.bg}
          align="center"
          justify="center"
        >
          <Chevron size={sizes.icon.sm} color={colors.button.primary.text} />
        </Box>
      </Pressable>
    );
  },
);

interface ReadinessSectionProps {
  completion: Completion;
  onStepPress: (target: ProfileStepTarget) => void;
}

/**
 * How ready the storefront is: the percentage, five pieces (info → photo → platforms →
 * prices → ID) that light up as they're done, and the one next step. Always on Home: at
 * 100% it turns into a quiet "complete" card instead of disappearing.
 */
const ReadinessSectionComponent: React.FC<ReadinessSectionProps> = ({ completion, onStepPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { nextStep, stages, percentage } = completion;
  const target = nextStep?.meta.target ?? null;
  const complete = percentage >= 100;
  const handleStep = useCallback(() => {
    if (target) onStepPress(target);
  }, [onStepPress, target]);

  if (!completion.isLoaded) {
    return <Skeleton width="100%" height={SKELETON_HEIGHT} borderRadius="lg" />;
  }

  return (
    <Card p="lg">
      <Box gap="lg">
        <Box row align="center" gap="md">
          <Box flex={1} gap="xs">
            <Text variant="title" numberOfLines={1}>
              {t(complete ? 'marketplace.creatorHome.strength.complete' : 'marketplace.creatorHome.strength.title')}
            </Text>
            <Text variant="bodySmall" color={colors.text.secondary}>
              {t(
                complete
                  ? 'marketplace.creatorHome.strength.completeBody'
                  : 'marketplace.creatorHome.strength.benefit',
              )}
            </Text>
          </Box>
          {complete ? (
            <BadgeCheck size={sizes.icon.lg} color={colors.premium.main} />
          ) : (
            <AnimatedNumber value={percent(percentage)} variant="h2" color={colors.interactive.text} />
          )}
        </Box>
        {stages.length > 1 ? <Pieces stages={stages} /> : null}
        {nextStep && !complete ? <NextStepRow step={nextStep} onPress={handleStep} /> : null}
      </Box>
    </Card>
  );
};

export const ReadinessSection = memo(ReadinessSectionComponent);
