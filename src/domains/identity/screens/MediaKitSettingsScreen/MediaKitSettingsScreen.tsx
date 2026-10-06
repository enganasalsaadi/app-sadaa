import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { EyeOff, Link2 } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import {
  Box,
  ConfirmSheet,
  CustomInput,
  ErrorState,
  FormSection,
  Layout,
  LayoutFooter,
  ListGroup,
  ListRow,
  Notice,
  Switch,
} from '@/shared/ui';
import { DiscardChangesSheet } from '../../components/DiscardChangesSheet';
import { SLUG_MAX_LENGTH } from '../../utils/mediaKitSlug';
import { MediaKitSettingsSkeleton } from './components/MediaKitSettingsSkeleton';
import {
  useMediaKitSettingsScreen,
  type MediaKitSettingsScreenModel,
} from './hooks/useMediaKitSettingsScreen';

const SettingsForm: React.FC<{ vm: MediaKitSettingsScreenModel }> = memo(({ vm }) => {
  const { t } = useTranslation();

  return (
    <Box gap="3xl">
      <FormSection title={t('account.mediaKit.settingsScreen.link.section')}>
        <Box gap="lg">
          {vm.cooldownMessage ? (
            <Notice
              tone="info"
              title={t('account.mediaKit.settingsScreen.cooldown.title')}
              message={vm.cooldownMessage}
            />
          ) : null}
          <Controller
            control={vm.control}
            name="slug"
            render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
              <CustomInput
                ref={ref}
                label={t('account.mediaKit.settingsScreen.link.label')}
                placeholder={t('account.mediaKit.settingsScreen.link.placeholder')}
                value={value}
                onChangeText={text => onChange(vm.normalizeSlug(text))}
                onBlur={onBlur}
                leftIcon={<Link2 />}
                maxLength={SLUG_MAX_LENGTH}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                keyboardType="url"
                textContentType="none"
                returnKeyType="done"
                onSubmitEditing={vm.onSave}
                editable={!vm.isSaving}
                error={fieldState.error?.message ?? vm.slugFeedback.error}
                hint={vm.slugFeedback.hint}
                hintTone={vm.slugFeedback.hintTone}
              />
            )}
          />
        </Box>
      </FormSection>

      <ListGroup
        title={t('account.mediaKit.settingsScreen.visibility.section')}
        footer={t(
          vm.isPublic
            ? 'account.mediaKit.settingsScreen.visibility.onHint'
            : 'account.mediaKit.settingsScreen.visibility.offHint',
        )}
      >
        <ListRow
          title={t('account.mediaKit.settingsScreen.visibility.label')}
          trailing={
            <Switch
              value={vm.isPublic}
              onValueChange={vm.onTogglePublic}
              disabled={vm.isUpdatingVisibility}
              accessibilityLabel={t('account.mediaKit.settingsScreen.visibility.label')}
            />
          }
        />
      </ListGroup>
    </Box>
  );
});

/** Detail archetype: the media kit link (live-checked slug) and who can see the kit. */
const MediaKitSettingsScreenComponent: React.FC = () => {
  useHideBottomBar();
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const vm = useMediaKitSettingsScreen();

  const body =
    vm.status === 'error' ? (
      <ErrorState
        title={t('account.mediaKit.loadFailed')}
        error={vm.loadError}
        onRetry={vm.onRetry}
      />
    ) : vm.status === 'loading' ? (
      <MediaKitSettingsSkeleton />
    ) : (
      <SettingsForm vm={vm} />
    );

  return (
    <>
      <Layout
        header={{ title: t('account.mediaKit.settingsScreen.title') }}
        footer={
          vm.status === 'ready' ? (
            <LayoutFooter
              primary={{
                label: t('account.mediaKit.settingsScreen.link.save'),
                onPress: vm.onSave,
                loading: vm.isSaving,
              }}
            />
          ) : undefined
        }
      >
        {body}
      </Layout>
      <ConfirmSheet
        visible={vm.hideSheetVisible}
        onClose={vm.closeHideSheet}
        icon={<EyeOff size={sizes.icon.lg} color={colors.text.secondary} />}
        title={t('account.mediaKit.settingsScreen.visibility.confirmTitle')}
        body={t('account.mediaKit.settingsScreen.visibility.confirmBody')}
        confirmLabel={t('account.mediaKit.settingsScreen.visibility.confirm')}
        onConfirm={vm.confirmHide}
        cancelLabel={t('common.cancel')}
      />
      <DiscardChangesSheet guard={vm.guard} />
    </>
  );
};

export const MediaKitSettingsScreen = memo(MediaKitSettingsScreenComponent);
