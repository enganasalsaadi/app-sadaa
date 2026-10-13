import { checkUpload, normalizeMime, policyMimes } from '../uploadPolicy';
import type { UploadPolicy } from '../uploadTypes';

const MB = 1024 * 1024;
const policy: UploadPolicy = {
  rules: [
    { mimes: ['video/mp4', 'video/quicktime'], maxBytes: 300 * MB },
    { mimes: ['image/jpeg', 'image/png'], maxBytes: 20 * MB },
  ],
};

describe('normalizeMime', () => {
  it('lowercases and resolves aliases', () => {
    expect(normalizeMime('IMAGE/JPEG', 'a.jpg')).toBe('image/jpeg');
    expect(normalizeMime('image/jpg', 'a.jpg')).toBe('image/jpeg');
    expect(normalizeMime('video/mov', 'clip.mov')).toBe('video/quicktime');
  });

  it('falls back to the extension when the picker gives nothing useful', () => {
    expect(normalizeMime(null, 'Clip.MOV')).toBe('video/quicktime');
    expect(normalizeMime('application/octet-stream', 'brief.pdf')).toBe('application/pdf');
    expect(normalizeMime('', 'photo.webp')).toBe('image/webp');
  });

  it('returns null for unknown types without a usable extension', () => {
    expect(normalizeMime(null, 'archive.zip')).toBeNull();
    expect(normalizeMime(undefined, 'noextension')).toBeNull();
  });

  it('keeps a specific reported type over the extension', () => {
    expect(normalizeMime('image/heic', 'photo.jpg')).toBe('image/heic');
  });
});

describe('checkUpload', () => {
  it('accepts an allowed type within its own cap', () => {
    expect(checkUpload(policy, 'video/mp4', 250 * MB)).toEqual({ ok: true, mime: 'video/mp4' });
    expect(checkUpload(policy, 'image/png', 20 * MB)).toEqual({ ok: true, mime: 'image/png' });
  });

  it('rejects a type outside the policy or unknown', () => {
    expect(checkUpload(policy, 'application/pdf', MB)).toEqual({ ok: false, failure: 'type' });
    expect(checkUpload(policy, null, MB)).toEqual({ ok: false, failure: 'type' });
  });

  it('applies the cap of the matching kind, not the largest one', () => {
    expect(checkUpload(policy, 'image/jpeg', 20 * MB + 1)).toEqual({
      ok: false,
      failure: 'size',
      maxBytes: 20 * MB,
    });
  });

  it('rejects empty files', () => {
    expect(checkUpload(policy, 'image/jpeg', 0)).toEqual({ ok: false, failure: 'empty' });
  });
});

it('policyMimes lists every accepted type', () => {
  expect(policyMimes(policy)).toEqual(['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png']);
});
