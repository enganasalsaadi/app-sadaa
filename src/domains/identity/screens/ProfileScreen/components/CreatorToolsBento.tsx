import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Eye,
  EyeOff,
  Link2,
  Share2,
  Tags,
  WalletCards,
  type LucideIcon,
} from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, CustomButton, IconButton, Pressable, Skeleton, Tag, Text } from '@/shared/ui';
import type { ProfileScreenModel } from '../hooks/useProfileScreen';

const ICON_BOX = moderateScale(40);
const TILE_MIN = moderateScale(132);

const TileIcon = memo<{ icon: LucideIcon; tone?: 'default' | 'warning' }>(({ icon: Icon, tone = 'default' }) => {
  const { colors, sizes } = useTheme();
  const warning = tone === 'warning';
  return (
    <Box
      width={ICON_BOX}
      height={ICON_BOX}
      borderRadius="md"
      bg={warning ? colors.surface.main : colors.interactive.soft}
      align="center"
      justify="center"
    >
      <Icon size={sizes.icon.md} color={warning ? colors.status.warning.main : colors.interactive.main} />
    </Box>
  );
});

interface TileProps {
  label: string;
  onPress: () => void;
  wide?: boolean;
  warning?: boolean;
  children: React.ReactNode;
}

const Tile = memo<TileProps>(({ label, onPress, wide = false, warning = false, children }) => {
  const { colors } = useTheme();
  return (
    <Pressable
      flex={wide ? undefined : 1}
      minHeight={wide ? undefined : TILE_MIN}
      p="lg"
      gap="sm"
      borderRadius="xl"
      bg={warning ? colors.status.warning.soft : colors.surface.main}
      borderWidth="thin"
      borderColor={colors.border.card}
      shadow={warning ? undefined : 'card'}
      onPress={onPress}
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {children}
    </Pressable>
  );
});

interface CreatorToolsBentoProps {
  rates: ProfileScreenModel['rates'];
  mediaKit: ProfileScreenModel['mediaKit'];
  nicheLabels: readonly string[];
  /** Niches come with the profile details: hidden while those failed (the error card says so). */
  showNiches: boolean;
  nichesLoading: boolean;
  onRates: () => void;
  onPayouts: () => void;
  onMediaKit: () => void;
  onNiches: () => void;
}

/** A creator's working tools as one bento: prices + payouts side by side, media kit and niches wide. */
const CreatorToolsBentoComponent: React.FC<CreatorToolsBentoProps> = ({
  rates,
  mediaKit,
  nicheLabels,
  showNiches,
  nichesLoading,
  onRates,
  onPayouts,
  onMediaKit,
  onNiches,
}) => {
  const { t } = useTranslation();
  const { colors, sizes, typography, isRTL } = useTheme();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const ratesTitle = t(rates.needsSetup ? 'account.rates.notice.title' : 'account.rates.title');
  const mediaKitTitle = t('account.profile.mediaKit.title');
  const nichesTitle = t('account.profile.niches.title');

  return (
    <Box gap="md">
      <Box row gap="md">
        <Tile label={ratesTitle} onPress={onRates} warning={rates.needsSetup}>
          <TileIcon icon={CircleDollarSign} tone={rates.needsSetup ? 'warning' : 'default'} />
          {rates.needsSetup ? (
            <>
              <Text variant="title" color={colors.status.warning.text}>
                {ratesTitle}
              </Text>
              <Text variant="caption" color={colors.text.primary}>
                {t('account.rates.notice.message')}
              </Text>
            </>
          ) : (
            <Box flex={1} justify="flex-end">
              {rates.isLoading ? (
                <Skeleton width="40%" height={typography.h2.lineHeight} />
              ) : (
                <Text variant="h2" color={colors.brand.text}>
                  {formatNumber(rates.count)}
                </Text>
              )}
              <Text variant="title">{ratesTitle}</Text>
              <Text variant="caption" color={colors.text.secondary} numberOfLines={2}>
                {t('account.profile.tools.ratesHint')}
              </Text>
            </Box>
          )}
        </Tile>
        <Tile label={t('account.profile.payouts.title')} onPress={onPayouts}>
          <TileIcon icon={WalletCards} />
          <Box flex={1} justify="flex-end" gap="xs">
            <Text variant="title">{t('account.profile.payouts.title')}</Text>
            <Text variant="caption" color={colors.text.secondary} numberOfLines={3}>
              {t('account.profile.payouts.subtitle')}
            </Text>
          </Box>
        </Tile>
      </Box>

      <Tile label={mediaKitTitle} onPress={onMediaKit} wide>
        <Box row align="center" gap="md">
          <TileIcon icon={Link2} />
          <Box flex={1}>
            <Text variant="title" numberOfLines={1}>
              {mediaKitTitle}
            </Text>
            <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
              {t('account.profile.mediaKit.subtitle')}
            </Text>
          </Box>
          {mediaKit.canShare ? (
            <IconButton
              icon={Share2}
              accessibilityLabel={t('account.profile.mediaKit.share')}
              onPress={mediaKit.share}
              loading={mediaKit.isSharing}
              variant="soft"
            />
          ) : null}
        </Box>
        {mediaKit.link ? (
          <Box
            row
            align="center"
            gap="sm"
            px="md"
            minHeight={sizes.input.md}
            borderRadius="md"
            bg={colors.surface.elevated}
            accessible
            accessibilityLabel={`${t(mediaKit.isPublic ? 'account.profile.mediaKit.public' : 'account.profile.mediaKit.private')}, ${mediaKit.link}`}
          >
            {mediaKit.isPublic ? (
              <Eye size={sizes.icon.sm} color={colors.icon.secondary} />
            ) : (
              <EyeOff size={sizes.icon.sm} color={colors.icon.secondary} />
            )}
            <Box flex={1}>
              <Text variant="buttonSmall" numberOfLines={1}>
                {mediaKit.link}
              </Text>
            </Box>
            {mediaKit.isPublic ? null : (
              <Text variant="caption" color={colors.text.tertiary}>
                {t('account.profile.mediaKit.private')}
              </Text>
            )}
          </Box>
        ) : null}
      </Tile>

      {showNiches ? (
        <Tile label={nichesTitle} onPress={onNiches} wide>
          <Box row align="center" gap="md">
            <TileIcon icon={Tags} />
            <Box flex={1}>
              <Text variant="title">{nichesTitle}</Text>
            </Box>
            <Chevron size={sizes.icon.sm} color={colors.icon.secondary} />
          </Box>
          {nichesLoading ? (
            <Skeleton width="70%" height={typography.bodySmall.lineHeight} />
          ) : nicheLabels.length > 0 ? (
            <Box row wrap gap="xs">
              {nicheLabels.map(label => (
                <Tag key={label} label={label} tone="brand" />
              ))}
            </Box>
          ) : (
            <Text variant="bodySmall" color={colors.text.secondary}>
              {t('account.profile.niches.empty')}
            </Text>
          )}
        </Tile>
      ) : null}
    </Box>
  );
};

export const CreatorToolsBento = memo(CreatorToolsBentoComponent);
