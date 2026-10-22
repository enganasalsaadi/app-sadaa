import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { BadgeCheck, Check } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { iconStroke, moderateScale, useTheme } from '@/core/theme';
import { Box, CustomButton, Pressable, Skeleton, Text } from '@/shared/ui';
import type { StrengthStage, StrengthStageKey } from '@/domains/identity';
import { CampaignRing } from '../../../components/CampaignRing';
import { HOME_STEP_DEF } from '../constants/homeSteps';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';

type Completion = CreatorHomeScreenModel['completion'];

const STAGE_LABEL = {
  info: 'marketplace.creatorHome.strength.stage.info',
  avatar: 'marketplace.creatorHome.strength.stage.avatar',
  platforms: 'marketplace.creatorHome.strength.stage.platforms',
  rates: 'marketplace.creatorHome.strength.stage.rates',
  kyc: 'marketplace.creatorHome.strength.stage.kyc',
} as const satisfies Record<StrengthStageKey, ParseKeys>;

const STATE_LABEL = {
  done: 'marketplace.creatorHome.readiness.state.done',
  current: 'marketplace.creatorHome.readiness.state.current',
  upcoming: 'marketplace.creatorHome.readiness.state.upcoming',
} as const satisfies Record<StrengthStage['state'], ParseKeys>;

/** Ring in design points (scaled inside `CampaignRing`). */
const RING = 64;
const RING_STROKE = 7;
const NODE = moderateScale(32);
const SKELETON_HEIGHT = moderateScale(168);
/** Under this, the copy says «let's finish» instead of «almost ready». */
const ALMOST = 60;

const percent = (value: number) => formatNumber(value / 100, { style: 'percent' });

/** One stage on the track: a teal check when done, a ringed glyph while it's next. Tap = go do it. */
const StageNode = memo<{ stage: StrengthStage; onPress: (key: StrengthStageKey) => void }>(({ stage, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const press = useCallback(() => onPress(stage.key), [onPress, stage.key]);
  const done = stage.state === 'done';
  const current = stage.state === 'current';
  const Icon = done ? Check : HOME_STEP_DEF[stage.key].icon;
  const label = t(STAGE_LABEL[stage.key]);

  return (
    <Pressable
      flex={1}
      align="center"
      gap="xs"
      minHeight={sizes.button.lg}
      onPress={press}
      disabled={done}
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.creatorHome.readiness.stageA11y', { stage: label, state: t(STATE_LABEL[stage.state]) })}
      accessibilityState={{ disabled: done }}
    >
      <Box
        width={NODE}
        height={NODE}
        borderRadius="sm"
        align="center"
        justify="center"
        bg={done ? colors.interactive.main : current ? colors.interactive.soft : colors.surface.elevated}
        borderWidth={current ? 'md' : undefined}
        borderColor={current ? colors.interactive.main : undefined}
      >
        <Icon
          size={sizes.icon.xs}
          strokeWidth={iconStroke.bold}
          color={done ? colors.text.onAccent : current ? colors.interactive.text : colors.text.tertiary}
        />
      </Box>
      <Text
        variant="caption"
        align="center"
        numberOfLines={1}
        color={done ? colors.text.secondary : current ? colors.interactive.text : colors.text.tertiary}
      >
        {label}
      </Text>
    </Pressable>
  );
});

interface ReadinessSectionProps {
  completion: Completion;
  onStepPress: (key: StrengthStageKey) => void;
}

/**
 * How ready the storefront is: a ring that draws to the percentage, the five stages (info →
 * photo → platforms → prices → ID) and one button for the next. Always on Home: at 100% it turns
 * into a quiet «complete» card instead of disappearing.
 */
const ReadinessSectionComponent: React.FC<ReadinessSectionProps> = ({ completion, onStepPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { stages, percentage } = completion;
  const complete = percentage >= 100;
  const left = stages.filter(stage => stage.state !== 'done').length;
  const next = stages.find(stage => stage.state === 'current') ?? stages.find(stage => stage.state !== 'done');
  const goNext = useCallback(() => {
    if (next) onStepPress(next.key);
  }, [next, onStepPress]);

  if (!completion.isLoaded) {
    return (
      <Box px="xl">
        <Skeleton width="100%" height={SKELETON_HEIGHT} borderRadius="xl" />
      </Box>
    );
  }

  const title = complete
    ? 'marketplace.creatorHome.readiness.complete'
    : percentage >= ALMOST
      ? 'marketplace.creatorHome.readiness.almost'
      : 'marketplace.creatorHome.readiness.start';

  return (
    <Box mx="xl" p="lg" gap="lg" borderRadius="xl" bg={colors.surface.main} shadow="card">
      <Box row align="center" gap="lg">
        <CampaignRing
          progress={percentage / 100}
          color={colors.interactive.main}
          trackColor={colors.surface.elevated}
          size={RING}
          strokeWidth={RING_STROKE}
          accessibilityLabel={t('marketplace.creatorHome.readiness.ringA11y', { percent: percent(percentage) })}
        >
          {complete ? (
            <BadgeCheck size={sizes.icon.lg} color={colors.premium.main} />
          ) : (
            <Text variant="title">{percent(percentage)}</Text>
          )}
        </CampaignRing>
        <Box flex={1} gap="xs">
          <Text variant="title" accessibilityRole="header">
            {t(title)}
          </Text>
          <Text variant="bodySmall" color={colors.text.secondary}>
            {complete
              ? t('marketplace.creatorHome.readiness.completeBody')
              : t('marketplace.creatorHome.readiness.left', { count: left })}
          </Text>
        </Box>
      </Box>
      {stages.length > 1 ? (
        <Box row gap="xs">
          {stages.map(stage => (
            <StageNode key={stage.key} stage={stage} onPress={onStepPress} />
          ))}
        </Box>
      ) : null}
      {!complete && next ? (
        <CustomButton
          title={t(HOME_STEP_DEF[next.key].ctaKey)}
          onPress={goNext}
          fullWidth
        />
      ) : null}
    </Box>
  );
};

export const ReadinessSection = memo(ReadinessSectionComponent);
