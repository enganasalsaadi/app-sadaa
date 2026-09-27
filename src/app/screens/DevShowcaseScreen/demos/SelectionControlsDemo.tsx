import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Checkbox, RadioGroup, SectionHeader, Switch } from '@/shared/ui';
import { useSelectionControlsDemo } from './hooks/useSelectionControlsDemo';

type Demo = ReturnType<typeof useSelectionControlsDemo>;
type PlatformItem = Demo['platformItems'][number];

interface PlatformCheckboxProps {
  item: PlatformItem;
  checked: boolean;
  onToggle: Demo['togglePlatform'];
}

const PlatformCheckbox: React.FC<PlatformCheckboxProps> = memo(({ item, checked, onToggle }) => {
  const handleChange = useCallback(
    (next: boolean) => onToggle(item.value, next),
    [onToggle, item.value],
  );
  return <Checkbox checked={checked} onChange={handleChange} label={item.label} />;
});

const SelectionControlsDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const demo = useSelectionControlsDemo();

  return (
    <Box gap="xl">
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.selection.switchTitle')} />
        <Box row gap="lg" align="center">
          <Switch
            value={demo.pushEnabled}
            onValueChange={demo.setPushEnabled}
            accessibilityLabel={t('devShowcase.selection.push')}
          />
          <Switch
            value={demo.emailEnabled}
            onValueChange={demo.setEmailEnabled}
            accessibilityLabel={t('devShowcase.selection.email')}
          />
          <Switch
            value
            onValueChange={demo.setEmailEnabled}
            accessibilityLabel={t('devShowcase.selection.email')}
            disabled
          />
        </Box>
      </Box>

      <Box gap="xs">
        <SectionHeader title={t('devShowcase.selection.checkboxTitle')} />
        <Checkbox
          checked={demo.allChecked}
          indeterminate={demo.someChecked}
          onChange={demo.setAllPlatforms}
          label={t('devShowcase.selection.allPlatforms')}
        />
        <Box ps="2xl">
          {demo.platformItems.map(item => (
            <PlatformCheckbox
              key={item.value}
              item={item}
              checked={demo.platforms.has(item.value)}
              onToggle={demo.togglePlatform}
            />
          ))}
        </Box>
        <Checkbox
          checked={demo.terms}
          onChange={demo.setTerms}
          label={t('devShowcase.selection.terms')}
          description={t('devShowcase.selection.termsDescription')}
          error={demo.terms ? undefined : t('devShowcase.selection.termsError')}
        />
        <Checkbox
          checked
          onChange={demo.setTerms}
          label={t('devShowcase.selection.disabled')}
          disabled
        />
      </Box>

      <Box gap="xs">
        <SectionHeader title={t('devShowcase.selection.radioTitle')} />
        <RadioGroup
          items={demo.payoutItems}
          value={demo.payout}
          onChange={demo.setPayout}
          accessibilityLabel={t('devShowcase.selection.radioTitle')}
        />
      </Box>
    </Box>
  );
};

export const SelectionControlsDemo = memo(SelectionControlsDemoComponent);
