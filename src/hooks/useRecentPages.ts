import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_KEY = 'quikle_recent_pages';
const MAX_RECENT = 3;

// Map paths to labels
const PAGE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/customers': 'Customers',
  '/conversations': 'Conversations',
  '/pipeline': 'Pipeline',
  '/projects': 'Projects',
  '/quotes': 'Quotes & Invoices',
  '/finance': 'Finance',
  '/employees': 'Team',
  '/automations': 'Automations',
  '/integrations': 'Integrations',
  '/analytics': 'Analytics',
  '/audit-log': 'Audit Log',
  '/notifications': 'Notifications',
  '/onboarding': 'Onboarding',
  '/settings': 'Settings',
};

export interface RecentPage {
  path: string;
  label: string;
  visitedAt: number;
}

export const useRecentPages = () => {
  const location = useLocation();
  const [recentPages, setRecentPages] = useState<RecentPage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const path = location.pathname;
    const label = PAGE_LABELS[path];
    if (!label) return; // Skip unlabeled routes (settings sub-pages, etc.)

    setRecentPages((prev) => {
      const filtered = prev.filter((p) => p.path !== path);
      const updated = [{ path, label, visitedAt: Date.now() }, ...filtered].slice(0, MAX_RECENT + 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [location.pathname]);

  // Return recent pages excluding the current page
  const getRecent = useCallback(
    () => recentPages.filter((p) => p.path !== location.pathname).slice(0, MAX_RECENT),
    [recentPages, location.pathname]
  );

  return { recentPages: getRecent() };
};
