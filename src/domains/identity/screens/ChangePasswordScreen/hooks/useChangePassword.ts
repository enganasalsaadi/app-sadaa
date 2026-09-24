import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useChangePasswordMutation } from '../../../api/accountApi';
import { toastService } from '@/core/toast';
import { goBack } from '@/core/navigation';

export type ChangePasswordFormValues = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export const useChangePassword = () => {
  const { t } = useTranslation();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const form = useForm<ChangePasswordFormValues>({
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onSubmit = useCallback(
    async (values: ChangePasswordFormValues) => {
      try {
        await changePassword({
          current_password: values.current_password,
          password: values.new_password,
          password_confirmation: values.confirm_password,
        }).unwrap();
        toastService.success(t('account.changePassword.success'));
        goBack();
      } catch {
        toastService.error(t('errors.generic'));
      }
    },
    [changePassword, t],
  );

  return { form, onSubmit, isLoading };
};
