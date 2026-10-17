import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Lock, ShieldAlert, ShieldCheck, Wallet } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import { Box, Notice, type NoticeProps } from '@/shared/ui';
import type { ReviewShortfall } from '../hooks/useCampaignReviewSummary';
import { useCampaignWizard } from '../CampaignWizardContext';

interface ReviewNoticesProps {
  ready: boolean;
  shortfall: ReviewShortfall | null;
}

/**
 * Under the review: what still blocks sending, or, once nothing does, the wallet against the most
 * that could be held (a warning only, with the top-up a tap away) and where the brand's
 * verification stands, since the server sends only for verified brands.
 */
const ReviewNoticesComponent: React.FC<ReviewNoticesProps> = ({ ready, shortfall }) => {
  const { t } = useTranslation();
  const { submission } = useCampaignWizard();
  const { kyc, canTopUp, topUp, openVerification } = submission;

  const onTopUp = useCallback(() => {
    if (shortfall) topUp(shortfall.shortfall);
  }, [shortfall, topUp]);

  const kycNotice = useMemo<NoticeProps>(() => {
    switch (kyc) {
      case 'verified':
        return { tone: 'success', icon: ShieldCheck, message: t('marketplace.campaign.wizard.review.notice.kycVerified') };
      case 'pending':
        return { tone: 'info', icon: Clock, message: t('marketplace.campaign.wizard.review.notice.kycPending') };
      case 'required':
        return {
          tone: 'warning',
          icon: ShieldAlert,
          message: t('marketplace.campaign.wizard.review.notice.kycRequired'),
          action: { label: t('marketplace.campaign.wizard.review.notice.kycAction'), onPress: openVerification },
        };
      case 'unknown':
        return { tone: 'info', icon: Lock, message: t('marketplace.campaign.wizard.review.notice.locked') };
      default: {
        const _exhaustive: never = kyc;
        return _exhaustive;
      }
    }
  }, [kyc, openVerification, t]);

  if (!ready) {
    return (
      <Notice
        tone="warning"
        title={t('marketplace.campaign.wizard.review.notice.missingTitle')}
        message={t('marketplace.campaign.wizard.review.notice.missingBody')}
      />
    );
  }

  return (
    <Box gap="md">
      {shortfall ? (
        <Notice
          tone="warning"
          icon={Wallet}
          message={t('marketplace.campaign.wizard.review.notice.shortfall', {
            balance: formatMoney(shortfall.balance, undefined, { rounding: 'down' }),
            max: formatMoney(shortfall.max),
            shortfall: formatMoney(shortfall.shortfall),
          })}
          action={canTopUp ? { label: t('marketplace.campaign.wizard.review.notice.topUp'), onPress: onTopUp } : undefined}
        />
      ) : null}
      <Notice {...kycNotice} />
    </Box>
  );
};

export const ReviewNotices = memo(ReviewNoticesComponent);
