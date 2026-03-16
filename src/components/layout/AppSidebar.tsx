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
  ChevronLeft,
  ChevronRight,
  LifeBuoy,
  Clock,
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
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useRecentPages } from '@/hooks/useRecentPages';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const AppSidebar = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: employee } = useEmployeeProfile();
  const { state, toggleSidebar } = useSidebar();
  const { needsOnboarding, setNeedsOnboarding } = useWorkspace();
  const { unreadCount } = useRealtimeNotifications();
  const { recentPages } = useRecentPages();
  const isCollapsed = state === 'collapsed';
  const navRef = useRef<HTMLDivElement>(null);

  const coreItems: NavItem[] = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/conversations', icon: MessageCircle, label: 'Conversations' },
    { path: '/pipeline', icon: Bot, label: 'Pipeline' },
  ];

  const manageItems: NavItem[] = [
    { path: '/projects', icon: FolderKanban, label: 'Projects' },
    { path: '/quotes', icon: FileText, label: 'Quotes & Invoices' },
    { path: '/finance', icon: DollarSign, label: 'Finance' },
    { path: '/employees', icon: Users, label: 'Team' },
  ];

  const automateItems: NavItem[] = [
    { path: '/automations', icon: Zap, label: 'Automations' },
    { path: '/integrations', icon: Workflow, label: 'Integrations' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    ...(employee?.role === 'admin'
      ? [{ path: '/audit-log', icon: ShieldCheck, label: 'Audit Log' }]
      : []),
  ];

  // Flatten all nav items for keyboard navigation
  const allItems = [...coreItems, ...manageItems, ...automateItems];

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

  // Reset focus index when route changes
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
                "relative transition-all duration-200 h-9",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground",
                focused && !active && "bg-muted/80 text-foreground ring-1 ring-primary/30"
              )}
            >
              <Link to={item.path}>
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                )}
              </Link>
            </SidebarMenuButton>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" className="font-medium">
              {item.label}
            </TooltipContent>
          )}
        </Tooltip>
      </SidebarMenuItem>
    );
  };

  // Calculate global indices for each group
  const coreStartIndex = 0;
  const manageStartIndex = coreItems.length;
  const automateStartIndex = coreItems.length + manageItems.length;

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      {/* Header: Logo + Workspace Switcher */}
      <SidebarHeader className="p-3 space-y-2">
        <div className={cn("flex items-center gap-2.5", isCollapsed && "justify-center")}>
          <img src={quikleLogo} alt="Quikle Logo" className="h-7 w-7 flex-shrink-0" />
          {!isCollapsed && (
            <h1 className="text-base font-bold text-primary tracking-tight">Quikle</h1>
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
        className="px-2 py-1 outline-none"
        ref={navRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* ⌘K Search */}
        {!isCollapsed && (
          <button
            onClick={() => {
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
            }}
            className="flex items-center gap-2 mx-2 mb-1 px-2.5 py-1.5 rounded-md border border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="text-xs flex-1 text-left">Search...</span>
            <kbd className="text-[10px] bg-background px-1.5 py-0.5 rounded border border-border/60 font-mono">⌘K</kbd>
          </button>
        )}

        {/* Recent Pages */}
        {!isCollapsed && recentPages.length > 0 && (
          <>
            <div className="px-3 pt-2 pb-1">
              <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
                Recent
              </span>
            </div>
            <SidebarMenu className="space-y-0">
              {recentPages.map((page) => (
                <SidebarMenuItem key={`recent-${page.path}`}>
                  <SidebarMenuButton
                    asChild
                    className="h-7 text-muted-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Link to={page.path}>
                      <Clock className="h-3 w-3 flex-shrink-0 opacity-40" />
                      <span className="truncate text-xs">{page.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </>
        )}

        {/* Core */}
        {!isCollapsed && (
          <div className="px-3 pt-3 pb-1">
            <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Core</span>
          </div>
        )}
        <SidebarMenu className="space-y-0">
          {coreItems.map((item, i) => renderNavItem(item, coreStartIndex + i))}
        </SidebarMenu>

        {/* Manage */}
        {!isCollapsed && (
          <div className="px-3 pt-3 pb-1">
            <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Manage</span>
          </div>
        )}
        <SidebarMenu className="space-y-0">
          {manageItems.map((item, i) => renderNavItem(item, manageStartIndex + i))}
        </SidebarMenu>

        {/* Automate */}
        {!isCollapsed && (
          <div className="px-3 pt-3 pb-1">
            <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Automate</span>
          </div>
        )}
        <SidebarMenu className="space-y-0">
          {automateItems.map((item, i) => renderNavItem(item, automateStartIndex + i))}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-border/40 p-2">
        {!isCollapsed ? (
          <div className="space-y-1">
            <UserProfile />
            <div className="flex items-center justify-between px-1 pt-1">
              <div className="flex items-center gap-0.5">
                <NotificationBell />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => navigate('/settings')}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Settings</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setIsHelpOpen(true)}
                    >
                      <LifeBuoy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Support</TooltipContent>
                </Tooltip>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={toggleSidebar}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Collapse (⌘B)</TooltipContent>
              </Tooltip>
            </div>
          </div>
        ) : (
          <div className="space-y-0.5 flex flex-col items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 relative"
                  onClick={() => navigate('/notifications')}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[9px] font-bold bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Notifications</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate('/settings')}>
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setIsHelpOpen(true)}>
                  <LifeBuoy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Support</TooltipContent>
            </Tooltip>
            <Separator className="my-1 bg-border/40" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleSidebar}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand (⌘B)</TooltipContent>
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
