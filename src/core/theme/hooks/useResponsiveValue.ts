import {useTheme} from './useTheme';
import type {ScreenCategory} from '../utils/responsive';

type ResponsiveMap<T> = Partial<Record<ScreenCategory, T>> & {
  small: T;
};

export function useResponsiveValue<T>(values: ResponsiveMap<T>): T {
  const {screen} = useTheme();
  const category = screen.category;

  if (category === 'large' && values.large !== undefined) {
    return values.large;
  }
  if (category !== 'small' && values.medium !== undefined) {
    return values.medium;
  }
  return values.small;
}
