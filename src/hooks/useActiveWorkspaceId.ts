import { useWorkspace } from '@/context/WorkspaceContext';

/**
 * Returns the active workspace ID for use in data queries.
 * Falls back to null if no workspace is selected.
 * All data-fetching hooks should use this to scope queries.
 */
export const useActiveWorkspaceId = (): string | null => {
  const { activeWorkspace } = useWorkspace();
  return activeWorkspace?.id ?? null;
};
