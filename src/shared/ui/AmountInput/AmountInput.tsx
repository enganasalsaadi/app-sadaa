import React, { forwardRef, memo, useCallback, useEffect, useState } from 'react';
import type { TextInputInstance } from 'react-native';
import { parseAmountText, sanitizeAmountText, toAmountText } from '@/core/money';
import type { CurrencyCode, Money } from '@/core/money';
import { CustomInput } from '../CustomInput';
import type { CustomInputProps } from '../CustomInput';

export interface AmountInputProps
  extends Omit<
    CustomInputProps,
    'value' | 'onChangeText' | 'keyboardType' | 'inputMode' | 'suffix' | 'isPassword' | 'multiline'
  > {
  /** Integer minor units (rule 06); `null` while empty. */
  value: Money | null;
  onChangeValue: (value: Money | null) => void;
  currency: CurrencyCode;
}

const sameAmount = (a: Money | null, b: Money | null): boolean =>
  a?.amount === b?.amount && a?.currency === b?.currency;

/**
 * Amount field for budgets, offers and withdrawals. Keeps the typed text (so `12.`
 * survives) and reports `Money` in minor units. Limits (min, max, balance) belong
 * in the form schema, not here.
 */
const AmountInputInner = forwardRef<TextInputInstance, AmountInputProps>(
  ({ value, onChangeValue, currency, onBlur, ...inputProps }, ref) => {
    const [text, setText] = useState(() => (value ? toAmountText(value) : ''));

    // Follow external resets (form reset, server prefill) without fighting the user's typing.
    useEffect(() => {
      setText(current =>
        sameAmount(parseAmountText(current, currency), value)
          ? current
          : value
            ? toAmountText(value)
            : '',
      );
    }, [value, currency]);

    const handleChangeText = useCallback(
      (next: string) => {
        const clean = sanitizeAmountText(next, currency);
        setText(clean);
        onChangeValue(parseAmountText(clean, currency));
      },
      [currency, onChangeValue],
    );

    // Leaving the field shows the full amount (`50` → `50.00`), so the value
    // read back is the value saved: a slipped digit is visible, not implied.
    const handleBlur = useCallback<NonNullable<CustomInputProps['onBlur']>>(
      event => {
        if (value) setText(toAmountText(value));
        onBlur?.(event);
      },
      [onBlur, value],
    );

    return (
      <CustomInput
        ref={ref}
        {...inputProps}
        value={text}
        onChangeText={handleChangeText}
        onBlur={handleBlur}
        keyboardType="decimal-pad"
        inputMode="decimal"
        suffix={currency}
      />
    );
  },
);

export const AmountInput = memo(AmountInputInner);
