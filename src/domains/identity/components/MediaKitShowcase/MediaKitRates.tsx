import React, { memo, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { isSocialPlatform } from '@/shared/utils';
import { Box, Pressable, SocialPlatformIcon, Text } from '@/shared/ui';
import type { MediaKitServicesModel } from '../../hooks/useMediaKitServices';
import type { ServiceGroup } from '../../utils/mediaKitShowcase';
import { MediaKitRise } from './MediaKitRise';
import { MediaKitSectionTitle } from './MediaKitSectionTitle';
import { MediaKitTicket } from './MediaKitTicket';

const PILL_LOGO = moderateScale(22);
const TICKET_STAGGER = 70;

interface PillProps {
  group: ServiceGroup;
  active: boolean;
  onPress: (key: string) => void;
}

const PlatformPill = memo<PillProps>(({ group, active, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const press = useCallback(() => onPress(group.key), [group.key, onPress]);
  const label = group.label ?? t('account.rates.inPerson');
  return (
    <Pressable
      onPress={press}
      scaleOnPress
      row
      align="center"
      gap="sm"
      height={sizes.button.md}
      ps="md"
      pe="sm"
      borderRadius="full"
      borderWidth="sm"
      borderColor={active ? colors.interactive.main : colors.border.default}
      bg={active ? colors.surface.main : colors.layout.transparent}
      shadow={active ? 'card' : undefined}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={t('account.mediaKit.showcase.services.pillA11y', {
        platform: label,
        count: group.services.length,
      })}
    >
      {isSocialPlatform(group.key) ? (
        <SocialPlatformIcon platform={group.key} size={PILL_LOGO} color={colors.text.primary} />
      ) : (
        <MapPin size={sizes.icon.sm} color={colors.interactive.main} />
      )}
      <Text variant="buttonSmall" color={active ? colors.text.primary : colors.text.secondary}>
        {label}
      </Text>
      <Box
        minWidth={sizes.control.md}
        height={sizes.control.md}
        px="xs"
        borderRadius="full"
        align="center"
        justify="center"
        bg={active ? colors.interactive.main : colors.surface.elevated}
      >
        <Text variant="caption" color={active ? colors.text.onAccent : colors.text.tertiary}>
          {group.services.length}
        </Text>
      </Box>
    </Pressable>
  );
});

interface MediaKitRatesProps {
  services: MediaKitServicesModel;
  /** Brand viewer with prices visible. */
  selectable: boolean;
}

/**
 * "Pick what you need": a platform filter (only with more than one platform) over price
 * tickets, up to four per platform; "All prices (N)" lays every ticket out, "By platform"
 * goes back. Tickets slide in on each switch; picks stay across switches (the footer
 * estimate keeps counting). One platform → its tickets straight away.
 */
const MediaKitRatesComponent: React.FC<MediaKitRatesProps> = ({ services, selectable }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { groups, activeGroup, onGroupChange, showAll, onShowAll, onShowByPlatform, view, fastestDays } = services;
  const styles = useStyles(
    ({ spacing, radii, borderWidths, colors: palette }) => ({
      // Edge to edge, so pills scroll under the screen edge instead of stopping at the gutter.
      filter: { flexGrow: 0, marginHorizontal: -spacing.xl },
      filterContent: { paddingHorizontal: spacing.xl, paddingVertical: spacing.xs, gap: spacing.sm },
      more: {
        minHeight: sizes.button.md,
        borderRadius: radii.lg,
        borderWidth: borderWidths.sm,
        borderStyle: 'dashed' as const,
        borderColor: palette.border.strong,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
      },
    }),
    [sizes.button.md],
  );

  if (!activeGroup || view.services.length === 0) return null;

  const viewKey = showAll ? 'all' : activeGroup.key;
  const moreLabel =
    view.more === 'all'
      ? t('account.mediaKit.showcase.services.allPrices', { count: view.totalCount })
      : t('account.mediaKit.showcase.services.byPlatform');

  return (
    <Box gap="lg">
      <MediaKitSectionTitle
        overline={t('account.mediaKit.showcase.services.overline')}
        title={t('account.mediaKit.showcase.services.title')}
        subtitle={selectable ? t('account.mediaKit.showcase.services.pickHint') : undefined}
      />
      {groups.length > 1 ? (
        <MediaKitRise>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filter}
            contentContainerStyle={styles.filterContent}
            accessibilityRole="tablist"
            accessibilityLabel={t('account.mediaKit.showcase.services.tabsA11y')}
          >
            {groups.map(group => (
              <PlatformPill
                key={group.key}
                group={group}
                active={!showAll && group.key === activeGroup.key}
                onPress={onGroupChange}
              />
            ))}
          </ScrollView>
        </MediaKitRise>
      ) : null}
      <Box key={viewKey} gap="md">
        {view.services.map((service, index) => (
          <MediaKitRise key={service.key} from="side" delay={index * TICKET_STAGGER}>
            <MediaKitTicket
              service={service}
              selectable={selectable && service.price !== null}
              selected={services.selected.has(service.key)}
              fastest={fastestDays !== null && service.deliveryDays === fastestDays}
              onToggle={services.toggleService}
            />
          </MediaKitRise>
        ))}
      </Box>
      {view.more ? (
        <Pressable
          onPress={view.more === 'all' ? onShowAll : onShowByPlatform}
          style={styles.more}
          accessibilityRole="button"
          accessibilityLabel={moreLabel}
        >
          <Text variant="buttonSmall" color={colors.interactive.text}>
            {moreLabel}
          </Text>
        </Pressable>
      ) : null}
    </Box>
  );
};

export const MediaKitRates = memo(MediaKitRatesComponent);
