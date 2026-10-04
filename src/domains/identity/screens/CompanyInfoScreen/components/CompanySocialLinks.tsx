import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, FormSection, Pressable, Text } from '@/shared/ui';
import { SocialLinkInput } from '@/domains/auth';
import type { CompanyInfoScreenModel } from '../hooks/useCompanyInfoScreen';

interface CompanySocialLinksProps {
  vm: CompanyInfoScreenModel;
}

/** Same inputs and disclosure as brand registration, bound to the company form. */
const CompanySocialLinksComponent: React.FC<CompanySocialLinksProps> = ({ vm }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <FormSection
      title={t('account.companyInfo.socialLinks')}
      tag={t('common.optional')}
      description={t('account.companyInfo.socialLinksHint')}
    >
      <Box gap="lg">
        {vm.visiblePlatforms.map(platform => (
          <Controller
            key={platform}
            control={vm.control}
            name={`socialLinks.${platform}`}
            render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
              <SocialLinkInput
                inputRef={ref}
                platform={platform}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
        ))}
      </Box>
      {vm.canShowMorePlatforms ? (
        <Pressable
          onPress={vm.showMorePlatforms}
          row
          align="center"
          gap="xs"
          minHeight={sizes.button.md}
          accessibilityRole="button"
          accessibilityLabel={t('account.companyInfo.morePlatforms')}
        >
          <Text variant="bodyMedium" color={colors.interactive.text}>
            {t('account.companyInfo.morePlatforms')}
          </Text>
          <ChevronDown size={sizes.icon.sm} color={colors.interactive.main} />
        </Pressable>
      ) : null}
    </FormSection>
  );
};

export const CompanySocialLinks = memo(CompanySocialLinksComponent);
