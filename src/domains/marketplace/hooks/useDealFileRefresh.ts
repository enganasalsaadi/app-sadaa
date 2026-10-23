import { useCallback } from 'react';
import type { RefreshUrl } from '@/core/download';
import { useAppDispatch } from '@/core/store';
import { dealFilesApi } from '../api/dealFilesApi';
import type { DealRole } from '../types/deal';
import { buildDealVault, vaultUrlOf } from '../utils/dealVault';

const NO_NAME = () => '';

/**
 * Fresh signed links for any file on a deal (brief, rounds, proofs, evidence, courier photos): the
 * viewer and the download queue call it once when a link expired. `null` = the file is gone.
 */
export const useDealFileRefresh = (role: DealRole, dealId: string): RefreshUrl => {
  const dispatch = useAppDispatch();
  return useCallback(
    async (fileId: string) => {
      const source = await dispatch(
        dealFilesApi.endpoints.getDealFiles.initiate({ role, id: dealId }, { forceRefetch: true, subscribe: false }),
      ).unwrap();
      return vaultUrlOf(buildDealVault(source, role, NO_NAME), fileId);
    },
    [dealId, dispatch, role],
  );
};
