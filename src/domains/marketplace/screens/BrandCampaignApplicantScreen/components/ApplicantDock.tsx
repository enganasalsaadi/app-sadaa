import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, UserCheck, X } from 'lucide-react-native';
import { iconStroke, resolveHue, useTheme } from '@/core/theme';
import { Box, CustomButton } from '@/shared/ui';

export interface ApplicantDockProps {
  canSelect: boolean;
  canShortlist: boolean;
  canReject: boolean;
  busy: boolean;
  onSelect: () => void;
  onShortlist: () => void;
  onReject: () => void;
}

/**
 * The decisions on the applicant, docked under the page: selecting leads (PC3.4, it opens the
 * hold-to-sign sheet), shortlisting and rejecting keep the application pending or end it. Only what the
 * server allows shows; a button the card cannot use is not drawn disabled.
 */
const ApplicantDockComponent: React.FC<ApplicantDockProps> = ({
  canSelect,
  canShortlist,
  canReject,
  busy,
  onSelect,
  onShortlist,
  onReject,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const danger = resolveHue(colors, 'danger');
  return (
    <Box gap="md" px="xl" py="md">
      {canSelect ? (
        <CustomButton
          title={t('marketplace.campaign.applicants.detail.actions.select')}
          fullWidth
          disabled={busy}
          leftIcon={<UserCheck size={sizes.icon.sm} color={colors.text.onBrand} strokeWidth={iconStroke.regular} />}
          onPress={onSelect}
        />
      ) : null}
      {canReject || canShortlist ? (
        <Box row gap="md">
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
                variant={canSelect ? 'secondary' : 'primary'}
                fullWidth
                loading={busy}
                leftIcon={
                  <Star
                    size={sizes.icon.sm}
                    color={canSelect ? colors.text.primary : colors.text.onBrand}
                    strokeWidth={iconStroke.regular}
                  />
                }
                onPress={onShortlist}
              />
            </Box>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
};

export const ApplicantDock = memo(ApplicantDockComponent);
