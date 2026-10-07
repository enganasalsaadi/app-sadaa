import type { MediaKitShareError } from '../../utils/mediaKitShare';

export type MediaKitCardStatus = 'loading' | 'error' | 'ready';

/** Share / copy triggers and their outcome, as `useMediaKitCard` wires them. */
export interface MediaKitCardShare {
  /** The share URL is known; false while the kit loads. */
  isReady: boolean;
  isSharing: boolean;
  error: MediaKitShareError | null;
  /** Only a network / 5xx failure can be replayed with the same idempotency key. */
  canRetry: boolean;
  isMakingPublic: boolean;
  onShare: () => void;
  onCopy: () => void;
  onRetry: () => void;
  onDismissError: () => void;
  onMakePublic: () => void;
}
