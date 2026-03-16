import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, MessageCircle, Bot, FolderKanban, FileText,
  DollarSign, Zap, Workflow, BarChart3, ShieldCheck, Bell, Settings,
  UserPlus, Search,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

interface CommandPage {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string;
  group: 'navigate' | 'settings' | 'actions';
}

const PAGES: CommandPage[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, group: 'navigate' },
  { label: 'Customers', path: '/customers', icon: Users, keywords: 'contacts clients', group: 'navigate' },
  { label: 'Conversations', path: '/conversations', icon: MessageCircle, keywords: 'chat messages', group: 'navigate' },
  { label: 'Pipeline', path: '/pipeline', icon: Bot, keywords: 'leads deals', group: 'navigate' },
  { label: 'Projects', path: '/projects', icon: FolderKanban, keywords: 'tasks boards', group: 'navigate' },
  { label: 'Quotes & Invoices', path: '/quotes', icon: FileText, keywords: 'billing quotes', group: 'navigate' },
  { label: 'Finance', path: '/finance', icon: DollarSign, keywords: 'payments money revenue', group: 'navigate' },
  { label: 'Team', path: '/employees', icon: Users, keywords: 'employees staff', group: 'navigate' },
  { label: 'Automations', path: '/automations', icon: Zap, keywords: 'workflows rules', group: 'navigate' },
  { label: 'Integrations', path: '/integrations', icon: Workflow, keywords: 'connect api', group: 'navigate' },
  { label: 'Analytics', path: '/analytics', icon: BarChart3, keywords: 'reports metrics', group: 'navigate' },
  { label: 'Notifications', path: '/notifications', icon: Bell, keywords: 'alerts', group: 'navigate' },
  { label: 'Audit Log', path: '/audit-log', icon: ShieldCheck, keywords: 'security logs', group: 'navigate' },
  { label: 'Onboarding', path: '/onboarding', icon: UserPlus, keywords: 'setup wizard new customer', group: 'navigate' },
  { label: 'Settings', path: '/settings', icon: Settings, keywords: 'preferences config', group: 'settings' },
  { label: 'Profile Settings', path: '/settings/general', icon: Settings, keywords: 'account', group: 'settings' },
  { label: 'Workspace Settings', path: '/settings/workspace', icon: Settings, keywords: 'team business', group: 'settings' },
  { label: 'Appearance', path: '/settings/appearance', icon: Settings, keywords: 'theme dark light', group: 'settings' },
  { label: 'Security & Privacy', path: '/settings/security', icon: ShieldCheck, keywords: 'password auth', group: 'settings' },
  { label: 'Data Import', path: '/settings/import', icon: Settings, keywords: 'csv hubspot migrate', group: 'settings' },
];

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const navPages = PAGES.filter((p) => p.group === 'navigate');
  const settingsPages = PAGES.filter((p) => p.group === 'settings');

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type to search..." />
      <CommandList className="max-h-[320px] py-1">
        <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
          No results found.
        </CommandEmpty>
        <CommandGroup heading="Pages">
          {navPages.map((page) => {
            const Icon = page.icon;
            return (
              <CommandItem
                key={page.path}
                value={`${page.label} ${page.keywords || ''}`}
                onSelect={() => handleSelect(page.path)}
                className="gap-2.5 cursor-pointer"
              >
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{page.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          {settingsPages.map((page) => {
            const Icon = page.icon;
            return (
              <CommandItem
                key={page.path}
                value={`${page.label} ${page.keywords || ''}`}
                onSelect={() => handleSelect(page.path)}
                className="gap-2.5 cursor-pointer"
              >
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{page.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
