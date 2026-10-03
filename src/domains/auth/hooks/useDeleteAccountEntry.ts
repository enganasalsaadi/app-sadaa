import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserRoundX } from 'lucide-react-native';
import type { WizardShellAction } from '@/shared/ui';

/**
 * Registration-wizard entry to account deletion: a header action on every step
 * plus the sheet's visibility. A draft account exists from step 1 on.
 */
export const useDeleteAccountEntry = () => {
  const { t } = useTranslation();
  const [sheetVisible, setSheetVisible] = useState(false);
  const closeSheet = useCallback(() => setSheetVisible(false), []);
  const action = useMemo<WizardShellAction>(
    () => ({
      icon: UserRoundX,
      label: t('auth.deleteAccount.entry'),
      onPress: () => setSheetVisible(true),
    }),
    [t],
  );
  return { action, sheetVisible, closeSheet };
};
