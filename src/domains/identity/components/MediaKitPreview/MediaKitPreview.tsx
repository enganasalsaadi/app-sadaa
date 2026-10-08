import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, Divider, SectionHeader, Text } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import type { PublicMediaKit } from '../../types/mediaKit';
import type { RateRow } from '../../utils/rateRows';
import { MediaKitPreviewIdentity } from './MediaKitPreviewIdentity';
import { MediaKitPreviewPlatformRow } from './MediaKitPreviewPlatformRow';
import { MediaKitPreviewRateRow } from './MediaKitPreviewRateRow';

export interface MediaKitPreviewProps {
  preview: PublicMediaKit;
  /** Every niche, already localised from the lookup. */
  nicheLabels: readonly string[];
  rateRows: readonly RateRow[];
}

/**
 * The media kit exactly as a brand sees it (contract §17.4 shape): identity,
 * platforms, rates (tap one for what's included), contract terms. Read-only. Sections without data stay hidden; `bio` and
 * portfolio join once the backend ships them.
 */
const MediaKitPreviewComponent: React.FC<MediaKitPreviewProps> = ({
  preview,
  nicheLabels,
  rateRows,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const terms = preview.contract_terms?.items ?? [];

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
          <Card shadow="none" px="lg" py="xs">
            {rateRows.map((row, index) => (
              <React.Fragment key={row.key}>
                {index > 0 ? <Divider /> : null}
                <MediaKitPreviewRateRow row={row} />
              </React.Fragment>
            ))}
          </Card>
        </Box>
      ) : null}

      {terms.length > 0 ? (
        <Box gap="md">
          <SectionHeader title={t('account.mediaKit.previewScreen.terms')} />
          <Card shadow="none" p="lg">
            <Box gap="md">
              {terms.map(item => (
                <Box key={item.key} row gap="sm">
                  <Text variant="bodySmall" color={colors.text.tertiary}>
                    {t('account.mediaKit.previewScreen.termBullet')}
                  </Text>
                  <Box flex={1}>
                    <Text variant="bodySmall" color={colors.text.secondary}>
                      {item.text}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </Box>
      ) : null}
    </Box>
  );
};

export const MediaKitPreview = memo(MediaKitPreviewComponent);
