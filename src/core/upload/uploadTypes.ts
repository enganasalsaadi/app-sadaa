/** A picked local file about to be uploaded. `size` null → read from disk before the slot request. */
export interface UploadSource {
  uri: string;
  name: string;
  /** As reported by the picker; normalised (aliases, extension fallback) before checks. */
  mime: string | null;
  size: number | null;
}

/** One group of allowed MIME types sharing a byte cap (e.g. images ≤ 20 MB). */
export interface UploadRule {
  mimes: readonly string[];
  maxBytes: number;
}

/** What one upload flow accepts; mirrors the server's checks so bad files never reach it. */
export interface UploadPolicy {
  rules: readonly UploadRule[];
}

/** Step 1 body: the server signs a slot for exactly this name, type and size. */
export interface UploadSlotRequest {
  name: string;
  mime: string;
  size: number;
}

export interface UploadSlotDto {
  file_id: string;
  kind: string;
  upload: {
    method: 'PUT';
    url: string;
    /** PHP `(object) []` → `{}`; never a list. */
    headers: Record<string, unknown> | null;
    expires_at: string;
  };
}

/** A signed PUT target. The URL grants write access: never log or persist it. */
export interface UploadSlot {
  fileId: string;
  kind: string;
  url: string;
  headers: Readonly<Record<string, string>>;
  expiresAt: string;
}

/** Domain adapter around its slot mutation (`.unwrap()`); errors propagate as the API error. */
export type RequestUploadSlot = (request: UploadSlotRequest) => Promise<UploadSlot>;

/**
 * `type` / `size` / `empty`: rejected before any request · `slot`: the slot request failed
 * (cause = API error, e.g. `deal_upload_limit`) · `transfer`: file unreadable or the PUT failed
 * · `canceled`: removed or unmounted.
 */
export type UploadFailure = 'type' | 'size' | 'empty' | 'slot' | 'transfer' | 'canceled';
