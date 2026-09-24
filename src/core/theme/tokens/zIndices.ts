const Z_INDICES = {
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  header: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  toast: 70,
  tooltip: 80,
  max: 9999,
} as const;

export type ZIndexToken = keyof typeof Z_INDICES;

export const createZIndices = (): Record<ZIndexToken, number> => {
  return { ...Z_INDICES };
};

export { Z_INDICES };
