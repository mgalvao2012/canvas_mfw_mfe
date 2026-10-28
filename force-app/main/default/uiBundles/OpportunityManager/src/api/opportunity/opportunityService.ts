import { executeGraphQL } from '@/api/graphqlClient';
import GET_ACCOUNT_OPPORTUNITIES from './query/getAccountOpportunities.graphql?raw';
import GET_OPPORTUNITY_STAGES from './query/getOpportunityStages.graphql?raw';
import CREATE_OPPORTUNITY from './mutation/createOpportunity.graphql?raw';
import type {
  CreateOpportunityMutation,
  CreateOpportunityMutationVariables,
  GetAccountOpportunitiesQuery,
  GetAccountOpportunitiesQueryVariables,
  GetOpportunityStagesQuery,
  GetOpportunityStagesQueryVariables,
} from '@/api/graphql-operations-types';
import type { Opportunity, StageOption } from '@/lib/opportunity';

// Always hits the network: the SDK's default 300s cache would otherwise serve
// the pre-create list after a refetch.
export async function fetchAccountOpportunities(
  accountId: string
): Promise<Opportunity[]> {
  const data = await executeGraphQL<
    GetAccountOpportunitiesQuery,
    GetAccountOpportunitiesQueryVariables
  >(GET_ACCOUNT_OPPORTUNITIES, { accountId }, 'no-cache');

  return (data.uiapi.query.Opportunity?.edges ?? [])
    .map(edge => edge?.node)
    .filter((node): node is NonNullable<typeof node> => node != null)
    .map(node => ({
      id: node.Id,
      name: node.Name?.value ?? '',
      amount: node.Amount?.value ?? null,
      amountDisplay: node.Amount?.displayValue ?? null,
      stage: node.StageName?.value ?? '',
      stageLabel: node.StageName?.displayValue ?? node.StageName?.value ?? '',
      closeDate: node.CloseDate?.value ?? null,
      closeDateDisplay: node.CloseDate?.displayValue ?? null,
    }));
}

/**
 * StageName values for the running user's default record type, falling back
 * to the first record type returned (Master) when no default is resolved.
 */
export async function fetchStageOptions(): Promise<{
  options: StageOption[];
  defaultValue: string | null;
}> {
  const data = await executeGraphQL<
    GetOpportunityStagesQuery,
    GetOpportunityStagesQueryVariables
  >(GET_OPPORTUNITY_STAGES);

  const info = data.uiapi.objectInfos?.[0];
  const stageField = info?.fields.find(f => f?.ApiName === 'StageName');
  const byRecordType =
    stageField && 'picklistValuesByRecordTypeIDs' in stageField
      ? (stageField.picklistValuesByRecordTypeIDs ?? [])
      : [];
  const entry =
    byRecordType.find(e => e?.recordTypeID === info?.defaultRecordTypeId) ??
    byRecordType[0];

  return {
    options: (entry?.picklistValues ?? [])
      .filter(v => v.value != null)
      .map(v => ({ value: v.value!, label: v.label ?? v.value! })),
    defaultValue: entry?.defaultValue?.value ?? null,
  };
}

export interface NewOpportunityInput {
  name: string;
  amount: number | null;
  stage: string;
  closeDate: string;
}

export async function createOpportunity(
  accountId: string,
  input: NewOpportunityInput
): Promise<string> {
  const data = await executeGraphQL<
    CreateOpportunityMutation,
    CreateOpportunityMutationVariables
  >(CREATE_OPPORTUNITY, {
    input: {
      Opportunity: {
        AccountId: accountId,
        Name: input.name,
        Amount: input.amount,
        StageName: input.stage,
        CloseDate: input.closeDate,
      },
    },
  });

  const id = data.uiapi.OpportunityCreate?.Record?.Id;
  if (!id) throw new Error('Opportunity was not created');
  return id;
}
