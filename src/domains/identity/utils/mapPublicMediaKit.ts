import type { WithMeta } from '@/core/api';
import type { PublicMediaKit, PublicMediaKitResult } from '../types/mediaKit';

/** An old slug answers 200 with `meta.canonical_slug` (§17.4); same slug → null. */
export const mapPublicMediaKit = (
  response: WithMeta<PublicMediaKit>,
  requestedSlug: string,
): PublicMediaKitResult => {
  const canonical = response.meta.canonical_slug;
  return {
    kit: response.data,
    canonicalSlug: canonical && canonical !== requestedSlug ? canonical : null,
  };
};
