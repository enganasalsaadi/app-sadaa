import React, { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react-native';
import { Box, CustomInput, IconButton } from '@/shared/ui';
import { DEAL_BRIEF_LIMITS } from '../../../constants/dealOffer';

interface BriefEntryAdderProps {
  placeholder: string;
  /** Returns whether the entry was taken (then the field clears). */
  onAdd: (raw: string) => boolean;
  autoCapitalize?: 'none' | 'sentences';
}

/** A one-line field + «add»: return or the button commits, the field clears for the next one. */
const BriefEntryAdderComponent: React.FC<BriefEntryAdderProps> = ({ placeholder, onAdd, autoCapitalize = 'sentences' }) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const commit = useCallback(() => {
    if (onAdd(text)) setText('');
  }, [onAdd, text]);

  return (
    <Box row align="center" gap="sm">
      <Box flex={1}>
        <CustomInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          maxLength={DEAL_BRIEF_LIMITS.maxEntryLength}
          returnKeyType="done"
          submitBehavior="submit"
          onSubmitEditing={commit}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCapitalize !== 'none'}
          mb="xs"
          accessibilityLabel={placeholder}
        />
      </Box>
      <IconButton icon={Plus} variant="solid" onPress={commit} accessibilityLabel={t('marketplace.offer.brief.add')} />
    </Box>
  );
};

export const BriefEntryAdder = memo(BriefEntryAdderComponent);
