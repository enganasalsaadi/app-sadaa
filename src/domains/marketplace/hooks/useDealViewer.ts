import { useCallback, useMemo } from 'react';
import { useFileViewer } from '@/shared/ui';
import type { DealFile, DealRef } from '../types';
import { isSaveable, toViewerFiles } from '../utils/dealVault';
import { useDealFileRefresh } from './useDealFileRefresh';

/**
 * The file viewer over some of a deal's files (a brief, a round's proofs, evidence): every kind
 * opens (photo, video, PDF, other documents), expired links refresh from the deal.
 */
export const useDealViewer = (files: readonly DealFile[], { role, id }: DealRef) => {
  const viewerFiles = useMemo(() => toViewerFiles(files).filter(isSaveable), [files]);
  const viewer = useFileViewer(viewerFiles);
  const refreshUrl = useDealFileRefresh(role, id);
  const canOpen = useCallback((fileId: string) => viewerFiles.some(file => file.id === fileId), [viewerFiles]);
  return { ...viewer, refreshUrl, canOpen };
};
