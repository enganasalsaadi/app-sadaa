import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  Link2,
  MessageSquareText,
  type LucideIcon,
} from 'lucide-react-native';
import { formatDate } from '@/core/i18n';
import { resolveHue, useStyles, useTheme, type HueTone } from '@/core/theme';
import {
  Box,
  CustomButton,
  MoneyText,
  Pressable,
  StatusPill,
  Text,
} from '@/shared/ui';
import { DEAL_RETENTION_PHASE_LOOK } from '../constants/dealRetention';
import type { DealRetentionCaseView } from '../hooks/useDealRetention';
import type { DealRole } from '../types';
import { parseLiveUrl } from '../utils/dealPublish';
import type { DealRetentionCaseAction } from '../utils/dealRetention';
import { DealHoldNote } from './DealHoldNote';
import { DealDisputeClock } from './DealDisputeClock';
import { EvidenceTile } from './EvidenceTile';

const WHEN_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  hour: 'numeric',
  minute: '2-digit',
};

export interface DealRetentionCaseCardProps {
  view: DealRetentionCaseView;
  role: DealRole;
  /** The other side's name, isolated. */
  other: string;
  confirming: boolean;
  onAction: (caseId: string, action: DealRetentionCaseAction) => void;
  onOpenShot: (caseId: string, url: string) => void;
  onLink: (url: string) => void;
}

/** A quoted line from one side or the team: who said it, then the words. */
const Quote = memo<{ by: string; text: string; tone: HueTone }>(
  ({ by, text, tone }) => {
    const { colors, sizes } = useTheme();
    const hue = resolveHue(colors, tone);
    return (
      <Box row gap="sm" p="md" borderRadius="md" bg={hue.soft}>
        <MessageSquareText size={sizes.icon.sm} color={hue.main} />
        <Box flex={1} gap="xs">
          <Text variant="overline" color={hue.text}>
            {by}
          </Text>
          <Text variant="bodySmall" color={colors.text.primary}>
            {text}
          </Text>
        </Box>
      </Box>
    );
  },
);

/** A case's screenshots, thumb-sized; photos open in the viewer. */
const Shots = memo<{
  caseId: string;
  urls: string[];
  label: string;
  onOpen: (caseId: string, url: string) => void;
}>(({ caseId, urls, label, onOpen }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const open = useCallback(
    (url: string) => onOpen(caseId, url),
    [caseId, onOpen],
  );
  if (urls.length === 0) return null;
  return (
    <Box gap="xs">
      <Text variant="caption" color={colors.text.secondary}>
        {label}
      </Text>
      <Box row gap="sm">
        {urls.map((url, index) => (
          <EvidenceTile
            key={url}
            tileKey={url}
            kind="image"
            url={url}
            onOpen={open}
            accessibilityLabel={t('marketplace.deals.retention.case.shotA11y', {
              index: index + 1,
            })}
          />
        ))}
      </Box>
    </Box>
  );
});

/** The case's own clock (`due_at`), and what happens when it runs out. */
const CaseClock = memo<{ dueAt: number; lead: string; after: string }>(
  ({ dueAt, lead, after }) => {
    const { colors, sizes } = useTheme();
    return (
      <Box
        row
        align="center"
        gap="sm"
        p="md"
        borderRadius="md"
        bg={colors.status.warning.soft}
      >
        <Clock size={sizes.icon.sm} color={colors.status.warning.main} />
        <Box flex={1} gap="xs">
          <Box row align="center" justify="space-between" gap="sm">
            <Text variant="buttonSmall" color={colors.status.warning.text}>
              {lead}
            </Text>
            <DealDisputeClock
              endsAt={dueAt}
              variant="title"
              color={colors.status.warning.text}
            />
          </Box>
          <Text variant="caption" color={colors.text.secondary}>
            {after}
          </Text>
        </Box>
      </Box>
    );
  },
);

/**
 * One retention report (approved P9.2): a tinted band says where it stands and for whom, then the
 * report (reason, note, screenshots), the creator's answer (restored link + account check and
 * screenshots, or the contest note), the brand's rejection note, the team's note and any clawback
 * (mint for the brand who got it back, red for the creator who lost it). The side the case waits
 * on gets its two answers at the bottom, under the case's clock.
 */
