export interface Opportunity {
  id: string;
  name: string;
  amount: number | null;
  amountDisplay: string | null;
  stage: string;
  stageLabel: string;
  closeDate: string | null;
  closeDateDisplay: string | null;
}

export interface StageOption {
  value: string;
  label: string;
}

export interface StageTotal {
  stage: string;
  label: string;
  value: number;
}

/** Lightning Experience origin used for record links (the app itself runs on *.my.salesforce.app). */
export const LEX_ORIGIN = 'https://trailsignup-b74685fca0428d.lightning.force.com';

const ACCOUNT_ID_PATTERN = /^001[a-zA-Z0-9]{12}(?:[a-zA-Z0-9]{3})?$/;

export function isAccountId(value: string | null | undefined): value is string {
  return value != null && ACCOUNT_ID_PATTERN.test(value);
}

export function opportunityRecordUrl(id: string): string {
  return `${LEX_ORIGIN}/lightning/r/Opportunity/${encodeURIComponent(id)}/view`;
}

/**
 * Sums Amount per stage, preserving first-seen order. Opportunities without an
 * amount are ignored; stages that total zero are dropped so the pie has no
 * empty slices.
 */
export function totalsByStage(opportunities: Opportunity[]): StageTotal[] {
  const totals = new Map<string, StageTotal>();
  for (const opp of opportunities) {
    if (opp.amount == null) continue;
    const current = totals.get(opp.stage);
    if (current) current.value += opp.amount;
    else totals.set(opp.stage, { stage: opp.stage, label: opp.stageLabel, value: opp.amount });
  }
  return [...totals.values()].filter(t => t.value > 0);
}
