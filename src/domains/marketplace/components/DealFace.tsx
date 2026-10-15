import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Avatar, Box, Text } from '@/shared/ui';
import type { DealParty } from '../types';
import { monogramOf } from '../utils/creatorText';

export interface DealFaceProps {
  party: DealParty;
  size: number;
  /** `brand`: on navy (passes, the detail hero). */
  surface?: 'default' | 'brand';
  /** Rim around the photo (the orbit's centre). */
  rim?: boolean;
}

/** The other side of a deal: their photo, or the first letter of their name on a tinted disc. */
const DealFaceComponent: React.FC<DealFaceProps> = ({
  party,
  size,
  surface = 'default',
  rim = false,
}) => {
  const { colors } = useTheme();
  const onBrand = surface === 'brand';
  const styles = useStyles(
    ({ radii, borderWidths }): Record<'disc', ViewStyle> => ({
      disc: {
        width: size,
        height: size,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: onBrand ? colors.glass.badge : colors.interactive.soft,
        borderWidth: rim ? borderWidths.md : 0,
        borderColor: colors.glass.border,
      },
    }),
    [
      colors.glass.badge,
      colors.glass.border,
      colors.interactive.soft,
      onBrand,
      rim,
      size,
    ],
  );

  return (
    <Box style={styles.disc}>
      {party.avatarUrl ? (
        <Avatar uri={party.avatarUrl} size={size} />
      ) : (
        <Text
          variant={size > 52 ? 'h3' : 'title'}
          color={onBrand ? colors.text.onBrand : colors.interactive.text}
        >
          {monogramOf(party.name ?? '')}
        </Text>
      )}
    </Box>
  );
};

export const DealFace = memo(DealFaceComponent);
