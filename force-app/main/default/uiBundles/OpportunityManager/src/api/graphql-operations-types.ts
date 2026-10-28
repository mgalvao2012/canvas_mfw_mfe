export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Base64: { input: string; output: string; }
  Currency: { input: number | string; output: number; }
  Date: { input: string; output: string; }
  DateTime: { input: string; output: string; }
  Double: { input: number | string; output: number; }
  Email: { input: string; output: string; }
  EncryptedString: { input: string; output: string; }
  /** Can be set to an ID or a Reference to the result of another mutation operation. */
  IdOrRef: { input: string; output: string; }
  JSON: { input: string; output: string; }
  Latitude: { input: number | string; output: number; }
  /** A 64-bit signed integer */
  Long: { input: number; output: number; }
  LongTextArea: { input: string; output: string; }
  Longitude: { input: number | string; output: number; }
  MultiPicklist: { input: string; output: string; }
  Percent: { input: number | string; output: number; }
  PhoneNumber: { input: string; output: string; }
  Picklist: { input: string; output: string; }
  RichTextArea: { input: string; output: string; }
  TextArea: { input: string; output: string; }
  Time: { input: string; output: string; }
  Url: { input: string; output: string; }
};

export enum DataType {
  Address = 'ADDRESS',
  Anytype = 'ANYTYPE',
  Base64 = 'BASE64',
  Boolean = 'BOOLEAN',
  Combobox = 'COMBOBOX',
  Complexvalue = 'COMPLEXVALUE',
  Currency = 'CURRENCY',
  Date = 'DATE',
  Datetime = 'DATETIME',
  Double = 'DOUBLE',
  Email = 'EMAIL',
  Encryptedstring = 'ENCRYPTEDSTRING',
  Int = 'INT',
  Json = 'JSON',
  Junctionidlist = 'JUNCTIONIDLIST',
  Location = 'LOCATION',
  Long = 'LONG',
  Multipicklist = 'MULTIPICKLIST',
  Percent = 'PERCENT',
  Phone = 'PHONE',
  Picklist = 'PICKLIST',
  Reference = 'REFERENCE',
  String = 'STRING',
  Textarea = 'TEXTAREA',
  Time = 'TIME',
  Url = 'URL'
}

export enum FieldExtraTypeInfo {
  ExternalLookup = 'EXTERNAL_LOOKUP',
  ImageUrl = 'IMAGE_URL',
  IndirectLookup = 'INDIRECT_LOOKUP',
  Personname = 'PERSONNAME',
  Plaintextarea = 'PLAINTEXTAREA',
  Richtextarea = 'RICHTEXTAREA',
  SwitchablePersonname = 'SWITCHABLE_PERSONNAME'
}

export enum FormFactor {
  Large = 'LARGE',
  Medium = 'MEDIUM',
  Small = 'SMALL'
}

export enum LayoutComponentType {
  Canvas = 'CANVAS',
  CustomLink = 'CUSTOM_LINK',
  EmptySpace = 'EMPTY_SPACE',
  Field = 'FIELD',
  ReportChart = 'REPORT_CHART',
  VisualforcePage = 'VISUALFORCE_PAGE'
}

export enum LayoutMode {
  Create = 'CREATE',
  Edit = 'EDIT',
  View = 'VIEW'
}

export enum LayoutType {
  Compact = 'COMPACT',
  Full = 'FULL'
}

export type OpportunityCreateInput = {
  Opportunity: OpportunityCreateRepresentation;
};

