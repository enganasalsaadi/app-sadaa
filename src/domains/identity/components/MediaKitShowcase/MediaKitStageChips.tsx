import React, { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, MapPin, X } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text, TierBadge } from '@/shared/ui';
import type { PublicMediaKit } from '../../types/mediaKit';
import { MediaKitRise } from './MediaKitRise';

/** A long niche or city name ends in "…" before it crowds the row. */
const CHIP_MAX_WIDTH = moderateScale(160);
const CHIP_STAGGER = 60;

const GlassChip = memo<{ icon: LucideIcon; label: string }>(({ icon: Icon, label }) => {
  const { colors, sizes } = useTheme();
  // Shrinks inside the capped pill instead of taking a flex share (that collapses to 0 here).
  const styles = useStyles(() => ({ label: { flexShrink: 1 } }), []);
  return (
    <Box
      row
      align="center"
      gap="xs"
      height={sizes.button.sm}
      maxWidth={CHIP_MAX_WIDTH}
      px="md"
      borderRadius="full"
      bg={colors.stage.chip}
      borderWidth="thin"
      borderColor={colors.glass.border}
    >
      <Icon size={sizes.icon.xs} color={colors.text.onBrand} />
      <Box style={styles.label}>
        <Text variant="buttonSmall" color={colors.text.onBrand} numberOfLines={1}>
          {label}
        </Text>
      </Box>
    </Box>
  );
});

interface MediaKitStageChipsProps {
  kit: PublicMediaKit;
  nicheLabels: readonly string[];
}

/**
 * Tier, the first niche and the city as glass pills; "+N" opens the other niches on their
 * own row underneath (each pops in), so a creator with many niches never breaks the line.
 */
const MediaKitStageChipsComponent: React.FC<MediaKitStageChipsProps> = ({ kit, nicheLabels }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen(prev => !prev), []);
  const [first, ...rest] = nicheLabels;
  const city = kit.city?.label;

  if (!kit.tier && !first && !city) return null;

  return (
    <Box align="center" gap="sm">
      <Box row wrap justify="center" align="center" gap="xs">
        {kit.tier ? <TierBadge tier={kit.tier} size="sm" surface="media" /> : null}
        {first ? <GlassChip icon={Briefcase} label={first} /> : null}
        {rest.length > 0 ? (
          <Pressable
            onPress={toggle}
            scaleOnPress
            align="center"
            justify="center"
            minWidth={sizes.button.md}
            height={sizes.button.md}
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
            accessibilityLabel={t(
              open ? 'account.mediaKit.showcase.stage.lessNiches' : 'account.mediaKit.showcase.stage.moreNiches',
            )}
          >
            <Box
              row
              align="center"
              justify="center"
              height={sizes.button.sm}
              minWidth={sizes.button.sm}
              px="sm"
              borderRadius="full"
              bg={colors.interactive.soft}
              borderWidth="thin"
              borderColor={colors.interactive.main}
            >
              {open ? (
                <X size={sizes.icon.xs} color={colors.interactive.text} />
              ) : (
                <Text variant="buttonSmall" color={colors.interactive.text}>
                  {t('account.mediaKit.showcase.stage.moreCount', { count: rest.length })}
                </Text>
              )}
            </Box>
          </Pressable>
        ) : null}
        {city ? <GlassChip icon={MapPin} label={city} /> : null}
      </Box>
      {open ? (
        <Box row wrap justify="center" gap="xs">
          {rest.map((label, index) => (
            <MediaKitRise key={label} from="pop" delay={index * CHIP_STAGGER}>
              <GlassChip icon={Briefcase} label={label} />
            </MediaKitRise>
          ))}
        </Box>
      ) : null}
    </Box>
  );
};

export const MediaKitStageChips = memo(MediaKitStageChipsComponent);
