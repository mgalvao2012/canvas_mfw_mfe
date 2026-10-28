import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import OpportunityManagerPage from './OpportunityManagerPage';
import * as service from '@/api/opportunity/opportunityService';

vi.mock('@/api/opportunity/opportunityService', () => ({
  fetchAccountOpportunities: vi.fn(),
  fetchStageOptions: vi.fn(),
  createOpportunity: vi.fn(),
}));

// Recharts' ResponsiveContainer needs a measured parent, which jsdom lacks.
vi.mock('@/components/opportunity/StagePieChart', () => ({
  default: ({ data }: { data: unknown[] }) => <div data-testid="pie">{data.length} slices</div>,
}));

const ACCOUNT_ID = '001ak00003gox1aAAA';

const renderAt = (search: string) =>
  render(
    <MemoryRouter initialEntries={[`/${search}`]}>
      <OpportunityManagerPage />
    </MemoryRouter>
  );

describe('OpportunityManagerPage', () => {
  beforeEach(() => {
    vi.mocked(service.fetchStageOptions).mockResolvedValue({
      options: [{ value: 'Prospecting', label: 'Prospecting' }],
      defaultValue: 'Prospecting',
    });
  });

  it('asks for an Account context when accountId is missing', () => {
    renderAt('');
    expect(screen.getByRole('alert')).toHaveTextContent('Account record page');
    expect(service.fetchAccountOpportunities).not.toHaveBeenCalled();
  });

  it('creates an opportunity on the context account and reloads the data', async () => {
    vi.mocked(service.fetchAccountOpportunities)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: '006xx0000000001AAA',
          name: 'Big Deal',
          amount: 1000,
          amountDisplay: '$1,000',
          stage: 'Prospecting',
          stageLabel: 'Prospecting',
          closeDate: '2026-12-31',
          closeDateDisplay: '12/31/2026',
        },
      ]);
    vi.mocked(service.createOpportunity).mockResolvedValue('006xx0000000001AAA');

    renderAt(`?accountId=${ACCOUNT_ID}`);
    expect(await screen.findByText('No open opportunities for this account.')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /new/i }));
    await user.type(screen.getByLabelText(/opportunity name/i), 'Big Deal');
    await user.type(screen.getByLabelText(/amount/i), '1000');
    await user.type(screen.getByLabelText(/close date/i), '2026-12-31');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(service.createOpportunity).toHaveBeenCalledWith(ACCOUNT_ID, {
      name: 'Big Deal',
      amount: 1000,
      stage: 'Prospecting',
      closeDate: '2026-12-31',
    });
    expect(await screen.findByRole('link', { name: 'Big Deal' })).toHaveAttribute(
      'href',
      expect.stringContaining('/lightning/r/Opportunity/006xx0000000001AAA/view')
    );
    expect(screen.getByTestId('pie')).toHaveTextContent('1 slices');
    expect(service.fetchAccountOpportunities).toHaveBeenCalledTimes(2);
  });
});

describe('OpportunityManagerPage refresh', () => {
  it('reloads opportunities when the refresh icon is clicked', async () => {
    vi.mocked(service.fetchStageOptions).mockResolvedValue({ options: [], defaultValue: null });
    vi.mocked(service.fetchAccountOpportunities).mockReset().mockResolvedValue([]);

    renderAt(`?accountId=${ACCOUNT_ID}`);
    const refresh = await screen.findByRole('button', { name: 'Refresh' });
    await waitFor(() => expect(refresh).toBeEnabled());
    await userEvent.setup().click(refresh);

    await waitFor(() => expect(service.fetchAccountOpportunities).toHaveBeenCalledTimes(2));
  });
});
