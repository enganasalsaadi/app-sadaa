import React, { memo, useCallback } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Copy } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import {
  Box,
  Card,
  CustomInput,
  Divider,
  FilePickerCard,
  KeyValueRow,
  LayoutFooter,
  Notice,
  Pressable,
  Text,
} from '@/shared/ui';
import { TopUpStepLayout } from '../../components/TopUpStepLayout';
import { ReceiptSourceSheet } from './components/ReceiptSourceSheet';
import { useTopUpTransferScreen, type TransferRow } from './hooks/useTopUpTransferScreen';

const CopyValue = memo<{ row: TransferRow; onCopy: (row: TransferRow) => void }>(({ row, onCopy }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const handlePress = useCallback(() => onCopy(row), [onCopy, row]);
  if (!row.copyValue) return <Text variant="bodyMedium">{row.value}</Text>;
  return (
    <Pressable
      onPress={handlePress}
      row
      align="center"
      gap="xs"
      minHeight={sizes.button.sm}
      accessibilityRole="button"
      accessibilityLabel={t('finance.topUp.transfer.copy', { label: row.label })}
      accessibilityHint={row.value}
    >
      <Text variant="bodyMedium" selectable>
        {row.value}
      </Text>
      <Copy size={sizes.icon.xs} color={colors.interactive.main} />
    </Pressable>
  );
});

const Section = memo<{ title: string; children: React.ReactNode }>(({ title, children }) => {
  const { colors } = useTheme();
  return (
    <Box gap="sm">
      <Text variant="label" color={colors.text.secondary} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </Box>
  );
});

/** Step 3 of the top-up wizard: send to Sada's account, then the transfer number and receipt. */
const TopUpTransferScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useTopUpTransferScreen();
  const hasAccounts = vm.accounts.length > 0;

  return (
    <TopUpStepLayout
      step="transfer"
      footer={<LayoutFooter primary={{ label: t('finance.topUp.continue'), onPress: vm.onContinue }} />}
    >
      <Box gap="2xl">
        <Box gap="xs">
          <Text variant="h2">{t('finance.topUp.transfer.title')}</Text>
          <Text variant="body" color={colors.text.secondary}>
            {t('finance.topUp.transfer.subtitle', { channel: vm.channelLabel })}
          </Text>
        </Box>

        <Section title={t('finance.topUp.transfer.sendTo')}>
          {hasAccounts ? (
            vm.accounts.map(account => (
              <Card key={account.id} px="lg" py="sm">
                {account.rows.map((row, index) => (
                  <Box key={row.key}>
                    {index > 0 ? <Divider /> : null}
                    <Box py="xs">
                      <KeyValueRow
                        label={row.label}
                        hint={row.hint}
                        value={<CopyValue row={row} onCopy={vm.copy} />}
                      />
                    </Box>
                  </Box>
                ))}
              </Card>
            ))
          ) : (
            <Notice
              tone="info"
              title={t('finance.topUp.transfer.noAccountsTitle')}
              message={t('finance.topUp.transfer.noAccounts')}
              action={{ label: t('finance.topUp.transfer.contactSupport'), onPress: vm.contactSupport }}
            />
          )}
          <Notice tone="info" message={vm.instructions ?? t('finance.topUp.transfer.exactNotice')} />
        </Section>

        <Section title={t('finance.topUp.transfer.detailsSection')}>
          <Controller
            control={vm.control}
            name="transferReference"
            render={({ field, fieldState }) => (
              <CustomInput
                ref={field.ref}
                label={t('finance.topUp.transfer.referenceLabel')}
                placeholder={t('finance.topUp.transfer.referencePlaceholder')}
                hint={t('finance.topUp.transfer.referenceHint')}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                maxLength={vm.referenceMaxLength}
                showCount
                autoCapitalize="characters"
                autoCorrect={false}
                autoComplete="off"
                returnKeyType="done"
              />
            )}
          />
        </Section>

        <Section title={t('finance.topUp.transfer.receiptLabel')}>
          <FilePickerCard
            file={vm.receipt}
            onPick={vm.openSourceSheet}
            onRemove={vm.removeReceipt}
            title={t('finance.topUp.transfer.receiptTitle')}
            hint={t('finance.topUp.transfer.receiptHint')}
            error={vm.receiptError}
          />
        </Section>
      </Box>

      <ReceiptSourceSheet
        visible={vm.sourceSheet}
        onClose={vm.closeSourceSheet}
        onChoose={vm.chooseSource}
        onDismissed={vm.onSourceSheetDismissed}
      />
    </TopUpStepLayout>
  );
};

export const TopUpTransferScreen = memo(TopUpTransferScreenComponent);
