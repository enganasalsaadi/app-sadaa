import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, ShieldQuestion } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useStyles, useTheme } from '@/core/theme';
import { Box, KeyValueRow, MoneyText, Text } from '@/shared/ui';
import {
  bpsShare,
  type ContractLang,
  type ContractParty,
  type ContractView,
} from '../../../utils/dealContract';
import { formatDuration } from '../../../utils/offerDuration';
import { ContractBlock } from './ContractBlock';

export interface ContractPaperProps {
  view: ContractView;
  lang: ContractLang;
}

const PERCENT: Intl.NumberFormatOptions = {
  style: 'percent',
  maximumFractionDigits: 2,
};

const PartyCard = memo<{
  role: string;
  party: ContractParty;
  detail: string | null;
}>(({ role, party, detail }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const Icon = party.verified ? BadgeCheck : ShieldQuestion;
  return (
    <Box
      flex={1}
      gap="xs"
      p="md"
      borderRadius="md"
      bg={colors.surface.elevated}
    >
      <Text variant="caption" color={colors.text.tertiary}>
        {role}
      </Text>
      <Text variant="bodyMedium" color={colors.text.primary} numberOfLines={2}>
        {party.legalName ?? ''}
      </Text>
      {detail ? (
        <Text variant="caption" color={colors.text.secondary} numberOfLines={2}>
          {detail}
        </Text>
      ) : null}
      <Box row align="center" gap="xs">
        <Icon
          size={sizes.icon.xs}
          color={
            party.verified ? colors.interactive.main : colors.icon.secondary
          }
        />
        <Text
          variant="caption"
          color={
            party.verified ? colors.interactive.text : colors.text.tertiary
          }
        >
          {t(
            party.verified
              ? 'marketplace.deals.contract.verified'
              : 'marketplace.deals.contract.unverified',
          )}
        </Text>
      </Box>
    </Box>
  );
});

/**
 * The contract as a sheet of paper: parties, deliverables, money, schedule, shipping and every
 * numbered term, in the picked language (English reads left to right).
 */
const ContractPaperComponent: React.FC<ContractPaperProps> = ({
  view,
  lang,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const direction = lang === 'en' ? 'ltr' : 'rtl';
  const styles = useStyles(
    ({
      radii,
      spacing,
      shadows,
      borderWidths,
    }): Record<'paper', ViewStyle> => ({
      paper: {
        borderRadius: radii.xl,
        padding: spacing.xl,
        gap: spacing.lg,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.card,
        ...shadows.card,
      },
    }),
    [colors.border.card, colors.surface.main],
  );

  return (
    <Box style={styles.paper}>
      {view.brand || view.creator ? (
        <Box row gap="sm">
          {view.brand ? (
            <PartyCard
              role={t('marketplace.deals.contract.brand')}
              party={view.brand}
              detail={view.brand.signatory}
            />
          ) : null}
          {view.creator ? (
            <PartyCard
              role={t('marketplace.deals.contract.creator')}
              party={view.creator}
              detail={view.creator.handles.join(' · ') || null}
            />
          ) : null}
        </Box>
      ) : null}

      {view.deliverables.length > 0 ? (
        <ContractBlock title={t('marketplace.deals.contract.deliverables')}>
          {view.deliverables.map(item => (
            <Box
              key={item.id}
              row
              align="flex-start"
              justify="space-between"
              gap="md"
            >
              <Box flex={1} gap="xs">
                <Text
                  variant="bodyMedium"
                  color={colors.text.primary}
                  writingDirection={direction}
                >
                  {item.title}
                </Text>
                <Text variant="caption" color={colors.text.tertiary}>
                  {[
                    item.deliveryHours !== null
                      ? formatDuration(t, item.deliveryHours)
                      : null,
                    item.revisions !== null
                      ? t('marketplace.offer.units.revisions', {
                          count: item.revisions,
                        })
                      : null,
                    item.retention,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </Box>
              {item.total ? <MoneyText value={item.total} size="sm" /> : null}
            </Box>
          ))}
        </ContractBlock>
      ) : null}

      <ContractBlock title={t('marketplace.deals.contract.payment')}>
        {view.total ? (
          <Box row align="center" justify="space-between">
            <Text variant="bodyMedium" color={colors.text.primary}>
              {t('marketplace.deals.contract.total')}
            </Text>
            <MoneyText value={view.total} size="title" />
          </Box>
        ) : null}
        {view.commissionBps !== null ? (
          <KeyValueRow
            label={t('marketplace.deals.contract.commission')}
            value={formatNumber(bpsShare(view.commissionBps), PERCENT)}
          />
        ) : null}
        {view.killFeeBps !== null ? (
          <KeyValueRow
            label={t('marketplace.deals.contract.killFee')}
            value={formatNumber(bpsShare(view.killFeeBps), PERCENT)}
          />
        ) : null}
        {view.freeCancelHours !== null ? (
          <KeyValueRow
            label={t('marketplace.deals.contract.freeCancel')}
            value={formatDuration(t, view.freeCancelHours)}
          />
        ) : null}
      </ContractBlock>

      {view.responseHours !== null || view.deliveryHours !== null ? (
        <ContractBlock title={t('marketplace.deals.contract.schedule')}>
          {view.responseHours !== null ? (
            <KeyValueRow
              label={t('marketplace.deals.contract.reply')}
              value={formatDuration(t, view.responseHours)}
            />
          ) : null}
          {view.deliveryHours !== null ? (
            <KeyValueRow
              label={t('marketplace.deals.contract.delivery')}
              value={formatDuration(t, view.deliveryHours)}
            />
          ) : null}
          {view.deliveryStarts ? (
            <Text
              variant="caption"
              color={colors.text.tertiary}
              writingDirection={direction}
            >
              {view.deliveryStarts}
            </Text>
          ) : null}
        </ContractBlock>
      ) : null}

      {view.shipping ? (
        <ContractBlock title={t('marketplace.deals.contract.shipping')}>
          <Text
            variant="bodySmall"
            color={colors.text.primary}
            writingDirection={direction}
          >
            {view.shipping}
          </Text>
        </ContractBlock>
      ) : null}

      {view.terms.length > 0 ? (
        <ContractBlock title={t('marketplace.deals.contract.terms')}>
          {view.terms.map((term, index) => (
            <Box key={term.key} row align="flex-start" gap="sm">
              <Text variant="buttonSmall" color={colors.interactive.text}>
                {formatNumber(index + 1)}
              </Text>
              <Box flex={1}>
                <Text
                  variant="bodySmall"
                  color={colors.text.primary}
                  writingDirection={direction}
                >
                  {term.text}
                </Text>
              </Box>
            </Box>
          ))}
        </ContractBlock>
      ) : null}
    </Box>
  );
};

export const ContractPaper = memo(ContractPaperComponent);
