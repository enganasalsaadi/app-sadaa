import React, { memo } from 'react';
import { Box } from '@/shared/ui';
import type { DealRetentionModel } from '../hooks/useDealRetention';
import { DealRetentionCaseCard } from './DealRetentionCaseCard';

export interface DealRetentionCasesProps {
  retention: DealRetentionModel;
}

/** Every retention report near the top of the page: the open one first, as the next step. */
const DealRetentionCasesComponent: React.FC<DealRetentionCasesProps> = ({
  retention,
}) => {
  if (retention.cases.length === 0) return null;
  return (
    <Box gap="lg">
      {retention.cases.map(view => (
        <DealRetentionCaseCard
          key={view.retentionCase.id}
          view={view}
          role={retention.role}
          other={retention.other}
          confirming={retention.confirmingId === view.retentionCase.id}
          onAction={retention.onAction}
          onOpenShot={retention.openShot}
          onLink={retention.onLink}
        />
      ))}
    </Box>
  );
};

export const DealRetentionCases = memo(DealRetentionCasesComponent);
