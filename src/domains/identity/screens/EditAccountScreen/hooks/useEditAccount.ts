import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/core/store';
import { selectUser } from '@/domains/auth';
import { useUpdateProfileMutation } from '@/domains/auth';
import { toastService } from '@/core/toast';
import { goBack } from '@/core/navigation';

export type EditAccountFormValues = {
  full_name: string;
  phone: string;
};

export const useEditAccount = () => {
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const form = useForm<EditAccountFormValues>({
    defaultValues: {
      full_name: user?.full_name ?? '',
      phone: user?.phone ?? '',
    },
  });

  const onSubmit = useCallback(
    async (values: EditAccountFormValues) => {
      try {
        // POST /account/profile — only name + phone; email is read-only.
        await updateProfile({
          full_name: values.full_name,
          phone: values.phone,
        }).unwrap();
        toastService.success(t('account.editAccount.saveSuccess'));
        goBack();
      } catch {
        toastService.error(t('errors.generic'));
      }
    },
    [updateProfile, t],
  );

  return { form, onSubmit, isLoading, user };
};
