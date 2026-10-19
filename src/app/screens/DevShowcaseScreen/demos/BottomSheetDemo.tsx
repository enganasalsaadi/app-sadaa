import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BottomSheet,
  Box,
  Chip,
  CustomButton,
  Rail,
  SelectionModal,
  SheetFrame,
  Text,
} from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { useBottomSheetDemo } from './hooks/useBottomSheetDemo';

const BottomSheetDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { sheet, framed, selection, selected, setSelected, items, tag, setTag } =
    useBottomSheetDemo();

  return (
    <Box row wrap gap="sm">
      <CustomButton
        title={t('devShowcase.modalsToasts.openBottomSheet')}
        onPress={sheet.open}
        variant="outline"
      />
      <CustomButton
        title={t('devShowcase.modalsToasts.openFramedSheet')}
        onPress={framed.open}
        variant="outline"
      />
      <CustomButton
        title={t('devShowcase.modalsToasts.openSelectionModal')}
        onPress={selection.open}
        variant="outline"
      />

      <BottomSheet visible={sheet.visible} onClose={sheet.close}>
        <Box px="2xl" pt="lg" pb="3xl" align="center">
          <Text variant="h4" mb="sm" align="center">
            {t('devShowcase.modalsToasts.sheetTitle')}
          </Text>
          <Text
            variant="body"
            color={colors.text.secondary}
            mb="2xl"
            align="center"
          >
            {t('devShowcase.modalsToasts.sheetBody')}
          </Text>
          <CustomButton
            title={t('devShowcase.modalsToasts.sheetConfirm')}
            onPress={sheet.close}
            fullWidth
          />
        </Box>
      </BottomSheet>

      {/* SheetFrame: white header (title, body, a sideways chip row), page-color body, white footer. */}
      <SheetFrame
        visible={framed.visible}
        onClose={framed.close}
        title={t('devShowcase.modalsToasts.sheetTitle')}
        body={t('devShowcase.modalsToasts.sheetBody')}
        headerAccessory={
          <Rail bleed gap="sm">
            {items.map(item => (
              <Chip
                key={String(item.value)}
                variant="tile"
                value={String(item.value)}
                label={item.label}
                selected={String(item.value) === tag}
                onSelect={setTag}
              />
            ))}
          </Rail>
        }
        footer={
          <CustomButton
            title={t('devShowcase.modalsToasts.sheetConfirm')}
            onPress={framed.close}
            fullWidth
          />
        }
      >
        <Text variant="body" color={colors.text.secondary}>
          {t('devShowcase.modalsToasts.sheetBody')}
        </Text>
      </SheetFrame>

      <SelectionModal
        visible={selection.visible}
        onClose={selection.close}
        title={t('devShowcase.modalsToasts.selectionTitle')}
        items={items}
        mode="single"
        selected={selected}
        onConfirm={setSelected}
      />
    </Box>
  );
};

export const BottomSheetDemo = memo(BottomSheetDemoComponent);