export type OpportunityCreateRepresentation = {
  AccountId?: InputMaybe<Scalars['IdOrRef']['input']>;
  Amount?: InputMaybe<Scalars['Currency']['input']>;
  CampaignId?: InputMaybe<Scalars['IdOrRef']['input']>;
  CloseDate?: InputMaybe<Scalars['Date']['input']>;
  ContactId?: InputMaybe<Scalars['IdOrRef']['input']>;
  ContractId?: InputMaybe<Scalars['IdOrRef']['input']>;
  CurrencyIsoCode?: InputMaybe<Scalars['Picklist']['input']>;
  DB_Amount__c?: InputMaybe<Scalars['Currency']['input']>;
  DB_Days__c?: InputMaybe<Scalars['Double']['input']>;
  DateTimeCreated__c?: InputMaybe<Scalars['DateTime']['input']>;
  Description?: InputMaybe<Scalars['LongTextArea']['input']>;
  ED_Leading_Causes__c?: InputMaybe<Scalars['RichTextArea']['input']>;
  ED_Outcome__c?: InputMaybe<Scalars['Double']['input']>;
  ED_Prescription__c?: InputMaybe<Scalars['RichTextArea']['input']>;
  Exec_Meeting__c?: InputMaybe<Scalars['Boolean']['input']>;
  External_ID__c?: InputMaybe<Scalars['String']['input']>;
  ForecastCategoryName?: InputMaybe<Scalars['Picklist']['input']>;
  Interactive_Demo__c?: InputMaybe<Scalars['Boolean']['input']>;
  IsExcludedFromTerritory2Filter?: InputMaybe<Scalars['Boolean']['input']>;
  IsPrivate?: InputMaybe<Scalars['Boolean']['input']>;
  LastActivityDate__c?: InputMaybe<Scalars['Date']['input']>;
  LastModifiedDate__c?: InputMaybe<Scalars['DateTime']['input']>;
  LeadSource?: InputMaybe<Scalars['Picklist']['input']>;
  Name?: InputMaybe<Scalars['String']['input']>;
  NextStep?: InputMaybe<Scalars['String']['input']>;
  OwnerId?: InputMaybe<Scalars['IdOrRef']['input']>;
  Pricebook2Id?: InputMaybe<Scalars['IdOrRef']['input']>;
  Probability?: InputMaybe<Scalars['Percent']['input']>;
  Products__c?: InputMaybe<Scalars['MultiPicklist']['input']>;
  RecordTypeId?: InputMaybe<Scalars['IdOrRef']['input']>;
  ReferralCode?: InputMaybe<Scalars['String']['input']>;
  SDO_MAPS_Dataset_Split__c?: InputMaybe<Scalars['Double']['input']>;
  SDO_MAPS_Tag_Opportunity__c?: InputMaybe<Scalars['String']['input']>;
  SDO_Pardot_Is_B2BMA_Plus_Data__c?: InputMaybe<Scalars['Boolean']['input']>;
  SDO_Quip_Close_Plan_Quip__c?: InputMaybe<Scalars['Url']['input']>;
  SDO_SFS_Work_Order__c?: InputMaybe<Scalars['IdOrRef']['input']>;
  SDO_Sales_Competitor__c?: InputMaybe<Scalars['Picklist']['input']>;
  SDO_Sales_Complete_ROI_Analysis__c?: InputMaybe<Scalars['Boolean']['input']>;
  SDO_Sales_Contract_Terms__c?: InputMaybe<Scalars['Picklist']['input']>;
  SDO_Sales_Discount__c?: InputMaybe<Scalars['Percent']['input']>;
  SDO_Sales_Partner_Owner__c?: InputMaybe<Scalars['IdOrRef']['input']>;
  SDO_Sales_Primary_Contact__c?: InputMaybe<Scalars['IdOrRef']['input']>;
  SDO_Sales_Project_Budgeted__c?: InputMaybe<Scalars['Boolean']['input']>;
  SDO_Sales_Project_Manager_Contact__c?: InputMaybe<Scalars['IdOrRef']['input']>;
  SDO_Sales_Reason_Lost__c?: InputMaybe<Scalars['Picklist']['input']>;
  SDO_Sales_Stalled_Opportunity__c?: InputMaybe<Scalars['Boolean']['input']>;
  SDO_Sales_Winning_Competitor__c?: InputMaybe<Scalars['Picklist']['input']>;
  SDO_Service_Case__c?: InputMaybe<Scalars['IdOrRef']['input']>;
  SourceId?: InputMaybe<Scalars['IdOrRef']['input']>;
  StageName?: InputMaybe<Scalars['Picklist']['input']>;
  SyncedQuoteId?: InputMaybe<Scalars['IdOrRef']['input']>;
  Territory2Id?: InputMaybe<Scalars['IdOrRef']['input']>;
  TotalOpportunityQuantity?: InputMaybe<Scalars['Double']['input']>;
  Type?: InputMaybe<Scalars['Picklist']['input']>;
  analyticsdemo_batch_id__c?: InputMaybe<Scalars['String']['input']>;
  db_days_CloseDate__c?: InputMaybe<Scalars['Double']['input']>;
};

export enum ResultOrder {
  Asc = 'ASC',
  Desc = 'DESC'
}

export enum TabOrder {
  LeftRight = 'LEFT_RIGHT',
  TopDown = 'TOP_DOWN'
}

export enum UiBehavior {
  Edit = 'EDIT',
  Readonly = 'READONLY',
  Required = 'REQUIRED'
}

export type CreateOpportunityMutationVariables = Exact<{
  input: OpportunityCreateInput;
}>;


export type CreateOpportunityMutation = { uiapi: { OpportunityCreate?: { Record?: { Id: string } | null } | null } };

export type GetAccountOpportunitiesQueryVariables = Exact<{
  accountId: Scalars['ID']['input'];
}>;


export type GetAccountOpportunitiesQuery = { uiapi: { query: { Opportunity?: { edges?: Array<{ node?: { Id: string, Name?: { value?: string | null } | null, Amount?: { value?: number | null, displayValue?: string | null } | null, StageName?: { value?: string | null, displayValue?: string | null } | null, CloseDate?: { value?: string | null, displayValue?: string | null } | null } | null } | null> | null } | null } } };

export type GetOpportunityStagesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOpportunityStagesQuery = { uiapi: { objectInfos?: Array<{ defaultRecordTypeId?: string | null, fields: Array<
        | { ApiName: string, picklistValuesByRecordTypeIDs?: Array<{ recordTypeID: string, defaultValue?: { value?: string | null } | null, picklistValues?: Array<{ label?: string | null, value?: string | null }> | null } | null> | null }
        | { ApiName: string }
       | null> } | null> | null } };
