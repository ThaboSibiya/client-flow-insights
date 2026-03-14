import React, { useState } from 'react';
import quikleLogo from '@/assets/quikle-logo.png';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  MessageCircle,
  BarChart3,
  FileText,
  UserPlus,
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
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import UserProfile from '@/components/auth/UserProfile';
import NotificationBell from '@/components/notifications/NotificationBell';
import CollapsibleWorkstationPanel from './CollapsibleWorkstationPanel';
import HelpPanel from '@/components/help/HelpPanel';
import WorkspaceSwitcher from '@/components/workspace/WorkspaceSwitcher';

const AppSidebar = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const location = useLocation();
  const { data: employee } = useEmployeeProfile();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // Consolidated from 7 groups to 4 logical groups
  const menuGroups = [
    {
      label: 'Overview',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/customers', icon: Users, label: 'Customers' },
        { path: '/conversations', icon: MessageCircle, label: 'Conversations' },
        { path: '/onboarding', icon: UserPlus, label: 'Onboarding' },
      ],
    },
    {
      label: 'Operations',
      items: [
        { path: '/pipeline', icon: Bot, label: 'Pipeline' },
        { path: '/projects', icon: FolderKanban, label: 'Projects' },
        { path: '/quotes', icon: FileText, label: 'Quotes & Invoices' },
        { path: '/finance', icon: DollarSign, label: 'Finance' },
      ],
    },
    {
      label: 'Automation',
      items: [
        { path: '/automations', icon: Zap, label: 'Automations' },
        { path: '/integrations', icon: Workflow, label: 'Integrations' },
        { path: '/analytics', icon: BarChart3, label: 'Analytics' },
      ],
    },
    {
      label: 'Settings',
      items: [
        { path: '/employees', icon: Users, label: 'Team' },
        { path: '/notifications', icon: Bell, label: 'Notifications' },
        ...(employee?.role === 'admin'
          ? [{ path: '/audit-log', icon: ShieldCheck, label: 'Audit Log' }]
          : []),
        { path: '/settings', icon: Settings, label: 'Settings' },
      ],
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-border/40 p-4">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center w-full")}>
            <img
              src={quikleLogo}
              alt="Quikle Logo"
              className="h-8 w-8 flex-shrink-0"
            />
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-primary">Quikle</h1>
                <p className="text-[10px] text-muted-foreground tracking-wide uppercase">
                  Innovation Suite
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && <NotificationBell />}
        </div>
      </SidebarHeader>

      {/* Workspace Switcher */}
      <div className="border-b border-border/40 px-2 py-2">
        <WorkspaceSwitcher />
      </div>

      {/* Workstation Panel - Collapsible */}
      {!isCollapsed && <CollapsibleWorkstationPanel />}

      {/* Navigation Content */}
      <SidebarContent className="px-2">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-2">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
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
                              "relative transition-all duration-200",
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
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer with User Profile and Collapse Toggle */}
      <SidebarFooter className="border-t border-border/40 p-2">
        {!isCollapsed ? (
          <div className="space-y-1.5">
            <UserProfile />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsHelpOpen(true)}
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            >
              <LifeBuoy className="h-4 w-4" />
              <span className="text-xs">Support</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs">Collapse sidebar</span>
              <kbd className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded">⌘B</kbd>
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsHelpOpen(true)}
                  className="w-full h-9"
                >
                  <LifeBuoy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Support</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="w-full h-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Expand sidebar (⌘B)
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </SidebarFooter>

      <HelpPanel isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Rail for edge hover toggle */}
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
