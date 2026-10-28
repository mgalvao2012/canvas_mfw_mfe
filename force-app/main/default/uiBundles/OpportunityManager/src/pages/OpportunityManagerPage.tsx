import { useEffect, type ReactNode } from 'react';
import { ChartPie, Crown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { StatusAlert } from '@/components/alerts/status-alert';
import { useAccountId } from '@/hooks/useAccountId';
import { useOpportunities } from '@/hooks/useOpportunities';
import StagePieChart from '@/components/opportunity/StagePieChart';
import OpportunityTable from '@/components/opportunity/OpportunityTable';
import NewOpportunityDialog from '@/components/opportunity/NewOpportunityDialog';

export default function OpportunityManagerPage() {
  const accountId = useAccountId();

  useEffect(() => {
    document.title = 'Opportunity Manager';
  }, []);

  if (!accountId) {
    return (
      <div className="p-4">
        <StatusAlert variant="error">
          Open this component from an Account record page.
        </StatusAlert>
      </div>
    );
  }

  return <AccountOpportunities accountId={accountId} />;
}

// SLDS media object for card headers: standard object icon + title.
function CardHeading({
  icon,
  iconClassName,
  children,
}: {
  icon: ReactNode;
  iconClassName: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden="true"
        className={`flex size-8 shrink-0 items-center justify-center rounded-md text-white [&_svg]:size-5 ${iconClassName}`}
      >
        {icon}
      </span>
      <CardTitle>
        <h2 className="truncate">{children}</h2>
      </CardTitle>
    </div>
  );
}

function LoadingBlock({ className }: { className: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Spinner className="size-8 text-primary" />
    </div>
  );
}

function AccountOpportunities({ accountId }: { accountId: string }) {
  const { opportunities, byStage, loading, error, refetch } =
    useOpportunities(accountId);
  const count = loading || error ? '' : ` (${opportunities.length})`;

  return (
    <div className="grid gap-3 p-3 sm:p-4">
      <Card>
        <CardHeader>
          <CardHeading icon={<ChartPie />} iconClassName="bg-[#5867e8]">
            Open Pipeline by Stage
          </CardHeading>
          <CardAction>
            <Button
              variant="outline"
              size="icon"
              onClick={refetch}
              disabled={loading}
              aria-label="Refresh"
              title="Refresh"
            >
              <RefreshCw className={loading ? 'animate-spin' : undefined} />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingBlock className="h-72" />
          ) : (
            <StagePieChart data={byStage} />
          )}
        </CardContent>
      </Card>

      <Card className="pb-0">
        <CardHeader>
          <CardHeading icon={<Crown />} iconClassName="bg-[#fcb95b]">
            Open Opportunities{count}
          </CardHeading>
          <CardAction>
            <NewOpportunityDialog accountId={accountId} onCreated={refetch} />
          </CardAction>
        </CardHeader>
        <CardContent className="px-0 group-data-[size=sm]/card:px-0">
          {error ? (
            <div className="px-4 pb-3">
              <StatusAlert variant="error">{error}</StatusAlert>
            </div>
          ) : loading ? (
            <LoadingBlock className="h-40" />
          ) : (
            <OpportunityTable opportunities={opportunities} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
