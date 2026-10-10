import React, { memo } from 'react';
import { Building2 } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box } from '@/shared/ui';

interface CompanyMarkProps {
  size: number;
}

/** The company's glass icon tile on navy (the API sends no logo yet). */
const CompanyMarkComponent: React.FC<CompanyMarkProps> = ({ size }) => {
  const { colors, sizes } = useTheme();
  return (
    <Box
      width={size}
      height={size}
      borderRadius="md"
      borderWidth="thin"
      borderColor={colors.glass.border}
      bg={colors.glass.badge}
      align="center"
      justify="center"
    >
      <Building2
        size={size >= sizes.iconButton.md ? sizes.icon.md : sizes.icon.sm}
        color={colors.text.onBrand}
      />
    </Box>
  );
};

export const CompanyMark = memo(CompanyMarkComponent);
