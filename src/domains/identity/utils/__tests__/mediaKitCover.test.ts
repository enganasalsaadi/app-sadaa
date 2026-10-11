import { COVER_MAX_BYTES, isValidCoverAsset, toCoverFormData } from '../mediaKitCover';

describe('isValidCoverAsset', () => {
  it.each(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])('accepts %s', type => {
    expect(isValidCoverAsset({ type, fileSize: 1024 })).toBe(true);
  });

  it('accepts exactly the size limit and rejects one byte more', () => {
    expect(isValidCoverAsset({ type: 'image/jpeg', fileSize: COVER_MAX_BYTES })).toBe(true);
    expect(isValidCoverAsset({ type: 'image/jpeg', fileSize: COVER_MAX_BYTES + 1 })).toBe(false);
  });

  it.each(['image/gif', 'image/heic', 'application/pdf'])('rejects %s', type => {
    expect(isValidCoverAsset({ type, fileSize: 1024 })).toBe(false);
  });

  it('rejects an unknown type', () => {
    expect(isValidCoverAsset({ fileSize: 1024 })).toBe(false);
  });
});

describe('toCoverFormData', () => {
  it('sends the file in the `cover` field', () => {
    const append = jest.spyOn(FormData.prototype, 'append');
    toCoverFormData({ uri: 'file:///c.jpg', fileName: 'c.jpg', type: 'image/jpeg' });
    expect(append).toHaveBeenCalledWith('cover', {
      uri: 'file:///c.jpg',
      name: 'c.jpg',
      type: 'image/jpeg',
    });
    append.mockRestore();
  });
});
