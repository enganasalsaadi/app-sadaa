import {useRef} from 'react';
import {StyleSheet} from 'react-native';
import {useTheme} from './useTheme';
import type {Theme} from '../types';

type NamedStyles<T> = {[P in keyof T]: T[P]};

type StyleFactory<T extends NamedStyles<T>> = (theme: Theme) => T;

const sameKeys = (a: readonly unknown[], b: readonly unknown[]): boolean =>
  a.length === b.length && a.every((value, i) => Object.is(value, b[i]));

/**
 * Creates memoized StyleSheet objects with access to the current theme.
 *
 * @param factory - Function that receives the theme and returns raw styles.
 * @param deps - Optional dependency array. When provided, styles recompute
 *   when theme OR any dep changes. Use this when the factory closes over
 *   props or local state (e.g. `isActive`, `variant`).
 *
 * Without deps, styles only recompute when the theme object changes.
 */
export function useStyles<T extends NamedStyles<T>>(
  factory: StyleFactory<T>,
  deps?: readonly unknown[],
): T {
  const theme = useTheme();
  const cache = useRef<{ keys: readonly unknown[]; styles: T } | null>(null);
  // Callers pass a variable-length deps list, which useMemo can't express; memoise by shallow key compare.
  const keys: readonly unknown[] = deps ? [theme, ...deps] : [theme, factory];

  if (!cache.current || !sameKeys(cache.current.keys, keys)) {
    cache.current = { keys, styles: StyleSheet.create(factory(theme)) as T };
  }
  return cache.current.styles;
}
