import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Loader2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ArrowRightLeft,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useWorkspace } from '@/context/WorkspaceContext';
import {
  useOrphanedDataMigration,
  OrphanedDataCounts,
  MigratableTable,
  TABLE_LABELS,
  WORKSPACE_TABLES,
} from '@/hooks/useOrphanedDataMigration';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

/** Counts records per workspace per table */
interface WorkspaceDataCounts {
  [workspaceId: string]: Partial<Record<MigratableTable, number>>;
}

const WorkspaceDataMigration: React.FC = () => {
  const { activeWorkspace, workspaces } = useWorkspace();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    counts,
    loading,
    migrating,
    migratedCount,
    detectOrphanedData,
    migrateToWorkspace,
    reassignRecords,
  } = useOrphanedDataMigration();

  const [selectedTables, setSelectedTables] = useState<Set<MigratableTable>>(new Set());
  const [migrationDone, setMigrationDone] = useState(false);

  // Multi-workspace split state
  const [splitOpen, setSplitOpen] = useState(false);
  const [splitTable, setSplitTable] = useState<MigratableTable>('customers');
  const [splitFrom, setSplitFrom] = useState<string>('');
  const [splitTo, setSplitTo] = useState<string>('');
  const [splitRecords, setSplitRecords] = useState<any[]>([]);
  const [splitSelected, setSplitSelected] = useState<Set<string>>(new Set());
  const [splitLoading, setSplitLoading] = useState(false);

  useEffect(() => {
    detectOrphanedData();
  }, [detectOrphanedData]);

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

  const handleMigrate = async () => {
    if (!activeWorkspace) return;
    const tables = [...selectedTables] as MigratableTable[];
    if (tables.length === 0) return;

    const success = await migrateToWorkspace(activeWorkspace.id, tables);
    if (success) {
      setMigrationDone(true);
      toast({
        title: 'Data migrated',
        description: `Records moved to "${activeWorkspace.name}".`,
      });
      setTimeout(() => setMigrationDone(false), 3000);
    } else {
      toast({
        title: 'Migration failed',
        description: 'Some data could not be migrated. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const selectedCount = counts
    ? [...selectedTables].reduce((sum, t) => sum + ((counts as any)[t] || 0), 0)
    : 0;

  // Load records for split view
  const loadSplitRecords = useCallback(async () => {
    if (!user || !splitFrom) return;
    setSplitLoading(true);
    try {
      const col = splitTable === 'conversations' ? 'company_owner_id' : 'user_id';
      let query = (supabase.from(splitTable as any).select('id, name, email, created_at') as any)
        .eq(col, user.id)
        .limit(100);

      if (splitFrom === '__null__') {
        query = query.is('workspace_id', null);
      } else {
        query = query.eq('workspace_id', splitFrom);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setSplitRecords(data || []);
      setSplitSelected(new Set());
    } catch (err: any) {
      console.error('Failed to load records:', err);
      setSplitRecords([]);
    } finally {
      setSplitLoading(false);
    }
  }, [user, splitTable, splitFrom]);

  useEffect(() => {
    if (splitOpen && splitFrom) {
      loadSplitRecords();
    }
  }, [splitOpen, splitFrom, splitTable, loadSplitRecords]);

  const handleSplitReassign = async () => {
    if (!splitTo || splitSelected.size === 0) return;
    const fromId = splitFrom === '__null__' ? null : splitFrom;
    const success = await reassignRecords(fromId, splitTo, splitTable, [...splitSelected]);
    if (success) {
      toast({ title: 'Records reassigned', description: `${splitSelected.size} records moved.` });
      loadSplitRecords();
      detectOrphanedData();
    } else {
      toast({ title: 'Failed', description: 'Could not reassign records.', variant: 'destructive' });
    }
  };

  const hasOrphanedData = counts && counts.total > 0;

  return (
    <div className="space-y-6">
      {/* Orphaned Data Migration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Database className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">Data Migration</CardTitle>
              <CardDescription>
                Migrate unassigned data to your active workspace
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => detectOrphanedData()} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Scan'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning for unassigned data...
            </div>
          )}

          {!loading && !hasOrphanedData && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              All data is assigned to a workspace. Nothing to migrate.
            </div>
          )}

          {!loading && hasOrphanedData && counts && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">{counts.total}</strong> unassigned records found.
                  Select which to move to <strong>"{activeWorkspace?.name}"</strong>:
                </span>
              </div>

              <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
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
                      <Badge variant="secondary" className="tabular-nums">{count}</Badge>
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {selectedCount} of {counts.total} records selected
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" disabled={migrating || selectedCount === 0}>
                      {migrating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Migrating {migratedCount}...
                        </>
                      ) : (
                        <>
                          Migrate {selectedCount} records
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Migrate data?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will assign {selectedCount} unassigned records to{' '}
                        <strong>"{activeWorkspace?.name}"</strong>. This can be reversed
                        using the workspace split tool below.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleMigrate}>Migrate</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {migrationDone && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  Migration complete!
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Multi-workspace Split */}
      {workspaces.length > 1 && (
        <Collapsible open={splitOpen} onOpenChange={setSplitOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ArrowRightLeft className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">Move Data Between Workspaces</CardTitle>
                    <CardDescription>
                      Reassign specific records from one workspace to another
                    </CardDescription>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${splitOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Type</label>
                    <Select value={splitTable} onValueChange={(v) => setSplitTable(v as MigratableTable)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WORKSPACE_TABLES.map((t) => (
                          <SelectItem key={t} value={t}>{TABLE_LABELS[t]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">From Workspace</label>
                    <Select value={splitFrom} onValueChange={setSplitFrom}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__null__">Unassigned</SelectItem>
                        {workspaces.map((w) => (
                          <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">To Workspace</label>
                    <Select value={splitTo} onValueChange={setSplitTo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target" />
                      </SelectTrigger>
                      <SelectContent>
                        {workspaces
                          .filter((w) => w.id !== splitFrom || splitFrom === '__null__')
                          .map((w) => (
                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {splitLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading records...
                  </div>
                )}

                {!splitLoading && splitRecords.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {splitRecords.length} records found • {splitSelected.size} selected
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (splitSelected.size === splitRecords.length) {
                            setSplitSelected(new Set());
                          } else {
                            setSplitSelected(new Set(splitRecords.map((r: any) => r.id)));
                          }
                        }}
                      >
                        {splitSelected.size === splitRecords.length ? 'Deselect all' : 'Select all'}
                      </Button>
                    </div>

                    <div className="rounded-lg border max-h-48 overflow-y-auto divide-y">
                      {splitRecords.map((record: any) => (
                        <label
                          key={record.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer text-sm"
                        >
                          <Checkbox
                            checked={splitSelected.has(record.id)}
                            onCheckedChange={() => {
                              setSplitSelected((prev) => {
                                const next = new Set(prev);
                                if (next.has(record.id)) next.delete(record.id);
                                else next.add(record.id);
                                return next;
                              });
                            }}
                          />
                          <span className="flex-1 truncate">
                            {record.name || record.email || record.id}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(record.created_at).toLocaleDateString()}
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            disabled={!splitTo || splitSelected.size === 0 || migrating}
                          >
                            {migrating ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <ArrowRightLeft className="h-4 w-4 mr-2" />
                            )}
                            Move {splitSelected.size} records
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reassign records?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Move {splitSelected.size} {TABLE_LABELS[splitTable].toLowerCase()} to{' '}
                              <strong>
                                {workspaces.find((w) => w.id === splitTo)?.name || 'target workspace'}
                              </strong>
                              ?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSplitReassign}>
                              Move Records
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}

                {!splitLoading && splitFrom && splitRecords.length === 0 && (
                  <p className="text-sm text-muted-foreground py-2">
                    No {TABLE_LABELS[splitTable].toLowerCase()} found in this workspace.
                  </p>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );
};

export default WorkspaceDataMigration;
