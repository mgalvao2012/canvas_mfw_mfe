import { describe, expect, it } from 'vitest';
import { isAccountId, opportunityRecordUrl, totalsByStage, type Opportunity } from './opportunity';

const opp = (stage: string, amount: number | null): Opportunity => ({
  id: `006${stage}`,
  name: stage,
  amount,
  amountDisplay: null,
  stage,
  stageLabel: `${stage} label`,
  closeDate: null,
  closeDateDisplay: null,
});

describe('totalsByStage', () => {
  it('sums amounts per stage in first-seen order', () => {
    expect(
      totalsByStage([opp('Prospecting', 100), opp('Closing', 50), opp('Prospecting', 25)])
    ).toEqual([
      { stage: 'Prospecting', label: 'Prospecting label', value: 125 },
      { stage: 'Closing', label: 'Closing label', value: 50 },
    ]);
  });

  it('ignores null amounts and drops zero-total stages', () => {
    expect(totalsByStage([opp('A', null), opp('B', 0), opp('C', 10)])).toEqual([
      { stage: 'C', label: 'C label', value: 10 },
    ]);
  });

  it('returns an empty list for no opportunities', () => {
    expect(totalsByStage([])).toEqual([]);
  });
});

describe('isAccountId', () => {
  it.each(['001ak00003gox1a', '001ak00003gox1aAAA'])('accepts %s', id => {
    expect(isAccountId(id)).toBe(true);
  });

  it.each([null, '', '006ak00003gox1aAAA', '001short', '001ak00003gox1aAAA<script>'])(
    'rejects %s',
    id => {
      expect(isAccountId(id)).toBe(false);
    }
  );
});

describe('opportunityRecordUrl', () => {
  it('points at the Lightning record page', () => {
    expect(opportunityRecordUrl('006xx0000000001AAA')).toBe(
      'https://trailsignup-b74685fca0428d.lightning.force.com/lightning/r/Opportunity/006xx0000000001AAA/view'
    );
  });
});