const DealRetentionCaseCardComponent: React.FC<DealRetentionCaseCardProps> = ({
  view,
  role,
  other,
  confirming,
  onAction,
  onOpenShot,
  onLink,
}) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const brand = role === 'brand';
  const { retentionCase: c, phase, actions } = view;
  const look = DEAL_RETENTION_PHASE_LOOK[phase];
  const hue = resolveHue(colors, look.tone);
  const Icon: LucideIcon = look.icon[role];
  const styles = useStyles(
    ({ radii, borderWidths }): Record<'card' | 'band' | 'grow', ViewStyle> => ({
      // The shadow sits on the outer box: `overflow: hidden` would clip it on iOS.
      card: {
        borderRadius: radii.xl,
        overflow: 'hidden',
        borderWidth: borderWidths.hairline,
        borderColor: colors.border.card,
      },
      band: { backgroundColor: hue.soft },
      grow: { flex: 1 },
    }),
    [colors.border.card, hue.soft],
  );

  const act = useCallback(
    (action: DealRetentionCaseAction) => () => onAction(c.id, action),
    [c.id, onAction],
  );
  const link = c.restoredUrl;
  const openLink = useCallback(() => {
    if (link) onLink(link);
  }, [link, onLink]);
  const host = link ? parseLiveUrl(link)?.host ?? link : null;

  const title = look.title
    ? t(look.title[role], { name: other })
    : c.status.label;
  const reported = c.reportedAt
    ? formatDate(c.reportedAt, WHEN_FORMAT, i18n.language)
    : null;
  const open = phase === 'awaitingCreator' || phase === 'awaitingBrand';
  const clock =
    open && c.dueAt !== null
      ? phase === 'awaitingCreator'
        ? {
            lead: brand
              ? t('marketplace.deals.retention.case.clock.answerBrand', {
                  name: other,
                })
              : t('marketplace.deals.retention.case.clock.answerCreator'),
            after: t('marketplace.deals.retention.case.clock.answerAfter'),
          }
        : {
            lead: brand
              ? t('marketplace.deals.retention.case.clock.confirmBrand')
              : t('marketplace.deals.retention.case.clock.confirmCreator', {
                  name: other,
                }),
            after: t('marketplace.deals.retention.case.clock.confirmAfter'),
          }
      : null;
  const theirs = (mine: boolean) =>
    mine ? t('marketplace.deals.retention.case.you') : other;

  return (
    <Box borderRadius="xl" bg={colors.surface.main} shadow="lg">
      <Box style={styles.card}>
        <Box row align="center" gap="sm" px="lg" py="md" style={styles.band}>
          <Icon size={sizes.icon.sm} color={hue.main} />
          <Text
            variant="buttonSmall"
            color={hue.text}
            accessibilityRole="header"
          >
            {title}
          </Text>
        </Box>
        <Box p="lg" gap="md">
          <Box gap="xs">
            <Text variant="title" color={colors.text.primary}>
              {t('marketplace.deals.retention.case.reason', {
                reason: c.reason.label,
              })}
            </Text>
            <Text variant="caption" color={colors.text.tertiary}>
              {reported
                ? t('marketplace.deals.retention.case.reportedOn', {
                    title: view.title,
                    date: reported,
                  })
                : view.title}
            </Text>
          </Box>
          {c.note ? (
            <Quote by={theirs(brand)} text={c.note} tone="neutral" />
          ) : null}
          <Shots
            caseId={c.id}
            urls={view.reportShots}
            label={t('marketplace.deals.retention.case.reportShots')}
            onOpen={onOpenShot}
          />
          {c.escalationReason ? (
            <Text variant="bodySmall" color={colors.text.secondary}>
              {c.escalationReason.label}
            </Text>
          ) : null}
          {c.response === 'contested' && c.responseNote ? (
            <Quote by={theirs(!brand)} text={c.responseNote} tone="warning" />
          ) : null}
          {host && link ? (
            <Box gap="sm">
              <Pressable
                onPress={openLink}
                scaleOnPress
                accessibilityRole="link"
                accessibilityLabel={t(
                  'marketplace.deals.retention.case.openLink',
                )}
              >
                <Box row align="center" gap="sm" py="xs">
                  <Link2 size={sizes.icon.sm} color={colors.interactive.main} />
                  <Text
                    variant="bodyMedium"
                    color={colors.interactive.text}
                    numberOfLines={1}
                  >
                    {host}
                  </Text>
                </Box>
              </Pressable>
              {c.handleChecked !== null ? (
                <StatusPill
                  label={
                    c.handleChecked
                      ? t('marketplace.deals.retention.case.handleChecked')
                      : t('marketplace.deals.retention.case.handleUnchecked')
                  }
                  tone={c.handleChecked ? 'success' : 'warning'}
                  size="sm"
                />
              ) : null}
            </Box>
          ) : null}
          <Shots
            caseId={c.id}
            urls={view.restoreShots}
            label={t('marketplace.deals.retention.case.restoreShots')}
            onOpen={onOpenShot}
          />
          {c.brandDecision === 'rejected' && c.brandNote ? (
            <Quote by={theirs(brand)} text={c.brandNote} tone="danger" />
          ) : null}
          {c.adminNote ? (
            <Quote
              by={t('marketplace.deals.retention.case.team')}
              text={c.adminNote}
              tone="interactive"
            />
          ) : null}
          {c.clawback ? (
            <Box
              row
              align="center"
              justify="space-between"
              gap="md"
              p="md"
              borderRadius="md"
              bg={brand ? colors.money.soft : colors.status.danger.soft}
            >
              <Box flex={1} gap="xs">
                <Text
                  variant="buttonSmall"
                  color={brand ? colors.money.text : colors.status.danger.text}
                >
                  {brand
                    ? t('marketplace.deals.retention.case.clawbackBrand', {
                        name: other,
                      })
                    : t('marketplace.deals.retention.case.clawbackCreator')}
                </Text>
                <Text variant="caption" color={colors.text.secondary}>
                  {brand
                    ? t('marketplace.deals.retention.case.clawbackBrandNote')
                    : t('marketplace.deals.retention.case.clawbackCreatorNote')}
                </Text>
              </Box>
              <MoneyText
                value={c.clawback}
                size="title"
                tone={brand ? 'money' : 'default'}
              />
            </Box>
          ) : null}
          {phase === 'escalated' ? (
            <Text variant="caption" color={colors.text.tertiary}>
              {t('marketplace.deals.retention.case.escalatedNote')}
            </Text>
          ) : null}
          {open && c.onHold ? (
            <DealHoldNote />
          ) : clock && c.dueAt !== null ? (
            <CaseClock dueAt={c.dueAt} lead={clock.lead} after={clock.after} />
          ) : null}
          {actions.length > 0 ? (
            <Box gap="sm">
              <Box row gap="sm">
                {actions.includes('restore') ? (
                  <CustomButton
                    title={t('marketplace.deals.retention.case.restore')}
                    size="md"
                    style={styles.grow}
                    leftIcon={
                      <Link2
                        size={sizes.icon.sm}
                        color={colors.button.primary.text}
                      />
                    }
                    onPress={act('restore')}
                  />
                ) : null}
                {actions.includes('contest') ? (
                  <CustomButton
                    title={t('marketplace.deals.retention.case.contest')}
                    variant="outline"
                    size="md"
                    style={styles.grow}
                    onPress={act('contest')}
                  />
                ) : null}
                {actions.includes('confirm') ? (
                  <CustomButton
                    title={t('marketplace.deals.retention.case.confirm')}
                    size="md"
                    style={styles.grow}
                    loading={confirming}
                    onPress={act('confirm')}
                  />
                ) : null}
                {actions.includes('reject') ? (
                  <CustomButton
                    title={t('marketplace.deals.retention.case.reject')}
                    variant="outline"
                    size="md"
                    style={styles.grow}
                    disabled={confirming}
                    onPress={act('reject')}
                  />
                ) : null}
              </Box>
              {actions.includes('reject') ? (
                <Text variant="caption" color={colors.text.tertiary}>
                  {t('marketplace.deals.retention.case.rejectNote')}
                </Text>
              ) : null}
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export const DealRetentionCaseCard = memo(DealRetentionCaseCardComponent);
