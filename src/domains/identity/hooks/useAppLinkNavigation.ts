import { useEffect } from 'react';
import { appLinkManager } from '@/core/linking';
import { push, type PublicStackParamList } from '@/core/navigation';

/**
 * Routes an opened `/c/{slug}` link to the public profile (contract §17.8).
 * Enable it only while the root stack registers `MediaKitPublic`; a launch link
 * waits in the manager until then. Pushed, so every link is a new open (new view).
 */
export const useAppLinkNavigation = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return undefined;
    let frame: number | undefined;
    const unsubscribe = appLinkManager.registerOpenHandler(target => {
      const params: PublicStackParamList['MediaKitPublic'] = {
        slug: target.slug,
        source: 'link',
      };
      // Next frame: on a launch link the branch mounts in the same commit.
      frame = requestAnimationFrame(() => push('MediaKitPublic', params));
    });
    return () => {
      unsubscribe();
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [enabled]);
};
