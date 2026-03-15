import React, { useState } from 'react';
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

const AppSidebar = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: employee } = useEmployeeProfile();
  const { state, toggleSidebar } = useSidebar();
  const { needsOnboarding, setNeedsOnboarding } = useWorkspace();
  const { unreadCount } = useRealtimeNotifications();
  const isCollapsed = state === 'collapsed';

  // 3 clean groups: Core, Manage, Automate — no group labels, separated by dividers
  const coreItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/conversations', icon: MessageCircle, label: 'Conversations' },
    { path: '/pipeline', icon: Bot, label: 'Pipeline' },
  ];

  const manageItems = [
    { path: '/projects', icon: FolderKanban, label: 'Projects' },
    { path: '/quotes', icon: FileText, label: 'Quotes & Invoices' },
    { path: '/finance', icon: DollarSign, label: 'Finance' },
    { path: '/employees', icon: Users, label: 'Team' },
  ];

  const automateItems = [
    { path: '/automations', icon: Zap, label: 'Automations' },
    { path: '/integrations', icon: Workflow, label: 'Integrations' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    ...(employee?.role === 'admin'
      ? [{ path: '/audit-log', icon: ShieldCheck, label: 'Audit Log' }]
      : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  const renderNavItem = (item: { path: string; icon: React.ComponentType<{ className?: string }>; label: string }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

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
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
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

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      {/* Header: Logo + Workspace Switcher merged */}
      <SidebarHeader className="p-3 space-y-2">
        <div className={cn("flex items-center gap-2.5", isCollapsed && "justify-center")}>
          <img
            src={quikleLogo}
            alt="Quikle Logo"
            className="h-7 w-7 flex-shrink-0"
          />
          {!isCollapsed && (
            <h1 className="text-base font-bold text-primary tracking-tight">Quikle</h1>
          )}
        </div>
        <WorkspaceSwitcher />
      </SidebarHeader>

      {/* Pending Workspace Invitations — only when expanded */}
      {!isCollapsed && <PendingWorkspaceInvitations />}

      {/* Workspace Onboarding Wizard */}
      <WorkspaceOnboarding
        open={needsOnboarding}
        onComplete={() => setNeedsOnboarding(false)}
      />

      {/* Navigation — no group labels, clean dividers */}
      <SidebarContent className="px-2 py-1">
        <SidebarMenu className="space-y-0.5">
          {coreItems.map(renderNavItem)}
        </SidebarMenu>

        <Separator className="my-2 mx-2 bg-border/40" />

        <SidebarMenu className="space-y-0.5">
          {manageItems.map(renderNavItem)}
        </SidebarMenu>

        <Separator className="my-2 mx-2 bg-border/40" />

        <SidebarMenu className="space-y-0.5">
          {automateItems.map(renderNavItem)}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer: User profile + utility icons */}
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setIsHelpOpen(true)}
                >
                  <LifeBuoy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Support</TooltipContent>
            </Tooltip>
            <Separator className="my-1 bg-border/40" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={toggleSidebar}
                >
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
