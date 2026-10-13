import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/core/toast';
import { getDealItemActions } from '@/domains/marketplace';
import type { DealDraft } from '@/domains/marketplace';

const MOCK_LATENCY_MS = 800;

/** Mocks the review round-trip: the card shows what the "server" returns after the delay. */
export const useDraftReviewDemo = () => {
  const { t } = useTranslation();
  const { success, info } = useToast();
  const [review, setReview] = useState<DealDraft['review']>(null);
  const [submitting, setSubmitting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const settle = useCallback((next: DealDraft['review'], onDone: () => void) => {
    setSubmitting(true);
    timer.current = setTimeout(() => {
      setSubmitting(false);
      setReview(next);
      onDone();
    }, MOCK_LATENCY_MS);
  }, []);

  const changesReview = useCallback(
    (): DealDraft['review'] => ({
      decision: { key: 'revision_requested', label: t('devShowcase.draftReview.changesToast') },
      by: 'brand',
      note: t('devShowcase.draftReview.note'),
      pins: [],
      reviewedAt: Date.now(),
    }),
    [t],
  );

  const onApprove = useCallback(
    () =>
      settle(
        {
          decision: { key: 'approved', label: t('devShowcase.draftReview.approvedToast') },
          by: 'brand',
          note: null,
          pins: [],
          reviewedAt: Date.now(),
        },
        () => success(t('devShowcase.draftReview.approvedToast')),
      ),
    [settle, success, t],
  );
  const onRequestChanges = useCallback(
    () => settle(changesReview(), () => info(t('devShowcase.draftReview.changesToast'))),
    [settle, changesReview, info, t],
  );
  const reset = useCallback(() => setReview(null), []);
  const onOpen = useCallback(() => info(t('devShowcase.draftReview.openToast')), [info, t]);

  // A brand looking at a submitted draft may review it.
  const canReview = getDealItemActions(
    { status: { key: 'draft_submitted', label: '' }, approveAsIsAvailable: false },
    'brand',
  ).includes('reviewDraft');

  return { review, changesReview, submitting, onApprove, onRequestChanges, reset, onOpen, canReview };
};
