/** Bar heights as a share of the tallest bar (0–1). Negative values and an all-zero series stay at 0. */
export const toBarRatios = (values: readonly number[]): number[] => {
  const max = Math.max(0, ...values);
  return values.map(value => (max > 0 ? Math.max(0, value) / max : 0));
};

/** Up to this many bars every label fits; above it every other label shows. */
export const MAX_ALL_LABELS = 7;

/**
 * Which month labels to print: all of them when they fit, else every other one,
 * counted back from the highlighted bar so it always keeps its label.
 */
export const isLabelShown = (index: number, count: number, highlightIndex: number): boolean =>
  count <= MAX_ALL_LABELS || Math.abs(highlightIndex - index) % 2 === 0;
