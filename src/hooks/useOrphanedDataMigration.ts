import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

/** Tables that carry a workspace_id column and belong to a user_id. */
const WORKSPACE_TABLES = [
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

type TableName = (typeof WORKSPACE_TABLES)[number];

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

/**
 * Detects data rows owned by the current user that have no workspace_id,
 * and offers to migrate them to a target workspace.
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
      const userIdCol = (table: TableName) =>
        table === 'conversations' ? 'company_owner_id' : 'user_id';

      const results = await Promise.all(
        WORKSPACE_TABLES.map(async (table) => {
          const { count, error } = await supabase
            .from(table)
            .select('id', { count: 'exact', head: true })
            .eq(userIdCol(table), user.id)
            .is('workspace_id', null);

          if (error) {
            console.warn(`Failed to count orphaned ${table}:`, error.message);
            return { table, count: 0 };
          }
          return { table, count: count ?? 0 };
        }),
      );

      const mapped = results.reduce(
        (acc, { table, count }) => ({ ...acc, [table]: count }),
        {} as Record<TableName, number>,
      );

      const total = results.reduce((s, r) => s + r.count, 0);
      const orphaned = { ...mapped, total } as OrphanedDataCounts;
      setCounts(orphaned);
      return orphaned;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /** Migrate all orphaned data for the current user to the given workspace. */
  const migrateToWorkspace = useCallback(
    async (workspaceId: string) => {
      if (!user) return false;
      setMigrating(true);
      setMigratedCount(0);

      try {
        const userIdCol = (table: TableName) =>
          table === 'conversations' ? 'company_owner_id' : 'user_id';

        let migrated = 0;

        for (const table of WORKSPACE_TABLES) {
          const { data, error } = await supabase
            .from(table)
            .update({ workspace_id: workspaceId } as any)
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

        setCounts(null);
        return true;
      } catch (err) {
        console.error('Migration failed:', err);
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
  };
};
