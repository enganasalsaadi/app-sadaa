import type { UploadSlot, UploadSlotDto, UploadSlotRequest } from './uploadTypes';

// Server `name` rule: string ≤ 255.
const MAX_NAME_LENGTH = 255;

/** Keeps the tail when too long so the extension survives. */
export const toSlotRequest = (name: string, mime: string, size: number): UploadSlotRequest => ({
  name: name.length > MAX_NAME_LENGTH ? name.slice(name.length - MAX_NAME_LENGTH) : name,
  mime,
  size,
});

const toHeaders = (raw: UploadSlotDto['upload']['headers']): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (!raw || Array.isArray(raw)) return headers;
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string') headers[key] = value;
    // S3 presigners may send multi-value headers as lists.
    else if (Array.isArray(value)) headers[key] = value.filter(v => typeof v === 'string').join(', ');
  }
  return headers;
};

/** `transformResponse` for every `…/uploads` slot endpoint. */
export const mapUploadSlot = (dto: UploadSlotDto): UploadSlot => ({
  fileId: dto.file_id,
  kind: dto.kind,
  url: dto.upload.url,
  headers: toHeaders(dto.upload.headers),
  expiresAt: dto.upload.expires_at,
});
