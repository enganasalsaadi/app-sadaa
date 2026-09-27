import i18n, { formatNumber } from '@/core/i18n';

const KB = 1024;
const MB = KB * 1024;

export const formatFileSize = (bytes: number): string =>
  bytes >= MB
    ? i18n.t('common.fileSize.mb', {
        value: formatNumber(bytes / MB, { maximumFractionDigits: 1 }),
      })
    : i18n.t('common.fileSize.kb', {
        value: formatNumber(Math.max(1, Math.round(bytes / KB))),
      });
