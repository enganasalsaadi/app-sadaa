import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { applyServerFieldErrors, baseApi, normalizeApiError } from '@/core/api';
import { useCountdown } from '@/core/hooks';
import { useAppDispatch } from '@/core/store';
import { useToast } from '@/core/toast';
import { formatClock } from '@/domains/auth';
import {
  useGetDomainVerificationQuery,
  useStartDomainVerificationMutation,
} from '../../../api/verificationApi';
import type { VerificationFlow } from '../../../hooks/useVerificationFlow';
import {
  createDomainEmailSchema,
  toStartDomainVerificationRequest,
  type DomainEmailFormValues,
} from '../../../schemas/domainEmailSchema';
import type { DomainVerification } from '../../../types/verification';

export type DomainEmailMode = 'loading' | 'error' | 'form' | 'sent' | 'expired';

/** Used when a 429 carries no `retry_after` (the limit is 3 sends per hour). */
const FALLBACK_RETRY_SECONDS = 60 * 60;

const SERVER_FIELDS = { domain: 'domain', email: 'email' } as const;

const toEpoch = (iso: string | null | undefined): number | null => {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : ms;
};

/** `m:ss`, or `h:mm:ss` once the link lives longer than an hour. */
const formatRemaining = (seconds: number) =>
  seconds < 3600
    ? formatClock(seconds)
    : `${Math.floor(seconds / 3600)}:${formatClock(seconds % 3600).padStart(5, '0')}`;

const formDefaults = (
  verification: DomainVerification | null,
): DomainEmailFormValues => ({
  domain: verification?.domain ?? '',
  email: verification?.email ?? '',
});

/**
 * Domain email (route 3): domain + email on it → confirmation link → the brand opens it in a
 * browser, outside the app. No faster signal than polling: refetch on focus, on "I opened the
 * link", and on the `brand_domain_verified` push (invalidates the same cache).
 */
