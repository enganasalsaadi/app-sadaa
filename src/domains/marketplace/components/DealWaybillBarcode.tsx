import React, { memo, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box } from '@/shared/ui';

const HEIGHT = moderateScale(40);
const BAR_UNIT = moderateScale(1.5);
/** Bars drawn from the number, capped so long numbers still fit beside it. */
const MAX_BARS = 32;

/** Two bars per character (widths 1–3 units, gaps 1–2), read off its char code: same number, same code. */
const barsOf = (value: string): { width: number; gap: number }[] =>
  Array.from(value.replace(/\s+/g, ''))
    .flatMap(char => {
      const code = char.charCodeAt(0);
      return [
        { width: (code % 3) + 1, gap: (Math.floor(code / 4) % 2) + 1 },
        { width: (Math.floor(code / 2) % 3) + 1, gap: (Math.floor(code / 8) % 2) + 1 },
      ];
    })
    .slice(0, MAX_BARS);

/**
 * The waybill's barcode: decorative (not scannable), drawn from the tracking number so each
 * shipment looks like its own label. Hidden from screen readers; the number beside it is read.
 */
const DealWaybillBarcodeComponent: React.FC<{ value: string }> = ({ value }) => {
  const { colors } = useTheme();
  const bars = useMemo(() => barsOf(value), [value]);
  const styles = useStyles(
    (): Record<'row', ViewStyle> => ({
      row: { flexDirection: 'row', alignItems: 'stretch', height: HEIGHT, overflow: 'hidden' },
    }),
    [],
  );
  return (
    <Box style={styles.row} accessible={false} importantForAccessibility="no-hide-descendants">
      {bars.map((bar, index) => (
        <React.Fragment key={index}>
          <Box width={bar.width * BAR_UNIT} bg={colors.text.primary} />
          <Box width={bar.gap * BAR_UNIT} />
        </React.Fragment>
      ))}
    </Box>
  );
};

export const DealWaybillBarcode = memo(DealWaybillBarcodeComponent);
