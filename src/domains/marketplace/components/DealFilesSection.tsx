import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@/shared/ui';
import { useDealFilesEntry } from '../hooks/useDealFilesEntry';
import type { DealRole } from '../types';
import { VaultEntryStrip } from './VaultEntryStrip';

export interface DealFilesSectionProps {
  role: DealRole;
  dealId: string;
}

/** Deal page section (both roles): the files strip into the deal's vault; nothing while it's empty. */
const DealFilesSectionComponent: React.FC<DealFilesSectionProps> = ({ role, dealId }) => {
  const { t } = useTranslation();
  const entry = useDealFilesEntry(role, dealId);
  if (!entry) return null;
  return (
    <Box mb="xl">
      <VaultEntryStrip
        title={t('marketplace.vault.entry.deal')}
        count={entry.count}
        files={entry.files}
        refreshUrl={entry.refreshUrl}
        onSeeAll={entry.seeAll}
      />
    </Box>
  );
};

export const DealFilesSection = memo(DealFilesSectionComponent);
