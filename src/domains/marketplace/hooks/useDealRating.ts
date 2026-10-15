import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { applyServerFieldErrors, normalizeApiError } from '@/core/api';
import { toastService } from '@/core/toast';
import {
  useRateDealMutation,
  useSkipDealRatingMutation,
} from '../api/dealRatingApi';
import { DEAL_RATING_ADVANCE_MS } from '../constants/dealRating';
import {
  createDealRatingSchema,
  type DealRatingFormValues,
} from '../schemas/dealRatingSchema';
import type { DealRatingCriterion, DealRole } from '../types';
import type { DealRating } from '../types/deal';
import { isDealConflictError, reportDealFailure } from '../utils/dealAction';
import {
  dealRatingView,
  firstMissingCriterion,
  ratingAverage,
  ratingCriteriaOf,
  toRatingBody,
  type DealRatingScores,
} from '../utils/dealRating';

/** One question at a time, the summary with the note, the skip warning, then the seal. */
export type DealRatingPhase = 'question' | 'summary' | 'skip' | 'sealed';

/** What the seal shows: the average just sent and whether the other side was already in. */
export interface DealRatingSeal {
  overall: number | null;
  theirsAnswered: boolean;
}

const COMMENT_FIELDS = { comment: 'comment' } as const;
const DEFAULT_VALUES: DealRatingFormValues = { comment: '' };

/**
 * The deal's mutual rating from the viewer's side (handoff M10) and its sheet: a score per
 * question (a tap moves on by itself after a beat), the summary with an optional note, sealing
 * or skipping (final, so it asks first). Both answer only the viewer's own rating, so the deal is
 * read again; a closed window or a second answer (`deal_rating_*`) toasts the server's words and
 * closes. The server keeps the viewer's own scores blind too until the reveal: the sealed
 * envelope shows the average only for a rating sent in this visit.
 */
export const useDealRating = (
  role: DealRole,
  id: string,
  rating: DealRating | null,
) => {
  const { t } = useTranslation();
  const ref = useMemo(() => ({ role, id }), [id, role]);
  const view = useMemo(() => dealRatingView(rating, role), [rating, role]);
  const criteria = ratingCriteriaOf(role);

  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<DealRatingPhase>('question');
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<DealRatingScores>({});
  const [seal, setSeal] = useState<DealRatingSeal | null>(null);
  const [mineOpen, setMineOpen] = useState(false);
  const toggleMine = useCallback(() => setMineOpen(open => !open), []);
  const skipFrom = useRef<DealRatingPhase>('question');
  const advance = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [rate, rateState] = useRateDealMutation({
    fixedCacheKey: `deal-rating-${id}`,
  });
  const [skip, skipState] = useSkipDealRatingMutation();

  const schema = useMemo(() => createDealRatingSchema(t), [t]);
  const { control, handleSubmit, reset, setError } =
    useForm<DealRatingFormValues>({
      mode: 'onTouched',
      resolver: yupResolver(schema),
      defaultValues: DEFAULT_VALUES,
    });

  const cancelAdvance = useCallback(() => {
    if (advance.current) clearTimeout(advance.current);
    advance.current = null;
  }, []);
  useEffect(() => cancelAdvance, [cancelAdvance]);

  const open = useCallback(() => {
    cancelAdvance();
    setScores({});
    setStep(0);
    setPhase('question');
    setSeal(null);
    reset(DEFAULT_VALUES);
    setVisible(true);
  }, [cancelAdvance, reset]);

  const close = useCallback(() => {
    cancelAdvance();
    setVisible(false);
  }, [cancelAdvance]);

  /** The picked score stays lifted a beat, then the first unanswered question (or the summary) rises. */
  const pick = useCallback(
    (criterion: DealRatingCriterion, score: number) => {
      const next = { ...scores, [criterion]: score };
      setScores(next);
      cancelAdvance();
      advance.current = setTimeout(() => {
        advance.current = null;
        const missing = firstMissingCriterion(next, criteria);
        if (missing === -1) setPhase('summary');
        else setStep(missing);
      }, DEAL_RATING_ADVANCE_MS);
    },
    [cancelAdvance, criteria, scores],
  );

  const back = useCallback(() => {
    cancelAdvance();
    if (phase === 'summary') {
      setStep(criteria.length - 1);
      setPhase('question');
      return;
    }
    setStep(current => Math.max(0, current - 1));
  }, [cancelAdvance, criteria.length, phase]);

  const edit = useCallback(
    (index: number) => {
      cancelAdvance();
      setStep(index);
      setPhase('question');
    },
    [cancelAdvance],
  );

  const askSkip = useCallback(() => {
    cancelAdvance();
    skipFrom.current = phase === 'skip' ? 'question' : phase;
    setPhase('skip');
  }, [cancelAdvance, phase]);

  const cancelSkip = useCallback(() => setPhase(skipFrom.current), []);

  const theirsAnswered = view?.theirs.answered ?? false;

  const confirmSkip = useCallback(async () => {
    if (skipState.isLoading) return;
    try {
      await skip(ref).unwrap();
      setVisible(false);
      toastService.success(t('marketplace.deals.rating.toast.skipped'));
    } catch (err) {
      const error = normalizeApiError(err);
      if (isDealConflictError(error)) {
        toastService.error(error.message);
        setVisible(false);
        return;
      }
      reportDealFailure(error);
    }
  }, [ref, skip, skipState.isLoading, t]);

  const submit = useCallback(() => {
    handleSubmit(async ({ comment }) => {
      if (rateState.isLoading) return;
      const missing = firstMissingCriterion(scores, criteria);
      if (missing !== -1) {
        edit(missing);
        return;
      }
      try {
        const entry = await rate({
          ref,
          body: toRatingBody(scores, criteria, comment),
        }).unwrap();
        setSeal({
          overall: entry.overall ?? ratingAverage(scores, criteria),
          theirsAnswered,
        });
        setPhase('sealed');
      } catch (err) {
        const error = normalizeApiError(err);
        if (isDealConflictError(error)) {
          toastService.error(error.message);
          setVisible(false);
          return;
        }
        if (!applyServerFieldErrors(err, COMMENT_FIELDS, setError)) {
          reportDealFailure(error);
        }
      }
    })();
  }, [
    criteria,
    edit,
    handleSubmit,
    rate,
    rateState.isLoading,
    ref,
    scores,
    setError,
    theirsAnswered,
  ]);

  return {
    view,
    criteria,
    visible,
    phase,
    step,
    scores,
    seal,
    /** The average of the rating sent in this visit, for the sealed envelope; `null` otherwise. */
    sentOverall: rateState.data?.overall ?? null,
    /** After the reveal: the viewer's own answer row, folded until tapped. */
    mineOpen,
    toggleMine,
    control,
    isSubmitting: rateState.isLoading,
    isSkipping: skipState.isLoading,
    open,
    close,
    pick,
    back,
    edit,
    askSkip,
    cancelSkip,
    confirmSkip,
    submit,
  };
};

export type DealRatingModel = ReturnType<typeof useDealRating>;
