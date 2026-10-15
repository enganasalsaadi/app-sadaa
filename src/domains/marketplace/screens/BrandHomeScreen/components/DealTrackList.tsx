import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import type { BrandActiveDeal } from '../../../types';
import { DealTrackRow } from './DealTrackRow';

const MORE_HEIGHT = moderateScale(52);

interface DealTrackListProps {
  deals: BrandActiveDeal[];
  onOpen: (id: string) => void;
  /** Every open deal, when more exist than the rows shown; else `null`. */
  moreCount: number | null;
  onSeeAll: () => void;
}

/**
 * «Moving without you»: a hairline-led heading, then one card of ruled rows, each a deal on
 * its tracker; «All your deals (n)» closes it when the server holds more than it sent.
 */
const DealTrackListComponent: React.FC<DealTrackListProps> = ({
  deals,
  onOpen,
  moreCount,
  onSeeAll,
}) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const styles = useStyles(
    ({
      colors: palette,
      borderWidths,
    }): Record<'rule' | 'arrow' | 'divider', ViewStyle> => ({
      rule: {
        flex: 1,
        height: borderWidths.thin,
        backgroundColor: palette.border.default,
      },
      arrow: { transform: [{ scaleX: isRTL ? -1 : 1 }] },
      divider: {
        borderTopWidth: borderWidths.thin,
        borderTopColor: palette.border.default,
      },
    }),
    [isRTL],
  );

  return (
    <Box gap="md">
      <Box row align="center" gap="sm" px="xl">
        <Text
          variant="buttonSmall"
          color={colors.text.secondary}
          accessibilityRole="header"
        >
          {t('marketplace.brandHome.deals.lane')}
        </Text>
        <Box style={styles.rule} />
      </Box>
      {/* Shadow outside, clip inside: iOS drops the shadow of a view that clips. */}
      <Box
        mx="xl"
        borderRadius="lg"
        shadow="card"
        bg={colors.surface.main}
        borderWidth="thin"
        borderColor={colors.border.card}
      >
        <Box borderRadius="lg" overflow="hidden">
          {deals.map((deal, at) => (
            <Box key={deal.id} style={at > 0 ? styles.divider : undefined}>
              <DealTrackRow deal={deal} onOpen={onOpen} />
            </Box>
          ))}
          {moreCount !== null ? (
            <Pressable
              row
              align="center"
              justify="center"
              gap="xs"
              minHeight={MORE_HEIGHT}
              style={styles.divider}
              onPress={onSeeAll}
              accessibilityRole="button"
            >
              <Text variant="buttonSmall" color={colors.interactive.text}>
                {t('marketplace.brandHome.deals.seeAllCount', {
                  count: moreCount,
                })}
              </Text>
              <Box style={styles.arrow}>
                <ArrowRight
                  size={sizes.icon.xs}
                  color={colors.interactive.text}
                />
              </Box>
            </Pressable>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export const DealTrackList = memo(DealTrackListComponent);
