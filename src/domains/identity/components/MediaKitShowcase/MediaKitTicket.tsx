import React, { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, ChevronUp, Clock, Eye, Lock, MapPin, RotateCcw, Zap } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import { iconStroke, moderateScale, useStyles, useTheme } from '@/core/theme';
import { isSocialPlatform } from '@/shared/utils';
import { Box, MoneyText, Pressable, SocialPlatformIcon, Text } from '@/shared/ui';
import { ADDON_ICONS } from '../../constants/addonIcons';
import type { ShowcaseService } from '../../utils/mediaKitShowcase';

const STUB = moderateScale(122);
const NOTCH = moderateScale(20);
const LOGO = moderateScale(30);
const WATERMARK = moderateScale(120);
const WATERMARK_OFFSET = moderateScale(-28);
const WATERMARK_ALPHA = 0.07;
const WATERMARK_TILT = '-14deg';
const DASHES = 11;
const DASH = moderateScale(6);
const DASH_WIDTH = 2;

const TermLine = memo<{ icon: LucideIcon; text: string }>(({ icon: Icon, text }) => {
  const { colors, sizes } = useTheme();
  return (
    <Box row align="center" gap="sm">
      <Icon size={sizes.icon.xs} color={colors.interactive.main} />
      <Box flex={1}>
        <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={1}>
          {text}
        </Text>
      </Box>
    </Box>
  );
});

/** What the package includes and its add-ons, folded until the brand asks. */
const TicketDetails = memo<{ service: ShowcaseService }>(({ service }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Box gap="sm">
      {service.includes.map(line => (
        <Box key={line} row align="center" gap="sm">
          <Check size={sizes.icon.xs} color={colors.status.success.main} />
          <Box flex={1}>
            <Text variant="caption" color={colors.text.secondary}>
              {line}
            </Text>
          </Box>
        </Box>
      ))}
      {service.addons.map(addon => {
        const Icon = ADDON_ICONS[addon.key];
        const { detail } = addon;
        return (
          <Box key={addon.key} row align="center" gap="sm">
            <Icon size={sizes.icon.xs} color={colors.interactive.main} />
            <Box flex={1}>
              <Text variant="caption" color={colors.text.secondary}>
                {detail
                  ? t('account.mediaKit.previewScreen.addonWithDetail', {
                      label: addon.label,
                      detail: t(detail.unit === 'hours' ? 'account.rates.hours' : 'account.rates.days', {
                        count: detail.count,
                      }),
                    })
                  : addon.label}
              </Text>
            </Box>
            {addon.price ? <MoneyText value={addon.price} size="sm" showSign /> : null}
          </Box>
        );
      })}
    </Box>
  );
});

/** The tear line: a dashed edge with a half-circle bite at each end, cut in the page colour. */
const TearLine = memo(() => {
  const styles = useStyles(
    ({ colors, radii }) => ({
      seam: {
        position: 'absolute' as const,
        top: NOTCH / 2,
        bottom: NOTCH / 2,
        start: -1,
        justifyContent: 'space-between' as const,
      },
      dash: { width: DASH_WIDTH, height: DASH, borderRadius: radii.xs, backgroundColor: colors.border.strong },
      notch: {
        position: 'absolute' as const,
        start: -NOTCH / 2,
        width: NOTCH,
        height: NOTCH,
        borderRadius: radii.full,
        backgroundColor: colors.layout.base,
      },
      top: { top: -NOTCH / 2 },
      bottom: { bottom: -NOTCH / 2 },
    }),
    [],
  );
  return (
    <>
      <Box style={styles.seam} pointerEvents="none">
        {Array.from({ length: DASHES }, (_, index) => (
          <Box key={index} style={styles.dash} />
        ))}
      </Box>
      <Box style={[styles.notch, styles.top]} pointerEvents="none" />
      <Box style={[styles.notch, styles.bottom]} pointerEvents="none" />
    </>
  );
});

interface MediaKitTicketProps {
  service: ShowcaseService;
  /** Brand viewer with prices visible: tapping the ticket adds it to the estimate. */
  selectable: boolean;
  selected: boolean;
  fastest: boolean;
  onToggle: (key: string) => void;
}

/**
 * One service as a ticket: the offer on the main part (platform mark, name, package, delivery,
 * revisions, how long it stays up, a faint oversized platform mark behind), the price on the
 * stub past a dashed tear line. Picked → the stub fills teal and the edge lights up. Locked
 * prices show a lock instead. Inclusions and add-ons fold under "Details".
 */
