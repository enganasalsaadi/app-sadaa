import type { UploadPolicy } from '@/core/upload';
import type { CampaignFilePurpose } from '../types/campaign';

const MB = 1024 * 1024;

const IMAGE = { mimes: ['image/jpeg', 'image/png', 'image/webp'], maxBytes: 20 * MB } as const;
const DOCUMENT = { mimes: ['application/pdf'], maxBytes: 20 * MB } as const;

/** Contract §3.2 Files: the cover is one image; brief attachments may also be a PDF. */
export const CAMPAIGN_UPLOAD_POLICY = {
  cover: { rules: [IMAGE] },
  brief: { rules: [IMAGE, DOCUMENT] },
} as const satisfies Record<CampaignFilePurpose, UploadPolicy>;

/** Files per campaign (`POST /files`): one cover, up to five brief attachments. */
export const CAMPAIGN_UPLOAD_LIMIT = {
  cover: 1,
  brief: 5,
} as const satisfies Record<CampaignFilePurpose, number>;
