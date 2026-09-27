import { Linking } from 'react-native';

/** wa.me deep link (works with and without the app installed). */
export const buildWhatsAppUrl = (phoneE164: string, text?: string): string => {
  const digits = phoneE164.replace(/\D/g, '');
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${digits}${query}`;
};

export const openWhatsApp = (phoneE164: string, text?: string) =>
  Linking.openURL(buildWhatsAppUrl(phoneE164, text));
