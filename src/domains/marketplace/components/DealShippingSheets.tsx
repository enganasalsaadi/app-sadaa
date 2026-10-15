import React, { memo } from 'react';
import type { DealShippingModel } from '../hooks/useDealShipping';
import type { Deal } from '../types';
import { DealAddressSheet } from './DealAddressSheet';
import { DealIssueSheet } from './DealIssueSheet';
import { DealShipCancelSheet } from './DealShipCancelSheet';
import { DealShipSheet } from './DealShipSheet';

export interface DealShippingSheetsProps {
  deal: Deal;
  shipping: DealShippingModel;
}

/** Every P5 sheet for the deal page; the model decides which one is up. */
const DealShippingSheetsComponent: React.FC<DealShippingSheetsProps> = ({ deal, shipping }) => {
  const { sheet } = shipping;
  const current = shipping.view?.current ?? null;
  const shipKind = sheet === 'ship' || sheet === 'edit' || sheet === 'reship' ? sheet : null;
  const sequence = sheet === 'reship' ? (current?.sequence ?? 0) + 1 : (current?.sequence ?? 1);

  return (
    <>
      <DealShipSheet
        kind={shipKind}
        onClose={shipping.close}
        control={shipping.shipControl}
        setFocus={shipping.shipFocus}
        courierLabels={shipping.courierLabels}
        sequence={sequence}
        partyName={shipping.party}
        onSubmit={shipping.onShip}
        submitting={shipping.shipping}
      />
      <DealIssueSheet
        visible={sheet === 'issue'}
        onClose={shipping.close}
        control={shipping.issueControl}
        brandName={shipping.party}
        delayedIn={shipping.delayedIn}
        photos={shipping.photos}
        photosError={shipping.photosError}
        onPickPhotos={shipping.pickPhotos}
        onRemovePhoto={shipping.removePhoto}
        onSubmit={shipping.onIssue}
        submitting={shipping.reporting}
      />
      <DealShipCancelSheet
        visible={sheet === 'cancel'}
        onClose={shipping.close}
        creatorName={shipping.party}
        refund={deal.cancellation?.brand?.refund ?? null}
        onCancel={shipping.onCancel}
      />
      <DealAddressSheet
        visible={sheet === 'address'}
        onClose={shipping.close}
        form={shipping.address}
        purpose="edit"
        brandName={deal.brand.name ?? ''}
        onSubmit={shipping.onSaveAddress}
        submitting={shipping.savingAddress}
      />
    </>
  );
};

export const DealShippingSheets = memo(DealShippingSheetsComponent);
