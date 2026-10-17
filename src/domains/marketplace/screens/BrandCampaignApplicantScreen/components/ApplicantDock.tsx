import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, X } from 'lucide-react-native';
import { iconStroke, resolveHue, useTheme } from '@/core/theme';
import { Box, CustomButton } from '@/shared/ui';

export interface ApplicantDockProps {
  canShortlist: boolean;
  canReject: boolean;
  busy: boolean;
  onShortlist: () => void;
  onReject: () => void;
}

/**
 * The decisions that keep the application pending, docked under the page. Selecting joins them in
 * PC3.4. Only what the server allows shows; a button the card cannot use is not drawn disabled.
 */
const ApplicantDockComponent: React.FC<ApplicantDockProps> = ({ canShortlist, canReject, busy, onShortlist, onReject }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const danger = resolveHue(colors, 'danger');
  return (
    <Box row gap="md" px="xl" py="md">
      {canReject ? (
        <Box flex={1}>
          <CustomButton
            title={t('marketplace.campaign.applicants.detail.actions.reject')}
            variant="secondary"
            fullWidth
            disabled={busy}
            leftIcon={<X size={sizes.icon.sm} color={danger.main} strokeWidth={iconStroke.regular} />}
            onPress={onReject}
          />
        </Box>
      ) : null}
      {canShortlist ? (
        <Box flex={1}>
          <CustomButton
            title={t('marketplace.campaign.applicants.detail.actions.shortlist')}
            fullWidth
            loading={busy}
            leftIcon={<Star size={sizes.icon.sm} color={colors.text.onBrand} strokeWidth={iconStroke.regular} />}
            onPress={onShortlist}
          />
        </Box>
      ) : null}
    </Box>
  );
};

export const ApplicantDock = memo(ApplicantDockComponent);
