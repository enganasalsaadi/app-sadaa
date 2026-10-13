import { checkUpload } from '@/core/upload';
import { DEAL_UPLOAD_POLICY } from '../dealUploads';

const MB = 1024 * 1024;

describe('DEAL_UPLOAD_POLICY (server DealFilePurposeEnum)', () => {
  it('draft: video ≤ 300 MB and images ≤ 20 MB, no PDF', () => {
    expect(checkUpload(DEAL_UPLOAD_POLICY.draft, 'video/webm', 300 * MB).ok).toBe(true);
    expect(checkUpload(DEAL_UPLOAD_POLICY.draft, 'video/mp4', 300 * MB + 1)).toMatchObject({ failure: 'size' });
    expect(checkUpload(DEAL_UPLOAD_POLICY.draft, 'image/webp', 20 * MB).ok).toBe(true);
    expect(checkUpload(DEAL_UPLOAD_POLICY.draft, 'image/png', 20 * MB + 1)).toMatchObject({ failure: 'size' });
    expect(checkUpload(DEAL_UPLOAD_POLICY.draft, 'application/pdf', MB)).toMatchObject({ failure: 'type' });
  });

  it('brief: images and PDF, no video', () => {
    expect(checkUpload(DEAL_UPLOAD_POLICY.brief, 'application/pdf', 20 * MB).ok).toBe(true);
    expect(checkUpload(DEAL_UPLOAD_POLICY.brief, 'video/mp4', MB)).toMatchObject({ failure: 'type' });
  });

  it.each(['proof', 'retention_report', 'retention_restore'] as const)('%s: images only', purpose => {
    expect(checkUpload(DEAL_UPLOAD_POLICY[purpose], 'image/jpeg', MB).ok).toBe(true);
    expect(checkUpload(DEAL_UPLOAD_POLICY[purpose], 'video/mp4', MB)).toMatchObject({ failure: 'type' });
    expect(checkUpload(DEAL_UPLOAD_POLICY[purpose], 'application/pdf', MB)).toMatchObject({ failure: 'type' });
  });

  it('evidence: mp4/mov video (no webm), images and PDF', () => {
    expect(checkUpload(DEAL_UPLOAD_POLICY.evidence, 'video/quicktime', 300 * MB).ok).toBe(true);
    expect(checkUpload(DEAL_UPLOAD_POLICY.evidence, 'video/webm', MB)).toMatchObject({ failure: 'type' });
    expect(checkUpload(DEAL_UPLOAD_POLICY.evidence, 'application/pdf', MB).ok).toBe(true);
  });
});
