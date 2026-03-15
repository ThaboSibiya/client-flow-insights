import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

/** Tables that carry a workspace_id column and belong to a user_id. */
export const WORKSPACE_TABLES = [
  'customers',
  'employees',
  'invoices',
  'payments',
  'projects',
  'conversations',
  'tickets',
  'quotes_invoices',
  'import_history',
] as const;

export type MigratableTable = (typeof WORKSPACE_TABLES)[number];

export const TABLE_LABELS: Record<MigratableTable, string> = {
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

export interface OrphanedDataCounts {
  customers: number;
  employees: number;
  invoices: number;
  payments: number;
  projects: number;
  conversations: number;
  tickets: number;
  quotes_invoices: number;
  import_history: number;
  total: number;
}

const userIdCol = (table: MigratableTable) =>
  table === 'conversations' ? 'company_owner_id' : 'user_id';

/**
 * Detects data rows owned by the current user that have no workspace_id,
 * and offers to migrate them to a target workspace.
 * Supports selective migration by table and reassignment between workspaces.
 */
export const useOrphanedDataMigration = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<OrphanedDataCounts | null>(null);
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migratedCount, setMigratedCount] = useState(0);

  /** Count orphaned rows (workspace_id IS NULL) for each table. */
  const detectOrphanedData = useCallback(async () => {
    if (!user) return null;
    setLoading(true);
    try {
      const results = await Promise.all(
        WORKSPACE_TABLES.map(async (table) => {
          const { count, error } = await (supabase
            .from(table as any)
            .select('id', { count: 'exact', head: true }) as any)
            .eq(userIdCol(table), user.id)
            .is('workspace_id', null);

          if (error) {
            console.warn(`Failed to count orphaned ${table}:`, error?.message);
            return { table, count: 0 };
          }
          return { table, count: (count as number) ?? 0 };
        }),
      );

      const mapped = results.reduce(
        (acc, { table, count }) => ({ ...acc, [table]: count }),
        {} as Record<MigratableTable, number>,
      );

      const total = results.reduce((s, r) => s + r.count, 0);
      const orphaned = { ...mapped, total } as OrphanedDataCounts;
      setCounts(orphaned);
      return orphaned;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Migrate orphaned data to a workspace.
   * @param selectedTables — if provided, only migrate these tables. Otherwise migrate all.
   */
  const migrateToWorkspace = useCallback(
    async (workspaceId: string, selectedTables?: MigratableTable[]) => {
      if (!user) return false;
      setMigrating(true);
      setMigratedCount(0);

      const tablesToMigrate = selectedTables ?? [...WORKSPACE_TABLES];

      try {
        let migrated = 0;

        for (const table of tablesToMigrate) {
          const { data, error } = await (supabase
            .from(table as any)
            .update({ workspace_id: workspaceId }) as any)
            .eq(userIdCol(table), user.id)
            .is('workspace_id', null)
            .select('id');

          if (error) {
            console.warn(`Failed to migrate ${table}:`, error.message);
            continue;
          }
          migrated += data?.length ?? 0;
          setMigratedCount(migrated);
        }

        // Refresh counts
        await detectOrphanedData();
        return true;
      } catch (err) {
        console.error('Migration failed:', err);
        return false;
      } finally {
        setMigrating(false);
      }
    },
    [user, detectOrphanedData],
  );

  /**
   * Reassign records from one workspace to another.
   * @param fromWorkspaceId — source workspace (or null for orphaned)
   * @param toWorkspaceId — target workspace
   * @param table — which table to reassign
   * @param recordIds — specific record IDs to reassign (if empty, reassign all)
   */
  const reassignRecords = useCallback(
    async (
      fromWorkspaceId: string | null,
      toWorkspaceId: string,
      table: MigratableTable,
      recordIds?: string[],
    ) => {
      if (!user) return false;
      setMigrating(true);

      try {
        let query = (supabase
          .from(table as any)
          .update({ workspace_id: toWorkspaceId }) as any)
          .eq(userIdCol(table), user.id);

        if (fromWorkspaceId) {
          query = query.eq('workspace_id', fromWorkspaceId);
        } else {
          query = query.is('workspace_id', null);
        }

        if (recordIds && recordIds.length > 0) {
          query = query.in('id', recordIds);
        }

        const { error } = await query;

        if (error) {
          console.error(`Reassign ${table} failed:`, error.message);
          return false;
        }
        return true;
      } catch (err) {
        console.error('Reassign failed:', err);
        return false;
      } finally {
        setMigrating(false);
      }
    },
    [user],
  );

  return {
    counts,
    loading,
    migrating,
    migratedCount,
    detectOrphanedData,
    migrateToWorkspace,
    reassignRecords,
  };
};
