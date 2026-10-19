import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '@/core/theme';

const RING_RADII = [60, 100, 145, 195] as const;

/** Concentric rings on the brand gradient: what a campaign's cover shows until the brand adds a photo. */
const CampaignCoverRingsComponent: React.FC = () => {
  const { colors } = useTheme();
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox="0 0 390 300"
      preserveAspectRatio="xMidYMid slice"
      pointerEvents="none"
      accessible={false}
    >
      <G fill="none" stroke={colors.media.glassBorder} strokeWidth={1}>
        {RING_RADII.map(radius => (
          <Circle key={radius} cx={270} cy={110} r={radius} />
        ))}
      </G>
      <Circle cx={270} cy={110} r={38} fill={colors.text.onBrand} fillOpacity={0.14} />
      <Circle cx={270} cy={110} r={20} fill={colors.text.onBrand} fillOpacity={0.22} />
    </Svg>
  );
};

export const CampaignCoverRings = memo(CampaignCoverRingsComponent);