export const useDomainEmailScreen = (flow: VerificationFlow) => {
  const { t } = useTranslation();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { leave, onVerified, onStarted } = flow;

  const [editing, setEditing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [retryUntil, setRetryUntil] = useState<number | null>(null);

  const query = useGetDomainVerificationQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const verification = query.data ?? null;
  const showForm = editing || !verification;

  // The mount already fetches; later focuses (back from the mail app) refetch.
  const { refetch } = query;
  const focusedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (focusedOnce.current) refetch();
      focusedOnce.current = true;
    }, [refetch]),
  );

  // Verified while open: leave once (settings → picker, wizard → next step).
  const verified = verification?.status === 'verified';
  const verifiedHandled = useRef(false);
  useEffect(() => {
    if (!verified || verifiedHandled.current) return;
    verifiedHandled.current = true;
    onVerified();
  }, [verified, onVerified]);

  // `can_resend` is a snapshot that goes stale as the cooldown ends; the timestamp is what
  // counts down. Any start (resend or a changed email) shares the cooldown and the hourly limit.
  const resendAt = toEpoch(verification?.resendAvailableAt);
  const waitSeconds = useCountdown(
    Math.max(resendAt ?? 0, retryUntil ?? 0) || null,
  );
  const resendClosed =
    verification !== null && !verification.canResend && resendAt === null;

  const expiresAt = toEpoch(verification?.expiresAt);
  const expirySeconds = useCountdown(expiresAt);
  // The clock check keeps the first render after a fetch (countdown not yet started) out of it.
  const isExpired =
    verification?.status === 'expired' ||
    (verification?.status === 'pending' &&
      expiresAt !== null &&
      expirySeconds === 0 &&
      expiresAt <= Date.now());

  const schema = useMemo(() => createDomainEmailSchema(t), [t]);
  const form = useForm<DomainEmailFormValues>({
    resolver: yupResolver(schema),
    mode: 'onTouched',
    defaultValues: formDefaults(verification),
  });
  const { control, handleSubmit, reset, setError, setFocus, getFieldState, trigger, formState } =
    form;

  // The form follows the latest attempt until the user starts typing.
  useEffect(() => {
    if (!editing && !formState.isDirty) reset(formDefaults(verification));
  }, [verification, editing, formState.isDirty, reset]);

  // The email must sit on the domain: re-judge it once the domain changes.
  const onDomainBlur = useCallback(() => {
    if (getFieldState('email').isTouched) trigger('email');
  }, [getFieldState, trigger]);
  const focusEmail = useCallback(() => setFocus('email'), [setFocus]);

  const startEditing = useCallback(() => {
    reset(formDefaults(verification));
    setEditing(true);
  }, [verification, reset]);

  const cancelEditing = useCallback(() => {
    setEditing(false);
    reset(formDefaults(verification));
  }, [verification, reset]);

  // Back from the edit form returns to the sent state, not out of the screen.
  const canCancelEdit = editing && verification !== null;
  useFocusEffect(
    useCallback(() => {
      if (!canCancelEdit) return undefined;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        cancelEditing();
        return true;
      });
      return () => sub.remove();
    }, [canCancelEdit, cancelEditing]),
  );
  const onBack = useCallback(() => {
    if (canCancelEdit) cancelEditing();
    else leave();
  }, [canCancelEdit, cancelEditing, leave]);

  const [startDomainVerification, { isLoading: isStarting }] =
    useStartDomainVerificationMutation();

  const start = useCallback(
    async (values: DomainEmailFormValues) => {
      try {
        await startDomainVerification(
          toStartDomainVerificationRequest(values),
        ).unwrap();
        setEditing(false);
        setRetryUntil(null);
        toast.success(t('account.verification.domain.toastSent'));
        // The link is in the inbox: registration moves on, verification finishes in the browser.
        onStarted();
      } catch (err) {
        const apiError = normalizeApiError(err);
        if (apiError.statusCode === 422) {
          // baseQuery already toasted it; pin the message to its field (a resend opens the form).
          reset(values);
          setEditing(true);
          applyServerFieldErrors(err, SERVER_FIELDS, setError);
          return;
        }
        if (apiError.code === 'kyc_already_verified') {
          toast.info(t('account.verification.errors.alreadyVerified'));
          onVerified();
          return;
        }
        if (apiError.statusCode === 429) {
          // `domain_verification_cooldown` (60 s) and `too_many_requests` (hourly) both send it.
          setRetryUntil(
            Date.now() + (apiError.retryAfter ?? FALLBACK_RETRY_SECONDS) * 1000,
          );
          return;
        }
        // 403/5xx open the global modals; offline shows the snackbar.
        if (
          !apiError.isForbidden &&
          !apiError.isServerError &&
          apiError.statusCode !== null
        ) {
          toast.error(t('errors.generic'));
        }
      }
    },
    [startDomainVerification, reset, setError, toast, t, onStarted, onVerified],
  );

  const onSubmit = useCallback(() => {
    if (waitSeconds > 0 || isStarting) return;
    handleSubmit(start)();
  }, [handleSubmit, waitSeconds, isStarting, start]);

  // Resend = the same body again; it replaces the pending link.
  const onResend = useCallback(() => {
    if (!verification || waitSeconds > 0 || resendClosed || isStarting) return;
    start({ domain: verification.domain, email: verification.email });
  }, [verification, waitSeconds, resendClosed, isStarting, start]);

  const onCheckAgain = useCallback(async () => {
    if (checking) return;
    setChecking(true);
    dispatch(baseApi.util.invalidateTags(['User']));
    try {
      const latest = await refetch().unwrap();
      // Verified → the effect above leaves the screen.
      if (latest?.status === 'pending') {
        toast.info(t('account.verification.domain.sent.stillPending'));
      }
    } catch {
      // baseQuery routes the failure (snackbar, modal or toast).
    } finally {
      setChecking(false);
    }
  }, [checking, dispatch, refetch, toast, t]);

  const mode: DomainEmailMode = query.isLoading
    ? 'loading'
    : query.isError && query.data === undefined
    ? 'error'
    : showForm
    ? 'form'
    : isExpired
    ? 'expired'
    : 'sent';

  const waitClock = formatRemaining(waitSeconds);
  const resendLabel =
    waitSeconds > 0
      ? t('account.verification.domain.sent.resendIn', { time: waitClock })
      : null;

  return {
    mode,
    onBack,
    loadError: query.error,
    retry: refetch,
    isRetrying: query.isFetching,
    form: {
      control,
      onDomainBlur,
      focusEmail,
      onSubmit,
      isSubmitting: isStarting,
      isRateLimited: waitSeconds > 0,
      submitLabel:
        waitSeconds > 0
          ? t('account.kyc.retryIn', { time: waitClock })
          : t('account.verification.domain.form.submit'),
    },
    sent: verification
      ? {
          title: isExpired
            ? t('account.verification.domain.expired.title')
            : t('account.verification.domain.sent.title'),
          body: isExpired
            ? t('account.verification.domain.expired.body')
            : t('account.verification.domain.sent.body', {
                email: verification.email,
              }),
          domain: verification.domain,
          email: verification.email,
          expiryLabel: isExpired
            ? (verification.status === 'expired' && verification.statusLabel) ||
              t('account.verification.status.domain.expired')
            : t('account.verification.domain.sent.expiresIn', {
                time: formatRemaining(expirySeconds),
              }),
          onCheckAgain,
          isChecking: checking,
          onResend,
          isResending: isStarting,
          resendDisabled: waitSeconds > 0 || resendClosed,
          resendLabel:
            resendLabel ?? t('account.verification.domain.sent.resend'),
          newLinkLabel:
            resendLabel ?? t('account.verification.domain.expired.resend'),
          onChange: startEditing,
        }
      : null,
  };
};

export type DomainEmailScreenModel = ReturnType<typeof useDomainEmailScreen>;
export type DomainEmailFormModel = DomainEmailScreenModel['form'];
export type DomainEmailSentModel = NonNullable<DomainEmailScreenModel['sent']>;
