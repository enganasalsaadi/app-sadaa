import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, Divider, KeyValueRow, MoneyText, SectionHeader } from '@/shared/ui';
import type { PublicMediaKit } from '../../types/mediaKit';
import type { RateRow } from '../../utils/rateRows';
import { MediaKitPreviewIdentity } from './MediaKitPreviewIdentity';
import { MediaKitPreviewPlatformRow } from './MediaKitPreviewPlatformRow';

export interface MediaKitPreviewProps {
  preview: PublicMediaKit;
  /** Every niche, already localised from the lookup. */
  nicheLabels: readonly string[];
  rateRows: readonly RateRow[];
}

/**
 * The media kit exactly as a brand sees it (contract §17.4 shape): identity,
 * platforms, rates. Read-only. Sections without data stay hidden; `bio` and
 * portfolio join once the backend ships them.
 */
const MediaKitPreviewComponent: React.FC<MediaKitPreviewProps> = ({
  preview,
  nicheLabels,
  rateRows,
}) => {
  const { t } = useTranslation();

  return (
    <Box gap="2xl">
      <Card shadow="none" p="lg">
        <MediaKitPreviewIdentity preview={preview} nicheLabels={nicheLabels} />
      </Card>

      {preview.platforms.length > 0 ? (
        <Box gap="md">
          <SectionHeader title={t('account.mediaKit.previewScreen.platforms')} />
          <Card shadow="none" px="lg">
            {preview.platforms.map((platform, index) => (
              <React.Fragment key={platform.platform}>
                {index > 0 ? <Divider /> : null}
                <MediaKitPreviewPlatformRow platform={platform} />
              </React.Fragment>
            ))}
          </Card>
        </Box>
      ) : null}

      {rateRows.length > 0 ? (
        <Box gap="md">
          <SectionHeader title={t('account.mediaKit.previewScreen.rates')} />
          <Card shadow="none" px="lg" py="md">
            {rateRows.map(row => (
              <KeyValueRow
                key={row.key}
                label={t('account.mediaKit.previewScreen.rateRow', {
                  platform: row.platformLabel,
                  service: row.serviceLabel,
                })}
                value={<MoneyText value={row.price} />}
              />
            ))}
          </Card>
        </Box>
      ) : null}
    </Box>
  );
};

export const MediaKitPreview = memo(MediaKitPreviewComponent);
