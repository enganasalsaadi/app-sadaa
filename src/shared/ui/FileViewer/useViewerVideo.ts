import { useCallback, useEffect, useRef, useState } from 'react';
import type { OnLoadData, OnProgressData, VideoRef } from 'react-native-video';
import type { VideoState } from './types';
import type { Size } from './viewerGeometry';

/** Playback speeds the speed button cycles through. */
export const VIDEO_RATES = [1, 1.5, 2] as const;

const INITIAL: VideoState = { paused: true, muted: false, rate: 1, time: 0, duration: 0 };

export interface ViewerVideo {
  ref: React.RefObject<VideoRef | null>;
  state: VideoState;
  togglePlay(): void;
  toggleMute(): void;
  cycleRate(): void;
  seek(seconds: number): void;
  onLoad(data: OnLoadData): void;
  onProgress(data: OnProgressData): void;
  onEnd(): void;
  /** The video's own shape once loaded (pan limits while zoomed). */
  natural: Size | null;
}

/** The active video's playback. A new file (`fileId`) starts paused at 0; mute and speed carry over. */
export const useViewerVideo = (fileId: string | null): ViewerVideo => {
  const ref = useRef<VideoRef | null>(null);
  const [state, setState] = useState<VideoState>(INITIAL);
  const [natural, setNatural] = useState<Size | null>(null);

  useEffect(() => {
    setState(current => ({ ...INITIAL, muted: current.muted, rate: current.rate }));
    setNatural(null);
  }, [fileId]);

  const togglePlay = useCallback(() => {
    setState(current => {
      // Replaying from the end starts over.
      if (current.paused && current.duration > 0 && current.time >= current.duration - 0.25) {
        ref.current?.seek(0);
        return { ...current, paused: false, time: 0 };
      }
      return { ...current, paused: !current.paused };
    });
  }, []);

  const toggleMute = useCallback(() => setState(current => ({ ...current, muted: !current.muted })), []);

  const cycleRate = useCallback(
    () =>
      setState(current => {
        const at = VIDEO_RATES.findIndex(rate => rate === current.rate);
        return { ...current, rate: VIDEO_RATES[(at + 1) % VIDEO_RATES.length] ?? 1 };
      }),
    [],
  );

  const seek = useCallback((seconds: number) => {
    ref.current?.seek(seconds);
    setState(current => ({ ...current, time: seconds }));
  }, []);

  const onLoad = useCallback((data: OnLoadData) => {
    setState(current => ({ ...current, duration: data.duration }));
    const { width, height } = data.naturalSize;
    if (width > 0 && height > 0) setNatural({ width, height });
  }, []);

  const onProgress = useCallback(
    (data: OnProgressData) => setState(current => ({ ...current, time: data.currentTime })),
    [],
  );

  const onEnd = useCallback(
    () => setState(current => ({ ...current, paused: true, time: current.duration })),
    [],
  );

  return { ref, state, togglePlay, toggleMute, cycleRate, seek, onLoad, onProgress, onEnd, natural };
};
