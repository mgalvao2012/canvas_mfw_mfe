import { describe, expect, it, vi } from 'vitest';
import { executeGraphQL } from '@/api/graphqlClient';
import { fetchAccountOpportunities } from './opportunityService';

vi.mock('@/api/graphqlClient', () => ({ executeGraphQL: vi.fn() }));

describe('fetchAccountOpportunities', () => {
  it('bypasses the SDK cache so a refetch after create sees the new record', async () => {
    vi.mocked(executeGraphQL).mockResolvedValue({ uiapi: { query: { Opportunity: { edges: [] } } } });
    await fetchAccountOpportunities('001ak00003gox1aAAA');
    expect(executeGraphQL).toHaveBeenCalledWith(
      expect.stringContaining('GetAccountOpportunities'),
      { accountId: '001ak00003gox1aAAA' },
      'no-cache'
    );
  });
});
