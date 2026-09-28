import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import { applyServerFieldErrors, normalizeApiError } from '@/core/api';
import type { AppApiError } from '@/core/api';
import { DEFAULT_PHONE_COUNTRY } from '@/core/config';
import type { AuthStackParamList } from '@/core/navigation';
import { useLoginMutation } from '../../../api';
import type { AccountType } from '../../../components/AccountTypeSheet';
import { createLoginSchema } from '../../../schemas';
import type { LoginFormValues } from '../../../schemas';

const SERVER_FIELD_MAP = {
  phone: 'phone',
  password: 'password',
} as const satisfies Record<string, keyof LoginFormValues>;

const DEFAULT_VALUES: LoginFormValues = {
  countryCode: DEFAULT_PHONE_COUNTRY,
  phone: '',
  password: '',
};

export const useLoginScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Login'>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'Login'>>();
  const schema = useMemo(() => createLoginSchema(t), [t]);
  const [apiError, setApiError] = useState<AppApiError | null>(null);
  const [accountSheetVisible, setAccountSheetVisible] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  const { control, handleSubmit, setError, setFocus, setValue, getValues, trigger, getFieldState } =
    useForm<LoginFormValues>({
      mode: 'onTouched',
      resolver: yupResolver(schema),
      defaultValues: DEFAULT_VALUES,
    });

  // Back from a password reset with the number already known: only the new
  // password is left to type.
  const prefillPhone = route.params?.phone;
  useEffect(() => {
    const parsed = prefillPhone ? parsePhoneNumberFromString(prefillPhone) : undefined;
    if (!parsed?.country) return;
    setValue('countryCode', parsed.country);
    setValue('phone', parsed.nationalNumber);
    setValue('password', '');
    setApiError(null);
    setFocus('password');
  }, [prefillPhone, setFocus, setValue]);

  // Success flips AppStatus; RootNavigator swaps to Main / the registration
  // branch on its own, so there's no navigation here.
  const onSubmit = useCallback(() => {
    handleSubmit(async values => {
      if (isLoading) return;
      const parsed = parsePhoneNumberFromString(values.phone, values.countryCode);
      if (!parsed) return;
      setApiError(null);
      try {
        await login({ phone: parsed.format('E.164'), password: values.password }).unwrap();
      } catch (err) {
        if (!applyServerFieldErrors(err, SERVER_FIELD_MAP, setError)) {
          setApiError(normalizeApiError(err));
        }
      }
    })();
  }, [handleSubmit, isLoading, login, setError]);

  const onChangeCountry = useCallback(
    (code: CountryCode) => {
      setValue('countryCode', code);
      if (getFieldState('phone').isTouched) trigger('phone');
    },
    [getFieldState, setValue, trigger],
  );

  // Carries the typed number over so it isn't entered twice.
  const onForgotPassword = useCallback(() => {
    const { phone, countryCode } = getValues();
    navigation.navigate('ForgotPassword', {
      screen: 'ResetPhone',
      params: { phone, countryCode },
    });
  }, [getValues, navigation]);

  const openAccountSheet = useCallback(() => setAccountSheetVisible(true), []);
  const closeAccountSheet = useCallback(() => setAccountSheetVisible(false), []);

  const onSelectAccountType = useCallback(
    (type: AccountType) => {
      setAccountSheetVisible(false);
      if (type === 'brand') navigation.navigate('BrandRegister');
      else if (type === 'influencer') navigation.navigate('InfluencerRegister');
    },
    [navigation],
  );

  return {
    control,
    setFocus,
    onChangeCountry,
    onSubmit,
    isSubmitting: isLoading,
    apiError,
    onForgotPassword,
    accountSheetVisible,
    openAccountSheet,
    closeAccountSheet,
    onSelectAccountType,
  };
};
