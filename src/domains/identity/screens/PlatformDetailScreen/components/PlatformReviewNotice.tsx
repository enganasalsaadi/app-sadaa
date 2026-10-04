import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Notice } from '@/shared/ui';
import type { PlatformResource } from '@/domains/auth';

interface PlatformReviewNoticeProps {
  platform: PlatformResource;
  onEdit: () => void;
}

/** Only for accounts that need attention: a rejected one (fix it) or a manual tier in review. */
const PlatformReviewNoticeComponent: React.FC<PlatformReviewNoticeProps> = ({
  platform,
  onEdit,
}) => {
  const { t } = useTranslation();

  switch (platform.verification_status) {
    case 'rejected':
      return (
        <Notice
          tone="danger"
          title={t('account.platforms.rejectedTitle')}
          message={platform.rejection_reason || t('account.platforms.rejectedFallback')}
          action={{ label: t('common.edit'), onPress: onEdit }}
        />
      );
    case 'pending_review':
      return <Notice tone="info" message={t('account.platforms.pendingReview')} />;
    case 'auto_verified':
    case 'approved':
      return null;
    default: {
      const _exhaustive: never = platform.verification_status;
      return _exhaustive;
    }
  }
};

export const PlatformReviewNotice = memo(PlatformReviewNoticeComponent);
