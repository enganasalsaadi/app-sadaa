import React, { memo, useCallback } from 'react';
import { FilePickerCard } from '@/shared/ui';
import type { KycSlot } from '../../../constants/kyc';
import type { KycScreenModel } from '../hooks/useKycScreen';

interface KycSlotPickerProps {
  vm: KycScreenModel;
  slot: KycSlot;
  title: string;
  hint: string;
}

/** One upload slot bound to the screen model. */
const KycSlotPickerComponent: React.FC<KycSlotPickerProps> = ({ vm, slot, title, hint }) => {
  const { pickSlot, removeSlot } = vm;
  const onPick = useCallback(() => pickSlot(slot), [pickSlot, slot]);
  const onRemove = useCallback(() => removeSlot(slot), [removeSlot, slot]);

  return (
    <FilePickerCard
      file={vm.files[slot]}
      onPick={onPick}
      onRemove={onRemove}
      title={title}
      hint={hint}
      error={vm.slotError(slot)}
      disabled={vm.isSubmitting}
    />
  );
};

export const KycSlotPicker = memo(KycSlotPickerComponent);
