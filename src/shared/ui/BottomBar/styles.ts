import type { Theme } from '@/core/theme';

export const tabItemStyles = ({ radii }: Theme) => ({
  tabBackground: {
    height: 45,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: radii.full,
  },
});
