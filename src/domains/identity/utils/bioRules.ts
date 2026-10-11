/** Contract §8.1: the bio is public, so it can't become a contact channel (deals stay in escrow). */
export const BIO_MAX_LENGTH = 300;

const ARABIC_INDIC_ZERO = 0x0660;
const PERSIAN_ZERO = 0x06f0;

/** Arabic-Indic (٠-٩) and Persian (۰-۹) digits → Western, so one digit rule covers all three. */
const toWesternDigits = (text: string): string =>
  text.replace(/[٠-٩۰-۹]/g, ch => {
    const code = ch.charCodeAt(0);
    return String(code >= PERSIAN_ZERO ? code - PERSIAN_ZERO : code - ARABIC_INDIC_ZERO);
  });

/** Separators people use to split a number (spaces, dashes, dots, brackets). */
const DIGIT_RUN = /(?:\d[\s\-.()[\]]*){7,}/;
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const HANDLE = /(?:^|[^\w])@\w{2,}/;
const SCHEME_OR_WWW = /(?:https?:\/\/|www\s*\.)/i;
/** `insta . com`, `wa(dot)me`, `shop نقطة com`: a dot in any spelling before a common TLD. */
const DOT = String.raw`(?:\.|\(\s*dot\s*\)|\[\s*dot\s*\]|\bdot\b|نقطة)`;
const TLD = String.raw`(?:com|net|org|me|ly|io|co|sy|app|link|store|shop|info|biz|tv|xyz|page|site|online)`;
const BARE_DOMAIN = new RegExp(String.raw`[\w-]\s*${DOT}\s*${TLD}(?![\w])`, 'i');

/**
 * Client mirror of the server's `bio_invalid` rule, for instant feedback only: the server stays
 * the authority and answers 422 with its own message. Errs on letting text through.
 */
export const hasBioContactDetails = (bio: string): boolean => {
  const text = toWesternDigits(bio);
  return (
    DIGIT_RUN.test(text) ||
    EMAIL.test(text) ||
    HANDLE.test(text) ||
    SCHEME_OR_WWW.test(text) ||
    BARE_DOMAIN.test(text)
  );
};
