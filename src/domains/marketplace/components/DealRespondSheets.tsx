import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDealSlipCopy } from '../hooks/useDealSlipCopy';
import type { DealRespondModel } from '../hooks/useDealRespond';
import type { Deal } from '../types';
import { DealDeclineSheet } from './DealDeclineSheet';
import { DealExtensionSheet } from './DealExtensionSheet';
import { DealReasonSheet } from './DealReasonSheet';
import { DealSignSheet } from './DealSignSheet';

export interface DealRespondSheetsProps {
  deal: Deal;
  respond: DealRespondModel;
  hasContract: boolean;
}

/** Every P4 sheet for the deal page; the model decides which one is up. */
const DealRespondSheetsComponent: React.FC<DealRespondSheetsProps> = ({
  deal,
  respond,
  hasContract,
}) => {
  const { t } = useTranslation();
  const copy = useDealSlipCopy(deal);
  const { sheet } = respond;
  const brandName = deal.brand.name ?? '';
  const creatorName = deal.creator.name ?? '';
  const onContract = hasContract ? respond.onContract : undefined;

  return (
    <>
      <DealSignSheet
        visible={sheet === 'accept'}
        onClose={respond.close}
        onDismissed={respond.onSheetDismissed}
        title={t('marketplace.deals.respond.accept.title')}
        body={t('marketplace.deals.respond.accept.body', { name: brandName })}
        amount={deal.total}
        badge={t('marketplace.deals.respond.accept.held')}
        caption={copy.caption}
        lines={copy.accept}
        hold={t('marketplace.deals.respond.accept.hold')}
        holdCaption={t('marketplace.deals.respond.accept.holdCaption')}
        holdA11y={t('marketplace.deals.respond.accept.holdA11y')}
        onSign={respond.onAccept}
        onContract={onContract}
      />
      <DealSignSheet
        visible={sheet === 'approveExtension'}
        onClose={respond.close}
        onDismissed={respond.onSheetDismissed}
        title={t('marketplace.deals.respond.approve.title', {
          duration: copy.askDuration ?? '',
        })}
        body={t('marketplace.deals.respond.approve.body')}
        amount={deal.total}
        badge={t('marketplace.deals.respond.approve.held')}
        caption={t('marketplace.deals.respond.approve.from')}
        lines={copy.approve}
        hold={t('marketplace.deals.respond.approve.hold')}
        holdCaption={t('marketplace.deals.respond.approve.holdCaption')}
        holdA11y={t('marketplace.deals.respond.approve.hold')}
        onSign={respond.onApproveExtension}
        onContract={onContract}
      />
      <DealDeclineSheet
        visible={sheet === 'decline'}
        onClose={respond.close}
        brandName={brandName}
        control={respond.declineControl}
        onSubmit={respond.onDecline}
        submitting={respond.declining}
      />
      {respond.range ? (
        <DealExtensionSheet
          visible={sheet === 'extension'}
          onClose={respond.close}
          brandName={brandName}
          range={respond.range}
          control={respond.extensionControl}
          onSign={respond.onExtension}
        />
      ) : null}
      <DealReasonSheet
        kind={
          sheet === 'withdraw' || sheet === 'rejectExtension' ? sheet : null
        }
        onClose={respond.close}
        creatorName={creatorName}
        control={respond.reasonControl}
        onSubmit={respond.onReason}
        submitting={respond.reasonSending}
      />
    </>
  );
};

export const DealRespondSheets = memo(DealRespondSheetsComponent);
