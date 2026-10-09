import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { formatMoney } from '@/core/i18n';
import { toAmountText } from '@/core/money';
import type { TopUpStackScreenProps } from '@/core/navigation';
import { useToast } from '@/core/toast';
import { useOpenSupport } from '@/domains/auth';
import { useFilePicker, type FilePickError, type FilePickSource } from '@/shared/ui';
import {
  TOP_UP_RECEIPT_MAX_BYTES,
  TOP_UP_RECEIPT_MIME_TYPES,
  TOP_UP_REFERENCE_MAX_LENGTH,
} from '../../../constants/topUp';
import { useTopUpFlow } from '../../../hooks/useTopUpFlow';
import { TOP_UP_STEP_FIELDS, type TopUpFormValues } from '../../../schemas/topUpSchema';

type Navigation = TopUpStackScreenProps<'TopUpTransfer'>['navigation'];

export interface TransferRow {
  key: string;
  label: string;
  value: string;
  /** What the copy button puts on the clipboard; `null` = not copyable. */
  copyValue: string | null;
  hint?: string;
}

export interface TransferAccountView {
  id: string;
  rows: TransferRow[];
}

const PICK_ERROR_KEY = {
  size: 'finance.topUp.transfer.pickErrors.size',
  type: 'finance.topUp.transfer.pickErrors.type',
  failed: 'finance.topUp.transfer.pickErrors.failed',
} as const satisfies Record<FilePickError, string>;

/**
 * Step 3: where to send (Sada's receiving account, every line copyable, the exact
 * amount first, the brand's payer code last), then the transfer number and the receipt (photo or PDF, checked on
 * the device, rule 07). No account to show → the brand asks support for one.
 */
export const useTopUpTransferScreen = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigation = useNavigation<Navigation>();
  const toast = useToast();
  const openSupport = useOpenSupport();
  const flow = useTopUpFlow();
  const { control, setValue, trigger } = useFormContext<TopUpFormValues>();
  const amount = useWatch({ control, name: 'amount' });
  const { field: receiptField, fieldState: receiptState } = useController({ control, name: 'receipt' });
  const { selected } = flow;
  const channelLabel = selected?.label ?? '';

  const amountRow = useMemo<TransferRow | null>(
    () =>
      amount
        ? {
            key: 'amount',
            label: t('finance.topUp.transfer.amountRow'),
            value: formatMoney(amount, lang),
            copyValue: toAmountText(amount),
          }
        : null,
    [amount, lang, t],
  );

  const payerReference = flow.channels?.payerReference ?? null;

  // Amount first, then the account, then the brand's code for the transfer note.
  const accounts = useMemo<TransferAccountView[]>(
    () =>
      (selected?.accounts ?? []).map(account => ({
        id: account.id,
        rows: [
          ...(amountRow ? [amountRow] : []),
          ...account.fields.map(field => ({
            key: field.key,
            label: field.label,
            value: field.value,
            copyValue: field.copyable ? field.value : null,
          })),
          ...(payerReference
            ? [
                {
                  key: 'payer_reference',
                  label: t('finance.topUp.transfer.payerReference'),
                  value: payerReference,
                  copyValue: payerReference,
                  hint: t('finance.topUp.transfer.payerReferenceHint'),
                },
              ]
            : []),
        ],
      })),
    [amountRow, payerReference, selected?.accounts, t],
  );

  const copy = useCallback(
    (row: TransferRow) => {
      if (!row.copyValue) return;
      Clipboard.setString(row.copyValue);
      toast.success(t('finance.topUp.transfer.copied', { label: row.label }));
    },
    [t, toast],
  );

  const contactSupport = useCallback(
    () => openSupport(t('finance.topUp.transfer.supportMessage', { channel: channelLabel })),
    [channelLabel, openSupport, t],
  );

  // ── Receipt ───────────────────────────────────────────────────────────────
  // The picker validates; the form keeps the file so it survives going back a step.
  const picker = useFilePicker({
    allowedMimeTypes: TOP_UP_RECEIPT_MIME_TYPES,
    maxBytes: TOP_UP_RECEIPT_MAX_BYTES,
    fallbackName: t('finance.topUp.transfer.receiptLabel'),
  });
  const { file: pickedFile, pickFrom, onRemove: clearPicked } = picker;
  useEffect(() => {
    if (pickedFile) setValue('receipt', pickedFile, { shouldDirty: true, shouldValidate: true });
  }, [pickedFile, setValue]);

  const [sourceSheet, setSourceSheet] = useState(false);
  const pendingSource = useRef<FilePickSource | null>(null);
  const openSourceSheet = useCallback(() => setSourceSheet(true), []);
  const closeSourceSheet = useCallback(() => {
    pendingSource.current = null;
    setSourceSheet(false);
  }, []);
  const chooseSource = useCallback((source: FilePickSource) => {
    pendingSource.current = source;
    setSourceSheet(false);
  }, []);
  // iOS can't present the picker while the sheet's modal is still on screen.
  const onSourceSheetDismissed = useCallback(() => {
    const source = pendingSource.current;
    pendingSource.current = null;
    if (source) pickFrom(source);
  }, [pickFrom]);

  const removeReceipt = useCallback(() => {
    clearPicked();
    setValue('receipt', null, { shouldDirty: true, shouldValidate: true });
  }, [clearPicked, setValue]);

  const receiptError = picker.pickError ? t(PICK_ERROR_KEY[picker.pickError]) : receiptState.error?.message;

  const onContinue = useCallback(async () => {
    const valid = await trigger(TOP_UP_STEP_FIELDS.transfer);
    if (valid) navigation.navigate('TopUpReview');
  }, [navigation, trigger]);

  return {
    control,
    channelLabel,
    accounts,
    instructions: selected?.instructions ?? null,
    copy,
    contactSupport,
    referenceMaxLength: TOP_UP_REFERENCE_MAX_LENGTH,
    receipt: receiptField.value,
    receiptError: receiptError ?? null,
    openSourceSheet,
    sourceSheet,
    closeSourceSheet,
    chooseSource,
    onSourceSheetDismissed,
    removeReceipt,
    onContinue,
  };
};

export type TopUpTransferScreenModel = ReturnType<typeof useTopUpTransferScreen>;
