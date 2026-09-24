import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface CurvedBarBackgroundProps {
  /** Total bar width (screen width minus horizontal margins). */
  width: number;
  /** Bar height (excluding the FAB overhang). */
  height: number;
  /** Radius of the concave cradle that holds the center FAB. */
  cradleRadius: number;
  /** Outer corner radius of the bar. */
  corner: number;
  /** Fill color of the bar surface. */
  fill: string;
  /** Hairline stroke color for definition against the page. */
  stroke: string;
}

/**
 * Builds a rounded-rect path with a smooth concave notch centered on the top
 * edge so the raised camera FAB nests inside a curved cradle. The two mirrored
 * cubic curves give the cradle soft, tangent-continuous shoulders (no hard
 * corners where the dip meets the top edge).
 */
const buildPath = (
  w: number,
  h: number,
  r: number,
  corner: number,
): string => {
  const c = w / 2;
  return [
    `M ${corner} 0`,
    `L ${c - r * 2} 0`,
    `C ${c - r * 0.4} 0 ${c - r} ${r} ${c} ${r}`,
    `C ${c + r} ${r} ${c + r * 0.4} 0 ${c + r * 2} 0`,
    `L ${w - corner} 0`,
    `Q ${w} 0 ${w} ${corner}`,
    `L ${w} ${h - corner}`,
    `Q ${w} ${h} ${w - corner} ${h}`,
    `L ${corner} ${h}`,
    `Q 0 ${h} 0 ${h - corner}`,
    `L 0 ${corner}`,
    `Q 0 0 ${corner} 0`,
    'Z',
  ].join(' ');
};

export const CurvedBarBackground: React.FC<CurvedBarBackgroundProps> = ({
  width,
  height,
  cradleRadius,
  corner,
  fill,
  stroke,
}) => {
  const d = useMemo(
    () => buildPath(width, height, cradleRadius, corner),
    [width, height, cradleRadius, corner],
  );

  return (
    <Svg width={width} height={height} style={styles.svg}>
      <Path d={d} fill={fill} stroke={stroke} strokeWidth={1} />
    </Svg>
  );
};

const styles = StyleSheet.create({
  svg: { position: 'absolute' },
});
