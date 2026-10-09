import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Card, KeyValueRow, Skeleton, SocialPlatformIcon, Text } from '@/shared/ui';
import { isSocialPlatform, type SocialPlatform } from '@/shared/utils';
import type { ProfileScreenModel } from '../hooks/useProfileScreen';

interface CompanyInfoCardProps {
  company: ProfileScreenModel['company'];
  isLoading: boolean;
  onPress: () => void;
}

/** Brand-only summary of what the company edit screen holds; tapping opens it. */
const CompanyInfoCardComponent: React.FC<CompanyInfoCardProps> = ({ company, isLoading, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const notSet = t('account.profile.company.notSet');

  const platforms = useMemo<SocialPlatform[]>(
    () => company.socialLinks.map(link => link.platform).filter(isSocialPlatform),
    [company.socialLinks],
  );

  return (
    <Card p="lg" onPress={onPress} accessibilityLabel={t('account.companyInfo.title')}>
      <Box gap="md">
        <Box row align="center" gap="sm">
          <Box flex={1}>
            <Text variant="title">{t('account.profile.company.title')}</Text>
          </Box>
          <Chevron size={sizes.icon.sm} color={colors.icon.secondary} />
        </Box>
        {isLoading ? (
          <Box gap="sm">
            <Skeleton width="80%" height={sizes.icon.sm} />
            <Skeleton width="60%" height={sizes.icon.sm} />
          </Box>
        ) : (
          <Box>
            <KeyValueRow
              label={t('account.profile.company.businessType')}
              value={company.businessType ?? notSet}
            />
            <KeyValueRow
              label={t('account.profile.company.governorate')}
              value={company.governorate ?? notSet}
            />
            <KeyValueRow
              label={t('account.profile.company.links')}
              value={
                platforms.length > 0 ? (
                  <Box row gap="sm" accessibilityLabel={t('account.profile.company.linksCount', { count: platforms.length })}>
                    {platforms.map(platform => (
                      <SocialPlatformIcon
                        key={platform}
                        platform={platform}
                        size={sizes.icon.sm}
                        color={colors.icon.secondary}
                      />
                    ))}
                  </Box>
                ) : (
                  t('account.profile.company.noLinks')
                )
              }
            />
          </Box>
        )}
      </Box>
    </Card>
  );
};

export const CompanyInfoCard = memo(CompanyInfoCardComponent);
