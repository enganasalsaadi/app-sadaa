import { createContext, useContext } from 'react';

/**
 * True for content rendered inside `HeroSheet`'s surface sheet. `Layout` reads it
 * so sheet screens need no chrome props: the hero owns the top inset and status bar.
 */
export const HeroSheetContext = createContext(false);

export const useInHeroSheet = (): boolean => useContext(HeroSheetContext);
