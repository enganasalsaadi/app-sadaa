import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { BadgeCheck, Clock, ShieldAlert, ShieldCheck, type LucideIcon } from 'lucide-react-native';
import { useStyles, useTheme, type ThemeColors } from '@/core/theme';
import type { KycStatus } from '@/domains/auth';
import { Box, Pressable, Text } from '@/shared/ui';

interface PillLook {
  icon: LucideIcon;
  labelKey: ParseKeys;
  brandLabelKey?: ParseKeys;
  tone: keyof ThemeColors['profile'];
}

const KYC_PILL = {
  unverified: {
    icon: ShieldCheck,
    labelKey: 'account.profile.kyc.pill.unverified',
    brandLabelKey: 'account.profile.kyc.pill.unverifiedBrand',
    tone: 'satelliteBorder',
  },
  pending: { icon: Clock, labelKey: 'account.profile.kyc.pendingTitle', tone: 'orbitPending' },
  verified: { icon: BadgeCheck, labelKey: 'account.profile.kyc.verifiedTitle', tone: 'orbitVerified' },
  rejected: { icon: ShieldAlert, labelKey: 'account.profile.kyc.rejectedTitle', tone: 'orbitRejected' },
} as const satisfies Record<KycStatus, PillLook>;

interface KycPillProps {
  status: KycStatus;
  isBrand: boolean;
  /** Set while the user can still send documents: the pill leads to verification. */
  onPress?: () => void;
}

/** Verification state under the name, on the navy hero; unverified reads as an open invitation (dashed). */
const KycPillComponent: React.FC<KycPillProps> = ({ status, isBrand, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const look: PillLook = KYC_PILL[status];
  const Icon = look.icon;
  const label = t(isBrand && look.brandLabelKey ? look.brandLabelKey : look.labelKey);
  const tone = colors.profile[look.tone];

  const styles = useStyles(
    ({ radii, borderWidths, spacing }): Record<'pill', ViewStyle> => ({
      pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radii.full,
        borderWidth: borderWidths.thin,
        borderStyle: status === 'unverified' ? 'dashed' : 'solid',
        borderColor: tone,
        backgroundColor: colors.profile.satellite,
      },
    }),
    [colors.profile.satellite, status, tone],
  );

  const pill = (
    <Box style={styles.pill}>
      <Icon size={sizes.icon.xs} color={status === 'unverified' ? colors.text.onBrand : tone} />
      <Text variant="caption" color={colors.text.onBrand} numberOfLines={1}>
        {label}
      </Text>
    </Box>
  );

  if (!onPress) return pill;
  return (
    <Pressable
      onPress={onPress}
      scaleOnPress
      minHeight={sizes.iconButton.md}
      justify="center"
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {pill}
    </Pressable>
  );
};

export const KycPill = memo(KycPillComponent);
