import type { UploadPolicy, UploadRule } from '@/core/upload';
import type { DealFileKind, DealFilePurpose } from '../types/deal';

const MB = 1024 * 1024;

/** Server `DealFileKindEnum` + `deals.uploads` caps. */
const KIND_RULE = {
  video: { mimes: ['video/mp4', 'video/quicktime', 'video/webm'], maxBytes: 300 * MB },
  image: { mimes: ['image/jpeg', 'image/png', 'image/webp'], maxBytes: 20 * MB },
  document: { mimes: ['application/pdf'], maxBytes: 20 * MB },
} as const satisfies Record<DealFileKind, UploadRule>;

/** Server `DealFilePurposeEnum::kinds()/mimes()`: what each upload flow accepts. */
export const DEAL_UPLOAD_POLICY = {
  draft: { rules: [KIND_RULE.video, KIND_RULE.image] },
  brief: { rules: [KIND_RULE.image, KIND_RULE.document] },
  proof: { rules: [KIND_RULE.image] },
  // Evidence video is mp4/mov only (B10 decision 4).
  evidence: {
    rules: [
      { ...KIND_RULE.video, mimes: ['video/mp4', 'video/quicktime'] },
      KIND_RULE.image,
      KIND_RULE.document,
    ],
  },
  retention_report: { rules: [KIND_RULE.image] },
  retention_restore: { rules: [KIND_RULE.image] },
} as const satisfies Record<DealFilePurpose, UploadPolicy>;

/** Files per submit (server `file_ids` max): draft round, brief, proof, evidence entry, retention. */
export const DEAL_UPLOAD_LIMIT = {
  draft: 10,
  brief: 5,
  proof: 3,
  evidence: 10,
  retention_report: 3,
  retention_restore: 3,
} as const satisfies Record<DealFilePurpose, number>;
