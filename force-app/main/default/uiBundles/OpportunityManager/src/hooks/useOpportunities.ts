import { useCallback, useMemo, useState } from 'react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { fetchAccountOpportunities } from '@/api/opportunity/opportunityService';
import { totalsByStage } from '@/lib/opportunity';

export function useOpportunities(accountId: string) {
  const [reloadKey, setReloadKey] = useState(0);
  const { data, loading, error } = useAsyncData(
    () => fetchAccountOpportunities(accountId),
    [accountId, reloadKey]
  );
  const opportunities = useMemo(() => data ?? [], [data]);
  const byStage = useMemo(() => totalsByStage(opportunities), [opportunities]);
  const refetch = useCallback(() => setReloadKey(k => k + 1), []);

  return { opportunities, byStage, loading, error, refetch };
}
