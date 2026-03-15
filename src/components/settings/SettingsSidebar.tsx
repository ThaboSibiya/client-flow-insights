
import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  User, 
  Building2, 
  Bell, 
  Palette, 
  Shield, 
  CreditCard, 
  Users, 
  Zap, 
  Bot,
  Webhook,
  FileText,
  Search,
  ChevronDown,
  ChevronRight,
  Lock,
  MessageSquare,
  Upload
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useUserRole } from '@/hooks/useUserRole';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import { useEnhancedPrivileges } from '@/hooks/useEnhancedPrivileges';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

interface SettingsMenuItem {
  path: string;
  icon: React.ElementType;
  label: string;
  description?: string;
  requiredRole?: 'owner' | 'admin' | 'all';
  requiredPrivilege?: string;
}

interface SettingsMenuGroup {
  label: string;
  items: SettingsMenuItem[];
  defaultOpen?: boolean;
}

const SettingsSidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Account': true,
    'Company': true,
    'Integrations': false,
    'Security': false,
  });

  const { isAdmin } = useUserRole();
  const { isCompanyOwner } = useEmployeeAuth();
  const { hasPrivilege, loading: privilegesLoading } = useEnhancedPrivileges();

  const menuGroups: SettingsMenuGroup[] = useMemo(() => [
    {
      label: 'Account',
      defaultOpen: true,
      items: [
        { 
          path: '/settings/general', 
          icon: User, 
          label: 'Profile', 
          description: 'Personal information and preferences',
          requiredRole: 'all'
        },
        { 
          path: '/settings/workspace', 
          icon: Building2, 
          label: 'Workspace', 
          description: 'Business workspace and team members',
          requiredRole: 'all'
        },
        { 
          path: '/settings/notifications', 
          icon: Bell, 
          label: 'Notifications', 
          description: 'Alert preferences and delivery settings',
          requiredRole: 'all'
        },
        { 
          path: '/settings/appearance', 
          icon: Palette, 
          label: 'Appearance', 
          description: 'Theme and display customization',
          requiredRole: 'all'
        },
      ]
    },
    {
      label: 'Company',
      defaultOpen: true,
      items: [
        { 
          path: '/settings/company', 
          icon: Building2, 
          label: 'Company Profile', 
          description: 'Business information and branding',
          requiredRole: 'admin'
        },
        { 
          path: '/settings/quotes', 
          icon: FileText, 
          label: 'Quote Settings', 
          description: 'Quote templates and defaults',
          requiredRole: 'admin'
        },
        { 
          path: '/settings/employees', 
          icon: Users, 
          label: 'Team Management', 
          description: 'Employee roles and permissions',
          requiredRole: 'admin'
        },
      ]
    },
    {
      label: 'Data',
      defaultOpen: false,
      items: [
        {
          path: '/settings/import',
          icon: Upload,
          label: 'Data Import',
          description: 'Import from HubSpot or CSV',
          requiredRole: 'admin',
        },
        {
          path: '/onboarding',
          icon: UserPlus,
          label: 'Customer Onboarding',
          description: 'Onboarding wizard and templates',
          requiredRole: 'all',
        },
      ]
    },
    {
      label: 'Integrations',
      defaultOpen: false,
      items: [
        { 
          path: '/settings/ai-agent', 
          icon: Bot, 
          label: 'AI Agent', 
          description: 'Voice agent configuration',
          requiredRole: 'admin'
        },
        { 
          path: '/settings/communications', 
          icon: MessageSquare, 
          label: 'Communications', 
          description: 'SMS & email provider settings',
          requiredRole: 'admin'
        },
        { 
          path: '/settings/automations', 
          icon: Zap, 
          label: 'Automations', 
          description: 'Workflow automation settings',
          requiredRole: 'admin'
        },
        { 
          path: '/settings/webhooks', 
          icon: Webhook, 
          label: 'Webhooks', 
          description: 'External system connections',
          requiredRole: 'admin'
        },
      ]
    },
    {
      label: 'Security',
      defaultOpen: false,
      items: [
        { 
          path: '/settings/security', 
          icon: Shield, 
          label: 'Security & Privacy', 
          description: 'Access control and audit logs',
          requiredRole: 'admin'
        },
        { 
          path: '/settings/billing', 
          icon: CreditCard, 
          label: 'Billing & Subscription', 
          description: 'Payment methods and plans',
          requiredRole: 'owner'
        },
      ]
    },
  ], []);

  const canAccessItem = (item: SettingsMenuItem): boolean => {
    if (privilegesLoading) return false;
    
    switch (item.requiredRole) {
      case 'owner':
        return isCompanyOwner;
      case 'admin':
        return isCompanyOwner || isAdmin;
      case 'all':
      default:
        return true;
    }
  };

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return menuGroups.map(group => ({
        ...group,
        items: group.items.filter(item => canAccessItem(item))
      })).filter(group => group.items.length > 0);
    }

    const query = searchQuery.toLowerCase();
    return menuGroups.map(group => ({
      ...group,
      items: group.items.filter(item => 
        canAccessItem(item) && (
          item.label.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
        )
      )
    })).filter(group => group.items.length > 0);
  }, [menuGroups, searchQuery, isCompanyOwner, isAdmin, privilegesLoading]);

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const getRoleBadge = (role?: 'owner' | 'admin' | 'all') => {
    if (role === 'owner') {
      return (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200">
          Owner
        </Badge>
      );
    }
    if (role === 'admin') {
      return (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">
          Admin
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className={cn(
      "bg-white/80 backdrop-blur-sm rounded-xl border border-quikle-silver/30 shadow-sm",
      isMobile ? "w-full" : "w-64 flex-shrink-0"
    )}>
      {/* Search */}
      <div className="p-3 border-b border-quikle-silver/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-quikle-slate/50" />
          <Input
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-quikle-crystal/30 border-quikle-silver/30 focus:border-quikle-primary/50"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {filteredGroups.map((group) => (
          <Collapsible
            key={group.label}
            open={searchQuery ? true : openGroups[group.label]}
            onOpenChange={() => !searchQuery && toggleGroup(group.label)}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-quikle-slate/60 uppercase tracking-wider hover:text-quikle-slate/80 transition-colors">
              <span>{group.label}</span>
              {!searchQuery && (
                openGroups[group.label] ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )
              )}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const hasAccess = canAccessItem(item);

                if (!hasAccess) {
                  return (
                    <Tooltip key={item.path}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-quikle-slate/40 cursor-not-allowed">
                          <Icon className="h-4 w-4" />
                          <span className="flex-1">{item.label}</span>
                          <Lock className="h-3.5 w-3.5" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>
                          {item.requiredRole === 'owner' 
                            ? 'Only company owners can access this'
                            : 'Admin access required'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group",
                      isActive
                        ? "bg-gradient-to-r from-quikle-primary/10 to-quikle-secondary/10 text-quikle-primary font-medium shadow-sm"
                        : "text-quikle-charcoal/80 hover:bg-quikle-crystal/50 hover:text-quikle-primary"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-quikle-primary" : "text-quikle-slate/60 group-hover:text-quikle-primary"
                    )} />
                    <span className="flex-1">{item.label}</span>
                    {getRoleBadge(item.requiredRole)}
                  </Link>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </nav>
    </div>
  );
};

export default SettingsSidebar;
