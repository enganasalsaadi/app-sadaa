import React, { memo, useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import type { OnLoadEvent } from 'react-native-fast-image';
import { Box } from '../primitives/Box';
import { Image } from '../primitives/Image';
import { ViewerFallback } from './ViewerFallback';
import type { Size } from './viewerGeometry';

export interface ViewerImageProps {
  id: string;
  uri: string | null;
  stage: Size;
  /** Reports the photo's own shape (pan limits while zoomed). */
  onNatural: (id: string, size: Size) => void;
  /** The load failed: ask for a fresh link once; `false` = no luck. */
  onBroken: (id: string) => Promise<boolean>;
}

type Phase = 'loading' | 'ready' | 'failed';

/** A photo fitted whole to the stage. A failed load refreshes the signed link once, then offers retry. */
const ViewerImageComponent: React.FC<ViewerImageProps> = ({ id, uri, stage, onNatural, onBroken }) => {
  const [phase, setPhase] = useState<Phase>('loading');
  const [attempt, setAttempt] = useState(0);
  const [refreshed, setRefreshed] = useState(false);

  const onLoad = useCallback(
    (event: OnLoadEvent) => {
      setPhase('ready');
      onNatural(id, { width: event.nativeEvent.width, height: event.nativeEvent.height });
    },
    [id, onNatural],
  );

  const onError = useCallback(() => {
    if (refreshed) {
      setPhase('failed');
      return;
    }
    setRefreshed(true);
    onBroken(id)
      .then(ok => {
        if (!ok) setPhase('failed');
      })
      .catch(() => setPhase('failed'));
  }, [id, onBroken, refreshed]);

  const retry = useCallback(() => {
    setPhase('loading');
    setAttempt(value => value + 1);
  }, []);

  if (!uri) return <ViewerFallback state="gone" />;

  return (
    <Box flex={1}>
      {phase === 'failed' ? (
        <ViewerFallback state="failed" onRetry={retry} />
      ) : (
        <Image
          key={`${uri}-${attempt}`}
          uri={uri}
          width={stage.width}
          height={stage.height}
          resizeMode="contain"
          showSkeleton={false}
          priority="high"
          onLoad={onLoad}
          onError={onError}
        />
      )}
      {phase === 'loading' ? (
        <Box style={StyleSheet.absoluteFill} pointerEvents="none">
          <ViewerFallback state="loading" />
        </Box>
      ) : null}
    </Box>
  );
};

export const ViewerImage = memo(ViewerImageComponent);
