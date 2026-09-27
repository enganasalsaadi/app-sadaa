import { PASSWORD_MIN_LENGTH } from '../schemas/passwordFields';

/** 0 = empty · 1 = weak · 2 = fair · 3 = strong. A hint only; the server enforces the policy. */
export type PasswordScore = 0 | 1 | 2 | 3;

export const scorePassword = (password: string): PasswordScore => {
  if (!password) return 0;
  if (password.length < PASSWORD_MIN_LENGTH) return 1;
  const classes = [/[a-z]/i, /\d/, /[^a-z\d]/i].filter(re => re.test(password)).length;
  if (classes === 3 || (classes === 2 && password.length >= 12)) return 3;
  return classes >= 2 ? 2 : 1;
};
