import { useCallback, useRef } from 'react';
import type { RefreshUrl } from '@/core/download';
import { useAppDispatch } from '@/core/store';
import { DEAL_FILES_FRESH_SECONDS, dealFilesApi } from '../api/dealFilesApi';
import type { DealRole } from '../types/deal';
import {
  buildDealVault,
  vaultUrlOf,
  type DealVaultSource,
} from '../utils/dealVault';

const NO_NAME = () => '';
const FRESH_MS = DEAL_FILES_FRESH_SECONDS * 1000;

/**
 * Fresh signed links for any file on a deal (brief, rounds, proofs, evidence, courier photos): the
 * viewer and the download queue call it once when a link expired. `null` = the file is gone.
 * Expired links come in bursts («download all»), so one re-read serves every call inside its window.
 */
export const useDealFileRefresh = (
  role: DealRole,
  dealId: string,
): RefreshUrl => {
  const dispatch = useAppDispatch();
  const latest = useRef<{
    key: string;
    at: number;
    read: Promise<DealVaultSource>;
  } | null>(null);

  return useCallback(
    async (fileId: string) => {
      const key = `${role}:${dealId}`;
      const now = Date.now();
      let current = latest.current;
      if (!current || current.key !== key || now - current.at >= FRESH_MS) {
        const fresh = {
          key,
          at: now,
          read: dispatch(
            dealFilesApi.endpoints.getDealFiles.initiate(
              { role, id: dealId },
              { forceRefetch: true, subscribe: false },
            ),
          ).unwrap(),
        };
        // A failed read must not answer the next file's call.
        fresh.read.catch(() => {
          if (latest.current === fresh) latest.current = null;
        });
        latest.current = fresh;
        current = fresh;
      }
      const source = await current.read;
      return vaultUrlOf(buildDealVault(source, role, NO_NAME), fileId);
    },
    [dealId, dispatch, role],
  );
};
