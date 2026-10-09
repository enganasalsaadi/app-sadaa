import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { iconStroke, useTheme } from '@/core/theme';
import { AnimatedNumber, Box, Card, Pressable, Text, Timeline, type TimelineStep } from '@/shared/ui';
import type { ProfileStepTarget, StrengthStageKey } from '@/domains/identity';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';

type Completion = CreatorHomeScreenModel['completion'];

interface ProfileStrengthCardProps {
  completion: Completion;
  onStepPress: (target: ProfileStepTarget) => void;
}

const STAGE_LABEL = {
  info: 'marketplace.creatorHome.strength.stage.info',
  avatar: 'marketplace.creatorHome.strength.stage.avatar',
  platforms: 'marketplace.creatorHome.strength.stage.platforms',
  rates: 'marketplace.creatorHome.strength.stage.rates',
  kyc: 'marketplace.creatorHome.strength.stage.kyc',
} as const satisfies Record<StrengthStageKey, ParseKeys>;

const percent = (value: number) => formatNumber(value / 100, { style: 'percent' });

/** The one next step as a teal row: tapping it opens the screen that completes it. */
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
        px="md"
        py="sm"
        minHeight={sizes.button.lg}
        borderRadius="md"
        bg={colors.interactive.soft}
        onPress={onPress}
        scaleOnPress
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${points}`}
        accessibilityHint={t('marketplace.creatorHome.strength.nextStep')}
      >
        <Box
          width={sizes.iconButton.sm}
          height={sizes.iconButton.sm}
          borderRadius="md"
          bg={colors.surface.main}
          align="center"
          justify="center"
        >
          <Icon size={sizes.icon.sm} color={colors.interactive.main} strokeWidth={iconStroke.regular} />
        </Box>
        <Box flex={1} gap="xs">
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.creatorHome.strength.nextStep')}
          </Text>
          <Text variant="bodyMedium" color={colors.interactive.text} numberOfLines={1}>
            {title}
          </Text>
        </Box>
        <Text variant="bodySmall" color={colors.interactive.text}>
          {points}
        </Text>
        <Chevron size={sizes.icon.sm} color={colors.interactive.text} />
      </Pressable>
    );
  },
);

/**
 * White card: completion %, why it matters (brands find complete profiles), the
 * five-stage track (rule 09 §3.1) and the one next step. Hidden at 100%.
 */
const ProfileStrengthCardComponent: React.FC<ProfileStrengthCardProps> = ({
  completion,
  onStepPress,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { nextStep, stages } = completion;
  const target = nextStep?.meta.target ?? null;
  const handleStep = useCallback(() => {
    if (target) onStepPress(target);
  }, [onStepPress, target]);

  const steps = useMemo<TimelineStep[]>(
    () => stages.map(stage => ({ key: stage.key, title: t(STAGE_LABEL[stage.key]), state: stage.state })),
    [stages, t],
  );

  return (
    <Card p="lg">
      <Box gap="lg">
        <Box row align="center" gap="md">
          <Box flex={1} gap="xs">
            <Text variant="title" numberOfLines={1}>
              {t('marketplace.creatorHome.strength.title')}
            </Text>
            <Text variant="bodySmall" color={colors.text.secondary}>
              {t('marketplace.creatorHome.strength.benefit')}
            </Text>
          </Box>
          <AnimatedNumber value={percent(completion.percentage)} variant="h3" color={colors.interactive.text} />
        </Box>
        {steps.length > 1 ? <Timeline steps={steps} variant="track" /> : null}
        {nextStep ? <NextStepRow step={nextStep} onPress={handleStep} /> : null}
      </Box>
    </Card>
  );
};

export const ProfileStrengthCard = memo(ProfileStrengthCardComponent);
