import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { EyeOff } from 'lucide-react-native';
import { Notice } from '@/shared/ui';
import type { MediaKitShareError } from '../../utils/mediaKitShare';

interface MediaKitShareNoticeProps {
  error: MediaKitShareError;
  canRetry: boolean;
  onMakePublic: () => void;
  onRetry: () => void;
  onDismiss: () => void;
}

/** Why the last share did not go through: a hidden kit is a prompt (§17.6 409), the rest are plain messages. */
const MediaKitShareNoticeComponent: React.FC<MediaKitShareNoticeProps> = ({
  error,
  canRetry,
  onMakePublic,
  onRetry,
  onDismiss,
}) => {
  const { t } = useTranslation();

  switch (error) {
    case 'private':
      return (
        <Notice
          tone="warning"
          icon={EyeOff}
          title={t('account.mediaKit.share.privateTitle')}
          message={t('account.mediaKit.share.privateBody')}
          action={{ label: t('account.mediaKit.share.makePublic'), onPress: onMakePublic }}
          onDismiss={onDismiss}
        />
      );
    case 'rate_limited':
      return (
        <Notice
          tone="warning"
          message={t('account.mediaKit.share.rateLimited')}
          onDismiss={onDismiss}
        />
      );
    case 'failed':
      return (
        <Notice
          tone="danger"
          message={t('account.mediaKit.share.failed')}
          action={canRetry ? { label: t('account.mediaKit.retry'), onPress: onRetry } : undefined}
          onDismiss={onDismiss}
        />
      );
    default: {
      const _exhaustive: never = error;
      return _exhaustive;
    }
  }
};

export const MediaKitShareNotice = memo(MediaKitShareNoticeComponent);
