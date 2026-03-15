import React, { useState, useCallback, useEffect } from 'react';
import { Building2, ArrowRight, Database, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWorkspace, Workspace } from '@/context/WorkspaceContext';
import { useOrphanedDataMigration, OrphanedDataCounts } from '@/hooks/useOrphanedDataMigration';
import { toast } from '@/hooks/use-toast';

interface WorkspaceOnboardingProps {
  open: boolean;
  onComplete: () => void;
}

type OnboardingStep = 'create' | 'migrate' | 'done';

const DATA_LABELS: Record<string, string> = {
  customers: 'Customers',
  employees: 'Employees',
  invoices: 'Invoices',
  payments: 'Payments',
  projects: 'Projects',
  conversations: 'Conversations',
  tickets: 'Tickets',
  quotes_invoices: 'Quotes & Invoices',
  import_history: 'Import History',
};

const WorkspaceOnboarding: React.FC<WorkspaceOnboardingProps> = ({ open, onComplete }) => {
  const { createWorkspace, refetchWorkspaces } = useWorkspace();
  const { counts, loading: detecting, migrating, migratedCount, detectOrphanedData, migrateToWorkspace } = useOrphanedDataMigration();

  const [step, setStep] = useState<OnboardingStep>('create');
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdWorkspace, setCreatedWorkspace] = useState<Workspace | null>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep('create');
      setName('');
      setIndustry('');
      setError(null);
      setCreatedWorkspace(null);
    }
  }, [open]);

  const handleCreateWorkspace = useCallback(async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const ws = await createWorkspace(name.trim(), industry.trim() || undefined);
      if (ws) {
        setCreatedWorkspace(ws);
        // Check for orphaned data before completing
        const orphaned = await detectOrphanedData();
        if (orphaned && orphaned.total > 0) {
          setStep('migrate');
        } else {
          await refetchWorkspaces();
          setStep('done');
          setTimeout(() => onComplete(), 800);
        }
      } else {
        setError('Failed to create workspace. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [name, industry, createWorkspace, detectOrphanedData, refetchWorkspaces, onComplete]);

  const handleMigrate = useCallback(async () => {
    if (!createdWorkspace) return;
    const success = await migrateToWorkspace(createdWorkspace.id);
    if (success) {
      toast({
        title: 'Data migrated successfully',
        description: `Your existing data has been moved to "${createdWorkspace.name}".`,
      });
      await refetchWorkspaces();
      setStep('done');
      setTimeout(() => onComplete(), 1200);
    } else {
      toast({
        title: 'Migration failed',
        description: 'Some data could not be migrated. You can retry from Settings.',
        variant: 'destructive',
      });
    }
  }, [createdWorkspace, migrateToWorkspace, refetchWorkspaces, onComplete]);

  const handleSkipMigration = useCallback(async () => {
    await refetchWorkspaces();
    toast({
      title: 'Migration skipped',
      description: 'You can migrate existing data later from Settings > Workspace.',
    });
    onComplete();
  }, [refetchWorkspaces, onComplete]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button.absolute]:hidden">
        {step === 'create' && (
          <>
            <DialogHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
                <Building2 className="h-6 w-6" />
              </div>
              <DialogTitle className="text-xl">Welcome! Let's set up your business</DialogTitle>
              <DialogDescription>
                Create a workspace to organize your team, customers, and operations.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="onboard-name">Business Name</Label>
                <Input
                  id="onboard-name"
                  placeholder="e.g. Acme Corp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !saving && handleCreateWorkspace()}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="onboard-industry">Industry (optional)</Label>
                <Input
                  id="onboard-industry"
                  placeholder="e.g. Technology, Retail, HVAC"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !saving && handleCreateWorkspace()}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <Button
              onClick={handleCreateWorkspace}
              disabled={!name.trim() || saving}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Workspace
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              You need at least one workspace to get started.
            </p>
          </>
        )}

        {step === 'migrate' && counts && (
          <>
            <DialogHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 mb-2">
                <Database className="h-6 w-6" />
              </div>
              <DialogTitle className="text-xl">Existing data found</DialogTitle>
              <DialogDescription>
                We found data from before your workspace was created. Would you like to move it
                into <strong>"{createdWorkspace?.name}"</strong>?
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              {(Object.entries(DATA_LABELS) as [string, string][]).map(([key, label]) => {
                const count = (counts as any)[key] as number;
                if (!count) return null;
                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium tabular-nums">{count}</span>
                  </div>
                );
              })}
              <div className="border-t pt-2 flex items-center justify-between text-sm font-semibold">
                <span>Total records</span>
                <span className="tabular-nums">{counts.total}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handleMigrate} disabled={migrating} className="w-full">
                {migrating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Migrating {migratedCount} records...
                  </>
                ) : (
                  <>
                    Move data to workspace
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={handleSkipMigration}
                disabled={migrating}
                className="w-full text-muted-foreground"
              >
                Skip for now
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Skipped data will remain unassigned. You can migrate it later.
            </p>
          </>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <DialogTitle className="text-xl">You're all set!</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Your workspace <strong>"{createdWorkspace?.name}"</strong> is ready.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceOnboarding;
