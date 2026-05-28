import { useOptionalWorkspace } from '@/context/WorkspaceContext';

/**
 * Returns the active workspace ID for use in data queries.
 * Falls back to null if no workspace is selected.
 * All data-fetching hooks should use this to scope queries.
 */
export const useActiveWorkspaceId = (): string | null => {
  const workspace = useOptionalWorkspace();
  return workspace?.activeWorkspace?.id ?? null;
};
