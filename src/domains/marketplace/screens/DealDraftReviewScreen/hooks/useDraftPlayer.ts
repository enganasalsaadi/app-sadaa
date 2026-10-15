import { useCallback, useEffect, useRef, useState } from 'react';
import type { OnLoadData, OnProgressData, VideoRef } from 'react-native-video';
import type { OnLoadEvent } from '@/shared/ui';

/** Height over width, or null while the file hasn't told us yet. */
const aspectOf = (width: number, height: number) => (width > 0 && height > 0 ? height / width : null);

/**
 * Playback of the draft video under review: play / pause, where it is, how long it is, its shape
 * (so the stage fits it), and a seek that also moves the playhead at once (pins and the scrubber
 * jump there). Starts paused and resets whenever another file is shown.
 */
export const useDraftPlayer = (fileKey: string | null) => {
  const ref = useRef<VideoRef>(null);
  const [paused, setPaused] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [aspect, setAspect] = useState<number | null>(null);

  useEffect(() => {
    setPaused(true);
    setTime(0);
    setDuration(0);
    setAspect(null);
  }, [fileKey]);

  const toggle = useCallback(() => setPaused(prev => !prev), []);
  const pause = useCallback(() => setPaused(true), []);
  const seek = useCallback((seconds: number) => {
    ref.current?.seek(seconds);
    setTime(seconds);
  }, []);
  const onLoad = useCallback((event: OnLoadData) => {
    setDuration(event.duration);
    const { width, height, orientation } = event.naturalSize;
    // Android can report a rotated phone video in its stored (landscape) frame.
    const turned = orientation === 'portrait' && width > height;
    setAspect(turned ? aspectOf(height, width) : aspectOf(width, height));
  }, []);
  const onImageLoad = useCallback(
    (event: OnLoadEvent) => setAspect(aspectOf(event.nativeEvent.width, event.nativeEvent.height)),
    [],
  );
  const onProgress = useCallback((event: OnProgressData) => setTime(event.currentTime), []);
  const onEnd = useCallback(() => {
    setPaused(true);
    ref.current?.seek(0);
    setTime(0);
  }, []);

  return { ref, paused, time, duration, aspect, toggle, pause, seek, onLoad, onImageLoad, onProgress, onEnd };
};

export type DraftPlayer = ReturnType<typeof useDraftPlayer>;
