import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Image, LiveDot, Pressable, SocialPlatformIcon, Text } from '@/shared/ui';
import type { DealLivePlatform } from '../../../constants/dealPublish';
import type { DealCreatorParty } from '../../../types';
import { monogramOf } from '../../../utils/creatorText';

const AVATAR = moderateScale(52);
const BADGE = moderateScale(24);
const WELL = moderateScale(52);

/** The handed-in post as the brand sees it. `null` = nothing handed in yet. */
export interface LiveRoomPost {
  /** `host/path`, or the «no link» line for an item with no platform. */
  link: string;
  /** Only when the link is on an allow-listed platform host (rule 07). */
  canOpen: boolean;
  platform: DealLivePlatform | null;
  platformLabel: string;
  /** The account the server read from the link (`@sara.style`), when it could. */
  handle: string | null;
  handleChecked: boolean;
}

export interface LiveRoomHeroProps {
  position: string;
  itemTitle: string;
  creator: DealCreatorParty;
  post: LiveRoomPost | null;
  /** Shown in the card while there is no post («Waiting for Sara to publish»). */
  waiting: string;
  onOpen: () => void;
}

/**
 * «غرفة البث» (approved P7): the post on a glass card over the live navy hero: who posted it (the
 * platform on their avatar), the link with «Open», and whether the account was matched to the
 * contract (amber «not checked» when the server couldn't read it: the screenshots then decide).
 */
const LiveRoomHeroComponent: React.FC<LiveRoomHeroProps> = ({ position, itemTitle, creator, post, waiting, onOpen }) => {
  const { t } = useTranslation();
  const { colors, sizes, spacing } = useTheme();
  const { top } = useSafeAreaInsets();
  const checked = post?.handleChecked ?? false;
  const styles = useStyles(
    ({ radii, borderWidths }): Record<
      'container' | 'titleRow' | 'titleText' | 'pill' | 'card' | 'avatar' | 'badge' | 'well' | 'open' | 'account',
      ViewStyle
    > => ({
      container: { paddingTop: top + spacing.sm },
      titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: sizes.iconButton.md,
        paddingStart: sizes.iconButton.md + spacing.sm,
      },
      titleText: { flex: 1 },
      pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radii.sm,
        backgroundColor: colors.live.lampOnFill,
      },
      card: {
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radii.xl,
        backgroundColor: colors.glass.fill,
        borderWidth: borderWidths.thin,
        borderColor: colors.glass.border,
      },
      avatar: {
        width: AVATAR,
        height: AVATAR,
        borderRadius: radii.full,
        borderWidth: borderWidths.lg,
        borderColor: colors.live.ring,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.brand.soft,
      },
      badge: {
        position: 'absolute',
        bottom: -spacing.xs,
        end: -spacing.xs,
        width: BADGE,
        height: BADGE,
        borderRadius: radii.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.brand.main,
        borderWidth: borderWidths.md,
        borderColor: colors.text.onBrand,
      },
      well: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: WELL,
        paddingStart: spacing.md,
        paddingEnd: spacing.xs,
        borderRadius: radii.md,
        backgroundColor: colors.live.well,
      },
      open: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        minHeight: sizes.button.md,
        paddingHorizontal: spacing.md,
        borderRadius: radii.md,
        backgroundColor: colors.button.onBrand.bg,
      },
      account: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radii.md,
        borderWidth: borderWidths.thin,
        backgroundColor: checked ? colors.live.okFill : colors.live.warnFill,
        borderColor: checked ? colors.live.okBorder : colors.live.warnBorder,
      },
    }),
    [checked, colors, sizes, spacing, top],
  );

  const name = creator.name ?? '';
  const accountTone = checked ? colors.live.okText : colors.live.warnText;

  return (
    <Box style={styles.container} px="xl" pb="4xl" gap="lg">
      <Box style={styles.titleRow}>
        <Box style={styles.titleText}>
          <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
            {position}
          </Text>
          <Text variant="title" color={colors.text.onBrand} numberOfLines={1} accessibilityRole="header">
            {itemTitle}
          </Text>
        </Box>
        {post ? (
          <Box style={styles.pill}>
            <LiveDot color={colors.live.ring} />
            <Text variant="caption" color={colors.text.onBrand}>
              {t('marketplace.deals.publish.brand.onAir')}
            </Text>
          </Box>
        ) : null}
      </Box>
      <Box style={styles.card}>
        <Box row align="center" gap="md">
          <Box style={styles.avatar}>
            {creator.avatarUrl ? (
              <Image uri={creator.avatarUrl} size={AVATAR - spacing.xs} borderRadius="full" />
            ) : (
              <Text variant="title" color={colors.brand.text}>
                {monogramOf(name)}
              </Text>
            )}
            {post?.platform ? (
              <Box style={styles.badge}>
                <SocialPlatformIcon platform={post.platform} size={sizes.icon.xs} color={colors.text.onBrand} />
              </Box>
            ) : null}
          </Box>
          <Box flex={1}>
            <Text variant="title" color={colors.text.onBrand} numberOfLines={1}>
              {name}
            </Text>
            {post?.handle ? (
              <Text variant="bodySmall" color={colors.text.onBrandMuted} numberOfLines={1}>
                {post.handle}
              </Text>
            ) : null}
          </Box>
        </Box>
        {post ? (
          <>
            <Box style={styles.well}>
              <Box flex={1}>
                <Text variant="bodyMedium" color={colors.text.onBrand} numberOfLines={1}>
                  {post.link}
                </Text>
              </Box>
              {post.canOpen ? (
                <Pressable
                  style={styles.open}
                  onPress={onOpen}
                  scaleOnPress
                  accessibilityRole="link"
                  accessibilityLabel={t('marketplace.deals.publish.brand.openA11y', { platform: post.platformLabel })}
                >
                  <Text variant="buttonSmall" color={colors.button.onBrand.text}>
                    {t('marketplace.deals.publish.brand.open')}
                  </Text>
                  <ExternalLink size={sizes.icon.xs} color={colors.button.onBrand.text} />
                </Pressable>
              ) : null}
            </Box>
            {post.platform ? (
              <Box style={styles.account} accessible accessibilityRole="text">
                {checked ? (
                  <ShieldCheck size={sizes.icon.md} color={accountTone} />
                ) : (
                  <AlertTriangle size={sizes.icon.md} color={accountTone} />
                )}
                <Box flex={1} gap="xs">
                  <Text variant="bodyMedium" color={accountTone}>
                    {checked
                      ? t('marketplace.deals.publish.brand.account.checked')
                      : t('marketplace.deals.publish.brand.account.unchecked')}
                  </Text>
                  <Text variant="caption" color={accountTone}>
                    {checked
                      ? t('marketplace.deals.publish.brand.account.checkedBody', { handle: post.handle ?? name })
                      : t('marketplace.deals.publish.brand.account.uncheckedBody', { name })}
                  </Text>
                </Box>
              </Box>
            ) : null}
          </>
        ) : (
          <Text variant="bodySmall" color={colors.text.onBrandMuted}>
            {waiting}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export const LiveRoomHero = memo(LiveRoomHeroComponent);
