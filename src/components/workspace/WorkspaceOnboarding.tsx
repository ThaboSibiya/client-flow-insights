import React, { useState, useCallback, useEffect } from 'react';
import { Building2, ArrowRight, Database, CheckCircle2, Loader2 } from 'lucide-react';
import WorkspacePlanPaywall from '@/components/workspace/WorkspacePlanPaywall';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWorkspace, Workspace } from '@/context/WorkspaceContext';
import {
  useOrphanedDataMigration,
  OrphanedDataCounts,
  MigratableTable,
  TABLE_LABELS,
  WORKSPACE_TABLES,
} from '@/hooks/useOrphanedDataMigration';
import { toast } from '@/hooks/use-toast';

interface WorkspaceOnboardingProps {
  open: boolean;
  onComplete: () => void;
}

type OnboardingStep = 'create' | 'migrate' | 'plan' | 'done';

const WorkspaceOnboarding: React.FC<WorkspaceOnboardingProps> = ({ open, onComplete }) => {
  const { createWorkspace, refetchWorkspaces } = useWorkspace();
  const {
    counts,
    loading: detecting,
    migrating,
    migratedCount,
    detectOrphanedData,
    migrateToWorkspace,
  } = useOrphanedDataMigration();

  const [step, setStep] = useState<OnboardingStep>('create');
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdWorkspace, setCreatedWorkspace] = useState<Workspace | null>(null);
  const [selectedTables, setSelectedTables] = useState<Set<MigratableTable>>(new Set(WORKSPACE_TABLES));

  useEffect(() => {
    if (open) {
      setStep('create');
      setName('');
      setIndustry('');
      setError(null);
      setCreatedWorkspace(null);
      setSelectedTables(new Set(WORKSPACE_TABLES));
    }
  }, [open]);

  // When counts arrive, pre-select only tables that have data
  useEffect(() => {
    if (counts) {
      const withData = WORKSPACE_TABLES.filter((t) => (counts as any)[t] > 0);
      setSelectedTables(new Set(withData));
    }
  }, [counts]);

  const toggleTable = (table: MigratableTable) => {
    setSelectedTables((prev) => {
      const next = new Set(prev);
      if (next.has(table)) next.delete(table);
      else next.add(table);
      return next;
    });
  };

  const handleCreateWorkspace = useCallback(async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const ws = await createWorkspace(name.trim(), industry.trim() || undefined);
      if (ws) {
        setCreatedWorkspace(ws);
        const orphaned = await detectOrphanedData();
        if (orphaned && orphaned.total > 0) {
          setStep('migrate');
        } else {
          await refetchWorkspaces();
          setStep('plan');
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
    const tables = [...selectedTables] as MigratableTable[];
    if (tables.length === 0) {
      toast({ title: 'No tables selected', description: 'Select at least one data type to migrate.' });
      return;
    }
    const success = await migrateToWorkspace(createdWorkspace.id, tables);
    if (success) {
      toast({
        title: 'Data migrated successfully',
        description: `Your existing data has been moved to "${createdWorkspace.name}".`,
      });
      await refetchWorkspaces();
      setStep('plan');
    } else {
      toast({
        title: 'Migration failed',
        description: 'Some data could not be migrated. You can retry from Settings.',
        variant: 'destructive',
      });
    }
  }, [createdWorkspace, selectedTables, migrateToWorkspace, refetchWorkspaces, onComplete]);

  const handleSkipMigration = useCallback(async () => {
    await refetchWorkspaces();
    toast({
      title: 'Migration skipped',
      description: 'You can migrate existing data later from Settings > Workspace.',
    });
    setStep('plan');
  }, [refetchWorkspaces]);

  const handlePlanSkip = useCallback(() => {
    setStep('done');
    setTimeout(() => onComplete(), 800);
  }, [onComplete]);

  const selectedCount = counts
    ? [...selectedTables].reduce((sum, t) => sum + ((counts as any)[t] || 0), 0)
    : 0;

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

            <Button onClick={handleCreateWorkspace} disabled={!name.trim() || saving} className="w-full">
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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground mb-2">
                <Database className="h-6 w-6" />
              </div>
              <DialogTitle className="text-xl">Existing data found</DialogTitle>
              <DialogDescription>
                Select the data you'd like to move into{' '}
                <strong>"{createdWorkspace?.name}"</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border bg-muted/50 p-3 space-y-1 max-h-64 overflow-y-auto">
              {(WORKSPACE_TABLES as readonly MigratableTable[]).map((key) => {
                const count = (counts as any)[key] as number;
                if (!count) return null;
                return (
                  <label
                    key={key}
                    className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedTables.has(key)}
                      onCheckedChange={() => toggleTable(key)}
                    />
                    <span className="flex-1 text-sm">{TABLE_LABELS[key]}</span>
                    <span className="text-sm font-medium tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  </label>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {selectedCount} of {counts.total} records selected
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <Button onClick={handleMigrate} disabled={migrating || selectedCount === 0} className="w-full">
                {migrating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Migrating {migratedCount} records...
                  </>
                ) : (
                  <>
                    Move {selectedCount} records
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
              <Button variant="ghost" onClick={handleSkipMigration} disabled={migrating} className="w-full text-muted-foreground">
                Skip for now
              </Button>
            </div>
          </>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
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
