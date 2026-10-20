import React, { memo, useCallback, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Rail, SectionHeader, Text } from '@/shared/ui';
import type { ProfileStepTarget } from '../../../constants/profileSteps';
import type { ProfileStep } from '../../../utils/profileOrbit';

const TICKET_WIDTH = moderateScale(158);
const TICKET_HEIGHT = moderateScale(156);
/** Where the ticket tears: the notches and the dashed line. */
const TEAR_Y = moderateScale(108);
const NOTCH = moderateScale(8);
const ICON_BOX = moderateScale(40);
const TEAR_DASH = [6, 5];
const TEAR_STROKE = 2;

interface TicketProps {
  step: ProfileStep;
  onPress: (target: ProfileStepTarget) => void;
}

/** One missing step as a tear-off ticket: what to do above the tear, what it is worth below. */
const Ticket = memo<TicketProps>(({ step, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes, spacing, isRTL } = useTheme();
  const Icon = step.meta.icon;
  const target = step.meta.target;
  const inReview = step.state === 'review';
  const hue = inReview ? colors.status.info : colors.interactive;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const title = t(step.meta.titleKey);
  const points = t('account.profile.points', { count: step.points });

  const styles = useStyles(
    (): Record<'ticket' | 'top' | 'tear' | 'notchStart' | 'notchEnd', ViewStyle> => {
      const notch: ViewStyle = {
        position: 'absolute',
        top: TEAR_Y - NOTCH,
        width: NOTCH * 2,
        height: NOTCH * 2,
        borderRadius: NOTCH,
        backgroundColor: colors.layout.base,
      };
      return {
        ticket: { width: TICKET_WIDTH, height: TICKET_HEIGHT },
        top: { height: TEAR_Y },
        tear: { position: 'absolute', top: TEAR_Y - TEAR_STROKE / 2, start: spacing.md, end: spacing.md },
        notchStart: { ...notch, start: -NOTCH },
        notchEnd: { ...notch, end: -NOTCH },
      };
    },
    [colors.layout.base, spacing.md],
  );

  const press = useCallback(() => {
    if (target) onPress(target);
  }, [onPress, target]);

  return (
    <Pressable
      style={styles.ticket}
      bg={colors.surface.main}
      borderRadius="lg"
      borderWidth="thin"
      borderColor={colors.border.card}
      onPress={press}
      disabled={!target}
      scaleOnPress
      accessibilityRole={target ? 'button' : 'text'}
      accessibilityLabel={inReview ? `${title}, ${t('account.profile.tickets.inReview')}` : `${title}, ${points}`}
    >
      <Box style={styles.top} p="md" gap="sm">
        <Box width={ICON_BOX} height={ICON_BOX} borderRadius="md" bg={hue.soft} align="center" justify="center">
          <Icon size={sizes.icon.md} color={hue.main} />
        </Box>
        <Text variant="bodySmall" >
          {title}
        </Text>
      </Box>

      <Box style={styles.tear} pointerEvents="none">
        <Svg height={TEAR_STROKE} width="100%">
          <Line
            x1="0"
            y1={TEAR_STROKE / 2}
            x2="100%"
            y2={TEAR_STROKE / 2}
            stroke={colors.border.default}
            strokeWidth={TEAR_STROKE}
            strokeDasharray={TEAR_DASH}
          />
        </Svg>
      </Box>
      <Box style={styles.notchStart} pointerEvents="none" />
      <Box style={styles.notchEnd} pointerEvents="none" />

      <Box flex={1} row align="center" justify="space-between" px="md">
        <Text variant="buttonSmall" color={hue.text}>
          {inReview ? t('account.profile.tickets.inReview') : points}
        </Text>
        {target ? <Chevron size={sizes.icon.sm} color={colors.icon.secondary} /> : null}
      </Box>
    </Pressable>
  );
});

interface MissingStepsRailProps {
  steps: readonly ProfileStep[];
  onStepPress: (target: ProfileStepTarget) => void;
}

/** "Complete your profile": one ticket per missing step, most points first (bounded, ≤ 8). */
const MissingStepsRailComponent: React.FC<MissingStepsRailProps> = ({ steps, onStepPress }) => {
  const { t } = useTranslation();
  const summary = useMemo(() => {
    const points = steps.reduce((sum, step) => (step.state === 'review' ? sum : sum + step.points), 0);
    return t('account.profile.tickets.summary', {
      steps: t('account.profile.tickets.steps', { count: steps.length }),
      points: t('account.profile.points', { count: points }),
    });
  }, [steps, t]);

  return (
    <Box gap="md">
      <Box px="xl">
        <SectionHeader title={t('account.profile.completeTitle')} subtitle={summary} />
      </Box>
      <Rail>
        {steps.map(step => (
          <Ticket key={step.key} step={step} onPress={onStepPress} />
        ))}
      </Rail>
    </Box>
  );
};

export const MissingStepsRail = memo(MissingStepsRailComponent);
