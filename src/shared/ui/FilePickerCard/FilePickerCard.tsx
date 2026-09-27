import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FileText, RefreshCw, CloudUpload, X } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Pressable } from '../primitives/Pressable';
import { Image } from '../primitives/Image';
import { ProgressBar } from '../ProgressBar';

export interface PickedFile {
  uri: string;
  name: string;
  /** MIME type. */
  type: string;
  /** Pre-formatted size label (e.g. "2.4 MB"). */
  sizeLabel?: string;
}

export interface FilePickerCardProps {
  file: PickedFile | null;
  onPick: () => void;
  onRemove: () => void;
  /** Empty-state call to action ("Upload commercial register"). */
  title: string;
  /** Allowed types + limit ("PDF, JPG or PNG · up to 10 MB"). */
  hint: string;
  error?: string | null;
  disabled?: boolean;
  /** 0–1 while the picked file uploads; replace/remove are locked until it settles. */
  uploadProgress?: number | null;
}

const FilePickerCardComponent: React.FC<FilePickerCardProps> = ({
  file,
  onPick,
  onRemove,
  title,
  hint,
  error,
  disabled = false,
  uploadProgress = null,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const uploading = uploadProgress !== null;
  const locked = disabled || uploading;
  const borderColor = error ? colors.status.danger.main : colors.interactive.main;

  return (
    <Box gap="sm">
      {file ? (
        <Box
          row
          align="center"
          gap="md"
          p="md"
          borderRadius="lg"
          borderWidth="thin"
          borderColor={colors.border.default}
          bg={colors.surface.elevated}
        >
          {file.type.startsWith('image/') ? (
            <Image
              uri={file.uri}
              size={sizes.thumbnail.sm}
              borderRadius="md"
              resizeMode="cover"
            />
          ) : (
            <Box
              width={sizes.thumbnail.sm}
              height={sizes.thumbnail.sm}
              borderRadius="md"
              bg={colors.interactive.soft}
              align="center"
              justify="center"
            >
              <FileText size={sizes.icon.md} color={colors.interactive.main} />
            </Box>
          )}

          <Box flex={1} gap="xs">
            <Text variant="bodyMedium" numberOfLines={1}>
              {file.name}
            </Text>
            {file.sizeLabel && !uploading ? (
              <Text variant="caption" color={colors.text.secondary}>
                {file.sizeLabel}
              </Text>
            ) : null}
            {uploading ? (
              <ProgressBar
                value={uploadProgress}
                accessibilityLabel={t('common.media.uploading')}
              />
            ) : null}
          </Box>

          <Pressable
            onPress={onPick}
            disabled={locked}
            width={sizes.button.md}
            height={sizes.button.md}
            align="center"
            justify="center"
            borderRadius="full"
            accessibilityRole="button"
            accessibilityLabel={t('common.replaceFile')}
          >
            <RefreshCw size={sizes.icon.sm} color={colors.icon.secondary} />
          </Pressable>
          <Pressable
            onPress={onRemove}
            disabled={locked}
            width={sizes.button.md}
            height={sizes.button.md}
            align="center"
            justify="center"
            borderRadius="full"
            accessibilityRole="button"
            accessibilityLabel={t('common.remove')}
          >
            <X size={sizes.icon.sm} color={colors.icon.secondary} />
          </Pressable>
        </Box>
      ) : (
        <Pressable
          onPress={onPick}
          disabled={disabled}
          align="center"
          justify="center"
          gap="sm"
          p="2xl"
          borderRadius="lg"
          borderWidth="sm"
          borderColor={borderColor}
          bg={colors.interactive.soft}
          style={styles.dashed}
          scaleOnPress
          accessibilityRole="button"
          accessibilityLabel={title}
          accessibilityHint={hint}
        >
          <Box
            width={sizes.avatar.md}
            height={sizes.avatar.md}
            borderRadius="full"
            bg={colors.surface.main}
            align="center"
            justify="center"
          >
            <CloudUpload size={sizes.icon.md} color={colors.interactive.main} />
          </Box>
          <Text variant="bodyMedium" color={colors.interactive.text} align="center">
            {title}
          </Text>
          <Text variant="caption" color={colors.text.secondary} align="center">
            {hint}
          </Text>
        </Pressable>
      )}

      {error ? (
        <Text
          variant="caption"
          color={colors.status.danger.text}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : null}
    </Box>
  );
};

const styles = StyleSheet.create({
  dashed: { borderStyle: 'dashed' },
});

export const FilePickerCard = memo(FilePickerCardComponent);
