import * as yup from 'yup';
import type { ParseKeys, TFunction } from 'i18next';
import { DEAL_LIVE_URL_REASON_COPY } from '../constants/dealPublish';
import {
  DEAL_RETENTION_LIMITS,
  DEAL_RETENTION_REASONS,
} from '../constants/dealRetention';
import { checkLiveUrl } from '../utils/dealPublish';

const maxNote = (t: TFunction) =>
  yup
    .string()
    .defined()
    .trim()
    .max(
      DEAL_RETENTION_LIMITS.maxNote,
      t('validation.maxLength', { count: DEAL_RETENTION_LIMITS.maxNote }),
    );

/** Brand reporting a post (screenshots are checked by the upload set). */
export interface DealRetentionReportValues {
  reason: string | null;
  note: string;
}

export const EMPTY_RETENTION_REPORT: DealRetentionReportValues = {
  reason: null,
  note: '',
};

/** One of the server's reasons; the note is optional except for «other» (server `required_if`). */
export const createDealRetentionReportSchema = (
  t: TFunction,
): yup.ObjectSchema<DealRetentionReportValues> =>
  yup.object({
    reason: yup
      .mixed<string>()
      .oneOf(
        [...DEAL_RETENTION_REASONS],
        t('marketplace.deals.changes.reasonError'),
      )
      .nullable()
      .defined()
      .test(
        'reason',
        t('marketplace.deals.changes.reasonError'),
        value => value !== null,
      ),
    note: maxNote(t).test(
      'required_if',
      t('marketplace.deals.retention.report.noteRequired'),
      function noteForOther(value) {
        return this.parent.reason !== 'other' || Boolean(value);
      },
    ),
  });

/** Creator restoring a post: the new link is optional (screenshots carry the proof). */
export interface DealRetentionRestoreValues {
  url: string;
}

export const EMPTY_RETENTION_RESTORE: DealRetentionRestoreValues = { url: '' };

/**
 * A well-formed link (test name = the server's reason code). The post's own platform and account
 * are checked by the server (`platform_mismatch` / `handle_mismatch` come back on the field).
 */
export const createDealRetentionRestoreSchema = (
  t: TFunction,
): yup.ObjectSchema<DealRetentionRestoreValues> =>
  yup.object({
    url: yup
      .string()
      .defined()
      .trim()
      .max(
        DEAL_RETENTION_LIMITS.maxUrl,
        t('validation.maxLength', { count: DEAL_RETENTION_LIMITS.maxUrl }),
      )
      .test(
        'invalid',
        t(DEAL_LIVE_URL_REASON_COPY.invalid.title),
        value => !value || checkLiveUrl(value, null) !== 'invalid',
      ),
  });

/** The creator contesting a report, or the brand rejecting a restore: a required note for the team. */
export interface DealRetentionNoteValues {
  note: string;
}

export const EMPTY_RETENTION_NOTE: DealRetentionNoteValues = { note: '' };

export const createDealRetentionNoteSchema = (
  t: TFunction,
  requiredKey: ParseKeys,
): yup.ObjectSchema<DealRetentionNoteValues> =>
  yup.object({
    note: maxNote(t).required(t(requiredKey)),
  });
