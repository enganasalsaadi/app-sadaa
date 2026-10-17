import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleAlert, ShieldCheck, type LucideIcon } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import { resolveHue, useTheme, type HueTone } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { ApplicantSelectFlow } from '../hooks/useApplicantSelectFlow';
import { DealSignSheet } from './DealSignSheet';
import type { DealCommitLine } from './DealCommitSlip';

export interface ApplicantSelectSheetProps {
  flow: ApplicantSelectFlow;
}

const Estimate = memo<{ flow: ApplicantSelectFlow }>(({ flow }) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const { estimate, balance } = flow;
  const tone: HueTone = estimate.kind === 'short' ? 'warning' : 'money';
  const hue = resolveHue(colors, tone);
  const Icon: LucideIcon = estimate.kind === 'short' ? CircleAlert : ShieldCheck;
  if (estimate.kind === 'unknown') return null;
  const body =
    estimate.kind === 'short' && balance
      ? t('marketplace.campaign.applicants.select.estimate.short.body', { balance: formatMoney(balance, i18n.language) })
      : t('marketplace.campaign.applicants.select.estimate.covers.body');
  return (
    <Box row align="flex-start" gap="sm" p="md" borderRadius="md" bg={hue.soft}>
      <Icon size={sizes.icon.sm} color={hue.main} />
      <Box flex={1} gap="xs">
        <Text variant="bodyMedium" color={colors.text.primary}>
          {t(
            estimate.kind === 'short'
              ? 'marketplace.campaign.applicants.select.estimate.short.title'
              : 'marketplace.campaign.applicants.select.estimate.covers.title',
          )}
        </Text>
        <Text variant="bodySmall" color={colors.text.secondary}>
          {body}
        </Text>
      </Box>
    </Box>
  );
});

/**
 * Picking an applicant (PC3.4, approved 2026-10-17): the slip of what is being bound (price, what
 * they deliver, the seat), the wallet's verdict as a labelled estimate, then press-and-hold to
 * select. The amount is the card's gross price; nothing here is computed beyond the estimate.
 */
const ApplicantSelectSheetComponent: React.FC<ApplicantSelectSheetProps> = ({ flow }) => {
  const { t } = useTranslation();
  const { target, deliverables, seat, seatsTotal } = flow;
  const name = target?.creator.displayName ?? '';
  const lines = useMemo<DealCommitLine[]>(
    () => [
      ...(deliverables
        ? [{ key: 'deliverables', title: t('marketplace.campaign.applicants.select.lines.deliverables'), detail: deliverables }]
        : []),
      ...(seatsTotal > 0
        ? [{ key: 'seat', title: t('marketplace.campaign.applicants.select.lines.seat', { seat, total: seatsTotal }) }]
        : []),
      { key: 'price', title: t('marketplace.campaign.applicants.select.lines.price') },
    ],
    [deliverables, seat, seatsTotal, t],
  );
  if (!target) return null;
  return (
    <DealSignSheet
      visible={flow.visible}
      onClose={flow.close}
      onDismissed={flow.onDismissed}
      title={t('marketplace.campaign.applicants.select.title', { name })}
      body={t('marketplace.campaign.applicants.select.body')}
      amount={target.price.gross}
      badge={t('marketplace.campaign.applicants.select.badge')}
      caption={t(target.price.isBid ? 'marketplace.campaign.applicants.card.bid' : 'marketplace.campaign.applicants.card.fixed')}
      lines={lines}
      hold={t('marketplace.campaign.applicants.select.hold')}
      holdCaption={t('marketplace.campaign.applicants.select.holdCaption')}
      holdA11y={t('marketplace.campaign.applicants.select.holdA11y', { name })}
      onSign={flow.sign}
    >
      <Estimate flow={flow} />
    </DealSignSheet>
  );
};

export const ApplicantSelectSheet = memo(ApplicantSelectSheetComponent);
