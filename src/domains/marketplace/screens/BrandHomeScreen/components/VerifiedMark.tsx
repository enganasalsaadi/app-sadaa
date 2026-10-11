import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import { iconStroke, moderateScale, useTheme } from '@/core/theme';
import { Box } from '@/shared/ui';

const MARK_SIZE = { sm: moderateScale(18), md: moderateScale(26) } as const;
const GLYPH_SIZE = { sm: moderateScale(12), md: moderateScale(16) } as const;

/** Mustard disc with a navy tick: a KYC-verified creator (rule 08 premium role). */
const VerifiedMarkComponent: React.FC<{ size?: keyof typeof MARK_SIZE }> = ({ size = 'md' }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Box
      width={MARK_SIZE[size]}
      height={MARK_SIZE[size]}
      borderRadius="full"
      align="center"
      justify="center"
      bg={colors.premium.main}
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('marketplace.creator.verified')}
    >
      <Check size={GLYPH_SIZE[size]} color={colors.brand.main} strokeWidth={iconStroke.bold} />
    </Box>
  );
};

export const VerifiedMark = memo(VerifiedMarkComponent);
