import React, { memo, useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import Video from 'react-native-video';
import { Box } from '../primitives/Box';
import { ViewerFallback } from './ViewerFallback';
import type { ViewerVideo as ViewerVideoModel } from './useViewerVideo';

export interface ViewerVideoProps {
  id: string;
  uri: string | null;
  player: ViewerVideoModel;
  onBroken: (id: string) => Promise<boolean>;
}

const PROGRESS_MS = 250;

/** The active video, fitted whole. A failed load refreshes the signed link once, then offers retry. */
const ViewerVideoComponent: React.FC<ViewerVideoProps> = ({ id, uri, player, onBroken }) => {
  const [failed, setFailed] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const onError = useCallback(() => {
    if (refreshed) {
      setFailed(true);
      return;
    }
    setRefreshed(true);
    onBroken(id)
      .then(ok => {
        if (!ok) setFailed(true);
      })
      .catch(() => setFailed(true));
  }, [id, onBroken, refreshed]);

  const retry = useCallback(() => {
    setFailed(false);
    setAttempt(value => value + 1);
  }, []);

  if (!uri) return <ViewerFallback state="gone" />;
  if (failed) return <ViewerFallback state="failed" onRetry={retry} />;

  return (
    <Box flex={1}>
      <Video
        key={`${uri}-${attempt}`}
        ref={player.ref}
        source={{ uri }}
        paused={player.state.paused}
        muted={player.state.muted}
        rate={player.state.rate}
        resizeMode="contain"
        progressUpdateInterval={PROGRESS_MS}
        onLoad={player.onLoad}
        onProgress={player.onProgress}
        onEnd={player.onEnd}
        onError={onError}
        style={StyleSheet.absoluteFill}
      />
    </Box>
  );
};

export const ViewerVideo = memo(ViewerVideoComponent);
