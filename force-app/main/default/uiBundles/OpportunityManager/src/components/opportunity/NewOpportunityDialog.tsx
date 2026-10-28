import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { StatusAlert } from '@/components/alerts/status-alert';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  createOpportunity,
  fetchStageOptions,
} from '@/api/opportunity/opportunityService';

// SLDS required-field marker (abbr.slds-required).
function RequiredMark() {
  return (
    <abbr title="required" className="text-destructive no-underline">
      *
    </abbr>
  );
}

interface NewOpportunityDialogProps {
  accountId: string;
  onCreated: () => void;
}

export default function NewOpportunityDialog({
  accountId,
  onCreated,
}: NewOpportunityDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [stage, setStage] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stages = useAsyncData(fetchStageOptions, []);
  const selectedStage = stage || stages.data?.defaultValue || '';

  const reset = () => {
    setName('');
    setAmount('');
    setStage('');
    setCloseDate('');
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createOpportunity(accountId, {
        name: name.trim(),
        amount: amount === '' ? null : Number(amount),
        stage: selectedStage,
        closeDate,
      });
      toast.success(`Opportunity "${name.trim()}" created`);
      setOpen(false);
      reset();
      onCreated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not create opportunity'
      );
    } finally {
      setSaving(false);
    }
  };

  const canSave =
    name.trim() !== '' && selectedStage !== '' && closeDate !== '' && !saving;

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus data-icon="inline-start" />
          New
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid">
          <DialogHeader>
            <DialogTitle>New Opportunity</DialogTitle>
            <DialogDescription>
              Created on the current account.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 p-4">
            <div className="grid gap-1">
              <Label htmlFor="opp-name">
                <RequiredMark />
                Opportunity Name
              </Label>
              <Input
                id="opp-name"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={120}
                required
                autoFocus
              />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="opp-amount">Amount</Label>
              <Input
                id="opp-amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="opp-stage">
                <RequiredMark />
                Stage
              </Label>
              <Select
                value={selectedStage}
                onValueChange={setStage}
                disabled={stages.loading}
              >
                <SelectTrigger id="opp-stage" className="w-full">
                  <SelectValue
                    placeholder={stages.loading ? 'Loading…' : 'Select a stage'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {stages.data?.options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {stages.error && (
                <p className="text-xs text-destructive">{stages.error}</p>
              )}
            </div>

            <div className="grid gap-1">
              <Label htmlFor="opp-close-date">
                <RequiredMark />
                Close Date
              </Label>
              <Input
                id="opp-close-date"
                type="date"
                value={closeDate}
                onChange={e => setCloseDate(e.target.value)}
                required
              />
            </div>

            {error && <StatusAlert variant="error">{error}</StatusAlert>}

            <p className="text-xs text-muted-foreground">
              <RequiredMark /> = Required Information
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
