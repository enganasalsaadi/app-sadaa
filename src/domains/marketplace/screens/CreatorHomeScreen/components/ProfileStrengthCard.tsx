import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { iconStroke, useTheme } from '@/core/theme';
import { Box, GradientSurface, Pressable, ProgressBar, Text } from '@/shared/ui';
import type { ProfileStepTarget } from '@/domains/identity';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';

type Completion = CreatorHomeScreenModel['completion'];

interface ProfileStrengthCardProps {
  completion: Completion;
  onStepPress: (target: ProfileStepTarget) => void;
}

const percent = (value: number) => formatNumber(value / 100, { style: 'percent' });

/** The one next step as a glass row: tapping it opens the screen that completes it. */
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
        borderWidth="thin"
        borderColor={colors.glass.border}
        bg={colors.glass.fill}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${points}`}
        accessibilityHint={t('marketplace.creatorHome.strength.nextStep')}
      >
        <Box
          width={sizes.iconButton.sm}
          height={sizes.iconButton.sm}
          borderRadius="md"
          bg={colors.glass.badge}
          align="center"
          justify="center"
        >
          <Icon size={sizes.icon.sm} color={colors.text.onBrand} strokeWidth={iconStroke.regular} />
        </Box>
        <Box flex={1} gap="xs">
          <Text variant="caption" color={colors.text.onBrandMuted}>
            {t('marketplace.creatorHome.strength.nextStep')}
          </Text>
          <Text variant="bodyMedium" color={colors.text.onBrand} numberOfLines={1}>
            {title}
          </Text>
        </Box>
        <Text variant="bodySmall" color={colors.glass.iconInteractive}>
          {points}
        </Text>
        <Chevron size={sizes.icon.sm} color={colors.text.onBrandMuted} />
      </Pressable>
    );
  },
);

/**
 * Navy glass card: completion %, why it matters (brands find complete profiles), the
 * bar and the one next step; the full rail stays on Profile. Hidden at 100%.
 */
const ProfileStrengthCardComponent: React.FC<ProfileStrengthCardProps> = ({
  completion,
  onStepPress,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { nextStep } = completion;
  const target = nextStep?.meta.target ?? null;
  const handleStep = useCallback(() => {
    if (target) onStepPress(target);
  }, [onStepPress, target]);

  return (
    <GradientSurface variant="brand" borderRadius="lg" p="lg" gap="lg">
      <Box row align="center" gap="md">
        <Box flex={1} gap="xs">
          <Text variant="title" color={colors.text.onBrand} numberOfLines={1}>
            {t('marketplace.creatorHome.strength.title')}
          </Text>
          <Text variant="bodySmall" color={colors.text.onBrandMuted}>
            {t('marketplace.creatorHome.strength.benefit')}
          </Text>
        </Box>
        <Text variant="h2" color={colors.text.onBrand}>
          {percent(completion.percentage)}
        </Text>
      </Box>
      <ProgressBar
        value={completion.percentage / 100}
        size="md"
        surface="brand"
        accessibilityLabel={t('marketplace.creatorHome.strength.title')}
      />
      {nextStep ? <NextStepRow step={nextStep} onPress={handleStep} /> : null}
    </GradientSurface>
  );
};

export const ProfileStrengthCard = memo(ProfileStrengthCardComponent);
