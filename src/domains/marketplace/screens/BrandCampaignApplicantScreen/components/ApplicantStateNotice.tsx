import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Info } from 'lucide-react-native';
import type { ParseKeys } from 'i18next';
import { iconStroke, resolveHue, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { ApplicationStatus } from '../../../types/campaign';

/** Where a decided application stands, in the brand's words; pending ones have no notice. */
const DECIDED_COPY = {
  rejected: 'marketplace.campaign.applicants.detail.decided.rejected',
  not_selected: 'marketplace.campaign.applicants.detail.decided.notSelected',
  cancelled: 'marketplace.campaign.applicants.detail.decided.cancelled',
  selected: 'marketplace.campaign.applicants.detail.decided.selected',
} as const satisfies Partial<Record<ApplicationStatus, ParseKeys>>;

export interface ApplicantStateNoticeProps {
  /** `null`: a status this app does not know yet; it shows no notice. */
  status: ApplicationStatus | null;
}

const isDecided = (status: ApplicationStatus | null): status is keyof typeof DECIDED_COPY =>
  status !== null && status in DECIDED_COPY;

/** An expired application says its 72 h are over (and why it cannot be decided); a decided one says what was decided. */
const ApplicantStateNoticeComponent: React.FC<ApplicantStateNoticeProps> = ({ status }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  if (status === 'expired') {
    const warn = resolveHue(colors, 'warning');
    return (
      <Box row gap="md" p="md" borderRadius="md" bg={warn.soft} accessible accessibilityRole="alert">
        <Clock size={sizes.icon.md} color={warn.main} strokeWidth={iconStroke.regular} />
        <Box flex={1} gap="xs">
          <Text variant="bodyMedium" color={warn.text}>
            {t('marketplace.campaign.applicants.detail.expiredNotice.title')}
          </Text>
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('marketplace.campaign.applicants.detail.expiredNotice.hint')}
          </Text>
        </Box>
      </Box>
    );
  }
  if (!isDecided(status)) return null;
  return (
    <Box row align="center" gap="md" p="md" borderRadius="md" bg={colors.surface.main} accessible>
      <Info size={sizes.icon.md} color={colors.text.secondary} strokeWidth={iconStroke.regular} />
      <Box flex={1}>
        <Text variant="bodyMedium" color={colors.text.primary}>
          {t(DECIDED_COPY[status])}
        </Text>
      </Box>
    </Box>
  );
};

export const ApplicantStateNotice = memo(ApplicantStateNoticeComponent);
