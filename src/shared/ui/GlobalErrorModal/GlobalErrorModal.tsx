import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAppDispatch,
  useAppSelector,
  selectServerError,
  hideServerError,
} from '@/core/store';
import { retryRegistry } from '@/core/api/retryRegistry';
import BottomSheet from '@gorhom/bottom-sheet';
import { useTheme } from '@/core/theme';
import { Box, Text } from '../primitives';
import { CustomButton } from '../CustomButton';

export const GlobalErrorModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const serverError = useAppSelector(selectServerError);
  const [retryCountdown, setRetryCountdown] = useState(0);

  const isUnavailable = serverError.error?.statusCode === 503;
  const show = serverError.show && !!serverError.error;

  const handleRetry = useCallback(async () => {
    if (!serverError.retryKey) return;
    const fn = retryRegistry.get(serverError.retryKey);
    if (!fn) return;
    try {
      await fn();
      dispatch(hideServerError());
    } catch {
      // Error will be re-dispatched by the global error handler
    }
  }, [serverError.retryKey, dispatch]);

  const handleRetryRef = useRef(handleRetry);
  handleRetryRef.current = handleRetry;

  useEffect(() => {
    if (!isUnavailable || !show) {
      setRetryCountdown(0);
      return;
    }

    setRetryCountdown(3);

    const timer = setInterval(() => {
      setRetryCountdown(prev => {
        if (prev <= 1) {
          handleRetryRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isUnavailable, show]);

  const handleClose = useCallback(() => {
    dispatch(hideServerError());
  }, [dispatch]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1 && show) dispatch(hideServerError());
    },
    [show, dispatch],
  );

  return (
    <BottomSheet
      index={show ? 0 : -1}
      snapPoints={['50%']}
      enablePanDownToClose
      enableContentPanningGesture
      onChange={handleSheetChange}
    >
      <Box px="lg" py="2xl" pb="4xl">
        <Text variant="title" mb="sm">
          {isUnavailable
            ? t('errors.unavailable.title')
            : t('errors.server.title')}
        </Text>

        <Text variant="bodySmall" color={colors.text.secondary} mb="lg">
          {serverError.error?.message || t('errors.server.defaultMessage')}
        </Text>

        {isUnavailable && retryCountdown > 0 && (
          <Text variant="label" color={colors.interactive.text} align="center" my="md">
            {t('errors.server.retryIn', { count: retryCountdown })}
          </Text>
        )}

        <Box mt="xl">
          <CustomButton
            title={
              isUnavailable && retryCountdown > 0
                ? t('errors.server.retryWithCount', { count: retryCountdown })
                : t('common.retry')
            }
            onPress={handleRetry}
            disabled={isUnavailable && retryCountdown > 0}
          />
          <Box mt="md" />
          <CustomButton
            title={t('common.close')}
            onPress={handleClose}
            variant="secondary"
          />
        </Box>
      </Box>
    </BottomSheet>
  );
};
