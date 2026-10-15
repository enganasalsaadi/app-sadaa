import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, GalleryModal, Rail, Text } from '@/shared/ui';
import { DealProofPhone } from '../../../components/DealProofPhone';
import { isViewableImage, useDealGallery } from '../../../hooks/useDealGallery';
import type { DealFile } from '../../../types';

const SHOT = moderateScale(150);

export interface ProofReelProps {
  proofs: DealFile[];
}

const Shot = memo<{ file: DealFile; index: number; total: number; onOpen: (id: string) => void }>(
  ({ file, index, total, onOpen }) => {
    const { t } = useTranslation();
    const viewable = isViewableImage(file);
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
const ProofReelComponent: React.FC<ProofReelProps> = ({ proofs }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const gallery = useDealGallery(proofs);
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
          <Shot key={file.id} file={file} index={index + 1} total={proofs.length} onOpen={gallery.open} />
        ))}
      </Rail>
      <GalleryModal
        images={gallery.urls}
        visible={gallery.index !== null}
        initialIndex={gallery.index ?? 0}
        onClose={gallery.close}
      />
    </Box>
  );
};

export const ProofReel = memo(ProofReelComponent);
