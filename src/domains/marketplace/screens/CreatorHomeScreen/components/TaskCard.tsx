import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Clock, Lock, Pause, type LucideIcon } from 'lucide-react-native';
import { iconStroke, moderateScale, useTheme } from '@/core/theme';
import { Box, MoneyText, Text } from '@/shared/ui';
import type { StrengthStageKey } from '@/domains/identity';
import { DealFace } from '../../../components/DealFace';
import {
  CREATOR_DEAL_ACTION_CTA,
  UNKNOWN_CREATOR_DEAL_ACTION_CTA,
} from '../../../constants/creatorHomeDeals';
import { useClock } from '../../../hooks/useClock';
import type { CreatorActiveDeal } from '../../../types';
import { creatorDealClock } from '../../../utils/creatorHomeDeals';
import { formatRemaining } from '../../../utils/dealTimer';
import { CREATOR_DEAL_ACTION_KICKER, UNKNOWN_CREATOR_DEAL_ACTION_KICKER } from '../constants/dealKickers';
import { HOME_STEP_DEF } from '../constants/homeSteps';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';
import type { HomeTask } from '../utils/buildHomeTasks';
import { TaskCardFrame, type TaskTone } from './TaskCardFrame';

const FACE = moderateScale(52);
const MINUTE = 60_000;

type Notice = NonNullable<CreatorHomeScreenModel['notice']>;

/** The card's mark: a deal's brand face, or a tinted tile with the task's glyph. */
const Mark = memo<{ icon: LucideIcon; tone: TaskTone }>(({ icon: Icon, tone }) => {
  const { colors, sizes } = useTheme();
  const hue = tone === 'interactive' ? colors.interactive : colors.status[tone];
  return (
    <Box width={FACE} height={FACE} borderRadius="md" bg={hue.soft} align="center" justify="center">
      <Icon size={sizes.icon.md} color={hue.text} strokeWidth={iconStroke.regular} />
    </Box>
  );
});

const Headline = memo<{ title: string; body: string; lines?: number }>(({ title, body, lines = 1 }) => {
  const { colors } = useTheme();
  return (
    <Box flex={1} gap="xs">
      <Text variant="title" numberOfLines={2}>
        {title}
      </Text>
      <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={lines}>
        {body}
      </Text>
    </Box>
  );
});

interface CardPlace {
  index: number;
  count: number;
  onNext: () => void;
}

/** A deal waiting on the creator: the server's action big, what it is worth, the time left. */
const DealTask = memo<CardPlace & { deal: CreatorActiveDeal; onOpen: (id: string) => void }>(
  ({ deal, onOpen, ...place }) => {
    const { t } = useTranslation();
    const { colors, sizes } = useTheme();
    const now = useClock(MINUTE);
    const clock = creatorDealClock(deal.dueAt, now);
    const open = useCallback(() => onOpen(deal.id), [deal.id, onOpen]);
    const key = deal.action?.key ?? null;
    const kicker = key ? CREATOR_DEAL_ACTION_KICKER[key] : UNKNOWN_CREATOR_DEAL_ACTION_KICKER;
    const action = deal.action?.label ?? deal.status.label;
    const name = deal.brand.name ?? '';
    const late = clock.kind === 'left' && clock.late;

    return (
      <TaskCardFrame
        {...place}
        icon={kicker.icon}
        kicker={t(kicker.labelKey)}
        tone="interactive"
        cta={{
          label: t(key ? CREATOR_DEAL_ACTION_CTA[key] : UNKNOWN_CREATOR_DEAL_ACTION_CTA),
          onPress: open,
          accessibilityLabel: t('marketplace.creatorHome.deals.cardLabel', { name, action }),
        }}
      >
        <Box row align="center" gap="md">
          <DealFace party={deal.brand} size={FACE} />
          <Headline title={action} body={name ? `${name} · ${deal.title}` : deal.title} />
        </Box>
        <Box row wrap gap="sm">
          <Box row align="center" px="md" py="xs" borderRadius="full" bg={colors.money.soft}>
            <MoneyText value={deal.total} size="sm" tone="money" />
          </Box>
          <Box
            row
            align="center"
            gap="xs"
            px="md"
            py="xs"
            borderRadius="full"
            bg={late ? colors.status.warning.soft : colors.surface.elevated}
          >
            {clock.kind === 'paused' ? (
              <Pause size={sizes.icon.xs} color={colors.text.secondary} />
            ) : (
              <Clock size={sizes.icon.xs} color={late ? colors.status.warning.main : colors.text.secondary} />
            )}
            <Text variant="caption" color={late ? colors.status.warning.text : colors.text.secondary}>
              {clock.kind === 'left'
                ? t('marketplace.creatorHome.deals.left', { time: formatRemaining(t, clock.seconds) })
                : t('marketplace.creatorHome.deals.paused')}
            </Text>
          </Box>
        </Box>
      </TaskCardFrame>
    );
  },
);

/** The one blocker: it stops offers, so it leads the deck in its own tone. */
const NoticeTask = memo<CardPlace & { notice: Notice; welcome: boolean }>(({ notice, welcome, ...place }) => {
  const { t } = useTranslation();
  const icon = notice.key === 'kitHidden' ? Lock : notice.tone === 'info' ? Clock : AlertCircle;
  return (
    <TaskCardFrame
      {...place}
      icon={AlertCircle}
      kicker={t(welcome ? 'marketplace.creatorHome.tasks.startHere' : 'marketplace.creatorHome.tasks.attention')}
      tone={notice.tone}
      cta={
        notice.action
          ? { label: notice.action.label, onPress: notice.action.onPress, loading: notice.action.busy }
          : undefined
      }
    >
      <Box row align="center" gap="md">
        <Mark icon={icon} tone={notice.tone} />
        <Headline title={notice.title} body={notice.message} lines={3} />
      </Box>
    </TaskCardFrame>
  );
});

/** A storefront stage still open, before the first offer ever. */
const StepTask = memo<CardPlace & { stage: StrengthStageKey; onStep: (stage: StrengthStageKey) => void }>(
  ({ stage, onStep, ...place }) => {
    const { t } = useTranslation();
    const def = HOME_STEP_DEF[stage];
    const run = useCallback(() => onStep(stage), [onStep, stage]);
    return (
      <TaskCardFrame
        {...place}
        icon={def.icon}
        kicker={t('marketplace.creatorHome.tasks.setup')}
        tone="interactive"
        cta={{ label: t(def.ctaKey), onPress: run }}
      >
        <Box row align="center" gap="md">
          <Mark icon={def.icon} tone="interactive" />
          <Headline title={t(def.titleKey)} body={t(def.bodyKey)} lines={2} />
        </Box>
      </TaskCardFrame>
    );
  },
);

interface TaskCardProps extends CardPlace {
  task: HomeTask;
  notice: CreatorHomeScreenModel['notice'];
  welcome: boolean;
  onOpenDeal: (id: string) => void;
  onStep: (stage: StrengthStageKey) => void;
}

/** The front card of the deck, drawn for its kind of task. */
const TaskCardComponent: React.FC<TaskCardProps> = ({ task, notice, welcome, onOpenDeal, onStep, ...place }) => {
  switch (task.kind) {
    case 'deal':
      return <DealTask {...place} deal={task.deal} onOpen={onOpenDeal} />;
    case 'notice':
      return notice ? <NoticeTask {...place} notice={notice} welcome={welcome} /> : null;
    case 'step':
      return <StepTask {...place} stage={task.stage} onStep={onStep} />;
    default: {
      const _exhaustive: never = task;
      return _exhaustive;
    }
  }
};

export const TaskCard = memo(TaskCardComponent);
