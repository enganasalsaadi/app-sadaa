import { useCallback, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import Clipboard from '@react-native-clipboard/clipboard';
import { launchImageLibrary } from 'react-native-image-picker';
import { applyServerFieldErrors, normalizeApiError, type AppApiError } from '@/core/api';
import { toastService } from '@/core/toast';
import { checkUpload, normalizeMime } from '@/core/upload';
import { useReportShipmentIssueMutation } from '../api/dealShippingApi';
import {
  DEAL_COURIER_LABEL,
  DEAL_SHIPPING_LIMITS,
  type DealCourierChoice,
} from '../constants/dealShipping';
import { DEAL_ISSUE_PHOTO_POLICY } from '../constants/dealUploads';
import {
  createDealIssueSchema,
  createDealShipSchema,
  issueNeedsPhotos,
  type DealIssueFormValues,
  type DealShipFormValues,
} from '../schemas/dealShippingSchema';
import type { Deal, DealRole } from '../types';
import { isDealConflictError, reportDealFailure, type DealActionOutcome } from '../utils/dealAction';
import {
  addressText,
  dealShippingDock,
  dealShippingView,
  safeTrackingUrl,
  shipFormValues,
  toShipmentBody,
  transitDays,
} from '../utils/dealShipping';
import { useClock } from './useClock';
import { useDealAction } from './useDealAction';
import { useDealAddressForm } from './useDealAddressForm';

const MINUTE_MS = 60_000;

/** The shipping sheets: the waybill (new, edit, re-ship), the creator's report, the brand's cancel, the address. */
export type DealShippingSheet = 'ship' | 'edit' | 'reship' | 'issue' | 'cancel' | 'address';

const SHIP_FIELDS = {
  courier: 'courierName',
  tracking_no: 'trackingNo',
  tracking_url: 'trackingUrl',
} as const;
const ISSUE_FIELDS = { reason: 'reason', note: 'note' } as const;
const EMPTY_ISSUE: DealIssueFormValues = { reason: null, note: '' };

/** A picked issue photo, kept on the device until the report goes (multipart, original quality). */
export interface DealIssuePhoto {
  key: string;
  uri: string;
  name: string;
  mime: string;
}

/**
 * Shipping on the deal page (handoff M5, B5.1), both roles. Brand: enter the waybill, edit it
 * until receipt or a report, re-ship or cancel with a refund after a report. Creator: confirm
 * receipt, report a problem (photos 1–5 for damaged / incomplete / wrong item; «delayed» only
 * from the server's date), the free cancel once the server opens it, and the delivery address
 * until the product ships. Receipt and both cancels are press-and-hold; both cancels carry an
 * idempotency key (rule 06). The tracking link opens only when it is a well-formed https link.
 */
export const useDealShipping = (role: DealRole, id: string, deal: Deal | null) => {
  const { t } = useTranslation();
  const ref = useMemo(() => ({ role, id }), [id, role]);
  const now = useClock(MINUTE_MS);
  const view = useMemo(() => (deal ? dealShippingView(deal, role, now) : null), [deal, now, role]);
  const dock = dealShippingDock(view, role);
  const party = (role === 'brand' ? deal?.creator.name : deal?.brand.name) ?? '';

  const ship = useDealAction(ref);
  const receive = useDealAction(ref);
  const cancel = useDealAction(ref, { idempotent: true });
  const saveAddress = useDealAction(ref);
  const [sendIssue, issueState] = useReportShipmentIssueMutation();

  const [sheet, setSheet] = useState<DealShippingSheet | null>(null);
  const close = useCallback(() => setSheet(null), []);

  const courierLabels = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(DEAL_COURIER_LABEL).map(([key, label]) => [key, t(label)]),
      ) as Record<DealCourierChoice, string>,
    [t],
  );

  // — Forms ——————————————————————————————————————————————————————————
  const shipSchema = useMemo(() => createDealShipSchema(t), [t]);
  const shipForm = useForm<DealShipFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(shipSchema),
    defaultValues: shipFormValues(null, courierLabels),
  });
  const issueSchema = useMemo(() => createDealIssueSchema(t), [t]);
  const issueForm = useForm<DealIssueFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(issueSchema),
    defaultValues: EMPTY_ISSUE,
  });
  const address = useDealAddressForm();
  const [photos, setPhotos] = useState<DealIssuePhoto[]>([]);
  const [photosError, setPhotosError] = useState<string | null>(null);

  const current = view?.current ?? null;
  const resetShip = shipForm.reset;
  const resetIssue = issueForm.reset;
  const resetCancel = cancel.resetIntent;
  const startAddress = address.start;
  const viewAddress = view?.address ?? null;
  const open = useCallback(
    (next: DealShippingSheet) => {
      switch (next) {
        case 'ship':
        case 'reship':
          resetShip(shipFormValues(null, courierLabels));
          break;
        case 'edit':
          resetShip(shipFormValues(current, courierLabels));
          break;
        case 'issue':
          resetIssue(EMPTY_ISSUE);
          setPhotos([]);
          setPhotosError(null);
          break;
        case 'cancel':
          resetCancel();
          break;
        case 'address':
          startAddress(viewAddress);
          break;
        default: {
          const _exhaustive: never = next;
          return _exhaustive;
        }
      }
      setSheet(next);
    },
    [courierLabels, current, resetCancel, resetIssue, resetShip, startAddress, viewAddress],
  );
  const opens = useMemo(
    () =>
      ({
        ship: () => open('ship'),
        edit: () => open('edit'),
        reship: () => open('reship'),
        issue: () => open('issue'),
        cancel: () => open('cancel'),
        address: () => open('address'),
      }) satisfies Record<DealShippingSheet, () => void>,
    [open],
  );

  /** Success → close + toast; conflict → close (toasted, refetched); else the sheet stays. */
  const settle = useCallback(
    (outcome: DealActionOutcome, success: string, onFields?: (error: AppApiError) => boolean) => {
      if (outcome.ok) {
        setSheet(null);
        toastService.success(success);
        return true;
      }
      if (outcome.conflict) {
        setSheet(null);
        return false;
      }
      if (!onFields?.(outcome.error)) reportDealFailure(outcome.error);
      return false;
    },
    [],
  );

  // — Brand ——————————————————————————————————————————————————————————
  const runShip = ship.run;
  const shipSubmit = shipForm.handleSubmit;
  const setShipError = shipForm.setError;
  const onShip = useMemo(
    () =>
      shipSubmit(async values => {
        const editing = sheet === 'edit';
        const outcome = await runShip('shipment', {
          method: editing ? 'PUT' : 'POST',
          body: toShipmentBody(values, courierLabels, editing),
        });
        const success =
          sheet === 'edit'
            ? t('marketplace.deals.shipping.toast.edited')
            : sheet === 'reship'
              ? t('marketplace.deals.shipping.toast.reshipped', { name: party })
              : t('marketplace.deals.shipping.toast.shipped', { name: party });
        settle(outcome, success, error => applyServerFieldErrors(error, SHIP_FIELDS, setShipError));
      }),
    [courierLabels, party, runShip, setShipError, settle, sheet, shipSubmit, t],
  );

  const runCancel = cancel.run;
  const onCancel = useCallback(
    async (): Promise<boolean> =>
      settle(
        await runCancel('shipment/cancel'),
        role === 'brand'
          ? t('marketplace.deals.shipping.toast.cancelled')
          : t('marketplace.deals.shipping.toast.freeCancelled'),
      ),
    [role, runCancel, settle, t],
  );

  // — Creator ————————————————————————————————————————————————————————
  const runReceive = receive.run;
  const onReceive = useCallback(
    async (): Promise<boolean> =>
      settle(await runReceive('shipment/receive'), t('marketplace.deals.shipping.toast.received')),
    [runReceive, settle, t],
  );

  const remaining = DEAL_SHIPPING_LIMITS.issuePhotos - photos.length;
  const pickPhotos = useCallback(async () => {
    if (remaining <= 0) {
      toastService.info(
        t('marketplace.deals.shipping.issue.photosLimit', { max: DEAL_SHIPPING_LIMITS.issuePhotos }),
      );
      return;
    }
    try {
      // Original quality: these photos become dispute evidence (rule 07).
      const response = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        assetRepresentationMode: 'current',
        selectionLimit: remaining,
      });
      if (response.didCancel) return;
      if (response.errorCode) throw new Error(response.errorCode);
      let rejected = 0;
      const picked = (response.assets ?? []).flatMap<DealIssuePhoto>(asset => {
        const name = asset.fileName ?? asset.uri ?? '';
        const check = checkUpload(
          DEAL_ISSUE_PHOTO_POLICY,
          normalizeMime(asset.type, name),
          asset.fileSize ?? 0,
        );
        if (!asset.uri || !check.ok) {
          rejected += 1;
          return [];
        }
        return [{ key: `${asset.uri}-${Date.now()}`, uri: asset.uri, name, mime: check.mime }];
      });
      if (rejected > 0) toastService.error(t('marketplace.deals.shipping.issue.photoRejected'));
      if (picked.length === 0) return;
      setPhotosError(null);
      setPhotos(list => [...list, ...picked].slice(0, DEAL_SHIPPING_LIMITS.issuePhotos));
    } catch {
      toastService.error(t('marketplace.deals.shipping.issue.pickFailed'));
    }
  }, [remaining, t]);
  const removePhoto = useCallback(
    (key: string) => setPhotos(list => list.filter(photo => photo.key !== key)),
    [],
  );

  const issueSubmit = issueForm.handleSubmit;
  const setIssueError = issueForm.setError;
  const photosRequired = t('marketplace.deals.shipping.issue.photosRequired');
  const onIssue = useMemo(
    () =>
      issueSubmit(
        async ({ reason, note }) => {
          if (reason === null || issueState.isLoading) return;
          if (issueNeedsPhotos(reason) && photos.length === 0) {
            setPhotosError(photosRequired);
            return;
          }
          const form = new FormData();
          form.append('reason', reason);
          if (note.trim()) form.append('note', note.trim());
          photos.forEach(photo => {
            const file: FormDataValue = { uri: photo.uri, name: photo.name, type: photo.mime };
            form.append('photos[]', file);
          });
          try {
            await sendIssue({ id, form }).unwrap();
            setSheet(null);
            toastService.success(t('marketplace.deals.shipping.toast.reported', { name: party }));
          } catch (err) {
            const error = normalizeApiError(err);
            if (isDealConflictError(error)) {
              setSheet(null);
              toastService.error(error.message);
              return;
            }
            if (applyServerFieldErrors(error, ISSUE_FIELDS, setIssueError)) return;
            if (error.statusCode === 422) {
              // `photos` / `photos.N` and `deal_issue_too_early`: the toast already said why.
              if (issueNeedsPhotos(reason)) setPhotosError(error.message);
              return;
            }
            reportDealFailure(error);
          }
        },
        ({ reason }) => {
          if (reason) return;
          const picked = issueForm.getValues('reason');
          if (issueNeedsPhotos(picked) && photos.length === 0) setPhotosError(photosRequired);
        },
      ),
    [id, issueForm, issueState.isLoading, issueSubmit, party, photos, photosRequired, sendIssue, setIssueError, t],
  );

  const runSaveAddress = saveAddress.run;
  const addressSubmit = address.handleSubmit;
  const applyAddressErrors = address.applyErrors;
  const toAddress = address.toBody;
  const onSaveAddress = useMemo(
    () =>
      addressSubmit(async () => {
        const outcome = await runSaveAddress('shipping-address', { method: 'PUT', body: toAddress() });
        settle(outcome, t('marketplace.deals.shipping.toast.addressSaved'), error =>
          applyAddressErrors(error),
        );
      }),
    [addressSubmit, applyAddressErrors, runSaveAddress, settle, t, toAddress],
  );

  // — Both ———————————————————————————————————————————————————————————
  const trackingNo = current?.trackingNo ?? null;
  const onCopyTracking = useCallback(() => {
    if (!trackingNo) return;
    Clipboard.setString(trackingNo);
    toastService.success(t('marketplace.deals.shipping.waybill.copied'));
  }, [t, trackingNo]);

  const trackingUrl = safeTrackingUrl(current?.trackingUrl ?? null);
  const onTrack = useMemo(
    () =>
      trackingUrl
        ? () => {
            Linking.openURL(trackingUrl).catch(() =>
              toastService.error(t('marketplace.deals.shipping.waybill.trackFailed')),
            );
          }
        : null,
    [t, trackingUrl],
  );

  // «Delayed» stays locked until the server's report day for the shipment on the way.
  const delayedIn = current ? transitDays(current, now).daysToReport : 0;

  const onCopyAddress = useCallback(() => {
    if (!viewAddress) return;
    Clipboard.setString(addressText(viewAddress));
    toastService.success(t('marketplace.deals.shipping.address.copied'));
  }, [t, viewAddress]);

  return {
    view,
    dock,
    party,
    now,
    sheet,
    opens,
    close,
    shipControl: shipForm.control,
    shipFocus: shipForm.setFocus,
    courierLabels,
    onShip,
    shipping: ship.isRunning,
    onReceive,
    onCancel,
    issueControl: issueForm.control,
    delayedIn,
    photos,
    photosError,
    pickPhotos,
    removePhoto,
    onIssue,
    reporting: issueState.isLoading,
    address,
    onSaveAddress,
    savingAddress: saveAddress.isRunning,
    onCopyTracking,
    onTrack,
    onCopyAddress,
  };
};

export type DealShippingModel = ReturnType<typeof useDealShipping>;
