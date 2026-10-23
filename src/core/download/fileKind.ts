import type { FileKind } from './downloadTypes';

const EXT_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  gif: 'image/gif',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  m4v: 'video/x-m4v',
  pdf: 'application/pdf',
};

const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/x-m4v': 'm4v',
  'application/pdf': 'pdf',
};

/** Lower-case extension of a name or URL path (query dropped), `''` when none. */
export const extensionOf = (nameOrUrl: string): string => {
  const path = nameOrUrl.split(/[?#]/)[0] ?? '';
  const last = path.split('/').pop() ?? '';
  const dot = last.lastIndexOf('.');
  return dot > 0 ? last.slice(dot + 1).toLowerCase() : '';
};

export const mimeFromName = (nameOrUrl: string): string =>
  EXT_MIME[extensionOf(nameOrUrl)] ?? 'application/octet-stream';

/** The server's kind wins; otherwise the MIME decides. */
export const fileKindOf = (mime: string, hint?: string | null): FileKind => {
  if (hint === 'image' || hint === 'video' || hint === 'document') return hint;
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  return 'document';
};

export const isPdf = (mime: string): boolean => mime === 'application/pdf';

// Path separators and reserved characters; the rest (Arabic included) stays readable.
const UNSAFE = /[/\\:*?"<>|]+/g;
const FIRST_PRINTABLE = 32;

/** A name that is safe on disk and keeps an extension, so Photos / Files / other apps read it right. */
export const safeFileName = (name: string, mime: string): string => {
  const printable = Array.from(name)
    .filter(char => char.charCodeAt(0) >= FIRST_PRINTABLE)
    .join('');
  const cleaned = printable.replace(UNSAFE, '-').trim().slice(0, 120) || 'file';
  if (extensionOf(cleaned)) return cleaned;
  const ext = MIME_EXT[mime];
  return ext ? `${cleaned}.${ext}` : cleaned;
};
