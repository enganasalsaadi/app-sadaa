import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, ShieldCheck } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, GradientSurface, StatusPill, Text } from '@/shared/ui';
import type { VerifiedView } from '../hooks/useCompanyVerificationScreen';

const ICON_BOX = moderateScale(40);

interface VerifiedSectionProps {
  verified: VerifiedView;
}

/** The one gold highlight: which route passed and when; nothing left to pick. */
const VerifiedSectionComponent: React.FC<VerifiedSectionProps> = ({ verified }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <Box gap="lg">
      <GradientSurface variant="premium" p="lg">
        <Box row align="flex-start" gap="md">
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
          <Box flex={1} gap="xs">
            <Box row align="center" gap="sm" wrap>
              <Text variant="title">{t('account.verification.verified.title')}</Text>
              <StatusPill
                label={t('account.verification.verified.badge')}
                tone="premium"
                icon={BadgeCheck}
                size="sm"
              />
            </Box>
            <Text variant="bodySmall" color={colors.text.secondary}>
              {verified.methodLine}
            </Text>
            {verified.dateLine ? (
              <Text variant="caption" color={colors.text.tertiary}>
                {verified.dateLine}
              </Text>
            ) : null}
          </Box>
        </Box>
      </GradientSurface>
      <Text variant="bodySmall" color={colors.text.secondary}>
        {t('account.verification.verified.benefit')}
      </Text>
    </Box>
  );
};

export const VerifiedSection = memo(VerifiedSectionComponent);
