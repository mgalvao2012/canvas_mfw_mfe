import { useSearchParams } from 'react-router';
import { isAccountId } from '@/lib/opportunity';

/** Account Id passed by the host LWC as `?accountId=`; null when missing or not an Account Id. */
export function useAccountId(): string | null {
  const [params] = useSearchParams();
  const value = params.get('accountId');
  return isAccountId(value) ? value : null;
}
