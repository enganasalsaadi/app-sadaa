import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Money } from '@/core/money';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, Text } from '@/shared/ui';
import { ApplicantFace } from '../../../components/ApplicantFace';
import { DealFundingCard } from '../../../components/DealFundingCard';
import type { DealFunding } from '../../../types';
import type { SeatFace } from '../../../utils/applicants';
import type { DealFundingState } from '../../../utils/dealRespond';

export interface SelectedUnfundedProps {
  face: SeatFace;
  price: Money | null;
  funding: DealFunding | null;
  fundingState: DealFundingState;
  dueAt: number | null;
  canTopUp: boolean;
  onTopUp: () => void;
  onOpenDeal: () => void;
  onKeepGoing: () => void;
}

const FACE = 52;

/**
 * The seat is reserved, the money is not there yet (frame 7): the same «vessel» the deal page shows,
 * with its 24-hour dial and what the wallet lacks. A top-up funds the deal on its own, so the way
 * out is top up, open the deal, or later.
 */
const SelectedUnfundedComponent: React.FC<SelectedUnfundedProps> = ({
  face,
  price,
  funding,
  fundingState,
  dueAt,
  canTopUp,
  onTopUp,
  onOpenDeal,
  onKeepGoing,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const canPay = canTopUp && fundingState === 'short';
  return (
    <Box flex={1} justify="center" gap="xl" px="xl">
      <Box row align="center" gap="md">
        <ApplicantFace name={face.name} avatarUrl={face.avatarUrl} size={FACE} large />
        <Box flex={1}>
          <Text variant="title" color={colors.text.primary}>
            {t('marketplace.campaign.applicants.selected.unfunded.who', { name: face.name })}
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.campaign.applicants.selected.unfunded.whoHint')}
          </Text>
        </Box>
      </Box>
      <Box gap="xs">
        <Text variant="h2" color={colors.text.primary}>
          {t('marketplace.campaign.applicants.selected.unfunded.title')}
        </Text>
        <Text variant="body" color={colors.text.secondary}>
          {t('marketplace.campaign.applicants.selected.unfunded.body')}
        </Text>
      </Box>
      {price && funding ? (
        <DealFundingCard funding={funding} state={fundingState} total={price} dueAt={dueAt} canTopUp={canTopUp} />
      ) : null}
      <Box gap="md">
        {canPay ? (
          <CustomButton fullWidth title={t('marketplace.campaign.applicants.selected.unfunded.topUp')} onPress={onTopUp} />
        ) : null}
        <CustomButton
          variant={canPay ? 'secondary' : 'primary'}
          fullWidth
          title={t('marketplace.campaign.applicants.selected.openDeal')}
          onPress={onOpenDeal}
        />
        <CustomButton variant="ghost" fullWidth title={t('marketplace.campaign.applicants.selected.unfunded.later')} onPress={onKeepGoing} />
      </Box>
    </Box>
  );
};

export const SelectedUnfunded = memo(SelectedUnfundedComponent);
