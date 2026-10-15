import React, { memo, useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';

const STRIPE = 6;

export interface DealStripesProps {
  color: string;
  /** Stripe width; gaps are the same. */
  stripe?: number;
}

/** Diagonal stripes filling the parent: time being added to a deal. */
const DealStripesComponent: React.FC<DealStripesProps> = ({
  color,
  stripe = STRIPE,
}) => {
  const id = `stripes${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={stripe * 2}
          height={stripe * 2}
          patternTransform="rotate(-45)"
        >
          <Rect width={stripe} height={stripe * 2} fill={color} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
};

export const DealStripes = memo(DealStripesComponent);
