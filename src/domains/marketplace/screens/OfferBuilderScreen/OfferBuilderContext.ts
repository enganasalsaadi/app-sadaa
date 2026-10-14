import { createContext, useContext } from 'react';
import type { OfferBuilderModel } from './hooks/useOfferBuilderScreen';

/** One builder state for every part of the screen (header, steps, dock, sheets). */
export const OfferBuilderContext = createContext<OfferBuilderModel | null>(null);

export const useOfferBuilder = (): OfferBuilderModel => {
  const model = useContext(OfferBuilderContext);
  if (!model) throw new Error('useOfferBuilder outside OfferBuilderScreen');
  return model;
};
