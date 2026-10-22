import React, { memo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Compass, Megaphone, Star } from 'lucide-react-native';
import { formatMoney, formatNumber } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Divider, GradientSurface, Image, MoneyText, Pressable, Text } from '@/shared/ui';
import type { CreatorCampaign } from '../../../types';
import { netHeadline } from '../../../utils/opportunities';
import type { CreatorHomeCampaignsModel } from '../hooks/useCreatorHomeCampaigns';
import { CampaignsQuiet } from './CampaignsQuiet';

const THUMB = moderateScale(50);
const SEAT_BAR = moderateScale(34);
const SEAT_HEIGHT = moderateScale(4);
const ROW_MIN_HEIGHT = moderateScale(72);

/** The cover, or the brand gradient with what kind of campaign it is. */
const Thumb = memo<{ campaign: CreatorCampaign }>(({ campaign }) => {
  const { colors, sizes } = useTheme();
  const uri = campaign.cover?.url ?? null;
  const Icon = campaign.invited ? Star : Megaphone;
  return (
    <Box width={THUMB} height={THUMB} borderRadius="md" overflow="hidden" align="center" justify="center">
      {uri ? (
        <Image uri={uri} width={THUMB} height={THUMB} />
      ) : (
        <>
          <GradientSurface variant="brand" style={StyleSheet.absoluteFill} />
          <Icon size={sizes.icon.sm} color={colors.text.onBrand} />
        </>
      )}
    </Box>
  );
});

/** Seats still free as a short teal bar, then the words. */
const Seats = memo<{ total: number; free: number }>(({ total, free }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const share = total > 0 ? Math.min(1, free / total) : 0;
  return (
    <Box row align="center" gap="xs">
      <Box width={SEAT_BAR} height={SEAT_HEIGHT} borderRadius="full" bg={colors.surface.elevated} overflow="hidden" row>
        <Box flex={share} bg={colors.interactive.main} />
        <Box flex={1 - share} />
      </Box>
      <Text variant="caption" color={colors.text.secondary}>
        {t('marketplace.creatorHome.campaignsB.seats', { count: free })}
      </Text>
    </Box>
  );
});

const CampaignRow = memo<{ campaign: CreatorCampaign; onOpen: (id: string) => void }>(({ campaign, onOpen }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const open = useCallback(() => onOpen(campaign.id), [campaign.id, onOpen]);
  const headline = netHeadline(campaign.pricing);
  const net =
    headline === null
      ? ''
      : headline.kind === 'fixed'
        ? formatMoney(headline.net)
        : `${formatMoney(headline.min)} – ${formatMoney(headline.max)}`;
  const kind = campaign.invited
    ? t('marketplace.creatorHome.campaignsB.invited')
    : (campaign.activityType?.label ?? null);

  return (
    <Pressable
      row
      align="center"
      gap="md"
      py="md"
      minHeight={ROW_MIN_HEIGHT}
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.campaign.feed.card.a11y', {
        title: campaign.title,
        brand: campaign.brand.name,
        net,
      })}
    >
      <Thumb campaign={campaign} />
      <Box flex={1} gap="xs">
        <Text variant="bodyMedium" numberOfLines={1}>
          {campaign.title}
        </Text>
        <Box row align="center" gap="xs" wrap>
          <Text
            variant="caption"
            color={campaign.invited ? colors.premium.text : colors.text.secondary}
            numberOfLines={1}
          >
            {kind ? `${campaign.brand.name} · ${kind}` : campaign.brand.name}
          </Text>
          <Seats total={campaign.seats.total} free={campaign.seats.free} />
        </Box>
      </Box>
      {headline?.kind === 'fixed' ? (
        <MoneyText value={headline.net} size="sm" />
      ) : net ? (
        <Text variant="caption" color={colors.text.primary}>
          {net}
        </Text>
      ) : null}
    </Pressable>
  );
});

type HomeCampaignsProps = Pick<
  CreatorHomeCampaignsModel,
  'campaigns' | 'openCampaign' | 'openFeed' | 'openApplications'
> & { openRates: () => void };

/**
 * «Campaigns for you» as one card: how many fit (and the new invitations), up to three the server
 * ranked, each with what the creator takes home and the seats left, then the applications under
 * review (or the whole feed). A calm card when nothing fits; hidden while the flag is off.
 */
const HomeCampaignsComponent: React.FC<HomeCampaignsProps> = ({
  campaigns,
  openCampaign,
  openFeed,
  openApplications,
  openRates,
}) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  if (campaigns.kind === 'hidden') return null;

  const { feedCount, newInvites, openApplications: reviewing, items } = campaigns;
  if (items.length === 0 && feedCount === 0 && newInvites === 0 && reviewing === 0) {
    return <CampaignsQuiet onSetRates={openRates} />;
  }
  const footer =
    reviewing > 0
      ? { label: t('marketplace.creatorHome.campaignsB.reviewing', { count: reviewing }), onPress: openApplications }
      : { label: t('marketplace.creatorHome.campaignsB.browse'), onPress: openFeed };

  return (
    <Box mx="xl" px="lg" pt="md" borderRadius="xl" bg={colors.surface.main} shadow="card">
      <Pressable
        row
        align="center"
        gap="sm"
        minHeight={sizes.button.md}
        onPress={openFeed}
        accessibilityRole="button"
        accessibilityLabel={t('marketplace.creatorHome.campaignsB.headerA11y', { count: feedCount })}
      >
        <Compass size={sizes.icon.sm} color={colors.text.secondary} />
        <Text variant="buttonSmall" color={colors.text.secondary}>
          {`${t('marketplace.creatorHome.campaigns.title')} · ${formatNumber(feedCount)}`}
        </Text>
        {newInvites > 0 ? (
          <Box px="sm" py="xs" borderRadius="full" bg={colors.premium.soft}>
            <Text variant="caption" color={colors.premium.text}>
              {t('marketplace.creatorHome.campaignsB.invites', { count: newInvites })}
            </Text>
          </Box>
        ) : null}
        <Box flex={1} />
        <Chevron size={sizes.icon.sm} color={colors.text.tertiary} />
      </Pressable>
      {items.map(campaign => (
        <Box key={campaign.id}>
          <Divider />
          <CampaignRow campaign={campaign} onOpen={openCampaign} />
        </Box>
      ))}
      <Divider />
      <Pressable
        row
        align="center"
        justify="center"
        gap="xs"
        minHeight={sizes.button.md}
        onPress={footer.onPress}
        accessibilityRole="button"
        accessibilityLabel={footer.label}
      >
        <Text variant="buttonSmall" color={colors.interactive.text}>
          {footer.label}
        </Text>
        <Chevron size={sizes.icon.sm} color={colors.interactive.text} />
      </Pressable>
    </Box>
  );
};

export const HomeCampaigns = memo(HomeCampaignsComponent);
