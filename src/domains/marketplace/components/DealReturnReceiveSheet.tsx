import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PackageCheck } from 'lucide-react-native';
import { Box, Notice, SheetFrame } from '@/shared/ui';
import { isolateText } from '@/shared/utils';
import type { DealReturnModel } from '../hooks/useDealReturn';
import type { DealReturnAnswerModel } from '../hooks/useDealReturnAnswer';
import type { Deal } from '../types';
import { DealHoldToSign } from './DealHoldToSign';
import { ReturnFact, useReturnDate } from './DealReturnParts';

export interface DealReturnReceiveSheetProps {
  deal: Deal;
  ret: DealReturnModel;
  answer: DealReturnAnswerModel;
}

/**
 * «Did the sample arrive?» (PC9.0 frame 2): the waybill on file to match against the parcel in
 * hand, then a press-and-hold. Final: it closes the return, and no problem can be reported after.
 */
const DealReturnReceiveSheetComponent: React.FC<DealReturnReceiveSheetProps> = ({ deal, ret, answer }) => {
  const { t } = useTranslation();
  const date = useReturnDate();
  const { ship } = ret;
  const creator = isolateText(deal.creator.name ?? '');
  return (
    <SheetFrame
      visible={answer.sheet === 'receive'}
      onClose={answer.close}
      title={t('marketplace.deals.return.answer.receive.title')}
      body={t('marketplace.deals.return.answer.receive.body', { name: creator })}
      footer={
        <DealHoldToSign
          label={t('marketplace.deals.return.answer.receive.hold')}
          caption={t('marketplace.deals.return.answer.receive.holdCaption')}
          hint={t('marketplace.deals.respond.hold.hint')}
          accessibilityLabel={t('marketplace.deals.return.answer.receive.title')}
          accessibilityHint={t('marketplace.deals.respond.hold.a11yHint')}
          icon={PackageCheck}
          onComplete={answer.onReceive}
        />
      }
    >
      {ship ? (
        <Box gap="md">
          <Box row gap="lg">
            <ReturnFact label={t('marketplace.deals.return.card.courier')} value={ship.courier ?? '—'} />
            <ReturnFact label={t('marketplace.deals.return.card.trackingNo')} value={ship.trackingNo ?? '—'} mono />
          </Box>
          <Box row gap="lg">
            {ship.handedAt !== null ? (
              <ReturnFact label={t('marketplace.deals.return.card.handed')} value={date(ship.handedAt)} />
            ) : (
              <Box flex={1} />
            )}
            {ret.autoConfirm ? (
              <ReturnFact
                label={t('marketplace.deals.return.answer.receive.autoOn')}
                value={date(ret.autoConfirm.at)}
              />
            ) : (
              <Box flex={1} />
            )}
          </Box>
        </Box>
      ) : null}
      <Notice
        tone="warning"
        title={t('marketplace.deals.return.answer.receive.finalTitle')}
        message={t('marketplace.deals.return.answer.receive.finalBody')}
      />
    </SheetFrame>
  );
};

export const DealReturnReceiveSheet = memo(DealReturnReceiveSheetComponent);
