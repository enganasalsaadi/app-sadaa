import type { RefreshUrl, RemoteFile } from '@/core/download';

/** A file the viewer can show: photo, video or document (PDFs read in-app). */
export interface ViewerFile extends RemoteFile {
  /** Where it belongs, under the name in the top bar («Brief», «Drafts · round 2»). */
  caption?: string | null;
}

export interface FileViewerProps {
  files: readonly ViewerFile[];
  visible: boolean;
  initialIndex?: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  /** Fresh signed link for an expired one (the owner refetches); without it an expired file shows its error. */
  refreshUrl?: RefreshUrl;
  /** `false` hides save / share (a file the user may only look at). Default `true`. */
  saveable?: boolean;
}

/** What the active PDF reports up to the overlay (page counter, page rail, zoom). */
export interface PdfState {
  page: number;
  pages: number;
  scale: number;
}

export interface VideoState {
  paused: boolean;
  muted: boolean;
  rate: number;
  /** Seconds. */
  time: number;
  duration: number;
}
