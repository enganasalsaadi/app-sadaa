import { useCallback, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

/** Skia needs pixel frames, so the card is sized from the measured stage. */
export const useGlassDemo = () => {
  const [stageWidth, setStageWidth] = useState(0);
  const onStageLayout = useCallback((event: LayoutChangeEvent) => {
    setStageWidth(event.nativeEvent.layout.width);
  }, []);
  return { stageWidth, onStageLayout };
};