const MediaKitTicketComponent: React.FC<MediaKitTicketProps> = ({
  service,
  selectable,
  selected,
  fastest,
  onToggle,
}) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => onToggle(service.key), [onToggle, service.key]);
  const toggleDetails = useCallback(() => setOpen(prev => !prev), []);
  const platform = service.platform !== null && isSocialPlatform(service.platform) ? service.platform : null;
  const hasDetails = service.includes.length > 0 || service.addons.length > 0;
  const picked = selectable && selected;

  const styles = useStyles(
    () => ({
      watermark: {
        position: 'absolute' as const,
        end: WATERMARK_OFFSET,
        bottom: WATERMARK_OFFSET,
        opacity: WATERMARK_ALPHA,
        transform: [{ rotate: WATERMARK_TILT }],
      },
    }),
    [],
  );

  const subtitle = [service.platformLabel ?? t('account.rates.inPerson'), service.packageLabel]
    .filter(Boolean)
    .join(t('account.mediaKit.showcase.services.termsSeparator'));
  const delivery = t('account.mediaKit.showcase.services.delivery', {
    days: t('account.rates.days', { count: service.deliveryDays }),
  });
  const revisions = t('account.mediaKit.showcase.services.revisions', { count: service.revisions });
  const stays = service.retentionLabel
    ? t('account.mediaKit.showcase.services.stays', { label: service.retentionLabel })
    : null;
  const price = service.price
    ? formatMoney(service.price, i18n.language)
    : t('account.mediaKit.publicScreen.lockedPrice');
  const label = [service.serviceLabel, subtitle, price, delivery, revisions, stays]
    .filter(Boolean)
    .join(t('account.mediaKit.showcase.listSeparator'));

  const body = (
    <>
      <Box flex={1} p="lg" gap="md" overflow="hidden">
        <Box style={styles.watermark} pointerEvents="none">
          {platform ? (
            <SocialPlatformIcon platform={platform} size={WATERMARK} color={colors.text.primary} />
          ) : (
            <MapPin size={WATERMARK} color={colors.text.primary} />
          )}
        </Box>
        <Box row align="center" gap="sm">
          {platform ? (
            <SocialPlatformIcon platform={platform} size={LOGO} color={colors.text.primary} />
          ) : (
            <MapPin size={LOGO} color={colors.interactive.main} />
          )}
          <Box flex={1}>
            <Text variant="title" numberOfLines={1}>
              {service.serviceLabel}
            </Text>
            {subtitle ? (
              <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </Box>
          {fastest ? (
            <Box row align="center" gap="xs" px="sm" py="xs" borderRadius="full" bg={colors.interactive.main}>
              <Zap size={sizes.icon.xs} color={colors.text.onAccent} />
              <Text variant="caption" color={colors.text.onAccent}>
                {t('account.mediaKit.showcase.services.fastest')}
              </Text>
            </Box>
          ) : null}
        </Box>
        <Box gap="xs">
          <TermLine icon={Clock} text={delivery} />
          <TermLine icon={RotateCcw} text={revisions} />
          {stays ? <TermLine icon={Eye} text={stays} /> : null}
        </Box>
        {hasDetails ? (
          <Pressable
            onPress={toggleDetails}
            row
            align="center"
            gap="xs"
            alignSelf="flex-start"
            minHeight={sizes.button.md}
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
            accessibilityLabel={t('account.mediaKit.showcase.services.details')}
          >
            <Text variant="buttonSmall" color={colors.interactive.text}>
              {t('account.mediaKit.showcase.services.details')}
            </Text>
            {open ? (
              <ChevronUp size={sizes.icon.xs} color={colors.interactive.text} />
            ) : (
              <ChevronDown size={sizes.icon.xs} color={colors.interactive.text} />
            )}
          </Pressable>
        ) : null}
        {open ? <TicketDetails service={service} /> : null}
      </Box>
      <Box
        width={STUB}
        align="center"
        justify="center"
        gap="xs"
        px="sm"
        py="lg"
        bg={picked ? colors.interactive.main : colors.interactive.soft}
      >
        <TearLine />
        <Text variant="caption" color={picked ? colors.text.onAccent : colors.interactive.text}>
          {t('account.mediaKit.showcase.services.price')}
        </Text>
        {service.price ? (
          <MoneyText value={service.price} size="title" tone={picked ? 'onAccent' : 'default'} fit />
        ) : (
          <Box row align="center" gap="xs">
            <Lock size={sizes.icon.sm} color={colors.icon.secondary} />
            <Text variant="bodySmall" color={colors.text.tertiary}>
              {t('account.mediaKit.publicScreen.lockedPrice')}
            </Text>
          </Box>
        )}
        {selectable ? (
          <Box row align="center" gap="xs" mt="xs" px="md" py="xs" borderRadius="full" bg={colors.surface.main}>
            {picked ? <Check size={sizes.icon.xs} color={colors.interactive.text} strokeWidth={iconStroke.bold} /> : null}
            <Text variant="caption" color={colors.interactive.text}>
              {t(picked ? 'account.mediaKit.showcase.services.picked' : 'account.mediaKit.showcase.services.pick')}
            </Text>
          </Box>
        ) : null}
      </Box>
    </>
  );

  // The shadow lives on the outer layer: iOS clips a shadow on the view that clips its content.
  const outer = { borderRadius: 'xl', bg: colors.surface.main, shadow: 'card' } as const;
  const ticket = (
    <Box
      row
      borderRadius="xl"
      overflow="hidden"
      borderWidth="md"
      borderColor={picked ? colors.interactive.main : colors.border.card}
    >
      {body}
    </Box>
  );

  if (!selectable) {
    return (
      <Box {...outer} accessible accessibilityLabel={label}>
        {ticket}
      </Box>
    );
  }

  return (
    <Pressable
      {...outer}
      onPress={toggle}
      scaleOnPress
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
    >
      {ticket}
    </Pressable>
  );
};

export const MediaKitTicket = memo(MediaKitTicketComponent);
