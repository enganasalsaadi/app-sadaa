import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, SectionHeader } from '@/shared/ui';
import { MediaKitShareNotice } from '@/domains/identity';

const noop = () => {};

const VARIANTS = [
  { id: 'private', error: 'private', canRetry: false, titleKey: 'devShowcase.mediaKitShareNotice.private' },
  { id: 'failed', error: 'failed', canRetry: true, titleKey: 'devShowcase.mediaKitShareNotice.failed' },
  { id: 'failedFinal', error: 'failed', canRetry: false, titleKey: 'devShowcase.mediaKitShareNotice.failedFinal' },
  { id: 'rateLimited', error: 'rate_limited', canRetry: false, titleKey: 'devShowcase.mediaKitShareNotice.rateLimited' },
] as const;

/** Every reason a media kit share can fail, as Home and the kit screens show it. */
const MediaKitShareNoticeDemoComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box gap="xl">
      {VARIANTS.map(variant => (
        <Box key={variant.id} gap="sm">
          <SectionHeader title={t(variant.titleKey)} />
          <MediaKitShareNotice
            error={variant.error}
            canRetry={variant.canRetry}
            onMakePublic={noop}
            onRetry={noop}
            onDismiss={noop}
          />
        </Box>
      ))}
    </Box>
  );
};

export const MediaKitShareNoticeDemo = memo(MediaKitShareNoticeDemoComponent);
