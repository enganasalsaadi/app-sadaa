import { isReceiptLinkExpired, isTrustedReceiptUrl } from '../receiptUrl';

const API = 'https://api.getsada.app/api';

describe('isTrustedReceiptUrl', () => {
  it('accepts the API origin', () => {
    expect(isTrustedReceiptUrl('https://api.getsada.app/storage/r/1.pdf?sig=x', API)).toBe(true);
    expect(isTrustedReceiptUrl('HTTPS://API.getsada.app/r.pdf', API)).toBe(true);
  });

  it('refuses other hosts, schemes, ports and look-alikes', () => {
    expect(isTrustedReceiptUrl('https://evil.example/r.pdf', API)).toBe(false);
    expect(isTrustedReceiptUrl('http://api.getsada.app/r.pdf', API)).toBe(false);
    expect(isTrustedReceiptUrl('https://api.getsada.app:8443/r.pdf', API)).toBe(false);
    expect(isTrustedReceiptUrl('https://api.getsada.app.evil.example/r.pdf', API)).toBe(false);
    expect(isTrustedReceiptUrl('https://api.getsada.app@evil.example/r.pdf', API)).toBe(false);
    expect(isTrustedReceiptUrl('file:///data/r.pdf', API)).toBe(false);
  });
});

describe('isReceiptLinkExpired', () => {
  const expiresAt = '2026-10-09T10:10:00Z';
  const at = (iso: string) => Date.parse(iso);

  it('keeps a link that still has time left', () => {
    expect(isReceiptLinkExpired({ expires_at: expiresAt }, at('2026-10-09T10:05:00Z'))).toBe(false);
  });

  it('refreshes a link that is dead or about to die', () => {
    expect(isReceiptLinkExpired({ expires_at: expiresAt }, at('2026-10-09T10:09:45Z'))).toBe(true);
    expect(isReceiptLinkExpired({ expires_at: expiresAt }, at('2026-10-09T10:30:00Z'))).toBe(true);
  });

  it('treats a missing or unreadable expiry as alive', () => {
    expect(isReceiptLinkExpired({ expires_at: null }, at('2030-01-01T00:00:00Z'))).toBe(false);
    expect(isReceiptLinkExpired({ expires_at: 'soon' }, at('2030-01-01T00:00:00Z'))).toBe(false);
  });
});
