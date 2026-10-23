import { useFileViewer } from '@/shared/ui';
import { MOCK_VIEWER_FILES } from '../mockData';

/** Two viewers over the same mock files: one that saves and shares, one look-only. */
export const useFileViewerDemo = () => {
  const full = useFileViewer(MOCK_VIEWER_FILES);
  const lookOnly = useFileViewer(MOCK_VIEWER_FILES);
  return { full, lookOnly };
};
