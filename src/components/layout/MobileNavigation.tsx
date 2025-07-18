
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  MessageCircle, 
  BarChart3, 
  UserPlus,
  Menu
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

const MobileNavigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const bottomNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/conversations', icon: MessageCircle, label: 'Chat', badge: 3 },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const drawerNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/conversations', icon: MessageCircle, label: 'Conversations', badge: 3 },
    { path: '/pipeline', icon: BarChart3, label: 'Pipeline' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/onboarding', icon: UserPlus, label: 'Add Customer' },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-quikle-silver/20 px-4 py-3 flex justify-between items-center sticky top-0 z-40 backdrop-blur-lg bg-white/95">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/f0901f42-4619-41c2-b222-e562191d61a9.png" 
            alt="Quikle Logo" 
            className="h-8 w-8" 
          />
          <div>
            <h1 className="text-lg font-bold text-quikle-primary">QUIKLE</h1>
            <p className="text-xs text-quikle-neutral -mt-1">Innovation Suite</p>
          </div>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="touch-target h-10 w-10 p-0 hover:bg-quikle-crystal"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="right" 
            className="w-80 bg-white border-l border-quikle-silver/20"
          >
            <SheetHeader className="border-b border-quikle-silver/20 pb-4 mb-6">
              <SheetTitle className="flex items-center gap-3 text-left">
                <img 
                  src="/lovable-uploads/f0901f42-4619-41c2-b222-e562191d61a9.png" 
                  alt="Quikle Logo" 
                  className="h-8 w-8" 
                />
                <div>
                  <div className="text-lg font-bold text-quikle-primary">QUIKLE</div>
                  <div className="text-xs text-quikle-neutral">Innovation Suite</div>
                </div>
              </SheetTitle>
            </SheetHeader>
            
            <nav className="space-y-2">
              {drawerNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-4 py-4 text-base font-medium transition-colors rounded-lg touch-target",
                      isActive 
                        ? "bg-quikle-crystal text-quikle-primary border border-quikle-primary/20" 
                        : "text-quikle-charcoal hover:bg-quikle-crystal/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <Badge 
                        variant="destructive" 
                        className="bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-quikle-silver/20 px-2 py-2 z-50 backdrop-blur-lg bg-white/95">
        <div className="flex items-center justify-around">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center p-2 min-w-[64px] touch-target relative transition-colors rounded-lg",
                  isActive 
                    ? "text-quikle-primary bg-quikle-crystal/50" 
                    : "text-quikle-slate hover:text-quikle-primary hover:bg-quikle-crystal/30"
                )}
                aria-label={item.label}
              >
                <div className="relative">
                  <Icon className="h-5 w-5 mb-1" />
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[18px] h-4 flex items-center justify-center p-0 rounded-full"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium truncate max-w-[60px]">
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-quikle-primary rounded-full" />
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
