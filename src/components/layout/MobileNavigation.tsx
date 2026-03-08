import React, { useMemo } from 'react';
import QuikleLogo from '@/components/brand/QuikleLogo';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  MessageCircle, 
  BarChart3, 
  UserPlus,
  Menu,
  Workflow,
  Zap,
  Bot,
  DollarSign,
  FileText,
  Bell,
  X,
  Settings,
  LogOut
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import WorkstationQuickPanel from '@/components/sidebar/WorkstationQuickPanel';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useConversationsOptimized } from '@/hooks/useConversationsOptimized';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from '@/components/notifications/NotificationBell';

const MobileNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, signOut } = useAuth();
  const { unreadCount: notificationCount } = useRealtimeNotifications();
  const { unreadCount: conversationCount } = useConversationsOptimized();

  // Dynamic bottom nav - always show core 4 plus most contextual
  const bottomNavItems = useMemo(() => [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { path: '/customers', icon: Users, label: 'Clients' },
    { path: '/conversations', icon: MessageCircle, label: 'Chat', badge: conversationCount || undefined },
    { path: '/pipeline', icon: Bot, label: 'Pipeline' },
  ], [conversationCount]);

  const drawerNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/conversations', icon: MessageCircle, label: 'Conversations', badge: conversationCount || undefined },
    { path: '/pipeline', icon: Bot, label: 'Pipeline' },
    { path: '/quotes', icon: FileText, label: 'Quotes & Invoices' },
    { path: '/finance', icon: DollarSign, label: 'Finance' },
    { path: '/employees', icon: Users, label: 'Team' },
    { path: '/automations', icon: Zap, label: 'Automations' },
    { path: '/integrations', icon: Workflow, label: 'Integrations' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/onboarding', icon: UserPlus, label: 'Add Customer' },
  ];

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    navigate('/auth');
  };

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden bg-background/95 backdrop-blur-lg border-b border-border/50 px-4 py-3 flex justify-between items-center sticky top-0 z-40">
        <QuikleLogo size="sm" />

        <div className="flex items-center gap-1">
          {/* Notification Bell */}
          <NotificationBell />

          {/* Menu Trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-10 w-10 rounded-full"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-[85vw] max-w-sm bg-background border-l border-border p-0"
            >
              {/* Header with User Info */}
              <SheetHeader className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-left text-base truncate">
                      {user?.email || 'Guest'}
                    </SheetTitle>
                    <p className="text-xs text-muted-foreground">Account Owner</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </SheetHeader>
              
              <ScrollArea className="h-[calc(100vh-180px)]">
                {/* Workstation Quick Panel */}
                <div className="p-3 border-b border-border/50">
                  <WorkstationQuickPanel variant="mobile" onItemClick={() => setIsOpen(false)} />
                </div>

                {/* Navigation Items */}
                <nav className="p-2">
                  <p className="text-xs font-medium text-muted-foreground px-3 py-2">Navigation</p>
                  {drawerNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <Link
                        key={`${item.path}-${item.label}`}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-3 py-3.5 text-sm font-medium transition-colors rounded-lg my-0.5",
                          "min-h-[48px]", // Touch target
                          isActive 
                            ? "bg-primary/10 text-primary" 
                            : "text-foreground hover:bg-accent"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && item.badge > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="text-[10px] min-w-[20px] h-5 flex items-center justify-center"
                          >
                            {item.badge > 9 ? '9+' : item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </ScrollArea>

              {/* Footer Actions */}
              <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border bg-background">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/settings');
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border/50 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around py-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 min-w-[64px] min-h-[56px] relative transition-all rounded-lg",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
                aria-label={item.label}
              >
                <div className="relative">
                  <Icon className={cn(
                    "h-5 w-5 transition-transform",
                    isActive && "scale-110"
                  )} />
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1.5 -right-2 text-[9px] min-w-[16px] h-4 flex items-center justify-center p-0 rounded-full"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium mt-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
