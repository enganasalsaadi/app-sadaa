import { mapUploadSlot, toSlotRequest } from '../uploadSlot';
import type { UploadSlotDto } from '../uploadTypes';

const dto = (headers: UploadSlotDto['upload']['headers']): UploadSlotDto => ({
  file_id: '01J9ZK4Q5W6X7Y8Z9A0B1C2D3E',
  kind: 'video',
  upload: {
    method: 'PUT',
    url: 'https://storage.example/signed',
    headers,
    expires_at: '2026-10-13T12:30:00+00:00',
  },
});

describe('mapUploadSlot', () => {
  it('maps the slot and keeps string headers', () => {
    expect(mapUploadSlot(dto({ 'Content-Type': 'video/mp4', 'x-amz-acl': 'private' }))).toEqual({
      fileId: '01J9ZK4Q5W6X7Y8Z9A0B1C2D3E',
      kind: 'video',
      url: 'https://storage.example/signed',
      headers: { 'Content-Type': 'video/mp4', 'x-amz-acl': 'private' },
      expiresAt: '2026-10-13T12:30:00+00:00',
    });
  });

  it('joins multi-value headers and drops non-strings', () => {
    expect(mapUploadSlot(dto({ Host: ['a', 'b'], Bad: 3 })).headers).toEqual({ Host: 'a, b' });
  });

  it('handles empty or missing headers', () => {
    expect(mapUploadSlot(dto({})).headers).toEqual({});
    expect(mapUploadSlot(dto(null)).headers).toEqual({});
  });
});

describe('toSlotRequest', () => {
  it('passes short names through', () => {
    expect(toSlotRequest('clip.mp4', 'video/mp4', 10)).toEqual({ name: 'clip.mp4', mime: 'video/mp4', size: 10 });
  });

  it('trims long names to 255 chars keeping the extension', () => {
    const name = `${'a'.repeat(300)}.mp4`;
    const request = toSlotRequest(name, 'video/mp4', 10);
    expect(request.name).toHaveLength(255);
    expect(request.name.endsWith('.mp4')).toBe(true);
  });
});
