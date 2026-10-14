import React, { memo, useCallback } from 'react';
import { useWatch } from 'react-hook-form';
import { useOfferBuilder } from '../OfferBuilderContext';
import type { BriefListField } from '../hooks/useOfferBrief';
import { BriefEntryList } from './BriefEntryList';

interface BriefFieldEntriesProps {
  field: BriefListField;
  look: 'chips' | 'points';
  tone?: 'default' | 'avoid';
}

/** One brief list bound to its form field: only this list re-renders when it changes. */
const BriefFieldEntriesComponent: React.FC<BriefFieldEntriesProps> = ({ field, look, tone }) => {
  const { form, brief } = useOfferBuilder();
  const entries = useWatch({ control: form.control, name: field });
  const { removeEntry } = brief;
  const onRemove = useCallback((entry: string) => removeEntry(field, entry), [field, removeEntry]);
  return <BriefEntryList entries={entries} look={look} tone={tone} onRemove={onRemove} />;
};

export const BriefFieldEntries = memo(BriefFieldEntriesComponent);
