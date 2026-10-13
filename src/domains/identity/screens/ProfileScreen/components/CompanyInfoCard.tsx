import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Globe, Link2, MapPin, Plus, Store, type LucideIcon } from 'lucide-react-native';
import { moderateScale, useTheme } from '@/core/theme';
import { formatNumber } from '@/core/i18n';
import { isSocialPlatform } from '@/shared/utils';
import { Box, Pressable, Skeleton, SocialPlatformIcon, Text } from '@/shared/ui';
import type { ProfileScreenModel } from '../hooks/useProfileScreen';

const ICON_BOX = moderateScale(40);
const FACT_ICON = moderateScale(36);

interface FactProps {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  first?: boolean;
}

/** One fact stacked label-over-value, so long activity names wrap instead of being cut. */
const Fact = memo<FactProps>(({ icon: Icon, label, children, first = false }) => {
  const { colors, sizes } = useTheme();
  return (
    <Box
      row
      align="flex-start"
      gap="md"
      px="lg"
      py="md"
      borderTopWidth={first ? undefined : 'thin'}
      borderColor={colors.border.default}
    >
      <Box width={FACT_ICON} height={FACT_ICON} borderRadius="full" bg={colors.surface.elevated} align="center" justify="center">
        <Icon size={sizes.icon.sm} color={colors.icon.secondary} />
      </Box>
      <Box flex={1} gap="xs">
        <Text variant="caption" color={colors.text.tertiary}>
          {label}
        </Text>
        {children}
      </Box>
    </Box>
  );
});

interface CompanyInfoCardProps {
  company: ProfileScreenModel['company'];
  isLoading: boolean;
  onEdit: () => void;
}

/** Brand-only: what the company edit screen holds, as stacked facts; links as chips. */
const CompanyInfoCardComponent: React.FC<CompanyInfoCardProps> = ({ company, isLoading, onEdit }) => {
  const { t } = useTranslation();
  const { colors, sizes, typography } = useTheme();
  const notSet = t('account.profile.company.notSet');
  const title = t('account.profile.company.title');
  const links = company.socialLinks;

  return (
    <Box borderRadius="xl" bg={colors.surface.main} borderWidth="thin" borderColor={colors.border.card} shadow="card" overflow="hidden">
      <Box row align="center" gap="md" ps="lg" pe="sm" pt="sm">
        <Box width={ICON_BOX} height={ICON_BOX} borderRadius="md" bg={colors.interactive.soft} align="center" justify="center">
          <Building2 size={sizes.icon.md} color={colors.interactive.main} />
        </Box>
        <Box flex={1}>
          <Text variant="title">{title}</Text>
        </Box>
        <Pressable
          onPress={onEdit}
          minHeight={sizes.iconButton.md}
          px="md"
          justify="center"
          accessibilityRole="button"
          accessibilityLabel={t('account.companyInfo.title')}
        >
          <Text variant="buttonSmall" color={colors.interactive.text}>
            {t('common.edit')}
          </Text>
        </Pressable>
      </Box>

      {isLoading ? (
        <Box p="lg" gap="md">
          <Skeleton width="80%" height={typography.body.lineHeight} />
          <Skeleton width="50%" height={typography.body.lineHeight} />
        </Box>
      ) : (
        <>
          <Fact icon={Store} label={t('account.profile.company.businessType')} first>
            <Text variant="bodyMedium">{company.businessType ?? notSet}</Text>
          </Fact>
          <Fact icon={MapPin} label={t('account.profile.company.governorate')}>
            <Text variant="bodyMedium">{company.governorate ?? notSet}</Text>
          </Fact>
          <Fact
            icon={Link2}
            label={
              links.length > 0
                ? `${t('account.profile.company.links')} · ${formatNumber(links.length)}`
                : t('account.profile.company.links')
            }
          >
            {links.length > 0 ? (
              <Box gap="sm" mt="xs">
                {links.map(link => (
                  <Box key={link.url} row align="center" gap="sm" px="md" minHeight={sizes.iconButton.md} borderRadius="md" bg={colors.surface.elevated}>
                    {isSocialPlatform(link.platform) ? (
                      <SocialPlatformIcon platform={link.platform} size={sizes.icon.sm} color={colors.icon.secondary} />
                    ) : (
                      <Globe size={sizes.icon.sm} color={colors.icon.secondary} />
                    )}
                    <Box flex={1}>
                      <Text variant="buttonSmall" numberOfLines={1} ellipsizeMode="middle">
                        {link.label}
                      </Text>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Pressable
                onPress={onEdit}
                row
                align="center"
                gap="xs"
                minHeight={sizes.iconButton.md}
                accessibilityRole="button"
                accessibilityLabel={t('account.profile.steps.socialLinks')}
              >
                <Plus size={sizes.icon.sm} color={colors.interactive.main} />
                <Text variant="bodyMedium" color={colors.interactive.text}>
                  {t('account.profile.steps.socialLinks')}
                </Text>
              </Pressable>
            )}
          </Fact>
        </>
      )}
    </Box>
  );
};

export const CompanyInfoCard = memo(CompanyInfoCardComponent);
