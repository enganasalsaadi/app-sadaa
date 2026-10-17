import React, { memo, useCallback } from 'react';
import { BriefEntryAdder } from '../../../components/brief/BriefEntryAdder';
import { BriefEntryList } from '../../../components/brief/BriefEntryList';
import { Box } from '@/shared/ui';
import { useCampaignWizard } from '../CampaignWizardContext';
import type { CampaignBriefList as BriefField } from '../hooks/useCampaignBrief';

interface CampaignBriefListProps {
  field: BriefField;
  look: 'chips' | 'points';
  tone?: 'default' | 'avoid';
  placeholder: string;
  autoCapitalize?: 'none' | 'sentences';
}

/** One list of the private brief: what was added (each removable) and the field to add the next. */
const CampaignBriefListComponent: React.FC<CampaignBriefListProps> = ({ field, look, tone, placeholder, autoCapitalize }) => {
  const { brief } = useCampaignWizard();
  const { addEntry, removeEntry } = brief;
  const onAdd = useCallback((raw: string) => addEntry(field, raw), [addEntry, field]);
  const onRemove = useCallback((entry: string) => removeEntry(field, entry), [field, removeEntry]);

  return (
    <Box gap="sm">
      <BriefEntryList entries={brief.brief[field]} look={look} tone={tone} onRemove={onRemove} />
      <BriefEntryAdder placeholder={placeholder} onAdd={onAdd} autoCapitalize={autoCapitalize} />
    </Box>
  );
};

export const CampaignBriefList = memo(CampaignBriefListComponent);
