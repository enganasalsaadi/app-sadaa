import React, { memo } from 'react';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Card, GradientSurface, Notice, StatusPill, Text } from '@/shared/ui';
import type { KycStatus, UserType } from '@/domains/auth';

const ICON_BOX = moderateScale(40);

type KycCopyKey = 'verifiedBody' | 'pendingBody' | 'rejectedBody' | 'unverifiedTitle' | 'unverifiedBody';

/** A creator verifies their ID, a brand its company document: the wording follows. */
const KYC_COPY = {
  influencer: {
    verifiedBody: 'account.profile.kyc.verifiedBody',
    pendingBody: 'account.profile.kyc.pendingBody',
    rejectedBody: 'account.profile.kyc.rejectedBody',
    unverifiedTitle: 'account.profile.kyc.unverifiedTitle',
    unverifiedBody: 'account.profile.kyc.unverifiedBody',
  },
  brand: {
    verifiedBody: 'account.profile.kyc.brand.verifiedBody',
    pendingBody: 'account.profile.kyc.brand.pendingBody',
    rejectedBody: 'account.profile.kyc.brand.rejectedBody',
    unverifiedTitle: 'account.profile.kyc.brand.unverifiedTitle',
    unverifiedBody: 'account.profile.kyc.brand.unverifiedBody',
  },
} as const satisfies Record<UserType, Record<KycCopyKey, ParseKeys>>;

export interface KycCardModel {
  status: KycStatus;
  rejectionReason: string | null;
}

interface KycCardProps {
  kyc: KycCardModel;
  userType: UserType;
  /** Opens the upload screen; shown only where an upload is possible (unverified, rejected). */
  onOpen?: () => void;
}

/** Verification in its four server states; `verified` is the one gold highlight. */
const KycCardComponent: React.FC<KycCardProps> = ({ kyc, userType, onOpen }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const copy = KYC_COPY[userType];
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  switch (kyc.status) {
    case 'verified':
      return (
        <GradientSurface variant="premium" p="lg" gap="sm">
          <Box row align="center" gap="md">
            <Box
              width={ICON_BOX}
              height={ICON_BOX}
              borderRadius="full"
              bg={colors.surface.main}
              align="center"
              justify="center"
            >
              <ShieldCheck size={sizes.icon.md} color={colors.premium.main} />
            </Box>
            <Box flex={1}>
              <Text variant="title">{t('account.profile.kyc.verifiedTitle')}</Text>
            </Box>
            <StatusPill
              label={t('account.profile.kyc.verifiedPill')}
              tone="premium"
              icon={BadgeCheck}
              size="sm"
            />
          </Box>
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t(copy.verifiedBody)}
          </Text>
        </GradientSurface>
      );
    case 'pending':
      return (
        <Notice
          tone="info"
          icon={Clock}
          title={t('account.profile.kyc.pendingTitle')}
          message={t(copy.pendingBody)}
        />
      );
    case 'rejected':
      return (
        <Notice
          tone="danger"
          icon={ShieldAlert}
          title={t('account.profile.kyc.rejectedTitle')}
          message={kyc.rejectionReason || t(copy.rejectedBody)}
          action={onOpen ? { label: t('account.profile.kyc.reupload'), onPress: onOpen } : undefined}
        />
      );
    case 'unverified':
      return (
        <Card
          shadow="none"
          p="lg"
          onPress={onOpen}
          accessibilityLabel={onOpen ? t(copy.unverifiedTitle) : undefined}
        >
          <Box row align="center" gap="md">
            <Box
              width={ICON_BOX}
              height={ICON_BOX}
              borderRadius="full"
              bg={colors.interactive.soft}
              align="center"
              justify="center"
            >
              <ShieldCheck size={sizes.icon.md} color={colors.interactive.main} />
            </Box>
            <Box flex={1} gap="xs">
              <Text variant="title">{t(copy.unverifiedTitle)}</Text>
              <Text variant="bodySmall" color={colors.text.secondary}>
                {t(copy.unverifiedBody)}
              </Text>
            </Box>
            {onOpen ? <Chevron size={sizes.icon.sm} color={colors.icon.secondary} /> : null}
          </Box>
        </Card>
      );
    default: {
      const _exhaustive: never = kyc.status;
      return _exhaustive;
    }
  }
};

export const KycCard = memo(KycCardComponent);
