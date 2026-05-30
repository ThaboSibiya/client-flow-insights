import React, { useState, useRef, useCallback, useEffect } from 'react';
import quikleLogo from '@/assets/quikle-logo.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  MessageCircle,
  BarChart3,
  FileText,
  ShieldCheck,
  Bot,
  FolderKanban,
  Workflow,
  Zap,
  DollarSign,
  Bell,
  Settings,
  PanelLeftClose,
  PanelLeft,
  LifeBuoy,
  Search,
} from 'lucide-react';
import { useEmployeeProfile } from '@/hooks/useEmployeeProfile';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import UserProfile from '@/components/auth/UserProfile';
import NotificationBell from '@/components/notifications/NotificationBell';
import HelpPanel from '@/components/help/HelpPanel';
import WorkspaceSwitcher from '@/components/workspace/WorkspaceSwitcher';
import PendingWorkspaceInvitations from '@/components/workspace/PendingWorkspaceInvitations';
import WorkspaceOnboarding from '@/components/workspace/WorkspaceOnboarding';
import { useWorkspace } from '@/context/WorkspaceContext';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const AppSidebar = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: employee } = useEmployeeProfile();
  const { state, toggleSidebar } = useSidebar();
  const { needsOnboarding, setNeedsOnboarding } = useWorkspace();
  const isCollapsed = state === 'collapsed';
  const navRef = useRef<HTMLDivElement>(null);

  const navGroups: NavGroup[] = [
    {
      label: 'Core',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/customers', icon: Users, label: 'Customers' },
        { path: '/conversations', icon: MessageCircle, label: 'Conversations' },
        { path: '/pipeline', icon: Bot, label: 'Pipeline' },
      ],
    },
    {
      label: 'Manage',
      items: [
        { path: '/projects', icon: FolderKanban, label: 'Projects' },
        { path: '/quotes', icon: FileText, label: 'Quotes & Invoices' },
        { path: '/finance', icon: DollarSign, label: 'Finance' },
        { path: '/employees', icon: Users, label: 'Team' },
      ],
    },
    {
      label: 'Automate',
      items: [
        { path: '/automations', icon: Zap, label: 'Automations' },
        { path: '/integrations', icon: Workflow, label: 'Integrations' },
        { path: '/analytics', icon: BarChart3, label: 'Analytics' },
        ...(employee?.role === 'admin'
          ? [{ path: '/audit-log', icon: ShieldCheck, label: 'Audit Log' }]
          : []),
      ],
    },
  ];

  const allItems = navGroups.flatMap((g) => g.items);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
      } else if (e.key === 'Enter' && focusedIndex >= 0) {
        e.preventDefault();
        navigate(allItems[focusedIndex].path);
      }
    },
    [allItems, focusedIndex, navigate]
  );

  useEffect(() => {
    setFocusedIndex(-1);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const renderNavItem = (item: NavItem, globalIndex: number) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    const focused = focusedIndex === globalIndex;

    return (
      <SidebarMenuItem key={item.path}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              asChild
              isActive={active}
              className={cn(
                'relative h-8 transition-colors duration-150',
                active
                  ? 'bg-primary/12 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                focused && !active && 'bg-accent text-accent-foreground ring-1 ring-ring/20'
              )}
            >
              <Link to={item.path}>
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-primary rounded-r-full" />
                )}
                <Icon className={cn('h-4 w-4 flex-shrink-0', active && 'text-primary')} />
                <span className="truncate text-[13px]">{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" className="font-medium text-xs">
              {item.label}
            </TooltipContent>
          )}
        </Tooltip>
      </SidebarMenuItem>
    );
  };

  // Build global index mapping
  let globalIndex = 0;

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      {/* Header */}
      <SidebarHeader className="p-3 space-y-2">
        <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'gap-2.5')}>
          <img src={quikleLogo} alt="Quikle" className="h-7 w-7 flex-shrink-0" />
          {!isCollapsed && (
            <h1 className="text-base font-bold text-foreground tracking-tight">Quikle</h1>
          )}
        </div>
        <WorkspaceSwitcher />
      </SidebarHeader>

      {!isCollapsed && <PendingWorkspaceInvitations />}

      <WorkspaceOnboarding
        open={needsOnboarding}
        onComplete={() => setNeedsOnboarding(false)}
      />

      {/* Navigation */}
      <SidebarContent
        className="px-2 py-1 outline-none overflow-x-hidden"
        ref={navRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {navGroups.map((group, groupIdx) => {
          const startIdx = globalIndex;
          const items = group.items.map((item, i) => {
            const idx = startIdx + i;
            return renderNavItem(item, idx);
          });
          globalIndex += group.items.length;

          return (
            <div key={group.label}>
              {/* Group separator for collapsed mode */}
              {isCollapsed && groupIdx > 0 && (
                <Separator className="my-1.5 mx-1 bg-border/30" />
              )}
              {/* Group label for expanded mode */}
              {!isCollapsed && (
                <div className={cn('px-2 pb-1', groupIdx === 0 ? 'pt-1' : 'pt-3')}>
                  <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest select-none">
                    {group.label}
                  </span>
                </div>
              )}
              <SidebarMenu className="space-y-px">{items}</SidebarMenu>
            </div>
          );
        })}
      </SidebarContent>

      {/* Footer — compact Monday.com style */}
      <SidebarFooter className="border-t border-border/40 p-2 space-y-1">
        <UserProfile />
        {!isCollapsed ? (
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-0.5">
              <NotificationBell />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsHelpOpen(true)}
                  >
                    <LifeBuoy className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Help & Support</TooltipContent>
              </Tooltip>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={toggleSidebar}
                >
                  <PanelLeftClose className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Collapse sidebar</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => navigate('/notifications')}
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Notifications</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/settings')}>
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
            <Separator className="my-0.5 bg-border/30 w-6" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSidebar}>
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          </div>
        )}
      </SidebarFooter>

      <HelpPanel isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
