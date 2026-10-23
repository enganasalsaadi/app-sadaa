import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, FileViewer, Rail, Text } from '@/shared/ui';
import { DealProofPhone } from '../../../components/DealProofPhone';
import { useDealViewer } from '../../../hooks/useDealViewer';
import type { DealFile } from '../../../types';

const SHOT = moderateScale(150);

export interface ProofReelProps {
  proofs: DealFile[];
  /** Brand side: an expired proof link refreshes from this deal. */
  dealId: string;
}

const Shot = memo<{ file: DealFile; viewable: boolean; index: number; total: number; onOpen: (id: string) => void }>(
  ({ file, viewable, index, total, onOpen }) => {
    const { t } = useTranslation();
    const open = useCallback(() => onOpen(file.id), [file.id, onOpen]);
    return (
      <DealProofPhone
        uri={file.url}
        width={SHOT}
        index={index}
        tag={index === 1 && viewable ? t('marketplace.deals.publish.brand.proofs.zoom') : null}
        accessibilityLabel={
          viewable
            ? t('marketplace.deals.publish.brand.proofs.a11y', { index, total })
            : t('marketplace.deals.publish.brand.proofs.unavailable')
        }
        onPress={viewable ? open : undefined}
      />
    );
  },
);

/** The screenshots as phone screens in a sideways reel; a tap opens the full-screen viewer to zoom in on the account name. */
const ProofReelComponent: React.FC<ProofReelProps> = ({ proofs, dealId }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const viewer = useDealViewer(proofs, { role: 'brand', id: dealId });
  if (proofs.length === 0) return null;
  return (
    <Box gap="sm">
      <Box row align="center" justify="space-between">
        <Text variant="overline" color={colors.text.tertiary}>
          {t('marketplace.deals.publish.brand.proofs.title')}
        </Text>
        <Text variant="caption" color={colors.text.tertiary}>
          {formatNumber(proofs.length)}
        </Text>
      </Box>
      <Rail shadow="card" gap="md" bleed gutter="xl">
        {proofs.map((file, index) => (
          <Shot
            key={file.id}
            file={file}
            viewable={viewer.canOpen(file.id)}
            index={index + 1}
            total={proofs.length}
            onOpen={viewer.open}
          />
        ))}
      </Rail>
      <FileViewer {...viewer.props} refreshUrl={viewer.refreshUrl} />
    </Box>
  );
};

export const ProofReel = memo(ProofReelComponent);
