import { useCallback, useState } from 'react';
import type { MediaTileUpload } from '@/shared/ui';

const RETRY_PROGRESS = 0.15;

/** Uploads are mocked: retry just flips the failed tile back to uploading. */
export const useMediaTileDemo = () => {
  const [retried, setRetried] = useState(false);
  const onRetry = useCallback(() => setRetried(true), []);
  const reset = useCallback(() => setRetried(false), []);

  const failedUpload: MediaTileUpload = retried
    ? { state: 'uploading', progress: RETRY_PROGRESS }
    : { state: 'failed', onRetry };

  return { failedUpload, reset };
};
