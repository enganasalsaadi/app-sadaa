import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Undo2 } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Card, CustomButton, GradientSurface, Image, MoneyText, StatusPill, Text } from '@/shared/ui';
import type { CreatorApplication } from '../types/campaign';
import { applicationTone, applicationWindow, isPendingApplication } from '../utils/creatorApplications';
import { useClock } from '../hooks/useClock';
import { ApplicationClock } from './ApplicationClock';

const THUMB = moderateScale(60);
/** A closed application steps back; its words and its figure stay readable. */
const CLOSED_OPACITY = 0.6;

export interface ApplicationCardProps {
  application: CreatorApplication;
  onOpen: (application: CreatorApplication) => void;
  onWithdraw: (application: CreatorApplication) => void;
}

/**
 * One signed application (PC5.2): the campaign and what the server says about it, what the creator
 * stands to take home, and the one thing to do — take it back while it waits, open the deal once
 * there is one. «Not selected» and the other closed ones are plain and neutral: no reason, no alarm.
 */
const ApplicationCardComponent: React.FC<ApplicationCardProps> = ({ application, onOpen, onWithdraw }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const Forward = isRTL ? ArrowLeft : ArrowRight;
  const now = useClock(60_000);
  const { campaign, price, state, deal, canWithdraw, expiresAt } = application;
  const pending = isPendingApplication(application);
  const closed = !pending && deal === null;

  const open = useCallback(() => onOpen(application), [application, onOpen]);
  const withdraw = useCallback(() => onWithdraw(application), [application, onWithdraw]);

  return (
    <Card
      onPress={open}
      p="lg"
      accessibilityLabel={t('marketplace.campaign.applications.card.a11y', {
        title: campaign.title,
        brand: campaign.brand.name,
        state: state.label,
      })}
    >
      <Box gap="md">
        <Box row gap="md">
          <Box
            width={THUMB}
            height={THUMB}
            borderRadius="lg"
            overflow="hidden"
            opacity={closed ? CLOSED_OPACITY : 1}
          >
            {campaign.cover?.url ? (
              <Image uri={campaign.cover.url} width="100%" height="100%" />
            ) : (
              <GradientSurface variant="brand" />
            )}
          </Box>
          <Box flex={1} gap="xs">
            <Text variant="bodyMedium" numberOfLines={2}>
              {campaign.title}
            </Text>
            <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
              {campaign.brand.name}
            </Text>
            <StatusPill label={state.label} tone={applicationTone(application)} size="sm" />
          </Box>
        </Box>
        <Box row justify="space-between" align="flex-end" gap="md">
          <Box gap="xs" opacity={closed ? CLOSED_OPACITY : 1}>
            <Text variant="caption" color={colors.text.secondary}>
              {price.isBid
                ? t('marketplace.campaign.applications.card.netBid', { bid: formatMoney(price.gross) })
                : t('marketplace.campaign.applications.card.netFixed')}
            </Text>
            <MoneyText value={price.net} size="lg" tone={closed ? 'muted' : 'money'} />
          </Box>
          {pending ? <ApplicationClock window={applicationWindow(expiresAt, now)} /> : null}
        </Box>
        {pending && canWithdraw ? (
          <CustomButton
            title={t('marketplace.campaign.applications.card.withdraw')}
            onPress={withdraw}
            variant="secondary"
            size="sm"
            leftIcon={<Undo2 size={sizes.icon.sm} color={colors.button.secondary.text} />}
          />
        ) : null}
        {deal ? (
          <CustomButton
            title={t('marketplace.campaign.applications.card.openDeal')}
            onPress={open}
            variant="primary"
            size="sm"
            rightIcon={<Forward size={sizes.icon.sm} color={colors.button.primary.text} />}
          />
        ) : null}
      </Box>
    </Card>
  );
};

export const ApplicationCard = memo(ApplicationCardComponent);
