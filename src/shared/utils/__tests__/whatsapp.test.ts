import { buildWhatsAppUrl } from '../whatsapp';

describe('buildWhatsAppUrl', () => {
  it('strips the plus and formatting', () => {
    expect(buildWhatsAppUrl('+963 962 401 604')).toBe(
      'https://wa.me/963962401604',
    );
  });

  it('encodes the prefilled message', () => {
    expect(buildWhatsAppUrl('+963962401604', 'رقم خاطئ +963')).toBe(
      `https://wa.me/963962401604?text=${encodeURIComponent('رقم خاطئ +963')}`,
    );
  });
});
