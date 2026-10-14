import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FileText, Images, type LucideIcon } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { BottomSheet, Box, Pressable, Text } from '@/shared/ui';
import type { BriefFileSource } from '../hooks/useBriefAttachments';
import { useOfferBuilder } from '../OfferBuilderContext';
import { SheetTitle } from './SheetTitle';

const SOURCES = [
  { source: 'photos', icon: Images, label: 'marketplace.offer.brief.files.photos' },
  { source: 'files', icon: FileText, label: 'marketplace.offer.brief.files.documents' },
] as const satisfies readonly { source: BriefFileSource; icon: LucideIcon; label: string }[];

/** Photos or documents; the picker opens once the sheet is gone (iOS can't stack them). */
const FileSourceSheetComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { sheet, closeSheet, chooseFileSource, onFilesSheetDismissed } = useOfferBuilder();
  const styles = useStyles(
    ({ radii, spacing }): Record<'option', ViewStyle> => ({
      option: {
        flex: 1,
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.xl,
        borderRadius: radii.xl,
        backgroundColor: colors.interactive.soft,
      },
    }),
    [colors.interactive.soft],
  );

  return (
    <BottomSheet visible={sheet === 'files'} onClose={closeSheet} onDismissed={onFilesSheetDismissed}>
      <Box px="xl" pb="2xl" gap="lg">
        <SheetTitle title={t('marketplace.offer.brief.files.sheetTitle')} body={t('marketplace.offer.brief.files.caption')} />
        <Box row gap="md">
          {SOURCES.map(({ source, icon: Icon, label }) => (
            <Pressable
              key={source}
              style={styles.option}
              scaleOnPress
              onPress={() => chooseFileSource(source)}
              accessibilityRole="button"
              accessibilityLabel={t(label)}
            >
              <Icon size={sizes.icon.lg} color={colors.interactive.main} />
              <Text variant="bodyMedium" color={colors.interactive.text}>
                {t(label)}
              </Text>
            </Pressable>
          ))}
        </Box>
      </Box>
    </BottomSheet>
  );
};

export const FileSourceSheet = memo(FileSourceSheetComponent);
