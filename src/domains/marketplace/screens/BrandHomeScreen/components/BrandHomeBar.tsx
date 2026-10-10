import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import { CompanyMark } from './CompanyMark';

interface BrandHomeBarProps {
  companyName: string;
  onOpenProfile: () => void;
}

/** Company pinned in the navy bar once the hero scrolls away; the bell stays a header action. */
const BrandHomeBarComponent: React.FC<BrandHomeBarProps> = ({ companyName, onOpenProfile }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(() => ({ shrink: { flexShrink: 1 } }));

  return (
    <Box row>
      <Pressable
        row
        align="center"
        gap="sm"
        minHeight={sizes.iconButton.md}
        style={styles.shrink}
        onPress={onOpenProfile}
        accessibilityRole="button"
        accessibilityLabel={t('marketplace.brandHome.openProfile', { name: companyName })}
      >
        <CompanyMark size={sizes.avatar.sm} />
        <Box style={styles.shrink}>
          <Text variant="title" color={colors.text.onBrand} numberOfLines={1}>
            {companyName}
          </Text>
        </Box>
      </Pressable>
    </Box>
  );
};

export const BrandHomeBar = memo(BrandHomeBarComponent);
