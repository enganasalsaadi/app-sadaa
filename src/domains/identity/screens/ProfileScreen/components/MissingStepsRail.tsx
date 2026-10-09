import React, { memo } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { formatNumber } from '@/core/i18n';
import { Box, Card, SectionHeader, StatusPill, Text } from '@/shared/ui';
import type { ProfileStepTarget } from '../../../constants/profileSteps';
import type { MissingStep } from '../../../utils/profileCompletion';

const CARD_WIDTH = moderateScale(148);
const ICON_BOX = moderateScale(36);

interface StepCardProps {
  step: MissingStep;
  onPress: (target: ProfileStepTarget) => void;
}

const StepCard = memo<StepCardProps>(({ step, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const Icon = step.meta.icon;
  const target = step.meta.target;
  const title = t(step.meta.titleKey);

  return (
    <Card
      width={CARD_WIDTH}
      p="md"
      onPress={target ? () => onPress(target) : undefined}
      accessibilityLabel={title}
    >
      <Box gap="sm">
        <Box row justify="space-between" align="center">
          <Box
            width={ICON_BOX}
            height={ICON_BOX}
            borderRadius="md"
            bg={colors.interactive.soft}
            align="center"
            justify="center"
          >
            <Icon size={sizes.icon.sm} color={colors.interactive.main} />
          </Box>
          <StatusPill
            label={`+${formatNumber(step.points / 100, { style: 'percent' })}`}
            tone="interactive"
            size="sm"
          />
        </Box>
        <Text variant="bodyMedium" numberOfLines={2}>
          {title}
        </Text>
      </Box>
    </Card>
  );
});

interface MissingStepsRailProps {
  steps: MissingStep[];
  onStepPress: (target: ProfileStepTarget) => void;
}

/** "Complete your profile": one swipeable card per incomplete step (bounded list, ≤ 8). */
const MissingStepsRailComponent: React.FC<MissingStepsRailProps> = ({ steps, onStepPress }) => {
  const { t } = useTranslation();
  const styles = useStyles(({ spacing }) => ({
    content: { paddingHorizontal: spacing.xl, gap: spacing.md },
  }));

  if (steps.length === 0) return null;

  return (
    <Box gap="md">
      <Box px="xl">
        <SectionHeader
          title={t('account.profile.completeTitle')}
          subtitle={t('account.profile.completeSubtitle')}
        />
      </Box>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {steps.map(step => (
          <StepCard key={step.key} step={step} onPress={onStepPress} />
        ))}
      </ScrollView>
    </Box>
  );
};

export const MissingStepsRail = memo(MissingStepsRailComponent);
