import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip } from '@/shared/ui';

export interface ApplicantFilterChipProps {
  chipKey: string;
  label: string;
  onClear: (key: string) => void;
}

/** An applied filter in the row under the tabs: shown selected, the × (or a tap) drops it. */
const ApplicantFilterChipComponent: React.FC<ApplicantFilterChipProps> = ({ chipKey, label, onClear }) => {
  const { t } = useTranslation();
  const clear = useCallback(() => onClear(chipKey), [chipKey, onClear]);
  return (
    <Chip
      label={label}
      value={chipKey}
      selected
      onSelect={clear}
      onClear={clear}
      clearLabel={t('marketplace.campaign.applicants.filters.remove', { label })}
    />
  );
};

export const ApplicantFilterChip = memo(ApplicantFilterChipComponent);
