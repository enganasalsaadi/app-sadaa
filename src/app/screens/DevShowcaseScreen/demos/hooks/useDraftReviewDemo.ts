import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/core/toast';
import { getDealActions } from '@/domains/marketplace';
import type { DraftStatus } from '@/domains/marketplace';

const MOCK_LATENCY_MS = 800;

/** Mocks the review round-trip: the card shows what the "server" returns after the delay. */
export const useDraftReviewDemo = () => {
  const { t } = useTranslation();
  const { success, info } = useToast();
  const [status, setStatus] = useState<DraftStatus>('pending_review');
  const [submitting, setSubmitting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const settle = useCallback((next: DraftStatus, onDone: () => void) => {
    setSubmitting(true);
    timer.current = setTimeout(() => {
      setSubmitting(false);
      setStatus(next);
      onDone();
    }, MOCK_LATENCY_MS);
  }, []);

  const onApprove = useCallback(
    () => settle('approved', () => success(t('devShowcase.draftReview.approvedToast'))),
    [settle, success, t],
  );
  const onRequestChanges = useCallback(
    () => settle('changes_requested', () => info(t('devShowcase.draftReview.changesToast'))),
    [settle, info, t],
  );
  const reset = useCallback(() => setStatus('pending_review'), []);
  const onOpen = useCallback(() => info(t('devShowcase.draftReview.openToast')), [info, t]);

  // A brand reviewing an `under_review` deal is allowed both actions.
  const actions = getDealActions('under_review', 'brand');
  const canReview = actions.includes('approveDraft') && actions.includes('requestChanges');

  return { status, submitting, onApprove, onRequestChanges, reset, onOpen, canReview };
};
