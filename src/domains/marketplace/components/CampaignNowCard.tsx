import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Ban, CheckCheck, Hourglass, PauseCircle, Users, type LucideIcon } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { iconStroke, resolveHue, useTheme } from '@/core/theme';
import { Box, Card, LiveDot, Text } from '@/shared/ui';
import { CAMPAIGN_COUNTDOWN_UNIT } from '../constants/campaignDetail';
import type { CampaignNow, CampaignNowCopy, CampaignNowGlyph, CampaignNowRing, CampaignNowTodo } from '../utils/campaignNow';
import { CampaignNowTodoRow } from './CampaignNowTodoRow';
import { CampaignReviewNoteCard } from './CampaignReviewNoteCard';
import { CampaignRing } from './CampaignRing';

const RING = 80;
const RING_STROKE = 7;

const GLYPH = {
  review: Hourglass,
  done: CheckCheck,
  ended: Ban,
  people: Users,
  pause: PauseCircle,
} as const satisfies Record<CampaignNowGlyph, LucideIcon>;

export interface CampaignNowCardProps {
  now: CampaignNow;
  /** The team's note, kept on the card while the campaign is sent back, rejected or removed. */
  note: string | null;
  onTodo: (todo: CampaignNowTodo) => void;
  /** A lifecycle call is in flight: the rows wait. */
  busy: boolean;
}

/**
 * «What is happening now, and what is asked of you»: the page's first answer. A ring for the one
 * clock or count that matters, the status in a sentence, then each thing the campaign waits on as
 * a row (lit when pressing), and what comes after. Sits inside the page body, not over the cover.
 */
const CampaignNowCardComponent: React.FC<CampaignNowCardProps> = ({ now, note, onTodo, busy }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const hue = resolveHue(colors, now.tone);
  const line = (value: CampaignNowCopy): string => ('text' in value ? value.text : t(value.key, value.params));
  const head = line(now.head);

  const ringOf = (ring: CampaignNowRing): { progress: number; label: string; content: React.ReactNode } => {
    switch (ring.kind) {
      case 'countdown': {
        const unit = t(CAMPAIGN_COUNTDOWN_UNIT[ring.unit]);
        return {
          progress: ring.remaining,
          label: t('marketplace.campaign.detail.island.ringA11y', { value: ring.value, unit }),
          content: (
            <Box align="center">
              <Text variant="amountTitle" color={hue.text}>
                {formatNumber(ring.value)}
              </Text>
              <Text variant="caption" color={colors.text.tertiary}>
                {unit}
              </Text>
            </Box>
          ),
        };
      }
      case 'ratio':
        return {
          progress: ring.total > 0 ? ring.done / ring.total : 0,
          label: t('marketplace.campaign.detail.now.ring.readyA11y', { done: ring.done, total: ring.total }),
          content: (
            <Box align="center">
              <Text variant="amountTitle" color={hue.text}>
                {`${formatNumber(ring.done)}/${formatNumber(ring.total)}`}
              </Text>
              <Text variant="caption" color={colors.text.tertiary}>
                {t('marketplace.campaign.detail.now.ring.ready')}
              </Text>
            </Box>
          ),
        };
      case 'count':
        return {
          progress: 1,
          label: t('marketplace.campaign.detail.now.ring.creatorsA11y', { count: ring.value }),
          content: (
            <Box align="center">
              <Text variant="amountTitle" color={hue.text}>
                {formatNumber(ring.value)}
              </Text>
              <Text variant="caption" color={colors.text.tertiary}>
                {t('marketplace.campaign.detail.now.ring.creators')}
              </Text>
            </Box>
          ),
        };
      case 'glyph': {
        const Glyph = GLYPH[ring.glyph];
        return {
          progress: 1,
          label: head,
          content: <Glyph size={sizes.icon.lg} color={hue.main} strokeWidth={iconStroke.regular} />,
        };
      }
      default: {
        const _exhaustive: never = ring;
        return _exhaustive;
      }
    }
  };
  const ring = ringOf(now.ring);

  return (
    <Card p="lg" shadow="card" borderRadius="xl">
      <Box gap="lg">
        <Box row align="center" gap="lg">
          <CampaignRing
            progress={ring.progress}
            color={hue.main}
            trackColor={hue.soft}
            size={RING}
            strokeWidth={RING_STROKE}
            accessibilityLabel={ring.label}
          >
            {ring.content}
          </CampaignRing>
          <Box flex={1} gap="xs">
            <Box row align="center" gap="sm">
              <LiveDot color={hue.main} size={sizes.dot.md} />
              <Text variant="caption" color={hue.text}>
                {t('marketplace.campaign.detail.now.tag')}
              </Text>
            </Box>
            <Text variant="title" color={colors.text.primary} accessibilityRole="header">
              {head}
            </Text>
            {now.body ? (
              <Text variant="bodySmall" color={colors.text.secondary}>
                {line(now.body)}
              </Text>
            ) : null}
          </Box>
        </Box>
        {note ? <CampaignReviewNoteCard note={note} /> : null}
        {now.todos.length > 0 ? (
          <Box gap="sm">
            <Text variant="caption" color={colors.text.tertiary}>
              {t('marketplace.campaign.detail.now.todoTitle')}
            </Text>
            {now.todos.map(todo => (
              <CampaignNowTodoRow key={todoKey(todo)} todo={todo} onPress={onTodo} busy={busy} />
            ))}
          </Box>
        ) : null}
        {now.calm ? (
          <Box row align="center" gap="md" p="md" borderRadius="lg" bg={colors.status.success.soft}>
            <CheckCheck size={sizes.icon.md} color={colors.status.success.text} strokeWidth={iconStroke.regular} />
            <Box flex={1}>
              <Text variant="bodySmall" color={colors.status.success.text}>
                {t('marketplace.campaign.detail.now.calm')}
              </Text>
            </Box>
          </Box>
        ) : null}
        {now.next ? (
          <Box pt="md" borderTopWidth="thin" borderColor={colors.layout.divider}>
            <Text variant="caption" color={colors.text.secondary}>
              {`${t('marketplace.campaign.detail.now.nextLabel')} ${line(now.next)}`}
            </Text>
          </Box>
        ) : null}
      </Box>
    </Card>
  );
};

const todoKey = (todo: CampaignNowTodo): string => {
  switch (todo.kind) {
    case 'missing':
      return `missing:${todo.missing}`;
    case 'decision':
      return `decision:${todo.action}`;
    case 'applicants':
    case 'extend':
    case 'edit':
      return todo.kind;
    default: {
      const _exhaustive: never = todo;
      return _exhaustive;
    }
  }
};

export const CampaignNowCard = memo(CampaignNowCardComponent);
