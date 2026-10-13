import type { UploadPolicy, UploadRule } from './uploadTypes';

// Pickers report legacy or non-standard names for the same types.
const MIME_ALIASES: Readonly<Record<string, string>> = {
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
  'video/mov': 'video/quicktime',
};

// Android document providers often send no type or octet-stream.
const EXTENSION_MIME: Readonly<Record<string, string>> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
  pdf: 'application/pdf',
};

const GENERIC_MIMES = new Set(['', 'application/octet-stream', 'binary/octet-stream']);

/** Lowercased, de-aliased MIME; falls back to the file extension when the picker gave nothing useful. */
export const normalizeMime = (mime: string | null | undefined, name: string): string | null => {
  const reported = (mime ?? '').trim().toLowerCase();
  if (!GENERIC_MIMES.has(reported)) return MIME_ALIASES[reported] ?? reported;
  const extension = name.split('.').pop()?.toLowerCase() ?? '';
  return EXTENSION_MIME[extension] ?? null;
};

export type UploadCheck =
  | { ok: true; mime: string }
  | { ok: false; failure: 'type' }
  | { ok: false; failure: 'empty' }
  | { ok: false; failure: 'size'; maxBytes: number };

const findRule = (policy: UploadPolicy, mime: string): UploadRule | undefined =>
  policy.rules.find(rule => rule.mimes.includes(mime));

/** Rule 07: MIME + size checked before the slot request; the server re-checks after the PUT. */
export const checkUpload = (
  policy: UploadPolicy,
  mime: string | null,
  size: number,
): UploadCheck => {
  const rule = mime ? findRule(policy, mime) : undefined;
  if (!mime || !rule) return { ok: false, failure: 'type' };
  if (size <= 0) return { ok: false, failure: 'empty' };
  if (size > rule.maxBytes) return { ok: false, failure: 'size', maxBytes: rule.maxBytes };
  return { ok: true, mime };
};

/** Every MIME a policy accepts, e.g. to narrow a document picker. */
export const policyMimes = (policy: UploadPolicy): string[] =>
  policy.rules.flatMap(rule => rule.mimes);
