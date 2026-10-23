import { extensionOf, fileKindOf, mimeFromName, safeFileName } from '../fileKind';

describe('fileKind', () => {
  it('reads the extension from names and signed URLs', () => {
    expect(extensionOf('brief.PDF')).toBe('pdf');
    expect(extensionOf('https://cdn.test/a/b/photo.jpeg?X-Amz-Signature=x.y')).toBe('jpeg');
    expect(extensionOf('README')).toBe('');
  });

  it('guesses the MIME from the extension', () => {
    expect(mimeFromName('clip.mov')).toBe('video/quicktime');
    expect(mimeFromName('unknown.xyz')).toBe('application/octet-stream');
  });

  it('prefers the server kind, then the MIME', () => {
    expect(fileKindOf('application/pdf', 'image')).toBe('image');
    expect(fileKindOf('video/mp4', null)).toBe('video');
    expect(fileKindOf('application/pdf')).toBe('document');
  });

  it('makes names safe on disk and keeps an extension', () => {
    expect(safeFileName('دليل/الهوية:2', 'application/pdf')).toBe('دليل-الهوية-2.pdf');
    expect(safeFileName('photo.png', 'image/png')).toBe('photo.png');
    expect(safeFileName('', 'image/jpeg')).toBe('file.jpg');
  });
});
