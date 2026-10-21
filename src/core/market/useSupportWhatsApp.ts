import { useGetConfigQuery } from '@/core/api/configApi';
import { readCachedAppConfig } from '@/core/api/configCache';
import { useActiveMarket } from './useActiveMarket';

/** Support WhatsApp (E.164): the active market's line, else the global one, else `null`. Server-driven only. */
export const useSupportWhatsApp = (): string | null => {
  const { market } = useActiveMarket();
  const { data } = useGetConfigQuery();
  return (
    market?.support.whatsapp ||
    (data ?? readCachedAppConfig())?.support.whatsapp ||
    null
  );
};
