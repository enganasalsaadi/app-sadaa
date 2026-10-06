import type { ParseKeys } from 'i18next';
import type { KycStatus, User } from '@/domains/auth';

/** Home blockers, highest priority first (plan §2). Suspended never reaches Home: its gate wins. */
export const HOME_NOTICES = [
  'platformsActionRequired',
  'kycRejected',
  'platformsUnderReview',
  'kitHidden',
] as const;
export type HomeNoticeKey = (typeof HOME_NOTICES)[number];

export type HomeNoticeAction = 'openPlatforms' | 'openKyc' | 'makePublic';

export interface HomeNoticeDef {
  tone: 'danger' | 'warning' | 'info';
  titleKey: ParseKeys;
  messageKey: ParseKeys;
  action: { labelKey: ParseKeys; run: HomeNoticeAction } | null;
}

export const HOME_NOTICE_DEF = {
  platformsActionRequired: {
    tone: 'danger',
    titleKey: 'marketplace.creatorHome.notice.platformsActionRequired.title',
    messageKey: 'marketplace.creatorHome.notice.platformsActionRequired.message',
    action: { labelKey: 'marketplace.creatorHome.notice.platformsActionRequired.action', run: 'openPlatforms' },
  },
  kycRejected: {
    tone: 'danger',
    titleKey: 'account.profile.kyc.rejectedTitle',
    messageKey: 'account.profile.kyc.rejectedBody',
    action: { labelKey: 'account.profile.kyc.reupload', run: 'openKyc' },
  },
  platformsUnderReview: {
    tone: 'info',
    titleKey: 'marketplace.creatorHome.notice.platformsUnderReview.title',
    messageKey: 'marketplace.creatorHome.notice.platformsUnderReview.message',
    action: null,
  },
  kitHidden: {
    tone: 'warning',
    titleKey: 'account.mediaKit.share.privateTitle',
    messageKey: 'account.mediaKit.share.privateBody',
    action: { labelKey: 'account.mediaKit.share.makePublic', run: 'makePublic' },
  },
} as const satisfies Record<HomeNoticeKey, HomeNoticeDef>;

export interface HomeNoticeInput {
  platformsReviewStatus: User['platforms_review_status'];
  kycStatus: KycStatus;
  /** `null` while the kit loads: never flag it hidden on a guess. */
  isKitPublic: boolean | null;
}

/** The one notice Home shows, or `null` when nothing blocks the creator. */
export const resolveHomeNotice = ({
  platformsReviewStatus,
  kycStatus,
  isKitPublic,
}: HomeNoticeInput): HomeNoticeKey | null => {
  if (platformsReviewStatus === 'action_required') return 'platformsActionRequired';
  if (kycStatus === 'rejected') return 'kycRejected';
  if (platformsReviewStatus === 'under_review') return 'platformsUnderReview';
  if (isKitPublic === false) return 'kitHidden';
  return null;
};
