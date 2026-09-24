// shared/utils/listStyles.ts
import { BASE_SPACING } from '@/core/theme/tokens/spacing';
import { StyleSheet } from 'react-native';

export const listStyles = StyleSheet.create({
  // للقوائم العمودية العادية
  verticalListContent: {
    paddingHorizontal: BASE_SPACING.lg,
    paddingBottom: BASE_SPACING['3xl'],
    paddingTop: BASE_SPACING.sm,
    gap: BASE_SPACING.md,
  },

  // للقوائم الأفقية
  horizontalListContent: {
    paddingHorizontal: BASE_SPACING.sm,
    paddingVertical: BASE_SPACING.md,
  },

  // للـ Grid
  gridContent: {
    paddingHorizontal: BASE_SPACING.md,
    paddingBottom: BASE_SPACING['3xl'],
    paddingTop: BASE_SPACING.md,
  },

  // للحالات الخاصة
  noPadding: {
    padding: 0,
  },
});
